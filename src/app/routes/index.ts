import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { CoursesRoutes } from "../modules/Courses/Courses.routes";
import { VideosRoutes } from "../modules/Videos/Videos.routes";
import { ReviewRoutes } from "../modules/Review/Review.routes";
import { CategoryRoutes } from "../modules/Category/Category.routes";
import { WatchHistoryRoutes } from "../modules/WatchHistory/WatchHistory.routes";
import { NotificationRoutes } from "../modules/Notification/Notification.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";

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
    path: "/courses",
    route: CoursesRoutes,
  },
  {
    path: "/videos",
    route: VideosRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/watch",
    route: WatchHistoryRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
