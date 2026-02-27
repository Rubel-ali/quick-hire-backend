import express from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./dashboard.controller";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/super-admin-dashboard",
  auth(UserRole.SUPER_ADMIN),
  DashboardController.getSuperAdminDashboard,
);

router.get(
  "/admin-dashboard",
  auth(UserRole.ADMIN),
  DashboardController.getAdminDashboard,
);

router.get(
  "/instructor-dashboard",
  auth(UserRole.INSTRUCTOR),
  DashboardController.getInstructorDashboard,
);

router.get(
  "/instructor-analytics",
  auth(UserRole.INSTRUCTOR),
  DashboardController.getInstructorAnalytics,
);

router.get(
  "/student-dashboard",
  auth(UserRole.STUDENT),
  DashboardController.getStudentDashboard
);


export const DashboardRoutes = router;
