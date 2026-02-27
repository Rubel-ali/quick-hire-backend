import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

// ================= SUPER ADMIN DASHBOARD =================

const getSuperAdminDashboard = catchAsync(async (req, res) => {
  const result = await DashboardService.getSuperAdminDashboard();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Super Admin Dashboard data fetched successfully",
    data: result,
  });
});

// ================= ADMIN DASHBOARD =================

const getAdminDashboard = catchAsync(async (req, res) => {
  const result = await DashboardService.getAdminDashboard();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin dashboard fetched successfully",
    data: result,
  });
});

// ================= INSTRUCTOR DASHBOARD =================

const getInstructorDashboard = catchAsync(async (req: any, res) => {
  const instructorId = req.user.id;

  const result = await DashboardService.getInstructorDashboard(instructorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Instructor dashboard fetched successfully",
    data: result,
  });
});

// ================= INSTRUCTOR DASHBOARD =================
const getStudentDashboard = catchAsync(async (req: any, res) => {
  const studentId = req.user.id;

  const result = await DashboardService.getStudentDashboard(studentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student dashboard fetched successfully",
    data: result,
  });
});

const getInstructorAnalytics = catchAsync(async (req, res) => {
  const instructorId = req.user?.id;

  const result = await DashboardService.getInstructorAnalytics(instructorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Instructor analytics fetched successfully",
    data: result,
  });
});

export const DashboardController = {
  getSuperAdminDashboard,
  getAdminDashboard,
  getInstructorDashboard,
  getStudentDashboard,
  getInstructorAnalytics,
};
