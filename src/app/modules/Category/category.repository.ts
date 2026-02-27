import prisma from "../../../shared/prisma";
import { Prisma } from "@prisma/client";

/**
 * CategoryRepository
 * --------------------
 * This layer is responsible ONLY for database access.
 * No business logic should be written here.
 */
export const CategoryRepository = {
  /**
   * Create a new category
   * @param data Prisma CategoryCreateInput
   */
  create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  },

  /**
   * Find categories with filtering, pagination and sorting
   * @param where Prisma where condition
   * @param skip number of records to skip
   * @param limit number of records to take
   * @param orderBy sorting configuration
   */
  findMany(
    where: Prisma.CategoryWhereInput,
    skip: number,
    limit: number,
    orderBy: Prisma.CategoryOrderByWithRelationInput,
  ) {
    return prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    });
  },

  /**
   * Count total categories based on filter
   * Used for pagination meta calculation
   */
  count(where: Prisma.CategoryWhereInput) {
    return prisma.category.count({ where });
  },

  /**
   * Update a category by ID
   * @param id category ID  
  */

  update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Find a single category by ID
   */
  findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  /**
   * Get all categories (no pagination)
   * Useful for dropdown lists
   */
  findAll() {
    return prisma.category.findMany();
  },

  /**
   * Delete a category by ID
   */
  delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },

};
