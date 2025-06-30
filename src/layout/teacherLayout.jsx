import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export function TeacherLayout() {
    return (
        <main className="grid grid-cols-5 min-h-screen font-sans">
            <aside className="col-span-1 bg-gray-900 text-white flex flex-col justify-between rounded-r-lg shadow-xl">
                <div className="p-6">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 shadow-lg">
                            T
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">Teacher Dashboard</h2>
                            <p className="text-sm text-blue-100">Admin Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-3 text-sm font-medium">
                        <Link to="/teacher" className="block hover:bg-blue-500 rounded-lg px-4 py-2 transition duration-200">
                            Dashboard Home
                        </Link>
                        <Link to="/teacher/manage-students" className="block hover:bg-blue-500 rounded-lg px-4 py-2 transition duration-200">
                            Manage Students
                        </Link>
                        <Link to="/teacher/upload-marks" className="block hover:bg-blue-500 rounded-lg px-4 py-2 transition duration-200">
                            Upload Marks
                        </Link>
                        <Link to="/teacher/upload-timetable" className="block hover:bg-blue-500 rounded-lg px-4 py-2 transition duration-200">
                            Upload Time Table
                        </Link>
                        <Link to="/teacher/upload-exam-schedule" className="block hover:bg-blue-500 rounded-lg px-4 py-2 transition duration-200">
                            Upload Exam Schedule
                        </Link>
                    </nav>
                </div>

                <div className="px-6 py-4 border-t border-blue-500 text-sm">
                    <Link
                        to="/logout-placeholder" // Placeholder for logout action
                        className="block text-white hover:text-red-300 mb-2 transition duration-200"
                    >
                        Logout
                    </Link>
                    <div className="text-xs text-center text-blue-200">
                        ECAP System
                        <br />
                        Teacher Management Portal
                    </div>
                </div>
            </aside>

            <section className="col-span-4 bg-gray-50 p-6 overflow-auto">
                <Outlet />
            </section>
        </main>
    );
}
