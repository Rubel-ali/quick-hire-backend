import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./Category.controller";

const router = express.Router();

router.post(
  "/",
  auth(),
  // validateRequest(CategoryValidation.createSchema),
  CategoryController.createCategoryForCourse
);
router.get("/", auth(), CategoryController.getCategoryList);

router.put("/:id", auth(), CategoryController.updateCategory);

router.get("/:id", auth(), CategoryController.getCategoryById);

router.delete("/:id", auth(), CategoryController.deleteCategoryFromDb);


export const CategoryRoutes = router;
