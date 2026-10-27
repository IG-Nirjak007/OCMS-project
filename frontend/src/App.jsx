import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Pages - Shared
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';

// Pages - Student
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseDetailPage from './pages/student/CourseDetailPage';
import SubmitAssignmentPage from './pages/student/SubmitAssignmentPage';

// Pages - Teacher
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import ManageMaterialsPage from './pages/teacher/ManageMaterialsPage';
import CreateAssignmentPage from './pages/teacher/CreateAssignmentPage';
import GradeSubmissionsPage from './pages/teacher/GradeSubmissionsPage';

// Pages - Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Components
import PrivateRoute from './components/layout/PrivateRoute';
import NotFoundPage from './pages/shared/NotFoundPage';
import UnauthorizedPage from './pages/shared/UnauthorizedPage';
import { useAuth } from './context/AuthContext';

function DashboardRedirect() {
  const { user, loading, isAdmin, isTeacher } = useAuth();
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span className="loading-text">Loading dashboard...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin?.()) return <Navigate to="/admin" replace />;
  if (isTeacher?.()) return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Dynamic Role Dashboard Route */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

        {/* Student & Course Routes */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_STUDENT', 'STUDENT', 'ROLE_TEACHER', 'TEACHER', 'ROLE_ADMIN', 'ADMIN']} />}>
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/assignments/:assignmentId/submit" element={<SubmitAssignmentPage />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_TEACHER', 'TEACHER']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
          <Route path="/courses/:courseId/materials" element={<ManageMaterialsPage />} />
          <Route path="/courses/:courseId/create-assignment" element={<CreateAssignmentPage />} />
          <Route path="/assignments/:assignmentId/grade" element={<GradeSubmissionsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN', 'ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* Authenticated Shared Routes */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_STUDENT', 'STUDENT', 'ROLE_TEACHER', 'TEACHER', 'ROLE_ADMIN', 'ADMIN']} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;