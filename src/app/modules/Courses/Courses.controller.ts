import httpStatus from "http-status";
import { CoursesService } from "./Courses.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { ICourse, updateICourse } from "./Courses.interface";
import { fileUploader } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";
import pick from "../../../shared/pick";
import { courseFilterableFields } from "./courses.costant";
import { Courses } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

/**
 * =========================
 * CREATE COURSE
 * =========================
 */
const createCourses = catchAsync(async (req: any, res: Response) => {
  const instructorId = req.user?.id;
  const userRole = req.user?.role;

  if (!instructorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access.");
  }

  if (userRole !== "INSTRUCTOR") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only instructors can create courses."
    );
  }

  const courseData: Courses = JSON.parse(req.body.text || "{}");

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const file = files?.file?.[0];

  if (!file) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No course thumbnail image uploaded."
    );
  }

  const uploadResult = await fileUploader.uploadToCloudinary(file);
  const thumbnailUrl = uploadResult?.Location;

  const result = await CoursesService.createIntoDb(
    courseData,
    instructorId,
    thumbnailUrl,
    courseData.categoryId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course created successfully.",
    data: result,
  });
});


/**
 * =========================
 * GET INACTIVE COURSES LIST
 * =========================
 */
const getCoursesDraftList = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const filters = pick(req.query, courseFilterableFields);
    const user = req.user;

    const instructorId = user?.role === "INSTRUCTOR" ? user.id : undefined;

    const course = await CoursesService.getDraftListFromDb(
      options,
      filters,
      instructorId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Courses list retrieved successfully",
      meta: course.meta,
      data: course.data,
    });
  }
);

/**
 * =========================
 * GET COURSES LIST
 * =========================
 */
const getCoursesList = catchAsync(async (req: any, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const filters = pick(req.query, courseFilterableFields);
  const user = req.user;

  const instructorId = user?.role === "INSTRUCTOR" ? user.id : undefined;

  const course = await CoursesService.getListFromDb(
    user.id,
    options,
    filters,
    instructorId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses list retrieved successfully",
    meta: course.meta,
    data: course.data,
  });
});

// =========================
// UPDATE COURSE STATUS
// =========================

const updateCourseStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await CoursesService.updateCourseStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course status updated successfully",
    data: result,
  });
});


/**
 * =========================
 * GET TOP REVIEWED COURSES
 * =========================
 */
const getTopCourses = catchAsync(async (req: any, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const userId = req.user.id;

  const courses = await CoursesService.getTopReviewedCourses(limit, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top reviewed courses retrieved successfully",
    data: courses,
  });
});

/**
 * =========================
 * RECOMMEND COURSE
 * =========================
 */
const recommendCourse = async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const courses = await CoursesService.recommendCourses(courseId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course recommended",
    data: courses,
  });
};

/**
 * =========================
 * GET RECOMMENDED COURSES
 * =========================
 */

const getRecommendedCourses = async (_req: Request, res: Response) => {
  const courses = await CoursesService.getRecommendedCourses();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recommended courses fetched",
    data: courses,
  });
};

/**
 * =========================
 * GET COURSE BY ID
 * =========================
 */
const getCoursesById = catchAsync(async (req: any, res: Response) => {
  const result = await CoursesService.getByIdFromDb(req.params.id, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses details retrieved successfully",
    data: result,
  });
});

const getDraftCoursesById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CoursesService.getDraftCoursesById(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Courses details retrieved successfully",
      data: result,
    });
  }
);

/**
 * =========================
 * UPDATE COURSE
 * =========================
 */
const updateCourses = catchAsync(async (req: any, res: Response) => {
  const instructorId = req.user?.id;
  const { id } = req.params;

  const courseData: updateICourse = JSON.parse(req.body.text || "{}");

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const file = files?.file?.[0];

  let thumbnailUrl: string | undefined;

  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    thumbnailUrl = uploadResult?.Location;
  }

  const course = await CoursesService.updateIntoDb(
    id,
    courseData,
    instructorId,
    thumbnailUrl
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses updated successfully",
    data: course,
  });
});

/**
 * =========================
 * DELETE COURSE
 * =========================
 */
const deleteCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await CoursesService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses deleted successfully",
    data: result,
  });
});

/**
 * =========================
 * DASHBOARD / COUNT ROUTES
 * =========================
 */
const allSuperAdminDashboardCount = catchAsync(async (req: Request, res: Response) => {
  const result = await CoursesService.allSuperAdminDashboardCount();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Super Admin Dashboard Count count retrieved successfully",
    data: result,
  });
});

const getTotalCoursesCount = catchAsync(async (req: Request, res: Response) => {
  const { instructorId } = req.params;
  const result = await CoursesService.getTotalCoursesCount(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total courses and price fetched successfully",
    data: result,
  });
});

const getStudentProgress = catchAsync(async (req: any, res) => {
  const studentId = req.user.id;

  const result = await CoursesService.getStudentVideoProgress(studentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student progress summary fetched successfully",
    data: result,
  });
});

/**
 * =========================
 * BUY COURSE
 * =========================
 */
const buyCourse = catchAsync(async (req: any, res: Response) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  const result = await CoursesService.buyCourse(userId, courseId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course purchased successfully",
    data: result,
  });
});

const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const courses = await CoursesService.getMyPurchasedCourses(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Purchased courses fetched successfully",
    data: courses,
  });
});

const getTotalSellCount = catchAsync(async (req: Request, res: Response) => {
  const { id: instructorId } = req.user as JwtPayload;

  const result = await CoursesService.getTotalSellCount(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All enrollments for your courses fetched successfully",
    data: result,
  });
});

/**
 * =========================================
 * SUPER ADMIN - TOTAL PLATFORM REVENUE
 * =========================================
 */
const getTotalRevenue = catchAsync(async (req: Request, res: Response) => {
  const result = await CoursesService.getTotalRevenue();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total platform revenue retrieved successfully",
    data: result,
  });
});

/**
 * =========================================
 * INSTRUCTOR - TOTAL REVENUE
 * =========================================
 */
const getInstructorRevenue = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any; // JWT payload

    const result = await CoursesService.getInstructorRevenue(user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Instructor revenue retrieved successfully",
      data: result,
    });
  }
);

/**
 * =========================================
 * INSTRUCTOR - COURSE ANALYTICS
 * =========================================
 */
const getInstructorCourseAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    const result =
      await CoursesService.getInstructorCourseAnalytics(user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Instructor course analytics retrieved successfully",
      data: result,
    });
  }
);

/**
 * =========================
 * EXPORT CONTROLLER
 * =========================
 */
export const CoursesController = {
  createCourses,
  getCoursesDraftList,
  getCoursesList,
  updateCourseStatus,
  getTopCourses,
  recommendCourse,
  getRecommendedCourses,
  getCoursesById,
  getDraftCoursesById,
  updateCourses,
  deleteCourses,
  allSuperAdminDashboardCount,
  getTotalCoursesCount,
  getStudentProgress,
  buyCourse,
  getMyCourses,
  getTotalSellCount,

  getTotalRevenue,
  getInstructorRevenue,
  getInstructorCourseAnalytics,
};