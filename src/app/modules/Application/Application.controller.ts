import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { ApplicationService } from "./Application.service";
import sendResponse from "../../../shared/sendResponse";

type AuthUser = {
  id: string;
  role: any;
};

const createApplication = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  const result = await ApplicationService.createIntoDb(req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.getAllFromDb();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applications retrieved successfully",
    data: result,
  });
});

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.getByIdFromDb(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application details retrieved successfully",
    data: result,
  });
});

const getMyApplications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  const result = await ApplicationService.getMyApplications(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My applications retrieved successfully",
    data: result,
  });
});

const deleteApplication = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  const result = await ApplicationService.deleteFromDb(req.params.id, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application deleted successfully",
    data: result,
  });
});

export const ApplicationController = {
  createApplication,
  getAllApplications,
  getApplicationById,
  getMyApplications,
  deleteApplication,
};
