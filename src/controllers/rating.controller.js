import prisma from "../config/prisma.js";

// SUBMIT OR UPDATE STORE RATING
export const submitOrUpdateRating = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check whether store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Create a new rating or update existing rating
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        id: savedRating.id,
        storeId: savedRating.storeId,
        rating: savedRating.rating,
        createdAt: savedRating.createdAt,
        updatedAt: savedRating.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};