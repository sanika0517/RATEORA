import prisma from "../config/prisma.js";

// GET ALL STORES WITH SEARCH, SORTING AND PAGINATION
export const getAllStores = async (req, res, next) => {
  try {
    const {
      search = "",
      sortBy = "name",
      order = "asc",
      page = "1",
      limit = "10",
    } = req.query;

    // Validate sorting fields
    const allowedSortFields = ["name", "address", "createdAt"];

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

    // Pagination
    const currentPage = Math.max(
      1,
      Number.parseInt(page, 10) || 1
    );

    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    // Search by store name or address
    const where = search.trim()
      ? {
          OR: [
            {
              name: {
                contains: search.trim(),
                mode: "insensitive",
              },
            },
            {
              address: {
                contains: search.trim(),
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    // Fetch stores and total count
    const [stores, totalStores] = await Promise.all([
      prisma.store.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
        orderBy: {
          [sortBy]: order,
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),

      prisma.store.count({ where }),
    ]);

    const storeIds = stores.map((store) => store.id);

    // Fetch overall ratings and current user's ratings
    const [ratingStats, userRatings] = await Promise.all([
      prisma.rating.groupBy({
        by: ["storeId"],
        where: {
          storeId: {
            in: storeIds,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      }),

      prisma.rating.findMany({
        where: {
          userId: req.user.id,
          storeId: {
            in: storeIds,
          },
        },
        select: {
          storeId: true,
          rating: true,
        },
      }),
    ]);

    // Format store listing
    const formattedStores = stores.map((store) => {
      const stats = ratingStats.find(
        (item) => item.storeId === store.id
      );

      const userRating = userRatings.find(
        (item) => item.storeId === store.id
      );

      return {
        ...store,
        averageRating: stats?._avg.rating
          ? Number(stats._avg.rating.toFixed(2))
          : 0,
        totalRatings: stats?._count.rating || 0,
        userRating: userRating?.rating ?? null,
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