import bcrypt from "bcrypt";
import { createInterface } from "node:readline/promises";
import { resetUserPasswordSchema } from "../src/validators/admin.validator.js";

const SALT_ROUNDS = 12;
const DEMO_ACCOUNTS = [
  { role: "ADMIN", email: "demo.admin@rateora.com" },
  { role: "NORMAL_USER", email: "demo.user@rateora.com" },
  { role: "STORE_OWNER", email: "demo.owner@rateora.com" },
];

async function readPassword(prompt) {
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return await terminal.question(prompt);
  } finally {
    terminal.close();
  }
}

async function collectPasswords() {
  const entries = [];

  for (const account of DEMO_ACCOUNTS) {
    const password = await readPassword(`Enter new password for ${account.role}: `);
    const validation = resetUserPasswordSchema.safeParse({ password });
    if (!validation.success) {
      const messages = validation.error.issues.map((issue) => issue.message).join("; ");
      throw new Error(`Password validation failed for ${account.role}: ${messages}`);
    }

    entries.push({ ...account, passwordHash: await bcrypt.hash(password, SALT_ROUNDS) });
  }

  return entries;
}

async function updateAllDemoPasswords(prisma, entries) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const targets = [];

          // Verify all exact demo emails and roles before changing any account.
          for (const account of entries) {
            const user = await tx.user.findUnique({
              where: { email: account.email },
              select: { id: true, role: true },
            });

            if (!user) {
              throw new Error(`Expected demo account is missing for role ${account.role}.`);
            }
            if (user.role !== account.role) {
              throw new Error(`Demo account role check failed for ${account.role}.`);
            }

            targets.push({ ...account, id: user.id });
          }

          for (const account of targets) {
            await tx.user.update({
              where: { id: account.id },
              data: {
                passwordHash: account.passwordHash,
                tokenVersion: { increment: 1 },
              },
              select: { id: true },
            });
          }

          return targets.map(({ role }) => role);
        },
        { isolationLevel: "Serializable" }
      );
    } catch (error) {
      if (error?.code === "P2034" && attempt < 3) continue;
      throw error;
    }
  }

  throw new Error("Transaction retry limit reached.");
}

async function main() {
  // Collect and validate all passwords before opening a database connection.
  const entries = await collectPasswords();
  const { default: prisma } = await import("../src/config/prisma.js");

  try {
    const updatedRoles = await updateAllDemoPasswords(prisma, entries);
    for (const role of updatedRoles) {
      console.log(`${role}: password updated; existing sessions invalidated`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const safeMessage =
    error?.message?.startsWith("Password validation failed") ||
    error?.message?.startsWith("A PowerShell terminal") ||
    error?.message?.startsWith("Password entry cancelled") ||
    error?.message?.startsWith("Expected demo account") ||
    error?.message?.startsWith("Demo account role check")
      ? error.message
      : `Demo password update stopped${typeof error?.code === "string" ? ` (${error.code})` : ""}; no credentials were printed.`;

  console.error(safeMessage);
  process.exitCode = 1;
});
