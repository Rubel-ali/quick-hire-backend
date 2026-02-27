import ApiError from "../../../errors/ApiErrors";
import { IUser, IUserFilterRequest } from "./user.interface";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { userSearchAbleFields } from "./user.costant";
import config from "../../../config";
import httpStatus from "http-status";
import { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { UserRepository } from "./user.repository";

// ================= CREATE USER =================

const createUserIntoDb = async (payload: any) => {
  const existingUser = await UserRepository.findUserByEmail(payload.email);

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new ApiError(
        400,
        `User with this email ${payload.email} already exists`,
      );
    }
    if (existingUser.username === payload.username) {
      throw new ApiError(
        400,
        `User with this username ${payload.username} already exists`,
      );
    }
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await UserRepository.createUser({
    ...payload,
    password: hashedPassword,
  });

  const accessToken = jwtHelpers.createToken(
    {
      id: result.id,
      email: result.email,
      role: result.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return { token: accessToken, result };
};

// ================= GET USERS =================

const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [
    {
      role: { not: "SUPER_ADMIN" },
    }
  ];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const sortOptions =
    options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: "desc" };

  const result = await UserRepository.getUsers(
    whereConditions,
    skip,
    limit,
    sortOptions,
  );

  const total = await UserRepository.countUsers(whereConditions);

  return {
    meta: { page, limit, total },
    data: result,
  };
};

// ================= UPDATE PROFILE =================

const updateProfile = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const file = files?.file?.[0];
  const stringData = req.body.text;

  const userId = req.user && (req.user as any).id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const existingUser = await UserRepository.findUserById(userId);
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  let image;
  if (file) {
    image = (await fileUploader.uploadToCloudinary(file)).Location;
  }

  const parseData = stringData ? JSON.parse(stringData) : {};

  const result = await UserRepository.updateUserById(existingUser.id, {
    username: parseData.username || existingUser.username,
    dob: parseData.dob || existingUser.dob,
    email: parseData.email || existingUser.email,
    profileImage: image || existingUser.profileImage,
    phoneNumber: parseData.phoneNumber || existingUser.phoneNumber,
  });

  return result;
};

// ================= ADMIN UPDATE USER =================

const updateUserIntoDb = async (payload: IUser, id: string) => {
  const userInfo = await UserRepository.findUserById(id);

  if (!userInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);
  }

  return UserRepository.updateUserById(userInfo.id, payload);
};

// ================= RESTRICT USER =================

const restictedUser = async (id: string, status: any) => {
  const user = await UserRepository.findUserById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return UserRepository.updateUserById(user.id, { status });
};

// ================= TOGGLE NOTIFICATION =================

const changeNotificationStatus = async (userId: string) => {
  const user = await UserRepository.findUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return UserRepository.updateUserById(user.id, {
    isNotification: !user.isNotification,
  });
};

// ================= DELETE USER =================

const deleteUserFromDb = async (id: string) => {
  const userInfo = await UserRepository.findUserById(id);

  if (!userInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);
  }

  return UserRepository.deleteUserById(userInfo.id);
};

// ================= GET SINGLE USER =================

const getUserById = async (id: string) => {
  const userInfo = await UserRepository.findUserById(id);

  if (!userInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);
  }

  return userInfo;
};

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  updateProfile,
  updateUserIntoDb,
  changeNotificationStatus,
  restictedUser,
  deleteUserFromDb,
  getUserById,
};
