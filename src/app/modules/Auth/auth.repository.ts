import prisma from "../../../shared/prisma";
import { User } from "@prisma/client";

const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const getUserProfileById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      profileUrl: true,
      profileImage: true,
      role: true,
      status: true,
      isNotification: true,
      fcmToken: true,
      dob: true,
      phoneNumber: true,
    },
  });
};

const updateUserById = async (id: string, data: Partial<User>) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

const updateUserByEmail = async (email: string, data: Partial<User>) => {
  return prisma.user.update({
    where: { email },
    data,
  });
};

export const AuthRepository = {
  findUserByEmail,
  findUserById,
  getUserProfileById,
  updateUserById,
  updateUserByEmail,
};
