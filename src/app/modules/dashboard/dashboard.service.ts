import prisma from "../../../shared/prisma";
import { DashboardRepository } from "./dashboard.repository";

// ================= SUPER ADMIN DASHBOARD =================

const getSuperAdminDashboard = async () => {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    publishedCourses,
    draftCourses,
    blockedUsers,
    enrollmentsWithPrice,
    monthlyEnrollments,
    categoryGrouped,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.courses.count(),
    prisma.enrollment.count(),
    prisma.courses.count({ where: { activeStatus: "PUBLISHED" } }),
    prisma.courses.count({ where: { activeStatus: "DRAFT" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),

    prisma.enrollment.findMany({
      include: {
        course: {
          select: { price: true },
        },
      },
    }),

    prisma.enrollment.findMany({
      select: { createdAt: true },
    }),

    prisma.courses.groupBy({
      by: ["categoryId"],
      _count: { categoryId: true },
    }),
  ]);

  // Revenue Calculation
  const totalRevenue = enrollmentsWithPrice.reduce(
    (sum, item) => sum + (item.course?.price ?? 0),
    0
  );

  // Monthly Revenue
  const revenueMap: Record<string, number> = {};

  enrollmentsWithPrice.forEach((item) => {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
    });

    if (!revenueMap[month]) revenueMap[month] = 0;
    revenueMap[month] += item.course?.price ?? 0;
  });

  const monthlyRevenue = Object.entries(revenueMap)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort(
      (a, b) =>
        new Date(`1 ${a.month} 2026`).getTime() -
        new Date(`1 ${b.month} 2026`).getTime()
    );

  // Enrollment Trend
  const enrollmentMap: Record<string, number> = {};

  monthlyEnrollments.forEach((item) => {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
    });

    enrollmentMap[month] = (enrollmentMap[month] || 0) + 1;
  });

  const enrollmentTrend = Object.entries(enrollmentMap).map(
    ([month, enrollments]) => ({
      month,
      enrollments,
    })
  );

  // Category Distribution
  const totalCategoryCourses = categoryGrouped.reduce(
    (sum, item) => sum + item._count.categoryId,
    0
  );

  const categoryDistribution = categoryGrouped.map((item) => ({
    categoryId: item.categoryId,
    percentage:
      totalCategoryCourses === 0
        ? 0
        : Math.round(
            (item._count.categoryId / totalCategoryCourses) * 100
          ),
  }));

  // Top Instructors
  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    select: {
      id: true,
      username: true,
      Courses: {
        include: {
          enrollments: {
            include: {
              course: { select: { price: true } },
            },
          },
        },
      },
    },
  });

  const topInstructors = instructors
    .map((inst) => {
      let revenue = 0;
      let totalStudents = 0;

      inst.Courses?.forEach((course) => {
        totalStudents += course.enrollments.length;

        course.enrollments.forEach((enroll) => {
          revenue += enroll.course?.price ?? 0;
        });
      });

      return {
        instructorId: inst.id,
        name: inst.username ?? "Unknown",
        revenue,
        totalStudents,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const platformHealth =
    totalCourses === 0
      ? 0
      : Math.round((publishedCourses / totalCourses) * 100);

  const healthStatus =
    platformHealth > 90
      ? "Excellent"
      : platformHealth > 70
      ? "Good"
      : "Needs Improvement";

  return {
    overview: {
      totalUsers,
      totalRevenue,
      totalCourses,
      totalEnrollments,
    },

    enrollmentTrend,
    monthlyRevenue,
    categoryDistribution,
    topInstructors,

    userGrowthByType: {
      students: totalStudents,
      instructors: totalInstructors,
    },

    platformHealth: {
      percentage: platformHealth,
      status: healthStatus,
    },

    pendingActions: draftCourses + blockedUsers,
  };
};

// ================= ADMIN DASHBOARD =================

const getAdminDashboard = async () => {
  const [totalUsers, activeCourses, enrollments, avgRating, categoryGroup] =
    await Promise.all([
      DashboardRepository.getTotalUsers(),
      DashboardRepository.getPublishedCourses(),
      DashboardRepository.getMonthlyEnrollments(),
      DashboardRepository.getAverageRating(),
      DashboardRepository.getCoursesByCategory(),
    ]);

  const enrollmentsWithPrice =
    await DashboardRepository.getEnrollmentsWithPrice();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = enrollmentsWithPrice
    .filter((e) => {
      const date = new Date(e.createdAt);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, e) => sum + (e.course?.price ?? 0), 0);

  const trendMap: Record<string, number> = {};

  enrollments.forEach((item) => {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
    });

    trendMap[month] = (trendMap[month] || 0) + 1;
  });

  const enrollmentTrend = Object.entries(trendMap).map(([month, enrollments]) => ({
    month,
    enrollments,
  }));

  const coursesByCategory = categoryGroup.map((item) => ({
    category: item.categoryId,
    count: item._count.categoryId,
  }));

  return {
    overview: {
      totalUsers,
      activeCourses,
      monthlyRevenue,
      avgRating: Number((avgRating || 0).toFixed(1)),
    },
    enrollmentTrend,
    coursesByCategory,
  };
};

// ================= INSTRUCTOR DASHBOARD =================

const getInstructorDashboard = async (instructorId: string) => {
  const [activeCourses, totalStudents, totalRevenue, avgRating, enrollments] =
    await Promise.all([
      DashboardRepository.getInstructorActiveCourses(instructorId),
      DashboardRepository.getInstructorTotalStudents(instructorId),
      DashboardRepository.getInstructorRevenue(instructorId),
      DashboardRepository.getInstructorAvgRating(instructorId),
      DashboardRepository.getInstructorEnrollments(instructorId),
    ]);

  const trendMap: Record<string, number> = {};

  enrollments.forEach((item) => {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
    });

    trendMap[month] = (trendMap[month] || 0) + 1;
  });

  const enrollmentTrend = Object.entries(trendMap).map(([month, enrollments]) => ({
    month,
    enrollments,
  }));

  return {
    overview: {
      activeCourses,
      totalStudents,
      totalRevenue,
      avgRating: Number((avgRating || 0).toFixed(1)),
    },
    enrollmentTrend,
  };
};

// ================= STUDENT DASHBOARD =================

const getStudentDashboard = async (studentId: string) => {
  const [enrollments, trendingCourses] = await Promise.all([
    DashboardRepository.getStudentActiveCourses(studentId),
    DashboardRepository.getTrendingCourses(),
  ]);

  const activeCourses = enrollments.length;

  const activeCourseList = enrollments.map((item: any) => ({
    courseId: item.course?.id,
    title: item.course?.title ?? "Unknown Course",
    instructorName:
      item.course?.instructor?.name ?? "Unknown Instructor",
    progress: Math.floor(Math.random() * 100),
  }));

  const hoursStudied = activeCourses * 8.5;

  return {
    overview: {
      activeCourses,
      hoursStudied,
      trendingCourses,
    },
    activeCoursesList: activeCourseList,
  };
};

// ================= EXPORT =================

const getInstructorAnalytics = async (instructorId: string) => {
  const totalStudents =
    await DashboardRepository.countTotalStudents(instructorId);

  const totalCompletions =
    await DashboardRepository.countTotalCompletions(instructorId);

  const completionRate =
    totalStudents === 0
      ? 0
      : Number(((totalCompletions / totalStudents) * 100).toFixed(1));

  const ratings =
    await DashboardRepository.getAverageRatingAnlytics(instructorId);

  const avgRating = Number((ratings._avg.rating || 0).toFixed(1));

  const totalReviews = ratings._count.rating;

  const enrollments =
    await DashboardRepository.getEnrollmentsWithCoursePrice(instructorId);

  const totalRevenue = enrollments.reduce(
    (sum, e) => sum + (e.course?.price ?? 0),
    0
  );

  const courses =
    await DashboardRepository.getCoursesWithEnrollments(instructorId);

  const revenueByCourse = courses.map((course) => ({
    courseId: course.id,
    title: course.name,
    revenue: course.enrollments.length * (course.price ?? 0),
  }));

  return {
    totalStudents,
    totalCompletions,
    completionRate,
    avgRating,
    totalReviews,
    totalRevenue,
    revenueByCourse,
  };
};

export const DashboardService = {
  getSuperAdminDashboard,
  getAdminDashboard,
  getInstructorDashboard,
  getStudentDashboard,
  getInstructorAnalytics,
};