export interface IVideos {
  id?: string;
  courseId?: string;
  instructorId?: string;
  name: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
}

export interface updateIVideos {
  name?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
}

export type IVideosFilterRequest = {
  name?: string | undefined;
  searchTerm?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
}