import httpStatus from "http-status";
import { CategoryService } from "./Category.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { categoryFilterableFields } from "./Category.costant";

const createCategoryForCourse = catchAsync(
  async (req: Request, res: Response) => {
    const { name } = req.body;

    const result = await CategoryService.createCategoryForCourse(
      name,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Category created and associated with course successfully",
      data: result,
    });
  }
);

const getCategoryList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page"]);
  const filters = pick(req.query, categoryFilterableFields);
  const library = await CategoryService.getListFromDb(options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses list retrieved successfully",
    meta: library.meta,
    data: library.data,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  const result = await CategoryService.updateCategory(categoryId, name);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cagetory details retrieved successfully",
    data: result,
  });
});


const deleteCategoryFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategoryFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategoryForCourse,
  getCategoryList,
  updateCategory,
  getCategoryById,
  deleteCategoryFromDb,
};
