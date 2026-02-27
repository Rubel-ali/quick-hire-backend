import httpStatus from "http-status";
import { VideosService } from "./Videos.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import ApiError from "../../../errors/ApiErrors";
import { IVideos, updateIVideos } from "./Videos.interface";
import pick from "../../../shared/pick";
import { videosFilterableFields } from "./Video.costant";

/**
 * CREATE VIDEO
 */
const createVideos = catchAsync(async (req: any, res: Response) => {
  const instructorId = req.user?.id;
  const userRole = req.user?.role;
  const courseId = req.params.id;

  if (!instructorId)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  if (userRole !== "INSTRUCTOR")
    throw new ApiError(httpStatus.FORBIDDEN, "Only instructors can create videos");

  const videosData: IVideos = JSON.parse(req.body.text || "{}");
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Service handles file upload now
  const result = await VideosService.createIntoDb(
    videosData,
    instructorId,
    courseId,
    files?.file?.[0],
    files?.video?.[0]
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Video created successfully",
    data: result,
  });
});

/**
 * GET VIDEOS LIST
 */
const getVideosList = catchAsync(async (req: any, res: Response) => {
  const options = pick(req.query, ["limit", "page"]);
  const filters = pick(req.query, videosFilterableFields);
  const instructorId = req.user?.id;

  const videos = await VideosService.getListFromDb(options, filters, instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Videos list retrieved successfully",
    meta: videos.meta,
    data: videos.data,
  });
});

/**
 * GET VIDEO BY ID
 */
const getVideosById = catchAsync(async (req: Request, res: Response) => {
  const result = await VideosService.getByIdFromDb(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Video details retrieved successfully",
    data: result,
  });
});

/**
 * UPDATE VIDEO
 */
const updateVideos = catchAsync(async (req: any, res: Response) => {
  const instructorId = req.user?.id;
  const { id } = req.params;
  const videosData: updateIVideos = JSON.parse(req.body.text || "{}");
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Service handles thumbnail upload
  const result = await VideosService.updateIntoDb(
    id,
    videosData,
    instructorId,
    files?.file?.[0]
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Video updated successfully",
    data: result,
  });
});

/**
 * DELETE VIDEO
 */
const deleteVideos = catchAsync(async (req: Request, res: Response) => {
  const result = await VideosService.deleteItemFromDb(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Video deleted successfully",
    data: result,
  });
});

export const VideosController = {
  createVideos,
  getVideosList,
  getVideosById,
  updateVideos,
  deleteVideos,
};