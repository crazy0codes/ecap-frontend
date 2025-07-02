import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx'; // Import useAuth
import ConfirmationModal from './confirmationModal.jsx'; // Assuming ConfirmationModal is in the same directory or adjust path

export const TeacherAttendance = () => {
    const { user } = useAuth(); // Get user for authorization headers if needed
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [days, setDays] = useState([]);
    const [students, setStudents] = useState([]); // Students for the selected branch/semester

    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedDate, setSelectedDate] = useState(''); // For new session creation
    const [attendanceSessionId, setAttendanceSessionId] = useState(null); // ID of the current session
    const [attendanceRecords, setAttendanceRecords] = useState({}); // {rollNumber: status}
    const [attendanceSessions, setAttendanceSessions] = useState([]); // List of sessions for selected date/branch/semester

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);

    // Helper to get authorization headers
    const getAuthHeaders = () => {
        // In a real Basic Auth scenario, you'd typically rely on the browser's
        // cached credentials after the initial login.
        // For programmatic fetches, you might need to re-send credentials.
        // For this example, we'll assume the browser handles it after initial login.
        // If your AuthContext stored username/password, you'd use them here:
        // return { 'Authorization': 'Basic ' + btoa(user.rollNumber + ":" + user.password), 'Content-Type': 'application/json' };
        return { 'Content-Type': 'application/json' }; // Default for most cases
    };


    // Fetch initial data (branches, semesters, courses, periods, days)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [branchesRes, semestersRes, coursesRes, periodsRes, daysRes] = await Promise.all([
                    fetch('http://localhost:8080/api/upload/branches', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/semesters', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/upload/courses', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/periods', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/days', { headers: getAuthHeaders() }),
                ]);

                const [branchesData, semestersData, coursesData, periodsData, daysData] = await Promise.all([
                    branchesRes.json(),
                    semestersRes.json(),
                    coursesRes.json(),
                    periodsRes.json(),
                    daysRes.json(),
                ]);

                setBranches(branchesData);
                setSemesters(semestersData);
                setCourses(coursesData);
                setPeriods(periodsData);
                setDays(daysData);

            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]); // Depend on user to ensure auth headers are ready

    // Fetch students based on selected branch and semester
    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedBranch && selectedSemester) {
                setLoading(true);
                setError('');
                try {
                    // Assuming an endpoint like /api/students/branch/{branchId}/semester/{semesterId} exists
                    // If not, you'd need to fetch all students and filter client-side, or create this backend endpoint.
                    const response = await fetch(`http://localhost:8080/api/students/branch/${selectedBranch}/semester/${selectedSemester}`, { headers: getAuthHeaders() });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch students: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setStudents(data);
                    // Initialize attendance records for all fetched students as 'Absent' by default
                    const initialRecords = {};
                    data.forEach(student => {
                        initialRecords[student.rollNumber] = 'Absent';
                    });
                    setAttendanceRecords(initialRecords);
                } catch (err) {
                    console.error("Error fetching students:", err);
                    setError('Failed to load students for selected criteria.');
                    setStudents([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setStudents([]);
            }
        };
        fetchStudents();
    }, [selectedBranch, selectedSemester, user]);

    // Fetch attendance sessions for selected date/branch/semester
    useEffect(() => {
        const fetchAttendanceSessions = async () => {
            if (selectedDate && selectedBranch && selectedSemester) {
                setLoading(true);
                setError('');
                try {
                    const formattedDate = selectedDate; // Already in YYYY-MM-DD format
                    const response = await fetch(`http://localhost:8080/api/attendance/sessions/branch/${selectedBranch}/semester/${selectedSemester}/date/${formattedDate}`, { headers: getAuthHeaders() });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch attendance sessions: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setAttendanceSessions(data);
                } catch (err) {
                    console.error("Error fetching attendance sessions:", err);
                    setError('Failed to load attendance sessions for selected date.');
                    setAttendanceSessions([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setAttendanceSessions([]);
            }
        };
        fetchAttendanceSessions();
    }, [selectedDate, selectedBranch, selectedSemester, user]);


    const handleAttendanceChange = (rollNumber, status) => {
        setAttendanceRecords(prev => ({ ...prev, [rollNumber]: status }));
    };

    const handleCreateSession = async () => {
        if (!selectedBranch || !selectedSemester || !selectedCourse || !selectedPeriod || !selectedDay || !selectedDate) {
            setModalMessage('Please select all session details (Branch, Semester, Course, Period, Day, Date) to create a session.');
            setShowModal(true);
            return;
        }
        setModalMessage('Creating attendance session...');
        setShowModal(true);
        setModalAction(null); // Clear any previous action

        try {
            const response = await fetch('http://localhost:8080/api/attendance/sessions', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    teacherId: 1, // Placeholder: Replace with actual logged-in teacher ID if available
                    courseId: selectedCourse,
                    branchId: selectedBranch,
                    semesterId: selectedSemester,
                    periodId: selectedPeriod,
                    dayId: selectedDay,
                    date: selectedDate, // YYYY-MM-DD
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create attendance session.');
            }

            const sessionData = await response.json();
            setAttendanceSessionId(sessionData.id); // Store the newly created session ID
            setModalMessage('Attendance session created successfully!');
            setShowModal(true);

            // Re-fetch sessions to update the list
            // This will trigger the useEffect for attendanceSessions
            // by updating selectedDate, selectedBranch, selectedSemester (if they were changed by user)
            // or by manually calling fetchAttendanceSessions if they are static.
            // For simplicity, we'll rely on the useEffect.
        } catch (err) {
            console.error("Error creating session:", err);
            setModalMessage(`Error creating session: ${err.message}`);
            setShowModal(true);
        }
    };

    const handleSubmitAttendance = async () => {
        if (!attendanceSessionId) {
            setModalMessage('Please create or select an attendance session first.');
            setShowModal(true);
            return;
        }
        if (students.length === 0) {
            setModalMessage('No students to mark attendance for.');
            setShowModal(true);
            return;
        }

        setModalMessage('Submitting attendance...');
        setShowModal(true);
        setModalAction(null);

        const recordsToSubmit = students.map(student => ({
            studentRollNumber: student.rollNumber,
            status: attendanceRecords[student.rollNumber] || 'Absent', // Default to Absent if not marked
        }));

        try {
            const response = await fetch(`http://localhost:8080/api/attendance/sessions/${attendanceSessionId}/records`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(recordsToSubmit),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit attendance records.');
            }

            setModalMessage('Attendance submitted successfully!');
            setShowModal(true);
            // Optionally clear selected session or reset form after submission
            setAttendanceSessionId(null);
            setAttendanceRecords({});
            setSelectedBranch('');
            setSelectedSemester('');
            setSelectedCourse('');
            setSelectedPeriod('');
            setSelectedDay('');
            setSelectedDate('');
            setStudents([]); // Clear students after submission
        } catch (err) {
            console.error("Error submitting attendance:", err);
            setModalMessage(`Error submitting attendance: ${err.message}`);
            setShowModal(true);
        }
    };

    const confirmModal = () => {
        if (modalAction) {
            modalAction();
            setModalAction(null);
        }
        setShowModal(false);
    };

    const cancelModal = () => {
        setShowModal(false);
        setModalAction(null);
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Attendance</h1>

            <ConfirmationModal
                show={showModal}
                message={modalMessage}
                onConfirm={confirmModal}
                onCancel={modalAction ? cancelModal : undefined}
            />

            {/* Session Creation/Selection */}
            <div className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Create or Select Attendance Session</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <select
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        required
                    >
                        <option value="">Select Branch</option>
                        {branches.map(b => (
                            <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                        ))}
                    </select>
                    <select
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        required
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(s => (
                            <option key={s.semesterId} value={s.semesterId}>{s.semesterNumber}</option>
                        ))}
                    </select>
                    <select
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                            <option key={c.courseId} value={c.courseId}>{c.courseName} ({c.courseCode})</option>
                        ))}
                    </select>
                    <select
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        required
                    >
                        <option value="">Select Period</option>
                        {periods.map(p => (
                            <option key={p.id} value={p.id}>{p.periodNumber}</option>
                        ))}
                    </select>
                    <select
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        required
                    >
                        <option value="">Select Day</option>
                        {days.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                    />
                </div>
                <button
                    onClick={handleCreateSession}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                >
                    Create New Session
                </button>

                {attendanceSessions.length > 0 && (
                    <div className="mt-6">
                        <label htmlFor="selectSession" className="block text-gray-700 text-sm font-semibold mb-2">Or Select Existing Session:</label>
                        <select
                            id="selectSession"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={attendanceSessionId || ''}
                            onChange={(e) => setAttendanceSessionId(e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">-- Select a session --</option>
                            {attendanceSessions.map(session => (
                                <option key={session.id} value={session.id}>
                                    Session ID: {session.id} - Date: {session.date} - Course: {session.courseName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Student Attendance List */}
            {selectedBranch && selectedSemester && students.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Mark Attendance</h2>
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Roll No</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.rollNumber} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.rollNumber}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.name}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <select
                                            value={attendanceRecords[student.rollNumber] || 'Absent'}
                                            onChange={(e) => handleAttendanceChange(student.rollNumber, e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md bg-white"
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6 p-4 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={handleSubmitAttendance}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            disabled={!attendanceSessionId || students.length === 0}
                        >
                            Submit Attendance
                        </button>
                    </div>
                </div>
            )}

            {selectedBranch && selectedSemester && students.length === 0 && !loading && (
                <p className="text-center text-gray-600 mt-8">No students found for the selected branch and semester.</p>
            )}
        </div>
    );
};
