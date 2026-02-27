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
  resumeLink: z.string().url("Resume link must be valid URL"),
  coverNote: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  resumeLink: z.string().url("Resume link must be valid URL").optional(),
  coverNote: z.string().optional(),
});

export const ApplicationValidation = {
  createApplicationSchema,
  updateSchema,
};
