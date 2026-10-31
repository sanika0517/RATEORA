import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";
import {
  AdminUserManagementError,
  deleteUserAccount,
  resetUserPasswordForAdmin,
  updateUserAccount,
} from "./admin-user-management.service.js";
import { resetUserPasswordSchema, updateUserSchema } from "../validators/admin.validator.js";
import { authorize } from "../middleware/auth.middleware.js";

const account = {
  id: "user-1",
  name: "A Valid Example User",
  email: "user@example.com",
  address: "42 Example Street",
  role: "NORMAL_USER",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
};

test("updates account fields and returns only safe user fields", async () => {
  let updateArgs;
  const prisma = {
    user: {
      findUnique: async () => ({ id: account.id, role: account.role, ownedStore: null }),
      update: async (args) => {
        updateArgs = args;
        return { ...account, ...args.data, passwordHash: "must not escape" };
      },
    },
  };

  const result = await updateUserAccount(prisma, account.id, {
    name: "Another Valid Example User",
    email: "new@example.com",
    address: "88 New Street",
    role: "ADMIN",
  });

  assert.equal(updateArgs.data.role, "ADMIN");
  assert.equal(result.email, "new@example.com");
  assert.equal("passwordHash" in result, false);
});

test("validates edit fields, role, and reset passwords", () => {
  assert.equal(
    updateUserSchema.safeParse({
      name: "A Valid Example User",
      email: "USER@example.com",
      address: "42 Example Street",
      role: "NORMAL_USER",
    }).success,
    true
  );
  assert.equal(
    updateUserSchema.safeParse({
      name: "short",
      email: "invalid",
      address: "",
      role: "ROOT",
    }).success,
    false
  );
  assert.equal(resetUserPasswordSchema.safeParse({ password: "StrongPass!" }).success, true);
  assert.equal(resetUserPasswordSchema.safeParse({ password: "weak" }).success, false);
});

test("rejects a non-admin user through the admin authorization middleware", () => {
  let statusCode;
  let responseBody;
  let passedToNext = false;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  authorize("ADMIN")({ user: { role: "NORMAL_USER" } }, response, () => {
    passedToNext = true;
  });

  assert.equal(statusCode, 403);
  assert.equal(responseBody.success, false);
  assert.equal(passedToNext, false);
});

test("rejects duplicate email addresses", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({ id: account.id, role: account.role, ownedStore: null }),
      update: async () => {
        throw { code: "P2002" };
      },
    },
  };

  await assert.rejects(
    updateUserAccount(prisma, account.id, { email: "taken@example.com" }),
    (error) => error instanceof AdminUserManagementError && error.status === 409
  );
});

test("rejects changing the role of a Store Owner with an associated store", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: account.id,
        role: "STORE_OWNER",
        ownedStore: { id: "store-1" },
      }),
      update: async () => assert.fail("user update must not run"),
    },
  };

  await assert.rejects(
    updateUserAccount(prisma, account.id, { role: "NORMAL_USER" }),
    (error) => error instanceof AdminUserManagementError && error.status === 409
  );
});

test("resets a password with bcrypt and increments tokenVersion", async () => {
  let updateArgs;
  const prisma = {
    user: {
      findUnique: async () => ({ id: account.id }),
      update: async (args) => {
        updateArgs = args;
        return { id: account.id };
      },
    },
  };

  await resetUserPasswordForAdmin(prisma, account.id, "StrongPass!");

  assert.deepEqual(updateArgs.data.tokenVersion, { increment: 1 });
  assert.equal(await bcrypt.compare("StrongPass!", updateArgs.data.passwordHash), true);
  assert.notEqual(updateArgs.data.passwordHash, "StrongPass!");
});

test("prevents deleting the acting admin account without a transaction", async () => {
  const prisma = {
    $transaction: async () => assert.fail("transaction must not run"),
  };

  await assert.rejects(
    deleteUserAccount(prisma, "admin-1", "admin-1"),
    (error) => error instanceof AdminUserManagementError && error.status === 400
  );
});

test("prevents deleting a Store Owner who still owns a store", async () => {
  let deleteCalled = false;
  let transactionOptions;
  const prisma = {
    $transaction: async (callback, options) => {
      transactionOptions = options;
      return callback({
        user: {
          findUnique: async () => ({ id: account.id, ownedStore: { id: "store-1" } }),
          delete: async () => {
            deleteCalled = true;
          },
        },
      });
    },
  };

  await assert.rejects(
    deleteUserAccount(prisma, account.id, "admin-1"),
    (error) => error instanceof AdminUserManagementError && error.status === 409
  );
  assert.equal(transactionOptions.isolationLevel, "Serializable");
  assert.equal(deleteCalled, false);
});

test("deletes a user in a serializable transaction", async () => {
  let deletedId;
  let transactionOptions;
  const prisma = {
    $transaction: async (callback, options) => {
      transactionOptions = options;
      return callback({
        user: {
          findUnique: async () => ({ id: account.id, ownedStore: null }),
          delete: async ({ where }) => {
            deletedId = where.id;
            return { id: where.id };
          },
        },
      });
    },
  };

  await deleteUserAccount(prisma, account.id, "admin-1");

  assert.equal(deletedId, account.id);
  assert.equal(transactionOptions.isolationLevel, "Serializable");
});
