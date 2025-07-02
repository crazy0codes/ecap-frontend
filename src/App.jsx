import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext'; // Import AuthProvider and useAuth
import { LoginPage } from './components/LoginPage'; // Import the new LoginPage
import { Layout } from './layout/index'; // Your existing Layout component

// Import your existing components
import { Profile } from './components/profile';
import { SemesterSchedule } from './components/semesterscheduel';
import { Marks } from './components/marks';
import { TimeTable } from './components/timeTable';
import { ManageStudents } from './components/manageStudents';
import { UploadMarks } from './components/uploadMarks';
import { UploadTimeTable } from './components/uploadTimeTable';
import { UploadExamSchedule } from './components/uploadExamSchedule';
import { TeacherDashboardHome } from './components/teacherDashboardHome';
// Import new Attendance components (will be created in Part 3)
import { StudentAttendance } from './components/StudentAttendance'; // UNCOMMENTED - Make sure filename matches
import { TeacherAttendance } from './components/TeacherAttendance'; // UNCOMMENTED - Make sure filename matches


// A simple PrivateRoute component to protect routes
const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Not authenticated, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // Check if user has any of the allowed roles
    if (allowedRoles && user && user.roles) {
        const hasRequiredRole = allowedRoles.some(role => user.roles.includes(role));
        if (!hasRequiredRole) {
            // Authenticated but no allowed role, redirect to unauthorized page or home
            return <Navigate to="/" replace />; // Or a dedicated /unauthorized page
        }
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

// Separate component to use useAuth hook
function AppRoutes() {
    const { isAuthenticated } = useAuth(); // Use isAuthenticated from context

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes wrapped by PrivateRoute */}
            <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
                {/* Student Routes */}
                <Route path="/" element={<PrivateRoute allowedRoles={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_FACULTY"]}><Profile /></PrivateRoute>} />
                <Route path="/semesterSchedule" element={<PrivateRoute allowedRoles={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_FACULTY"]}><SemesterSchedule /></PrivateRoute>} />
                <Route path="/semester" element={<PrivateRoute allowedRoles={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_FACULTY"]}><Marks /></PrivateRoute>} />
                <Route path="/course" element={<PrivateRoute allowedRoles={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_FACULTY"]}><TimeTable /></PrivateRoute>} />
                <Route path="/attendance" element={<PrivateRoute allowedRoles={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_FACULTY"]}><StudentAttendance /></PrivateRoute>} /> {/* UNCOMMENTED */}
                {/* Add Counselling route here if you have a component for it */}
                <Route path="/counselling" element={<PrivateRoute allowedRoles={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_FACULTY"]}><div>Counselling Page (Placeholder)</div></PrivateRoute>} />


                {/* Teacher/Admin Routes */}
                <Route path="/teacher" element={<PrivateRoute allowedRoles={["ROLE_FACULTY", "ROLE_ADMIN"]}><TeacherDashboardHome /></PrivateRoute>} />
                <Route path="/teacher/manage-students" element={<PrivateRoute allowedRoles={["ROLE_ADMIN"]}><ManageStudents /></PrivateRoute>} />
                <Route path="/teacher/upload-marks" element={<PrivateRoute allowedRoles={["ROLE_FACULTY", "ROLE_ADMIN"]}><UploadMarks /></PrivateRoute>} />
                <Route path="/teacher/upload-timetable" element={<PrivateRoute allowedRoles={["ROLE_FACULTY", "ROLE_ADMIN"]}><UploadTimeTable /></PrivateRoute>} />
                <Route path="/teacher/upload-exam-schedule" element={<PrivateRoute allowedRoles={["ROLE_FACULTY", "ROLE_ADMIN"]}><UploadExamSchedule /></PrivateRoute>} />
                <Route path="/teacher/manage-attendance" element={<PrivateRoute allowedRoles={["ROLE_FACULTY", "ROLE_ADMIN"]}><TeacherAttendance /></PrivateRoute>} /> {/* UNCOMMENTED */}

                {/* Logout Route */}
                <Route path="/logout" element={<LogoutHandler />} /> {/* Handle logout */}
            </Route>

            {/* Fallback for unmatched routes */}
            <Route path="*" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
        </Routes>
    );
}

// Simple Logout Handler component
const LogoutHandler = () => {
    const { logout } = useAuth();
    React.useEffect(() => {
        logout();
    }, [logout]);
    return <Navigate to="/login" replace />;
};

export default App;
