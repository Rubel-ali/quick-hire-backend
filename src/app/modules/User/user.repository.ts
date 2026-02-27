import prisma from "../../../shared/prisma";
import { Prisma, User } from "@prisma/client";

const findUserByEmail = async (email: string) => {
  return prisma.user.findFirst({
    where: { email },
  });
};

const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const createUser = async (data: User) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      status: true,
      phoneNumber: true,
      country: true,
      region: true,
      isNotification: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getUsers = async (
  whereConditions: Prisma.UserWhereInput,
  skip: number,
  limit: number,
  sortOptions: any,
) => {
  return prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortOptions,
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      phoneNumber: true,
      isNotification: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const countUsers = async (whereConditions: Prisma.UserWhereInput) => {
  return prisma.user.count({
    where: whereConditions,
  });
};

const updateUserById = async (id: string, data: Partial<User>) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUserById = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};

export const UserRepository = {
  findUserByEmail,
  findUserById,
  createUser,
  getUsers,
  countUsers,
  updateUserById,
  deleteUserById,
};
