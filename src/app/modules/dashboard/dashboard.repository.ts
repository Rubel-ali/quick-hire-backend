import prisma from "../../../shared/prisma";

// ================= USER =================

const getTotalUsers = async () => {
  return prisma.user.count();
};

const getTotalStudents = async () => {
  return prisma.user.count({
    where: { role: "STUDENT" },
  });
};

const getTotalInstructors = async () => {
  return prisma.user.count({
    where: { role: "INSTRUCTOR" },
  });
};

const getBlockedUsers = async () => {
  return prisma.user.count({
    where: { status: "SUSPENDED" },
  });
};

// ================= COURSE =================

const getTotalCourses = async () => {
  return prisma.courses.count();
};

const getPublishedCourses = async () => {
  return prisma.courses.count({
    where: { activeStatus: "PUBLISHED" },
  });
};

const getDraftCourses = async () => {
  return prisma.courses.count({
    where: { activeStatus: "DRAFT" },
  });
};

// ================= ENROLLMENT =================

const getTotalEnrollments = async () => {
  return prisma.enrollment.count();
};

const getEnrollmentsWithPrice = async () => {
  return prisma.enrollment.findMany({
    include: {
      course: {
        select: {
          price: true,
        },
      },
    },
  });
};

// ================= ADMIN DASHBOARD EXTRA =================

// Monthly Enrollments (Trend)
const getMonthlyEnrollments = async () => {
  return prisma.enrollment.findMany({
    select: {
      createdAt: true,
    },
  });
};

// Courses By Category
const getCoursesByCategory = async () => {
  return prisma.courses.groupBy({
    by: ["categoryId"],
    _count: {
      categoryId: true,
    },
  });
};

// Average Rating
const getAverageRating = async () => {
  const result = await prisma.review.aggregate({
    _avg: {
      rating: true,
    },
  });

  return result._avg.rating || 0;
};

// ================= INSTRUCTOR DASHBOARD =================

// Active Courses (Published)
const getInstructorActiveCourses = async (instructorId: string) => {
  return prisma.courses.count({
    where: {
      instructorId,
      activeStatus: "PUBLISHED",
    },
  });
};

// Total Students (Unique enrollments across instructor courses)
const getInstructorTotalStudents = async (instructorId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        instructorId,
      },
    },
    select: {
      studentId: true,
    },
    distinct: ["studentId"],
  });

  return enrollments.length;
};

// Instructor Revenue
const getInstructorRevenue = async (instructorId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        instructorId,
      },
    },
    include: {
      course: {
        select: {
          price: true,
        },
      },
    },
  });

  return enrollments.reduce((sum, e) => sum + e.course.price, 0);
};

// Instructor Average Rating
const getInstructorAvgRating = async (instructorId: string) => {
  const result = await prisma.review.aggregate({
    where: {
      course: {
        instructorId,
      },
    },
    _avg: {
      rating: true,
    },
  });

  return result._avg.rating || 0;
};

// Enrollment Trend
const getInstructorEnrollments = async (instructorId: string) => {
  return prisma.enrollment.findMany({
    where: {
      course: {
        instructorId,
      },
    },
    select: {
      createdAt: true,
    },
  });
};

// ================= STUDENT DASHBOARD =================

// // Active Enrolled Courses
const getStudentActiveCourses = async (studentId: string) => {
  return prisma.enrollment.findMany({
    where: {
      studentId,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          // instructor: { select: { name: true } },
        },
      },
    },
  });
};


// Trending Courses (Top 5 by enrollment)
const getTrendingCourses = async () => {
  return prisma.courses.findMany({
    take: 5,
    orderBy: {
      enrollments: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      _count: {
        select: { enrollments: true },
      },
    },
  });
};

const countTotalStudents = async (instructorId: string) => {
  return prisma.enrollment.count({
    where: {
      course: { instructorId },
    },
  });
};

const countTotalCompletions = async (instructorId: string) => {
  return prisma.enrollment.count({
    where: {
      course: { instructorId },
      status: "COMPLETED",
    },
  });
};

const getAverageRatingAnlytics = async (instructorId: string) => {
  return prisma.review.aggregate({
    where: {
      course: { instructorId },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });
};

const getEnrollmentsWithCoursePrice = async (instructorId: string) => {
  return prisma.enrollment.findMany({
    where: {
      course: { instructorId },
    },
    include: {
      course: {
        select: {
          price: true,
        },
      },
    },
  });
};

const getCoursesWithEnrollments = async (instructorId: string) => {
  return prisma.courses.findMany({
    where: { instructorId },
    include: {
      enrollments: true,
    },
  });
};


// ================= EXPORT =================

export const DashboardRepository = {
  // Super Admin Dashboard
  getTotalUsers,
  getTotalStudents,
  getTotalInstructors,
  getBlockedUsers,
  getTotalCourses,
  getPublishedCourses,
  getDraftCourses,
  getTotalEnrollments,
  getEnrollmentsWithPrice,

  // Admin Dashboard Extra
  getMonthlyEnrollments,
  getCoursesByCategory,
  getAverageRating,

  // Instructor Dashboard
  getInstructorActiveCourses,
  getInstructorTotalStudents,
  getInstructorRevenue,
  getInstructorAvgRating,
  getInstructorEnrollments,

  countTotalStudents,
  countTotalCompletions,
  getAverageRatingAnlytics,
  getEnrollmentsWithCoursePrice,
  getCoursesWithEnrollments,

  // Student Dashboard
  getStudentActiveCourses,
  // getStudentSkillPoints,
  getTrendingCourses,
};
