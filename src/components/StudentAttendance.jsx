import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth
// import { AttendanceCircle } from './attendanceCircle'; // Assuming AttendanceCircle is in the same directory or adjust path

export function StudentAttendance({ className }) {
    const { user } = useAuth(); // Get the logged-in user from AuthContext
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendanceSummary = async () => {
            if (!user || !user.rollNumber) {
                setError("User not logged in or roll number not available.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch attendance summary for the logged-in student
                // The backend endpoint is /api/attendance/students/{studentRollNumber}/summary
                const response = await fetch(`http://20.244.28.21:8080/api/attendance/students/${user.rollNumber}/summary`);

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error("Authentication error. Please log in again.");
                    }
                    throw new Error(`Failed to fetch attendance summary: ${response.statusText}`);
                }

                const data = await response.json();
                setAttendanceSummary(data);
            } catch (err) {
                console.error("Error fetching attendance summary:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceSummary();
    }, [user]); // Re-fetch when user changes (e.g., after login)

    if (loading) {
        return <div className={`p-8 bg-white rounded-lg shadow-md ${className}`}>Loading attendance...</div>;
    }

    if (error) {
        return <div className={`p-8 bg-white rounded-lg shadow-md text-red-600 ${className}`}>Error: {error}</div>;
    }

    // Calculate overall percentage for the AttendanceCircle
    const totalClasses = attendanceSummary?.totalClasses || 0;
    const classesAttended = attendanceSummary?.classesAttended || 0;
    const overallPercentage = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 100) : 0;

    return (
        <div className={`p-8 bg-white rounded-lg shadow-md ${className}`}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Attendance</h1>

            <div className="flex flex-col items-center justify-center mb-8">
                <AttendanceCircle percentage={overallPercentage} />
                <p className="mt-4 text-lg font-semibold text-gray-700">
                    Overall Attendance: {classesAttended} / {totalClasses} classes
                </p>
            </div>

            {attendanceSummary?.subjectAttendance && attendanceSummary.subjectAttendance.length > 0 ? (
                <>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Subject-wise Attendance</h2>
                    <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Course Code</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Course Name</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Attended</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Total</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceSummary.subjectAttendance.map((subject, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{subject.courseCode}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{subject.courseName}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{subject.classesAttended}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{subject.totalClasses}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            {subject.totalClasses > 0 ? Math.round((subject.classesAttended / subject.totalClasses) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-600">No subject-wise attendance data available.</p>
            )}
        </div>
    );
}

// Make sure AttendanceCircle is defined or imported correctly.
// If it's in a separate file, ensure the import path is correct.
// For now, I'll include it here if it's not already in its own file.
// If you have it as a separate file like 'attendanceCircle.jsx', keep that.
// If you provided it inline in the previous prompt, it should be in its own file.
// Let's assume it's in `src/attendanceCircle.jsx` or similar.
// If you included it directly in your prompt, it should be in a separate file.
// Based on your initial prompt, it was provided as a separate function.
// I'll put it here for completeness, but you should ideally keep it in its own file.

export function AttendanceCircle({ percentage = 85, className }) {
    // Determine color based on percentage
    const strokeColor = percentage >= 75 ? '#22c55e' : '#ef4444'; // Tailwind green-500 or red-500

    return (
        <div className={`flex flex-col items-center justify-center ${className}`} >
            <div className="relative w-32 h-32 rounded-full bg-gray-200">
                {/* Conic gradient for the progress bar */}
                <div
                    className="absolute top-0 left-0 w-full h-full rounded-full shadow-lg"
                    style={{
                        background: `conic-gradient(${strokeColor} ${percentage * 3.6}deg, #e5e7eb 0deg)`,
                    }}
                ></div>

                {/* Inner circle for the percentage text */}
                <div className="absolute top-2 left-2 w-28 h-28 rounded-full bg-white flex items-center justify-center text-xl font-bold">
                    {percentage}%
                </div>
            </div>

            {/* Bottom label */}
            <p className="mt-2 text-center text-sm font-medium text-gray-700">Attendance</p>
        </div>
    );
}
