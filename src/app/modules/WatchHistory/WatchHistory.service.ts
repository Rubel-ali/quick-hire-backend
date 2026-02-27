import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createWatchHistory = async (studentId: string, videoId: string) => {
  // 🔍 Check if user exists
  const user = await prisma.user.findUnique({ where: { id: studentId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // 🔍 Check if video exists
  const video = await prisma.videos.findUnique({ where: { id: videoId } });
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, "Video not found");
  }

  // ✅ Check if already exists, return it instead of throwing
  const existing = await prisma.watchHistory.findUnique({
    where: {
      studentId_videoId: {
        studentId,
        videoId,
      },
    },
  });

  if (existing) {
    return existing; // ✅ Return existing watch history instead of throwing
  }

  // ✅ Create new record if not exists
  const watchHistory = await prisma.watchHistory.create({
    data: {
      studentId,
      videoId,
    },
  });

  return watchHistory;
};

const getListFromDb = async () => {
  const result = await prisma.watchHistory.findMany();
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.watchHistory.findUnique({ where: { id } });
  if (!result) {
    throw new Error("watchHistory not found");
  }
  return result;
};

const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.watchHistory.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.watchHistory.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
export const WatchHistoryService = {
  createWatchHistory,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
