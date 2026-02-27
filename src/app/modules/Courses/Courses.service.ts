import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import {
  ICourse,
  ICourseFilterRequest,
  updateICourse,
} from "./Courses.interface";
import httpStatus from "http-status";

const createIntoDb = async (
  data: ICourse,
  instructorId: string,
  thumbnailUrl: string,
  categoryId: string,
) => {
  if (!instructorId) throw new ApiError(400, "Missing instructorId");
  if (!categoryId) throw new ApiError(400, "Missing categoryId");

  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
  });
  if (!instructor) throw new ApiError(404, "Instructor not found");
  if (instructor.role !== "INSTRUCTOR")
    throw new ApiError(403, "Only instructors can create courses");

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw new ApiError(404, "Category not found");

  const course = await prisma.courses.create({
    data: {
      ...data,
      instructorId,
      thumbnailUrl,
      categoryId,
    },
    include: {
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return course;
};

const getListFromDb = async (
  userId: string,
  options: IPaginationOptions,
  params: ICourseFilterRequest & { minPrice?: number; maxPrice?: number },
  instructorId?: string,
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  const andConditions: Prisma.CoursesWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { category: { name: { contains: searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: (filterData as any)[key],
      })),
    });
  }

  andConditions.push({ activeStatus: "PUBLISHED" });

  if (instructorId) andConditions.push({ instructorId });

  const whereConditions: Prisma.CoursesWhereInput = { AND: andConditions };

  const result = await prisma.courses.findMany({
    where: whereConditions,
    include: {
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
      enrollments: { where: { studentId: userId }, select: { id: true } },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const coursesWithBuyStatus = result.map((course) => ({
    ...course,
    isBuy: course.enrollments.length > 0,
  }));

  const total = await prisma.courses.count({ where: whereConditions });

  return { meta: { page, limit, total }, data: coursesWithBuyStatus };
};

/**
 * =========================
 * GET DRAFT COURSES LIST
 * =========================
 */

const getDraftListFromDb = async (
  options: IPaginationOptions,
  params: ICourseFilterRequest & { minPrice?: number; maxPrice?: number },
  instructorId?: string,
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  const andConditions: Prisma.CoursesWhereInput[] = [];

  // 🔍 Search by course name and category name
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // 💵 Filter by min and max price
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    });
  }

  // 🧩 Additional filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // ✅ Always filter only DRAFT courses
  // andConditions.push({
  //   activeStatus: "DRAFT",
  // });

  // 🧑‍🏫 Filter by instructorId
  if (instructorId) {
    andConditions.push({
      instructorId,
    });
  }

  // Final WHERE
  const whereConditions: Prisma.CoursesWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.courses.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      category: {
        include: {
          // subcategories: {
          //   include: {
          //     subcategories2: true,
          //   },
          // },
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.courses.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

/**
 * =========================
 * GET TOP REVIEWED COURSES
 * =========================
 */

const getTopReviewedCourses = async (limit: number = 5, userId: string) => {
  const topCourseRatings = await prisma.review.groupBy({
    by: ["courseId"],
    _avg: { rating: true },
    orderBy: { _avg: { rating: "desc" } },
    take: limit,
  });

  const courseIds = topCourseRatings.map((item) => item.courseId);
  if (courseIds.length === 0) return [];

  const courses = await prisma.courses.findMany({
    where: { id: { in: courseIds }, activeStatus: "PUBLISHED" },
    include: {
      enrollments: { where: { studentId: userId }, select: { id: true } },
      review: true,
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
    },
  });

  const ratingMap = new Map(
    topCourseRatings.map((r) => [r.courseId, r._avg.rating]),
  );
  return courses
    .map((course) => ({
      ...course,
      isBuy: course.enrollments.length > 0,
      avgRating: ratingMap.get(course.id) ?? 0,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);
};

// =========================
// GET COURSE BY ID
// =========================

const getByIdFromDb = async (id: string, userId: string) => {
  const course = await prisma.courses.findUnique({
    where: { id },
    include: {
      videos: true,
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
    },
  });
  if (!course) throw new ApiError(404, "Course not found");
  return course;
};

// =========================
// GET DRAFT COURSE BY ID
// =========================

const getDraftCoursesById = async (id: string) => {
  const course = await prisma.courses.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      category: { select: { id: true, name: true } },
    },
  });
  if (!course || course.activeStatus !== "DRAFT")
    throw new ApiError(404, "Draft course not found");
  return course;
};

// =========================
// UPDATE COURSE STATUS (PUBLISH / UNPUBLISH)
// =========================

const updateCourseStatus = async (id: string, status: any) => {
  const course = await prisma.courses.findUnique({
    where: { id },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const updatedCourse = await prisma.courses.update({
    where: { id },
    data: {
      activeStatus: status,
    },
  });

  return updatedCourse;
};

/**
 * =========================
 * DASHBOARD FUNCTIONS
 * =========================
 */
const allSuperAdminDashboardCount = async () => {
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalInstructors = await prisma.user.count({
    where: { role: "INSTRUCTOR" },
  });
  const totalCourses = await prisma.courses.count();
  const totalEnrollments = await prisma.enrollment.count();
  return { totalStudents, totalInstructors, totalCourses, totalEnrollments };
};

const getTotalCoursesCount = async (instructorId: string) => {
  const totalCourses = await prisma.courses.count({ where: { instructorId } });
  return totalCourses;
};

const getStudentVideoProgress = async (studentId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: { select: { id: true } } },
  });

  const progressList = [];
  for (const enroll of enrollments) {
    const totalVideos = await prisma.videos.count({
      where: { courseId: enroll.course.id },
    });
    const watchedVideos = await prisma.watchHistory.count({
      where: { studentId: studentId, video: { courseId: enroll.course.id } },
    });
    const progress = totalVideos ? (watchedVideos / totalVideos) * 100 : 0;
    progressList.push({
      courseId: enroll.course.id,
      progress: Number(progress.toFixed(2)),
    });
  }

  return progressList;
};

const getTotalSellCount = async (instructorId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId } },
  });
  return enrollments.length;
};

/**
 * =========================
 * RECOMMENDED COURSES
 * =========================
 */
const recommendCourses = async (courseId: string) => {
  return await prisma.courses.update({
    where: { id: courseId },
    data: { recommended: true },
  });
};

/**
 * =========================
 * GET RECOMMENDED COURSES
 * =========================
 */

const getRecommendedCourses = async () => {
  return await prisma.courses.findMany({
    where: { recommended: true, activeStatus: "PUBLISHED" },
    include: { user: { select: { username: true, email: true } } },
  });
};

/**
 * =========================
 * UPDATE COURSE -- ADMIN CAN UPDATE ANY COURSE, INSTRUCTOR CAN UPDATE ONLY HIS COURSE
 * =========================
 */
const updateIntoDb = async (
  id: string,
  data: updateICourse,
  instructorId: string,
  thumbnailUrl?: string,
) => {
  const isExitsCourse = await prisma.courses.findFirst({
    where: { id, instructorId },
  });
  if (!isExitsCourse) {
    throw new ApiError(404, "Course not found");
  }

  const updateData: any = { ...data };

  if (thumbnailUrl !== undefined) {
    updateData.thumbnailUrl = thumbnailUrl;
  }

  // Ensure categoryId (or any optional field) is only set if not undefined
  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId;
  }

  const updatedCourse = await prisma.courses.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return updatedCourse;
};

/**
 * =========================
 * DELETE COURSE -- ADMIN CAN DELETE ANY COURSE, INSTRUCTOR CAN DELETE ONLY HIS COURSE
 * =========================
 */
const deleteItemFromDb = async (id: string) => {
  const course = await prisma.courses.findUnique({ where: { id } });
  if (!course) throw new ApiError(404, "Course not found");
  await prisma.courses.delete({ where: { id } });
  return { message: "Course deleted successfully" };
};

/**
 * =========================
 * MY PURCHASED COURSES -- STUDENT
 * =========================
 */
const getMyPurchasedCourses = async (studentId: string) => {
  const enrollments = await prisma.enrollment.findMany({
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
  return enrollments.map((e) => e.course);
};

/**
 * =========================
 * BUY COURSE
 * =========================
 */
const buyCourse = async (
  studentId: string,
  courseId: string,
  // paymentId?: string,
) => {
  const course = await prisma.courses.findUnique({ where: { id: courseId } });
  if (!course) throw new ApiError(404, "Course not found");

  const alreadyEnrolled = await prisma.enrollment.findFirst({
    where: { courseId, studentId },
  });
  if (alreadyEnrolled) throw new ApiError(400, "Course already purchased");

  const enrollment = await prisma.enrollment.create({
    data: { courseId, studentId },
  });
  return enrollment;
};

/**
 * =========================
 * GET STUDENT VIDEO PROGRESS
 * =========================
 */

// const getStudentVideoProgress = async (instructorId: string) => {

/**
 * =========================
 * GET TOTAL REVENUE SUPER ADMIN → Total Revenue
 * =========================
 */

const getTotalRevenue = async () => {
  const enrollments = await prisma.enrollment.findMany({
    include: { course: { select: { price: true } } },
  });

  const totalRevenue = enrollments.reduce((sum, e) => sum + e.course.price, 0);

  return {
    totalRevenue,
    totalSales: enrollments.length,
  };
};

/**
 * =========================
 * GET INSTRUCTOR REVENUE
 * =========================
 */

const getInstructorRevenue = async (instructorId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId } },
    include: { course: { select: { price: true, name: true } } },
  });

  const totalRevenue = enrollments.reduce((sum, e) => sum + e.course.price, 0);

  return {
    totalRevenue,
    totalSales: enrollments.length,
  };
};

/**
 * =========================
 * GET INSTRUCTOR COURSE ANALYTICS
 * =========================
 */

const getInstructorCourseAnalytics = async (instructorId: string) => {
  const courses = await prisma.courses.findMany({
    where: { instructorId },
    include: {
      enrollments: {
        include: {
          course: { select: { price: true } },
        },
      },
    },
  });

  return courses.map((course) => {
    const totalStudents = course.enrollments.length;

    const revenue = course.enrollments.reduce((sum, e) => sum + course.price, 0);

    return {
      courseId: course.id,
      courseName: course.name,
      totalStudents,
      revenue,
    };
  });
};

//   const enrollments = await prisma.enrollment.findMany({
//     where: { instructorId },
//     include: { course: { select: { id: true } } },
//   });

//   const progressList = [];

//   for (const enroll of enrollments) {
//     const totalVideos = await prisma.videos.count({
//       where: { courseId: enroll.course.id },
//     });

//     const watchedVideos = await prisma.watchHistory.count({
//       where: {
//         userId: instructorId,
//         video: { courseId: enroll.course.id },
//       },
//     });

//     const progress = totalVideos ? (watchedVideos / totalVideos) * 100 : 0;

//     // 🔥 AUTO COMPLETE
//     if (progress === 100 && enroll.status === "ACTIVE") {
//       await prisma.enrollment.update({
//         where: { id: enroll.id },
//         data: { status: "COMPLETED" },
//       });
//     }

//     progressList.push({
//       courseId: enroll.course.id,
//       progress: Number(progress.toFixed(2)),
//     });
//   }

//   return progressList;
// };


export const CoursesService = {
  // Instructor
  createIntoDb,
  updateIntoDb,
  updateCourseStatus,
  deleteItemFromDb,
  getTotalCoursesCount,
  getTotalSellCount,
  getDraftListFromDb,
  // REVENUE
  getInstructorRevenue,
  // ANALYTICS
  getInstructorCourseAnalytics,

  // Student
  getListFromDb,
  getMyPurchasedCourses,
  buyCourse,
  getStudentVideoProgress,
  getTopReviewedCourses,

  // Admin
  getDraftCoursesById,
  allSuperAdminDashboardCount,
  recommendCourses,
  getRecommendedCourses,

  // AUTO COMPLETE
  // getStudentVideoProgress,

  // REVENUE
  getTotalRevenue,

  // Common
  getByIdFromDb,
};
