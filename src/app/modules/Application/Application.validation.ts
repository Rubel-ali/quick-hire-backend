import { z } from "zod";

const createApplicationSchema = z.object({
  jobId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid Job ID (Must be a valid MongoDB ObjectId)",
    ),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  coverNote: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  coverNote: z.string().optional(),
});

export const ApplicationValidation = {
  createApplicationSchema,
  updateSchema,
};
