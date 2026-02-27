import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createIntoDb = async (
  courseId: string,
  studentId: string,
  rating: number
) => {
  // Validate course
  const course = await prisma.courses.findUnique({ where: { id: courseId } });
  if (!course) throw new ApiError(httpStatus.NOT_FOUND, "Course not found");

  // Check if user already reviewed
  const existingReview = await prisma.review.findFirst({
    where: { courseId, studentId },
  });

  if (existingReview) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You have already reviewed this course."
    );
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      rating,
      courseId,
      studentId,
    },
  });

  await prisma.courses.update({
    where: { id: courseId },
    data: {
      reviewCount: {
        increment: 1,
      },
    },
  });
  

  return review;
};

const getListFromDb = async () => {
  const result = await prisma.review.findMany();
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.review.findUnique({ where: { id } });
  if (!result) {
    throw new Error("review not found");
  }
  return result;
};

const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.review.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.review.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
export const ReviewService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
