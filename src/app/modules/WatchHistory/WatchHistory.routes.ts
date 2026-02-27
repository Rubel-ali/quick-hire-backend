import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { WatchHistoryController } from "./WatchHistory.controller";
import { WatchHistoryValidation } from "./WatchHistory.validation";

const router = express.Router();

router.post(
  "/create-watch-history",
  auth(),
  // validateRequest(WatchHistoryValidation.createSchema),
  WatchHistoryController.createWatchHistoryController,
);

router.get("/", auth(), WatchHistoryController.getWatchHistoryList);

router.get("/:id", auth(), WatchHistoryController.getWatchHistoryById);

router.put(
  "/:id",
  auth(),
  validateRequest(WatchHistoryValidation.updateSchema),
  WatchHistoryController.updateWatchHistory,
);

router.delete("/:id", auth(), WatchHistoryController.deleteWatchHistory);

export const WatchHistoryRoutes = router;
