import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./Review.service";
import httpStatus from "http-status";

const createReview = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { courseId, rating } = req.body;

  const review = await ReviewService.createIntoDb(courseId, userId, rating);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Review submitted successfully",
    data: review,
  });
});

const getReviewList = catchAsync(async (req, res) => {
  const result = await ReviewService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review list retrieved successfully",
    data: result,
  });
});

const getReviewById = catchAsync(async (req, res) => {
  const result = await ReviewService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review details retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const result = await ReviewService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewList,
  getReviewById,
  updateReview,
  deleteReview,
};
