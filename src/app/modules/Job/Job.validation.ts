import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
});

const updateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  company: z.string().min(1, "Company is required").optional(),
  location: z.string().min(1, "Location is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
});

export const JobValidation = {
  createJobSchema,
  updateSchema,
};
