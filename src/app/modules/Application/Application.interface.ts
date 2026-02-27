export interface CreateApplicationData {
  jobId: string;
  name: string;
  email: string;
  resumeLink: string;
  coverNote?: string;
}

export interface UpdateApplicationData {
  name?: string;
  email?: string;
  resumeLink?: string;
  coverNote?: string;
}