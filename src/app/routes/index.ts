import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { JobRoutes } from "../modules/Job/Job.routes";
import { ApplicationRoutes } from "../modules/Application/Application.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/jobs",
    route: JobRoutes,
  },
  {
    path: "/applications",
    route: ApplicationRoutes,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
