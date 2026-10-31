import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export class AdminUserManagementError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUserAccount(prisma, userId, input) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, ownedStore: { select: { id: true } } },
  });

  if (!existingUser) throw new AdminUserManagementError(404, "User not found");

  if (
    existingUser.ownedStore &&
    input.role !== undefined &&
    input.role !== "STORE_OWNER"
  ) {
    throw new AdminUserManagementError(
      409,
      "A Store Owner with an associated store cannot be assigned another role"
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return safeUser(updated);
  } catch (error) {
    if (error.code === "P2002") {
      throw new AdminUserManagementError(409, "Email is already registered");
    }
    if (error.code === "P2025") throw new AdminUserManagementError(404, "User not found");
    throw error;
  }
}

export async function resetUserPasswordForAdmin(prisma, userId, password) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) throw new AdminUserManagementError(404, "User not found");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
    select: { id: true },
  });
}

export async function deleteUserAccount(prisma, userId, adminId) {
  if (userId === adminId) {
    throw new AdminUserManagementError(400, "You cannot delete your own account");
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, ownedStore: { select: { id: true } } },
        });
        if (!user) throw new AdminUserManagementError(404, "User not found");
        if (user.ownedStore) {
          throw new AdminUserManagementError(
            409,
            "This Store Owner still has an associated store"
          );
        }

        // Rating.userId uses ON DELETE CASCADE, so its ratings are removed atomically.
        await tx.user.delete({ where: { id: userId }, select: { id: true } });
      },
      { isolationLevel: "Serializable" }
    );
  } catch (error) {
    if (error instanceof AdminUserManagementError) throw error;
    if (error.code === "P2025") throw new AdminUserManagementError(404, "User not found");
    if (error.code === "P2003") {
      throw new AdminUserManagementError(
        409,
        "This account is still referenced by another record"
      );
    }
    throw error;
  }
}
