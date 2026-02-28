import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { ApplicationController } from "./Application.controller";
import { ApplicationValidation } from "./Application.validation";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER),
  
  // validateRequest(ApplicationValidation.createApplicationSchema),
  ApplicationController.createApplication,
);

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ApplicationController.getAllApplications,
);

router.get("/my", auth(UserRole.USER), ApplicationController.getMyApplications);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ApplicationController.getApplicationById,
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ApplicationController.deleteApplication,
);

export const ApplicationRoutes = router;
