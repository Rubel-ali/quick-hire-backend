import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { JobController } from "./Job.controller";
import { JobValidation } from "./Job.validation";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.uploadImage,
  // validateRequest(JobValidation.createJobSchema),
  JobController.createJob,
);

router.get("/", auth(), JobController.getAllJobs);

router.get("/:id", auth(), JobController.getJobById);

router.put(
  "/:id",
  auth(),
  validateRequest(JobValidation.updateSchema),
  JobController.updateJob,
);

router.delete("/:id", auth(), JobController.deleteJob);

export const JobRoutes = router;
