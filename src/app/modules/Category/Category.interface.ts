export interface ICategory {
  id?: string;
  name: string;
}

export interface updateICategory {
  name?: string;
}

export type ICategoryFilterRequest = {
  name?: string | undefined;
  searchTerm?: string | undefined;
}