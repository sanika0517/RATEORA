
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import {
  deleteUserAccount,
  resetUserPasswordForAdmin,
  updateUserAccount,
} from "../services/admin-user-management.service.js";

// 1. ADMIN DASHBOARD STATISTICS
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings, usersByRole] =
      await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.rating.count(),
        prisma.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
      ]);

    const roleBreakdown = {
      ADMIN: 0,
      NORMAL_USER: 0,
      STORE_OWNER: 0,
    };

    usersByRole.forEach((item) => {
      roleBreakdown[item.role] = item._count.role;
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        usersByRole: roleBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE USER
export const createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        passwordHash,
        role,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET ALL USERS WITH SEARCH, FILTER, SORTING AND PAGINATION
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = "",
      role,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const allowedSortFields = ["name", "email", "createdAt"];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sorting field",
      });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({
        success: false,
        message: "Order must be asc or desc",
      });
    }

    const validRoles = ["ADMIN", "NORMAL_USER", "STORE_OWNER"];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const where = {
      ...(role && { role }),
      ...(search.trim() && {
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { email: { contains: search.trim(), mode: "insensitive" } },
          { address: { contains: search.trim(), mode: "insensitive" } },
        ],
      }),
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          [sortBy]: order,
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),

      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          totalUsers,
          currentPage,
          totalPages: Math.ceil(totalUsers / pageSize),
          pageSize,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET INDIVIDUAL USER DETAILS
export const getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStore: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let storeDetails = null;

    if (user.role === "STORE_OWNER" && user.ownedStore) {
      const ratings = user.ownedStore.ratings;
      const totalRatings = ratings.length;

      const averageRating =
        totalRatings > 0
          ? Number(
              (
                ratings.reduce((sum, item) => sum + item.rating, 0) /
                totalRatings
              ).toFixed(2)
            )
          : 0;

      storeDetails = {
        id: user.ownedStore.id,
        name: user.ownedStore.name,
        email: user.ownedStore.email,
        address: user.ownedStore.address,
        averageRating,
        totalRatings,
      };
    }

    const { ownedStore, ...userDetails } = user;

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: {
        ...userDetails,
        storeDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. UPDATE USER DETAILS AND ROLE
export const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserAccount(prisma, req.params.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// 6. RESET A USER PASSWORD AND REVOKE EXISTING SESSIONS
export const resetUserPassword = async (req, res, next) => {
  try {
    await resetUserPasswordForAdmin(prisma, req.params.userId, req.body.password);
    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Existing sessions have been invalidated.",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// 7. DELETE USER; RATINGS ARE CASCADE-DELETED BY THE DATABASE
export const deleteUser = async (req, res, next) => {
  try {
    await deleteUserAccount(prisma, req.params.userId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// 5. CREATE STORE
export const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check whether the owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        role: true,
        ownedStore: {
          select: { id: true },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Store Owner not found",
      });
    }

    // Ensure the selected user is a Store Owner
    if (owner.role !== "STORE_OWNER") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a Store Owner",
      });
    }

    // Prevent assigning multiple stores to one owner
    if (owner.ownedStore) {
      return res.status(409).json({
        success: false,
        message: "This Store Owner already has a store",
      });
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET ALL STORES WITH SEARCH, SORTING AND PAGINATION
export const getAllStores = async (req, res, next) => {
  try {
    const {
      search = "",
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const allowedSortFields = ["name", "email", "createdAt"];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sorting field",
      });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({
        success: false,
        message: "Order must be asc or desc",
      });
    }

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const where = search.trim()
      ? {
          OR: [
            { name: { contains: search.trim(), mode: "insensitive" } },
            { email: { contains: search.trim(), mode: "insensitive" } },
            { address: { contains: search.trim(), mode: "insensitive" } },
          ],
        }
      : {};

    const [stores, totalStores] = await Promise.all([
      prisma.store.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          [sortBy]: order,
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),

      prisma.store.count({ where }),
    ]);

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating =
        totalRatings > 0
          ? Number(
              (
                store.ratings.reduce(
                  (sum, item) => sum + item.rating,
                  0
                ) / totalRatings
              ).toFixed(2)
            )
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        averageRating,
        totalRatings,
        createdAt: store.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stores fetched successfully",
      data: {
        stores: formattedStores,
        pagination: {
          totalStores,
          currentPage,
          totalPages: Math.ceil(totalStores / pageSize),
          pageSize,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
