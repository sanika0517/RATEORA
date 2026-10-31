import prisma from "../config/prisma.js";

// STORE OWNER DASHBOARD
export const getOwnerDashboard = async (req, res, next) => {
  try {
    // Find the store belonging to the logged-in owner
    const store = await prisma.store.findUnique({
      where: {
        ownerId: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this Store Owner",
      });
    }

    // Fetch rating statistics and users
    const [ratingStats, ratings] = await Promise.all([
      prisma.rating.aggregate({
        where: {
          storeId: store.id,
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
          storeId: store.id,
        },
        select: {
          id: true,
          rating: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Store Owner dashboard fetched successfully",
      data: {
        store,
        averageRating: ratingStats._avg.rating
          ? Number(ratingStats._avg.rating.toFixed(2))
          : 0,
        totalRatings: ratingStats._count.rating,
        ratings,
      },
    });
  } catch (error) {
    next(error);
  }
};