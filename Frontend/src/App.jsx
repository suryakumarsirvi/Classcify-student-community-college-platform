import { Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
import TeacherLogin from "./pages/auth/TeacherLogin";
import StudentLogin from "./pages/auth/StudentLogin";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import TeacherDashboardLayout from "./layouts/TeacherDashboardLayout";
import StudentDashboardLayout from "./layouts/StudentDashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import StudentDashboard from "./pages/student/StudentDashboard";
import Community from "./pages/student/Community";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import { UnauthenticatedRoute } from "./routes/UnauthenticatedRoute";
import RegistrationDashboard from "./pages/auth/RegistrationDashboard";
import ExplorePage from "./components/Common/ExplorePage";
import TeacherClassroom from "./pages/teacher/TeacherClassroom";
import Announcements from "./components/Common/Announcements";
import Messages from "./components/Common/Messages";
import Assets from "./components/Common/Assets";
import AdminClassroom from "./pages/admin/AdminClassroom";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import StudentClassroom from "./pages/student/StudentClassroom";
import Notification from "./components/Common/Notification";
import { Toaster } from "@/components/ui/toaster";
import StudentAttendance from "./pages/student/StudentAttendance";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RegistrationDashboard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="messages" element={<Messages />} />
        {/* Auth Routes (Only accessible if not logged in) */}
        <Route
          path="/admin/login"
          element={
            <UnauthenticatedRoute role="admin">
              <AdminLogin />
            </UnauthenticatedRoute>
          }
        />
        <Route
          path="/teacher/login"
          element={
            <UnauthenticatedRoute role="teacher">
              <TeacherLogin />
            </UnauthenticatedRoute>
          }
        />
        <Route
          path="/student/login"
          element={
            <UnauthenticatedRoute role="student">
              <StudentLogin />
            </UnauthenticatedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="staffroom" element={<StaffManagement />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="classroom" element={<AdminClassroom />} />
          {/* <Route path="announcements" element={<Announcements />} /> */}
          <Route path="messages" element={<Messages />} />
          {/* <Route path="events" element={<Events />} /> */}
          {/* Add other admin routes */}
        </Route>

        {/* Teacher Dashboard Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="classroom" element={<TeacherClassroom />} />
          {/* <Route path="announcements" element={<Announcements />} /> */}
          <Route path="messages" element={<Messages />} />
          {/* <Route path="create" element={<TeacherCreate />} /> */}
          {/* <Route path="events" element={<Events />} /> */}
          <Route path="assets" element={<Assets />} />
          {/* Add other teacher routes */}
        </Route>

        {/* Student Dashboard Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="explore" element={<ExplorePage />} />
          {/* <Route path="announcements" element={<Announcements />} /> */}
          <Route path="messages" element={<Messages />} />
          {/* <Route path="events" element={<Events />} /> */}
          <Route path="assets" element={<Assets />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="classroom" element={<StudentClassroom />} />
          <Route path="community" element={<Community />} />
          {/* <Route path="create" element={<StudentCreate />} /> */}
          {/* Add other student routes */}
        </Route>

        {/* Redirects & 404 */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
