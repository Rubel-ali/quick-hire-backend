import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { CreateApplicationData } from "./Application.interface";

type AuthUser = {
  id: string;
  role: UserRole;
};
const createIntoDb = async (
  payload: CreateApplicationData,
  user: AuthUser
) => {
  if (user.role !== UserRole.USER) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only users can apply");
  }

  if (!payload.resumeLink) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Resume link is required"
    );
  }

  // Job exists কিনা check
  const job = await prisma.job.findUnique({
    where: { id: payload.jobId },
  });

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job not found");
  }

  // Already applied কিনা check
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId: payload.jobId,
      },
    },
  });

  if (existingApplication) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already applied to this job"
    );
  }

  return prisma.application.create({
    data: {
      jobId: payload.jobId,
      userId: user.id,
      resumeLink: payload.resumeLink,
      coverNote: payload.coverNote,
    },
  });
};

const getAllFromDb = async () => {
  return prisma.application.findMany({
    include: {
      user: true,
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getByIdFromDb = async (id: string) => {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: true,
      job: true,
    },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  return application;
};

const getMyApplications = async (user: AuthUser) => {
  return prisma.application.findMany({
    where: { userId: user.id },
    include: {
      job: true,
    },
  });
};

const deleteFromDb = async (id: string, user: AuthUser) => {
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  // Only owner or admin can delete
  if (
    application.userId !== user.id &&
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  return prisma.application.delete({
    where: { id },
  });
};

export const ApplicationService = {
  createIntoDb,
  getAllFromDb,
  getByIdFromDb,
  getMyApplications,
  deleteFromDb,
};
