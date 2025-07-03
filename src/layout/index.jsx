import { Link, Outlet } from "react-router-dom";
import { useAuth } from '../components/AuthContext'; // Import useAuth hook
import React, { useEffect, useState } from 'react'; // Import React, useEffect, and useState

export function Layout() {
    const { user, logout } = useAuth(); // Get user and logout function from AuthContext
    const [studentProfile, setStudentProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState(null);

    // Fetch student profile data when the user object changes (i.e., after login)
    useEffect(() => {
        const fetchProfile = async () => {
            if (user && user.rollNumber) {
                setLoadingProfile(true);
                setProfileError(null);
                try {
                    // For Basic Auth, the browser handles credentials for subsequent requests
                    // if the user has already logged in via the browser's prompt.
                    // If you're using a custom login form, you might need to manually
                    // include Authorization headers here using getAuthHeaders from AuthContext.
                    const response = await fetch(`http://20.244.28.21:8080/api/students/${user.rollNumber}/profile`);

                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error("Unauthorized: Please log in again.");
                        } else if (response.status === 403) {
                            throw new Error("Forbidden: You do not have access to this profile.");
                        }
                        throw new Error(`Failed to fetch profile: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setStudentProfile(data);
                } catch (err) {
                    console.error("Error fetching student profile in Layout:", err);
                    setProfileError(err.message);
                    // If profile fetch fails, especially due to auth, consider logging out
                    // logout(); // Uncomment if you want to force logout on profile fetch failure
                } finally {
                    setLoadingProfile(false);
                }
            } else {
                setStudentProfile(null); // Clear profile if no user is logged in
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [user, logout]); // Re-run when user object changes

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
    };

    return (
        <main className="grid grid-cols-5 min-h-screen font-sans">
            <aside className="col-span-1 bg-gray-900 text-white flex flex-col justify-between">
                <div className="p-6">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-2">
                            {studentProfile ? studentProfile.name?.[0] || '?' : 'A'} {/* Display first letter of name */}
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">
                                {loadingProfile ? "Loading..." : studentProfile ? studentProfile.name : "Guest User"}
                            </h2>
                            <p className="text-sm text-blue-100">
                                {loadingProfile ? "" : studentProfile ? studentProfile.rollNumber : ""}
                            </p>
                            {profileError && <p className="text-red-300 text-xs mt-1">{profileError}</p>}
                        </div>
                    </div>

                    <nav className="space-y-3 text-sm font-medium">
                        {user && user.roles && user.roles.includes("ROLE_STUDENT") && (
                            <>
                                <Link to="/" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Bio Data
                                </Link>
                                <Link to="/semesterSchedule" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Semester Schedule
                                </Link>
                                <Link to="/semester" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Marks
                                </Link>
                                <Link to="/course" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Time Table
                                </Link>
                                <Link to="/attendance" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Attendance
                                </Link>
                                <Link to="/counselling" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Counselling
                                </Link>
                            </>
                        )}
                        {user && (user.roles.includes("ROLE_FACULTY") || user.roles.includes("ROLE_ADMIN")) && (
                            <>
                                <hr className="border-t border-blue-500 my-4" />
                                <h3 className="text-md font-semibold text-blue-200 mb-2">Teacher/Admin Panel</h3>
                                <Link to="/teacher" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Dashboard
                                </Link>
                                {/* These links will be handled by TeacherDashboardHome */}
                                <Link to="/teacher/manage-students" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Manage Students
                                </Link>
                                <Link to="/teacher/upload-marks" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Upload Marks
                                </Link>
                                <Link to="/teacher/upload-timetable" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Upload Time Table
                                </Link>
                                <Link to="/teacher/upload-exam-schedule" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Upload Exam Schedule
                                </Link>
                                <Link to="/teacher/manage-attendance" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                                    Manage Attendance
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <div className="px-6 py-4 border-t border-blue-500 text-sm">
                    <button
                        onClick={handleLogout}
                        className="block text-white hover:text-red-300 mb-2 w-full text-left"
                    >
                        Logout
                    </button>
                    <div className="text-xs text-center text-blue-200">
                        ECAP System
                        <br />
                        Student Management Portal
                    </div>
                </div>
            </aside>

            <section className="col-span-4 bg-gray-50 p-6">
                <Outlet />
            </section>
        </main>
    );
}
