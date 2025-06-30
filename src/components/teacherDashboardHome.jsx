import React from 'react';
import DashboardCard from './dashboardCard.jsx'; // Corrected import path

export const TeacherDashboardHome = () => {
    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, Teacher!</h1>
            <p className="text-gray-600 text-lg mb-4">
                Use the navigation on the left to manage student data, upload academic schedules, and more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <DashboardCard title="Manage Students" description="Add, edit, or delete student profiles, including bulk upload." link="/manage-students" />
                <DashboardCard title="Upload Marks" description="Update student examination scores." link="/upload-marks" />
                <DashboardCard title="Time Table" description="Set up and update class schedules." link="/upload-timetable" />
                <DashboardCard title="Exam Schedule" description="Manage upcoming examination dates." link="/upload-exam-schedule" />
            </div>
        </div>
    );
};
