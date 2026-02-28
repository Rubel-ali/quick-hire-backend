import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthUser, CreateJobPayload } from "./Job.interface";
import { JobService } from "./Job.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { jobFilterableFields } from "./Job.constant";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  const jobData: CreateJobPayload = JSON.parse(req.body.text || "{}");

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const file = files?.file?.[0];

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company logo is required.");
  }

  // Upload to cloudinary (folder: company-logos)
  const uploadResult = await fileUploader.uploadToCloudinary(file);
  const companyLogo = uploadResult?.Location;

  const result = await JobService.createIntoDb(jobData, user, companyLogo);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, jobFilterableFields);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await JobService.getAllFromDb(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Jobs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getJobById = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.getByIdFromDb(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job details retrieved successfully",
    data: result,
  });
});

const updateJob = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  const result = await JobService.updateIntoDb(req.params.id, req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job updated successfully",
    data: result,
  });
});

const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  const result = await JobService.deleteFromDb(req.params.id, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job deleted successfully",
    data: result,
  });
});

export const JobController = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
