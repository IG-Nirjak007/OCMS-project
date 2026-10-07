import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PrivateRoute from './components/layout/PrivateRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import CourseDetailPage from './pages/student/CourseDetailPage';
import SubmitAssignmentPage from './pages/student/SubmitAssignmentPage';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import ManageMaterialsPage from './pages/teacher/ManageMaterialsPage';
import GradeSubmissionsPage from './pages/teacher/GradeSubmissionsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import NotFoundPage from './pages/shared/NotFoundPage';
import UnauthorizedPage from './pages/shared/UnauthorizedPage';

const MainLayout = () => (
    <>
        <Navbar />
        <div className="main-layout">
            <Sidebar />
            <main className="content">
                <Outlet />
            </main>
        </div>
    </>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Public Routes without Navbar/Sidebar */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Protected Routes with Navbar/Sidebar Layout */}
                    <Route element={<MainLayout />}>
                        {/* Student Routes */}
                        <Route element={<PrivateRoute allowedRoles={['ROLE_STUDENT']} />}>
                            <Route path="/" element={<StudentDashboardPage />} />
                            <Route path="/courses/:id" element={<CourseDetailPage />} />
                            <Route path="/student/submit/:assignmentId" element={<SubmitAssignmentPage />} />
                        </Route>

                        {/* Instructor Routes */}
                        <Route element={<PrivateRoute allowedRoles={['ROLE_TEACHER']} />}>
                            <Route path="/teacher" element={<TeacherDashboardPage />} />
                            <Route path="/teacher/materials" element={<ManageMaterialsPage />} />
                            <Route path="/teacher/submissions/:id" element={<GradeSubmissionsPage />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN']} />}>
                            <Route path="/admin" element={<AdminDashboardPage />} />
                            <Route path="/admin/users" element={<ManageUsersPage />} />
                            <Route path="/admin/courses" element={<ManageCoursesPage />} />
                        </Route>
                    </Route>

                    {/* Fallback Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;