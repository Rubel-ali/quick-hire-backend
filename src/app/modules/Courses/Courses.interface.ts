export interface ICourse {
  instructorId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  description: string;
  level: string;
  categoryId: string;
}

export interface updateICourse {
  name?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  activeStatus?: string;
  level?: string;
}

export type ICourseFilterRequest = {
  name?: string | undefined;
  category?: string | undefined;
  price?: number | undefined;
  searchTerm?: string | undefined;
  description?: string | undefined;
}