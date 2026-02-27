import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CoursesController } from "./Courses.controller";
import { CoursesValidation } from "./Courses.validation";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * =========================================
 * COURSE CREATION (INSTRUCTOR ONLY)
 * =========================================
 */
router.post(
  "/create-course",
  auth(UserRole.INSTRUCTOR),
  fileUploader.uploadCourseImage,
  // validateRequest(CoursesValidation.createCourseSchema),
  CoursesController.createCourses,
);

/**
 * =========================================
 * COURSE LISTING -- PULISHED COURSES -- ALL AUTHENTICATED USERS
 * =========================================
 */

router.get(
  "/",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.INSTRUCTOR,
    UserRole.STUDENT,
  ),
  CoursesController.getCoursesList,
);

router.put(
  "/status/:id",
  auth(UserRole.INSTRUCTOR, UserRole.ADMIN),
  CoursesController.updateCourseStatus,
);

/** Inactive Courses (Admin + Super Admin Only) */
router.get(
  "/draft",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  CoursesController.getCoursesDraftList,
);

/** Single Draf Course */
router.get(
  "/draft/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CoursesController.getDraftCoursesById,
);

/**
 * =========================================
 * DASHBOARD & ANALYTICS
 * =========================================
 */

/** Super Admin Global Dashboard Count */
router.get(
  "/allSuperAdminDashboardCount",
  auth(UserRole.SUPER_ADMIN),
  CoursesController.allSuperAdminDashboardCount,
);

/** Top Courses (Admin + Super Admin) */
router.get(
  "/topCourses",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CoursesController.getTopCourses,
);

/**
 * =========================================
 * STUDENT FEATURES
 * =========================================
 */

/** Student Progress */
router.get(
  "/studentProgress",
  auth(UserRole.STUDENT),
  CoursesController.getStudentProgress,
);

/** Buy / Enroll Course */
router.post("/buy", auth(UserRole.STUDENT), CoursesController.buyCourse);

/** My Courses (Student & Instructor) */
router.get(
  "/my-courses",
  auth(UserRole.STUDENT, UserRole.INSTRUCTOR),
  CoursesController.getMyCourses,
);

/**
 * =========================================
 * INSTRUCTOR FEATURES
 * =========================================
 */

/** Instructor Total Sell Count */
router.get(
  "/sell",
  auth(UserRole.INSTRUCTOR),
  CoursesController.getTotalSellCount,
);

/** Instructor Revenue */
router.get(
  "/revenue",
  auth(UserRole.INSTRUCTOR),
  CoursesController.getTotalRevenue,
);

/** Instructor Course Count (Admin can view any) */
router.get(
  "/start/:instructorId",
  auth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CoursesController.getTotalCoursesCount,
);

router.get(
  "/revenue/instructor",
  auth(UserRole.INSTRUCTOR),
  CoursesController.getInstructorRevenue,
);

router.get(
  "/analytics/instructor",
  auth(UserRole.INSTRUCTOR),
  CoursesController.getInstructorCourseAnalytics,
);

/**
 * =========================================
 * RECOMMENDATION SYSTEM
 * =========================================
 */

/** Get Recommended Courses */
router.get(
  "/recommend",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.INSTRUCTOR,
    UserRole.STUDENT,
  ),
  CoursesController.getRecommendedCourses,
);

/** Recommend Course */
router.post(
  "/recommend/:id",
  auth(UserRole.INSTRUCTOR, UserRole.SUPER_ADMIN),
  CoursesController.recommendCourse,
);

/**
 * =========================================
 * UPDATE & DELETE
 * =========================================
 */

/** Update Course (Instructor Own / Admin Override) */
router.put(
  "/:id",
  auth(UserRole.INSTRUCTOR, UserRole.ADMIN),
  fileUploader.uploadCourseImage,
  validateRequest(CoursesValidation.updateCourseSchema),
  CoursesController.updateCourses,
);

/** Delete Course */
router.delete(
  "/:id",
  auth(UserRole.INSTRUCTOR, UserRole.ADMIN),
  CoursesController.deleteCourses,
);

/**
 * =========================================
 * GET COURSE BY ID (Keep at Bottom)
 * =========================================
 */
router.get(
  "/:id",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.INSTRUCTOR,
    UserRole.STUDENT,
  ),
  CoursesController.getCoursesById,
);

export const CoursesRoutes = router;
