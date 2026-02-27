import prisma from "../../../shared/prisma";
import { Prisma } from "@prisma/client";

// ================= BASIC COURSE =================

const findCourseById = async (id: string) => {
  return prisma.courses.findUnique({
    where: { id },
  });
};

const createCourse = async (data: any) => {
  return prisma.courses.create({
    data,
    include: {
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
    },
  });
};

const updateCourse = async (id: string, data: any) => {
  return prisma.courses.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, username: true } },
    },
  });
};

const deleteCourse = async (id: string) => {
  return prisma.courses.delete({
    where: { id },
  });
};

// ================= LIST & FILTER =================

const getCourses = async (
  where: Prisma.CoursesWhereInput,
  skip: number,
  take: number,
  orderBy: any,
  studentId?: string,
) => {
  return prisma.courses.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
      enrollments: studentId
        ? { where: { studentId }, select: { id: true } }
        : false,
    },
  });
};

const countCourses = async (where: Prisma.CoursesWhereInput) => {
  return prisma.courses.count({ where });
};

// ================= ENROLLMENT =================

const findEnrollment = async (studentId: string, courseId: string) => {
  return prisma.enrollment.findFirst({
    where: { studentId, courseId },
  });
};

const createEnrollment = async (data: any) => {
  return prisma.enrollment.create({ data });
};

const getStudentEnrollments = async (studentId: string) => {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          user: { select: { id: true, username: true } },
          category: { select: { id: true, name: true } },
        },
      },
    },
  });
};

// ================= DASHBOARD =================

const countUsersByRole = async (role: any) => {
  return prisma.user.count({ where: { role } });
};

const countAllCourses = async () => prisma.courses.count();

const countAllEnrollments = async () => prisma.enrollment.count();

const findEnrollmentsByInstructor = async (instructorId: string) => {
  return prisma.enrollment.findMany({
    where: { course: { instructorId } },
    include: { course: { select: { price: true, name: true } } },
  });
};

const getAllEnrollmentsWithCourse = async () => {
  return prisma.enrollment.findMany({
    include: { course: { select: { price: true } } },
  });
};

export const CoursesRepository = {
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  countCourses,
  findEnrollment,
  createEnrollment,
  getStudentEnrollments,
  countUsersByRole,
  countAllCourses,
  countAllEnrollments,
  findEnrollmentsByInstructor,
  getAllEnrollmentsWithCourse,
};
