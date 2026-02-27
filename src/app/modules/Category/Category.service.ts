import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { categorySearchAbleFields } from "./Category.costant";
import { ICategoryFilterRequest } from "./Category.interface";
import { CategoryRepository } from "./category.repository";

/**
 * CategoryService
 * -----------------
 * This layer contains business logic.
 * It communicates with the repository layer.
 */

const createCategoryForCourse = async (name: string) => {
  /**
   * Business Logic:
   * You may add duplicate check or slug generation here later
   */

  const category = await CategoryRepository.create({ name });

  return { category };
};

const getListFromDb = async (
  options: IPaginationOptions,
  params: ICategoryFilterRequest,
) => {
  /**
   * Extract pagination values
   */
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  /**
   * Extract searchTerm separately
   */
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.CategoryWhereInput[] = [];

  /**
   * Handle search functionality
   * Performs case-insensitive search across searchable fields
   */
  if (searchTerm) {
    andConditions.push({
      OR: categorySearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  /**
   * Handle additional filtering (exact match)
   */
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  /**
   * Combine all conditions
   */
  const whereConditions: Prisma.CategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  /**
   * Sorting logic
   */
  const orderBy =
    options.sortBy && options.sortOrder
      ? {
          [options.sortBy]: options.sortOrder,
        }
      : {
          createdAt: "desc" as const,
        };

  /**
   * Fetch paginated data
   */
  const result = await CategoryRepository.findMany(
    whereConditions,
    skip,
    limit,
    orderBy,
  );

  /**
   * Count total matching records
   */
  const total = await CategoryRepository.count(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

/**
 * updateCategory
 */

const updateCategory = async (id: string, name: string) => {
  /**
   * Check if category exists before update
   */
  const existingCategory = await CategoryRepository.findById(id);
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  /**
   * Perform update
   */
  const updatedCategory = await CategoryRepository.update(id, { name });
  return updatedCategory;
};

const getByIdFromDb = async (id: string) => {
  /**
   * Fetch single category
   */
  const result = await CategoryRepository.findById(id);

  /**
   * If not found, throw proper error
   */
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  return result;
};

const getAllCategoriesWithSubCategories = async () => {
  /**
   * Return all categories
   * Useful for dropdown / filter UI
   */
  return CategoryRepository.findAll();
};

const deleteCategoryFromDb = async (id: string) => {
  /**
   * Check if category exists before deletion
   */
  const existingCategory = await CategoryRepository.findById(id);
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  /**
   * Perform deletion
   */
  const deleteCategory = await CategoryRepository.delete(id);
  return deleteCategory;
};

export const CategoryService = {
  createCategoryForCourse,
  getListFromDb,
  updateCategory,
  getByIdFromDb,
  getAllCategoriesWithSubCategories,
  deleteCategoryFromDb,
};
