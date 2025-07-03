import React, { useState, useEffect, useCallback } from 'react';
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
    const [attendanceSessionId, setAttendanceSessionId] = useState(null); // ID of the current session for individual marking or bulk upload
    const [attendanceRecords, setAttendanceRecords] = useState({}); // {rollNumber: status} for individual marking
    const [attendanceSessions, setAttendanceSessions] = useState([]); // List of sessions for selected date/branch/semester

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'

    // States for bulk upload of attendance records
    const [csvData, setCsvData] = useState([]); // Parsed data from CSV for attendance records
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedBulkSessionId, setSelectedBulkSessionId] = useState(''); // Session ID for bulk upload

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
            const response = await fetch('http://localhost:8080/api/upload/attendance-sessions', { // Corrected URL
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Authorization': 'ROLE_ADMIN' // As per your API spec
                },
                body: JSON.stringify([{ // Wrap in array as per your API spec
                    teacherId: 1, // Placeholder: Replace with actual logged-in teacher ID if available
                    courseId: parseInt(selectedCourse, 10), // Ensure it's a number
                    branchId: parseInt(selectedBranch, 10), // Ensure it's a number
                    semesterId: parseInt(selectedSemester, 10), // Ensure it's a number
                    periodId: parseInt(selectedPeriod, 10), // Ensure it's a number
                    dayId: parseInt(selectedDay, 10), // Ensure it's a number
                    date: selectedDate, // YYYY-MM-DD
                }]),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create attendance session.');
            }

            // The API returns a list of created sessions, take the first one if successful
            const sessionData = await response.json();
            if (sessionData && sessionData.length > 0) {
                setAttendanceSessionId(sessionData[0].id); // Store the newly created session ID
                setModalMessage('Attendance session created successfully!');
            } else {
                setModalMessage('Attendance session created, but no ID returned.');
            }
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
            attendanceSessionId: attendanceSessionId, // Use the selected session ID
            studentRollNumber: student.rollNumber,
            status: attendanceRecords[student.rollNumber] || 'Absent', // Default to Absent if not marked
        }));

        try {
            const response = await fetch(`http://localhost:8080/api/upload/attendance-records`, { // Corrected URL
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Authorization': 'ROLE_ADMIN' // As per your API spec
                },
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

    // --- CSV Upload Logic for Attendance Records ---

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        // Expected headers for attendance records upload CSV
        const expectedHeaderMap = {
            'studentrollnumber': 'studentRollNumber',
            'status': 'status'
        };

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
                console.warn(`Skipping row ${i + 1} due to column mismatch or malformed line.`);
                continue;
            }
            let rowObject = {};
            headers.forEach((header, index) => {
                const propertyName = expectedHeaderMap[header];
                if (propertyName) {
                    rowObject[propertyName] = values[index];
                } else {
                    console.warn(`Unexpected header in CSV: ${header}. Skipping this value.`);
                }
            });

            // Basic validation for attendance records
            if (!rowObject['studentRollNumber'] || !['present', 'absent'].includes((rowObject['status'] || '').toLowerCase())) {
                console.warn(`Invalid or missing data in row ${i + 1}. Skipping.`);
                continue;
            }

            data.push({
                studentRollNumber: rowObject['studentRollNumber'],
                status: rowObject['status']
            });
        }
        // Filter out entries that don't have essential data after parsing
        return data.filter(entry => entry.studentRollNumber && entry.status);
    };

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const parsed = parseCSV(text);
                setCsvData(parsed);
                if (parsed.length === 0) {
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "studentRollNumber,status").');
                    setShowModal(true);
                }
            };
            reader.readAsText(file);
        } else {
            setModalMessage('Please drop a valid CSV file.');
            setShowModal(true);
            setCsvData([]);
            setFileName('');
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv') {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const parsed = parseCSV(text);
                setCsvData(parsed);
                if (parsed.length === 0) {
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "studentRollNumber,status").');
                    setShowModal(true);
                }
            };
            reader.readAsText(file);
        } else if (file) {
            setModalMessage('Please select a valid CSV file.');
            setShowModal(true);
            setCsvData([]);
            setFileName('');
        }
    };

    const handleClearCsvData = () => {
        setCsvData([]);
        setFileName('');
        setModalMessage('CSV data cleared successfully.');
        setShowModal(true);
    };

    const handleBulkUploadAttendance = async () => {
        if (!selectedBulkSessionId) {
            setModalMessage('Please select an attendance session for bulk upload.');
            setShowModal(true);
            return;
        }
        if (csvData.length === 0) {
            setModalMessage('No data to upload. Please upload a CSV file.');
            setShowModal(true);
            return;
        }

        setModalMessage('Uploading bulk attendance records...');
        setShowModal(true);

        const recordsToSubmit = csvData.map(record => ({
            attendanceSessionId: parseInt(selectedBulkSessionId, 10), // Use the selected bulk session ID
            studentRollNumber: record.studentRollNumber,
            status: record.status
        }));

        try {
            const response = await fetch('/api/upload/attendance-records', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Authorization': 'ROLE_ADMIN' // As per your API spec
                },
                body: JSON.stringify(recordsToSubmit)
            });

            if (response.ok) {
                setModalMessage('Bulk attendance records uploaded successfully!');
                // Optionally, update the local attendance records for the selected session
                // This would require fetching the updated records for the session or
                // more complex client-side state management. For simplicity, we'll just confirm success.
            } else {
                let errorMessage = `Bulk upload failed: ${response.statusText || 'Unknown error'}`;
                try {
                    const errorData = await response.json();
                    errorMessage = `Bulk upload failed: ${errorData.message || response.statusText}`;
                } catch (e) {
                    console.warn("Could not parse error response for bulk upload.", e);
                }
                setModalMessage(errorMessage);
            }
        } catch (error) {
            console.error('Error during bulk attendance upload:', error);
            setModalMessage('An error occurred during bulk attendance upload.');
        } finally {
            setShowModal(true);
            setCsvData([]); // Clear CSV data after attempting upload
            setFileName('');
            setSelectedBulkSessionId('');
        }
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

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('individual'); setCsvData([]); setFileName(''); setSelectedBulkSessionId(''); }}
                        className={`${
                            activeTab === 'individual'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-200 focus:outline-none`}
                    >
                        Individual Entry
                    </button>
                    <button
                        onClick={() => { setActiveTab('bulk'); setAttendanceSessionId(null); setAttendanceRecords({}); setStudents([]); }}
                        className={`${
                            activeTab === 'bulk'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-200 focus:outline-none`}
                    >
                        Bulk Upload (CSV)
                    </button>
                </nav>
            </div>

            {activeTab === 'individual' && (
                <>
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

                    {/* Student Attendance List for Individual Marking */}
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
                </>
            )}

            {activeTab === 'bulk' && (
                <>
                    {/* Select Session for Bulk Upload */}
                    <div className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Session for Bulk Attendance Upload</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Re-using session selection fields to filter available sessions */}
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
                            <input
                                type="date"
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />
                        </div>
                        {attendanceSessions.length > 0 && (
                            <div className="mt-6">
                                <label htmlFor="selectBulkSession" className="block text-gray-700 text-sm font-semibold mb-2">Select Session to Upload Records To:</label>
                                <select
                                    id="selectBulkSession"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedBulkSessionId || ''}
                                    onChange={(e) => setSelectedBulkSessionId(e.target.value ? parseInt(e.target.value) : null)}
                                    required
                                >
                                    <option value="">-- Select an existing session --</option>
                                    {attendanceSessions.map(session => (
                                        <option key={session.id} value={session.id}>
                                            Session ID: {session.id} - Course: {session.courseName} - Period: {session.periodNumber} - Day: {session.dayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {selectedDate && selectedBranch && selectedSemester && attendanceSessions.length === 0 && !loading && (
                            <p className="text-center text-gray-600 mt-4">No sessions found for the selected criteria. Please create one in the "Individual Entry" tab.</p>
                        )}
                    </div>

                    <div
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 mb-8 ${
                            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                        }`}
                    >
                        <p className="text-gray-600 text-lg mb-4">
                            Drag & drop your CSV file here, or
                        </p>
                        <label htmlFor="csv-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-3 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                            Browse Files
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                        </label>
                        {fileName && <p className="mt-4 text-gray-700">File selected: <span className="font-medium">{fileName}</span></p>}
                        <p className="mt-2 text-sm text-gray-500">
                            (Only CSV files are supported. Expected headers: "studentRollNumber,status")
                        </p>
                    </div>

                    {/* Display Extracted CSV Data and Action Buttons */}
                    {csvData.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Preview & Confirm Upload Data ({csvData.length} entries)</h2>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 mb-4">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr className="bg-blue-100 text-blue-800">
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Student Roll Number</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.studentRollNumber}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    onClick={handleClearCsvData}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    Clear Data
                                </button>
                                <button
                                    onClick={handleBulkUploadAttendance}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                    disabled={!selectedBulkSessionId}
                                >
                                    Confirm & Upload
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
