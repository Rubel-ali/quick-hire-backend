import { UserRole } from "@prisma/client";

export type CreateJobPayload = {
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
};

export type UpdateJobPayload = Partial<CreateJobPayload>;

export type AuthUser = {
  id: string;
  role: UserRole;
};