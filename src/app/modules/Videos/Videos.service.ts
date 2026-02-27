import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  IVideos,
  IVideosFilterRequest,
  updateIVideos,
} from "./Videos.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { videosSearchAbleFields } from "./Video.costant";
import { Prisma } from "@prisma/client";
// import { sumDurations } from "../../../shared/sumDuration";
import { fileUploader } from "../../../helpars/fileUploader";
// import { getVideoDurationFromBufferAlt } from "../../../shared/getVideoDuration";

const createIntoDb = async (
  data: IVideos,
  instructorId: string,
  courseId: string,
  thumbnailFile: Express.Multer.File,
  videoFile?: Express.Multer.File,
) => {
  if (!instructorId)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access.");

  if (!thumbnailFile)
    throw new ApiError(httpStatus.BAD_REQUEST, "Thumbnail is required");

  // 🔥 CHECK COURSE OWNERSHIP
  const course = await prisma.courses.findFirst({
    where: {
      id: courseId,
      instructorId,
    },
  });

  if (!course) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Course not found or unauthorized",
    );
  }

  const uploadThumbnailResult =
    await fileUploader.uploadToCloudinary(thumbnailFile);

  const thumbnailUrl = uploadThumbnailResult?.Location;

  let videoUrl: string | undefined;

  if (videoFile) {
    const uploadVideoResult = await fileUploader.uploadToCloudinary(videoFile);

    videoUrl = uploadVideoResult?.Location;
  }

  const existingVideoCount = await prisma.videos.count({
    where: { courseId },
  });

  const serialNo = existingVideoCount + 1;

  const video = await prisma.videos.create({
    data: {
      ...data,
      instructorId,
      courseId,
      thumbnailUrl,
      videoUrl: videoUrl ?? "",
      serialNo,
    },
  });

  await prisma.courses.update({
    where: { id: courseId },
    data: {
      videoCount: existingVideoCount + 1,
    },
  });

  return video;
};

const getListFromDb = async (
  options: IPaginationOptions,
  params: IVideosFilterRequest,
  instructorId: string,
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.VideosWhereInput[] = [{ instructorId }];

  if (searchTerm) {
    andConditions.push({
      OR: videosSearchAbleFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const result = await prisma.videos.findMany({
    where: { AND: andConditions },
    include: { user: { select: { id: true, username: true } } },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.videos.count({ where: { AND: andConditions } });

  return { meta: { page, limit, total }, data: result };
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.videos.findUnique({ where: { id } });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Video not found");
  return result;
};

const updateIntoDb = async (
  id: string,
  data: updateIVideos,
  instructorId: string,
  thumbnailFile?: Express.Multer.File,
) => {
  const video = await prisma.videos.findFirst({ where: { id, instructorId } });
  if (!video) throw new ApiError(httpStatus.NOT_FOUND, "Video not found");

  let thumbnailUrl = video.thumbnailUrl;
  if (thumbnailFile) {
    const uploadResult = await fileUploader.uploadToCloudinary(thumbnailFile);
    thumbnailUrl = uploadResult?.Location;
  }

  const updatedVideo = await prisma.videos.update({
    where: { id },
    data: { ...data, thumbnailUrl },
  });

  return updatedVideo;
};

const deleteItemFromDb = async (id: string) => {
  const video = await prisma.videos.findUnique({ where: { id } });
  if (!video) throw new ApiError(httpStatus.NOT_FOUND, "Video not found");

  await prisma.videos.delete({ where: { id } });

  // Update course videoCount and totalDuration after deletion
  const videos = await prisma.videos.findMany({
    where: { courseId: video.courseId },
    select: { videoDuration: true },
  });

  // const totalDuration = sumDurations(videos.map(v => v.videoDuration));

  await prisma.courses.update({
    where: { id: video.courseId },
    data: { videoCount: videos.length },
  });

  return video;
};

export const VideosService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
