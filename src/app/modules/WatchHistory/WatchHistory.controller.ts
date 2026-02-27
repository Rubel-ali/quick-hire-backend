import httpStatus from "http-status";
import { WatchHistoryService } from "./WatchHistory.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";

const createWatchHistoryController = async (req: Request, res: Response) => {
  const { studentId, videoId } = req.body;

  const result = await WatchHistoryService.createWatchHistory(
    studentId,
    videoId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "WatchHistory created successfully",
    data: result,
  });
};

const getWatchHistoryList = catchAsync(async (req, res) => {
  const result = await WatchHistoryService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "WatchHistory list retrieved successfully",
    data: result,
  });
});

const getWatchHistoryById = catchAsync(async (req, res) => {
  const result = await WatchHistoryService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "WatchHistory details retrieved successfully",
    data: result,
  });
});

const updateWatchHistory = catchAsync(async (req, res) => {
  const result = await WatchHistoryService.updateIntoDb(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "WatchHistory updated successfully",
    data: result,
  });
});

const deleteWatchHistory = catchAsync(async (req, res) => {
  const result = await WatchHistoryService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "WatchHistory deleted successfully",
    data: result,
  });
});

export const WatchHistoryController = {
  createWatchHistoryController,
  getWatchHistoryList,
  getWatchHistoryById,
  updateWatchHistory,
  deleteWatchHistory,
};
