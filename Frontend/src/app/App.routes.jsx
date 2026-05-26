import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import RegistrationDashboard from "@/modules/auth/pages/RegistrationDashboard";
import ExplorePage from "@/components/Common/ExplorePage";
import Messages from "@/components/Common/Messages";
import AdminLogin from "@/modules/auth/pages/AdminLogin";
import TeacherLogin from "@/modules/auth/pages/TeacherLogin";
import StudentLogin from "@/modules/auth/pages/StudentLogin";
import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import AdminDashboard from "@/modules/admin/pages/AdminDashboard";
import AdminAnalytics from "@/modules/admin/pages/AdminAnalytics";
import StaffManagement from "@/modules/admin/pages/StaffManagement";
import AdminClassroom from "@/modules/admin/pages/AdminClassroom";
import Announcements from "@/components/Common/Announcements";
import Events from "@/components/Common/Events";
import TeacherDashboardLayout from "@/layouts/TeacherDashboardLayout";
import TeacherDashboard from "@/modules/teacher/pages/TeacherDashboard";
import TeacherAttendance from "@/modules/teacher/pages/TeacherAttendance";
import TeacherClassroom from "@/modules/teacher/pages/TeacherClassroom";
import TeacherCreate from "@/modules/teacher/pages/TeacherCreate";
import Assets from "@/components/Common/Assets";
import StudentDashboardLayout from "@/layouts/StudentDashboardLayout";
import StudentDashboard from "@/modules/student/pages/StudentDashboard";
import Notification from "@/components/Common/Notification";
import StudentAttendance from "@/modules/student/pages/StudentAttendance";
import StudentClassroom from "@/modules/student/pages/StudentClassroom";
import Community from "@/modules/student/pages/Community";
import StudentCreate from "@/modules/student/pages/StudentCreate";
import NotFound from "@/components/NotFound";
import { UnauthenticatedRoute } from "@/routes/UnauthenticatedRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RouterErrorFallback from "@/errors/router.error";
import { Toaster } from "@/components/ui/toaster";

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouterErrorFallback />,
    children: [
      {
        index: true,
        element: <RegistrationDashboard />,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "admin/login",
        element: (
          <UnauthenticatedRoute role="admin">
            <AdminLogin />
          </UnauthenticatedRoute>
        ),
      },
      {
        path: "teacher/login",
        element: (
          <UnauthenticatedRoute role="teacher">
            <TeacherLogin />
          </UnauthenticatedRoute>
        ),
      },
      {
        path: "student/login",
        element: (
          <UnauthenticatedRoute role="student">
            <StudentLogin />
          </UnauthenticatedRoute>
        ),
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute role="admin">
            <AdminDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "analytics",
            element: <AdminAnalytics />,
          },
          {
            path: "staffroom",
            element: <StaffManagement />,
          },
          {
            path: "explore",
            element: <ExplorePage />,
          },
          {
            path: "classroom",
            element: <AdminClassroom />,
          },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "messages",
            element: <Messages />,
          },
          {
            path: "events",
            element: <Events />,
          },
        ],
      },
      {
        path: "teacher/dashboard",
        element: (
          <ProtectedRoute role="teacher">
            <TeacherDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <TeacherDashboard />,
          },
          {
            path: "explore",
            element: <ExplorePage />,
          },
          {
            path: "attendance",
            element: <TeacherAttendance />,
          },
          {
            path: "classroom",
            element: <TeacherClassroom />,
          },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "messages",
            element: <Messages />,
          },
          {
            path: "create",
            element: <TeacherCreate />,
          },
          {
            path: "events",
            element: <Events />,
          },
          {
            path: "assets",
            element: <Assets />,
          },
        ],
      },
      {
        path: "student/dashboard",
        element: (
          <ProtectedRoute role="student">
            <StudentDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <StudentDashboard />,
          },
          {
            path: "explore",
            element: <ExplorePage />,
          },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "messages",
            element: <Messages />,
          },
          {
            path: "events",
            element: <Events />,
          },
          {
            path: "assets",
            element: <Assets />,
          },
          {
            path: "notifications",
            element: <Notification />,
          },
          {
            path: "attendance",
            element: <StudentAttendance />,
          },
          {
            path: "classroom",
            element: <StudentClassroom />,
          },
          {
            path: "community",
            element: <Community />,
          },
          {
            path: "create",
            element: <StudentCreate />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
