import bcrypt from "bcrypt";
import { createStoreSchema, createUserSchema } from "../src/validators/admin.validator.js";

const SALT_ROUNDS = 12;
const ROLES = ["ADMIN", "NORMAL_USER", "STORE_OWNER"];
const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    email: "demo.admin@rateora.com",
    name: "RATEORA Demo Administrator",
    address: "RATEORA Demo Workspace, 100 Demo Avenue",
  },
  {
    role: "NORMAL_USER",
    email: "demo.user@rateora.com",
    name: "RATEORA Demo Member Account",
    address: "RATEORA Demo Workspace, 110 Demo Avenue",
  },
  {
    role: "STORE_OWNER",
    email: "demo.owner@rateora.com",
    name: "RATEORA Demo Store Owner",
    address: "RATEORA Demo Workspace, 120 Demo Avenue",
  },
];

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    if (!input.isTTY || typeof input.setRawMode !== "function") {
      reject(new Error("A PowerShell terminal is required for hidden password input."));
      return;
    }

    let value = "";
    let settled = false;
    const wasRaw = input.isRaw;

    const restoreTerminal = () => {
      input.off("data", onData);
      input.setRawMode(wasRaw ?? false);
      input.pause();
    };

    const finish = (error) => {
      if (settled) return;
      settled = true;
      restoreTerminal();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish(new Error("Password entry cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
    process.stdout.write(prompt);
  });
}

async function collectAndValidatePasswords() {
  const validated = [];

  for (const account of DEMO_ACCOUNTS) {
    const password = await readHidden(`Enter approved password for ${account.role}: `);
    const parsed = createUserSchema.safeParse({ ...account, password });

    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message).join("; ");
      throw new Error(`Password validation failed for ${account.role}: ${messages}`);
    }

    validated.push(parsed.data);
  }

  const storeCheck = createStoreSchema.safeParse({
    name: "RATEORA Demo Market Central",
    email: "demo.owner@rateora.com",
    address: "RATEORA Demo Workspace, 200 Storefront Avenue",
    ownerId: "00000000-0000-4000-8000-000000000000",
  });

  if (!storeCheck.success) {
    throw new Error("Demo store details did not pass the existing store validation.");
  }

  return validated;
}

async function createOrSkipAccount(prisma, account, passwordHash) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existing = await emailExistsCaseInsensitive(tx, account.email);

          // Existing accounts are never changed, regardless of role or store state.
          if (existing) return "skipped";

          const createdUser = await tx.user.create({
            data: {
              name: account.name,
              email: account.email,
              address: account.address,
              role: account.role,
              passwordHash,
            },
            select: { id: true },
          });

          if (account.role === "STORE_OWNER") {
            const store = createStoreSchema.parse({
              name: "RATEORA Demo Market Central",
              email: "demo.owner@rateora.com",
              address: "RATEORA Demo Workspace, 200 Storefront Avenue",
              ownerId: createdUser.id,
            });

            await tx.store.create({ data: store, select: { id: true } });
          }

          return "created";
        },
        { isolationLevel: "Serializable" }
      );
    } catch (error) {
      if (error?.code === "P2002") {
        const existing = await emailExistsCaseInsensitive(prisma, account.email);
        if (existing) return "skipped";
      }

      if (error?.code === "P2034" && attempt < 3) continue;
      throw error;
    }
  }

  throw new Error("Transaction retry limit reached.");
}

async function emailExistsCaseInsensitive(client, email) {
  const [result] = await client.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM "User"
      WHERE lower("email") = lower(${email})
    ) AS "exists"
  `;

  return result.exists;
}

async function main() {
  const passwords = await collectAndValidatePasswords();
  const preparedAccounts = await Promise.all(
    passwords.map(async (account) => ({
      account,
      passwordHash: await bcrypt.hash(account.password, SALT_ROUNDS),
    }))
  );

  const { default: prisma } = await import("../src/config/prisma.js");

  try {
    for (const { account, passwordHash } of preparedAccounts) {
      const status = await createOrSkipAccount(prisma, account, passwordHash);
      console.log(`${account.role}: ${status === "created" ? "created" : "already exists; skipped"}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (!ROLES.every((role) => DEMO_ACCOUNTS.some((account) => account.role === role))) {
  console.error("Demo role configuration is incomplete.");
  process.exitCode = 1;
} else {
  main().catch((error) => {
    const code = typeof error?.code === "string" ? ` (${error.code})` : "";
    const message = error?.message?.startsWith("Password validation failed") ||
      error?.message?.startsWith("A PowerShell terminal") ||
      error?.message?.startsWith("Password entry cancelled")
      ? error.message
      : `Demo account setup stopped${code}; no credentials were printed.`;
    console.error(message);
    process.exitCode = 1;
  });
}
