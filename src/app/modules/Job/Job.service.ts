
import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { AuthUser, CreateJobPayload, UpdateJobPayload } from "./Job.interface";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { jobSearchableFields } from "./Job.constant";

const createIntoDb = async (
  payload: CreateJobPayload,
  user: AuthUser,
  companyLogo: string
) => {
  if (
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  return prisma.job.create({
    data: {
      ...payload,
      companyLogo,
      admin: {
        connect: { id: user.id },
      },
    },
  });
};

const getAllFromDb = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.JobWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: jobSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.JobWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // ✅ FIXED SORTING
  const sortOptions: Prisma.JobOrderByWithRelationInput =
    options.sortBy && options.sortOrder
      ? {
          [options.sortBy]: options.sortOrder as Prisma.SortOrder,
        }
      : {
          createdAt: "desc",
        };

  const result = await prisma.job.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortOptions,
    include: {
      admin: true,
    },
  });

  const total = await prisma.job.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getByIdFromDb = async (id: string) => {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      admin: true,
    },
  });

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job not found");
  }

  return job;
};

const updateIntoDb = async (
  id: string,
  payload: UpdateJobPayload,
  user: AuthUser
) => {
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job not found");
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  return prisma.job.update({
    where: { id },
    data: payload,
  });
};

const deleteFromDb = async (id: string, user: AuthUser) => {
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  return prisma.job.delete({
    where: { id },
  });
};

export const JobService = {
  createIntoDb,
  getAllFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteFromDb,
};