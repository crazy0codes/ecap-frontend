import React, { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from './confirmationModal.jsx';
import { useAuth } from './AuthContext.jsx'; // Assuming AuthContext provides user info for headers

export const UploadMarks = () => {
    const { user } = useAuth(); // Get user for authorization headers if needed

    // State for fetched data
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [branches, setBranches] = useState([]); // Needed for student filtering if fetching all students

    // State for form selections
    const [selectedStudentRollNo, setSelectedStudentRollNo] = useState(''); // Changed to rollNo
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [currentMarksData, setCurrentMarksData] = useState({ marksObtained: '', grade: '' });

    // State for search and filter
    const [searchTerm, setSearchTerm] = useState('');

    // State for UI feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'

    // States for bulk upload
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    // Helper to get authorization headers (same as in TeacherAttendance)
    const getAuthHeaders = () => {
        // For this example, assuming no specific auth header needed by backend for GETs
        // If your backend requires it, you'd use user.token or similar from AuthContext
        return { 'Content-Type': 'application/json' };
    };

    // Helper function to safely parse JSON or return empty array for 204 No Content
    const parseJsonResponse = async (response) => {
        if (response.status === 204) {
            return []; // No content, return empty array
        }
        if (!response.ok) {
            // Attempt to parse error message if available, otherwise use status text
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || response.statusText}`);
        }
        return response.json();
    };

    // --- Data Fetching Effects ---

    // Fetch initial data (branches, semesters, courses, students)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [studentsRes, coursesRes, semestersRes, branchesRes] = await Promise.all([
                    fetch('http://localhost:8080/api/students', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/courses', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/semesters', { headers: getAuthHeaders() }),
                    fetch('http://localhost:8080/api/branches', { headers: getAuthHeaders() }),
                ]);

                // Safely parse JSON for each response
                const [studentsData, coursesData, semestersData, branchesData] = await Promise.all([
                    parseJsonResponse(studentsRes),
                    parseJsonResponse(coursesRes),
                    parseJsonResponse(semestersRes),
                    parseJsonResponse(branchesRes),
                ]);

                setStudents(studentsData);
                setCourses(coursesData);
                setSemesters(semestersData);
                setBranches(branchesData);

            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError('Failed to load initial data. Please ensure backend is running and data is available. Error: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);


    // Effect to fetch and display existing marks when student, course, or semester changes
    useEffect(() => {
        const fetchExistingMarks = async () => {
            if (selectedStudentRollNo && selectedSemesterId && selectedCourseId) {
                setLoading(true);
                setError('');
                try {
                    const response = await fetch(`http://localhost:8080/api/students/${selectedStudentRollNo}/semester/${selectedSemesterId}/marks`, {
                        headers: getAuthHeaders()
                    });

                    const data = await parseJsonResponse(response); // Use the helper function

                    // The API returns a list of marks for the semester. Find the specific course's mark.
                    const markForCourse = data.find(mark => mark.courseId === selectedCourseId);

                    if (markForCourse) {
                        setCurrentMarksData({
                            marksObtained: markForCourse.marksObtained,
                            grade: markForCourse.grade
                        });
                    } else {
                        setCurrentMarksData({ marksObtained: '', grade: '' });
                    }
                } catch (err) {
                    console.error("Error fetching existing marks:", err);
                    setError('Failed to load existing marks. Error: ' + err.message);
                    setCurrentMarksData({ marksObtained: '', grade: '' });
                } finally {
                    setLoading(false);
                }
            } else {
                setCurrentMarksData({ marksObtained: '', grade: '' });
            }
        };
        fetchExistingMarks();
    }, [selectedStudentRollNo, selectedCourseId, selectedSemesterId, user]);

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Handlers for Individual Entry ---

    const handleStudentSelect = (e) => {
        setSelectedStudentRollNo(e.target.value);
        setSelectedCourseId('');
        setSelectedSemesterId('');
    };

    const handleCourseSelect = (e) => {
        setSelectedCourseId(parseInt(e.target.value, 10));
    };

    const handleSemesterSelect = (e) => {
        setSelectedSemesterId(parseInt(e.target.value, 10));
    };

    const handleMarkChange = (e) => {
        const { name, value } = e.target;
        setCurrentMarksData({ ...currentMarksData, [name]: value });
    };

    const handleSubmitMarks = async (e) => {
        e.preventDefault();
        if (!selectedStudentRollNo || !selectedCourseId || !selectedSemesterId || currentMarksData.marksObtained === '' || currentMarksData.grade === '') {
            setModalMessage('Please select a student, course, semester, and enter both marks and grade.');
            setShowModal(true);
            return;
        }

        const payload = [{
            rollNumber: selectedStudentRollNo,
            courseId: selectedCourseId,
            semesterId: selectedSemesterId,
            marksObtained: parseFloat(currentMarksData.marksObtained),
            grade: currentMarksData.grade.toUpperCase()
        }];

        setModalMessage('Uploading marks...');
        setShowModal(true);

        try {
            const response = await fetch('http://localhost:8080/api/upload/semester-marks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setModalMessage('Marks uploaded successfully!');
                // Re-fetch all students to update the overview table
                const updatedStudentsRes = await fetch('http://localhost:8080/api/students', { headers: getAuthHeaders() });
                const updatedStudentsData = await parseJsonResponse(updatedStudentsRes); // Use helper
                setStudents(updatedStudentsData);

            } else {
                let errorMessage = `Failed to upload marks: ${response.statusText || 'Unknown error'}`;
                try {
                    const errorData = await response.json(); // Still try to parse if not 204
                    errorMessage = `Failed to upload marks: ${errorData.message || response.statusText}`;
                } catch (e) {
                    console.warn("Could not parse error response for marks upload.", e);
                }
                setModalMessage(errorMessage);
            }
        } catch (error) {
            console.error('Error submitting marks:', error);
            setModalMessage('An error occurred while uploading marks.');
        } finally {
            setShowModal(true);
            setSelectedStudentRollNo('');
            setSelectedCourseId('');
            setSelectedSemesterId('');
            setCurrentMarksData({ marksObtained: '', grade: '' });
        }
    };

    const confirmModal = () => {
        setShowModal(false);
    };

    // --- CSV Upload Logic ---

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        const expectedHeaderMap = {
            'rollnumber': 'rollNumber',
            'courseid': 'courseId',
            'semesterid': 'semesterId',
            'marksobtained': 'marksObtained',
            'grade': 'grade'
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

            let courseIdValue = parseInt(rowObject['courseId'], 10);
            let semesterIdValue = parseInt(rowObject['semesterId'], 10);
            let marksObtainedValue = parseFloat(rowObject['marksObtained']);

            if (isNaN(courseIdValue) || isNaN(semesterIdValue) || isNaN(marksObtainedValue) || !rowObject['rollNumber'] || !rowObject['grade']) {
                console.warn(`Invalid or missing data in row ${i + 1}. Skipping.`);
                continue;
            }

            data.push({
                rollNumber: rowObject['rollNumber'],
                courseId: courseIdValue,
                semesterId: semesterIdValue,
                marksObtained: marksObtainedValue,
                grade: (rowObject['grade']).toUpperCase()
            });
        }
        return data;
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "rollNumber,courseId,semesterId,marksObtained,grade").');
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "rollNumber,courseId,semesterId,marksObtained,grade").');
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

    const handleBulkUploadSubmit = async () => {
        if (csvData.length === 0) {
            setModalMessage('No data to upload. Please upload a CSV file.');
            setShowModal(true);
            return;
        }

        setModalMessage('Uploading bulk marks...');
        setShowModal(true);

        try {
            const response = await fetch('http://localhost:8080/api/upload/semester-marks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(csvData)
            });

            if (response.ok) {
                setModalMessage('Bulk marks uploaded successfully!');
                const updatedStudentsRes = await fetch('http://localhost:8080/api/students', { headers: getAuthHeaders() });
                const updatedStudentsData = await parseJsonResponse(updatedStudentsRes); // Use helper
                setStudents(updatedStudentsData);
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
            console.error('Error during bulk upload:', error);
            setModalMessage('An error occurred during bulk upload.');
        } finally {
            setShowModal(true);
            setCsvData([]); // Clear CSV data after attempting upload
            setFileName('');
        }
    };


    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Marks</h1>

            <ConfirmationModal
                show={showModal}
                message={modalMessage}
                onConfirm={confirmModal}
            />

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('individual'); setCsvData([]); setFileName(''); }}
                        className={`${
                            activeTab === 'individual'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-200 focus:outline-none`}
                    >
                        Individual Entry
                    </button>
                    <button
                        onClick={() => { setActiveTab('bulk'); setSelectedStudentRollNo(''); setSelectedCourseId(''); setSelectedSemesterId(''); setCurrentMarksData({ marksObtained: '', grade: '' }); }}
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

            {loading && <p className="text-center text-blue-600 mt-4">Loading data...</p>}
            {error && <p className="text-center text-red-600 mt-4">{error}</p>}

            {activeTab === 'individual' && (
                <form onSubmit={handleSubmitMarks} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                    <div className="mb-4">
                        <label htmlFor="searchTerm" className="block text-gray-700 text-sm font-semibold mb-2">Search Student (Name or Roll No):</label>
                        <input
                            type="text"
                            id="searchTerm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type to search students..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Student Select */}
                        <div>
                            <label htmlFor="studentSelect" className="block text-gray-700 text-sm font-semibold mb-2">Select Student:</label>
                            <select
                                id="studentSelect"
                                value={selectedStudentRollNo}
                                onChange={handleStudentSelect}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select a student --</option>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(student => (
                                        <option key={student.rollNumber} value={student.rollNumber}>
                                            {student.name} ({student.rollNumber})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No students found</option>
                                )}
                            </select>
                        </div>

                        {/* Semester Select */}
                        <div>
                            <label htmlFor="semesterSelect" className="block text-gray-700 text-sm font-semibold mb-2">Select Semester:</label>
                            <select
                                id="semesterSelect"
                                value={selectedSemesterId}
                                onChange={handleSemesterSelect}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                                disabled={!selectedStudentRollNo}
                            >
                                <option value="">-- Select a semester --</option>
                                {semesters.map(semester => (
                                    <option key={semester.semesterId} value={semester.semesterId}>
                                        Semester {semester.semesterNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course Select */}
                        <div>
                            <label htmlFor="courseSelect" className="block text-gray-700 text-sm font-semibold mb-2">Select Course:</label>
                            <select
                                id="courseSelect"
                                value={selectedCourseId}
                                onChange={handleCourseSelect}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                                disabled={!selectedStudentRollNo || !selectedSemesterId}
                            >
                                <option value="">-- Select a course --</option>
                                {courses.map(course => (
                                    <option key={course.courseId} value={course.courseId}>
                                        {course.courseCode} - {course.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Marks Input */}
                        <div>
                            <label htmlFor="marksObtained" className="block text-gray-700 text-sm font-semibold mb-2">Marks Obtained:</label>
                            <input
                                type="number"
                                id="marksObtained"
                                name="marksObtained"
                                value={currentMarksData.marksObtained}
                                onChange={handleMarkChange}
                                placeholder="Enter marks"
                                min="0"
                                max="100"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!selectedStudentRollNo || !selectedCourseId || !selectedSemesterId}
                            />
                        </div>
                        {/* Grade Input */}
                        <div>
                            <label htmlFor="grade" className="block text-gray-700 text-sm font-semibold mb-2">Grade:</label>
                            <input
                                type="text"
                                id="grade"
                                name="grade"
                                value={currentMarksData.grade}
                                onChange={handleMarkChange}
                                placeholder="Enter grade (e.g., A, B+, C)"
                                maxLength="2"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!selectedStudentRollNo || !selectedCourseId || !selectedSemesterId}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        disabled={!selectedStudentRollNo || !selectedCourseId || !selectedSemesterId || currentMarksData.marksObtained === '' || currentMarksData.grade === ''}
                    >
                        Upload Marks
                    </button>
                </form>
            )}

            {activeTab === 'bulk' && (
                <>
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
                            (Only CSV files are supported. Expected headers: "rollNumber,courseId,semesterId,marksObtained,grade")
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
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Roll Number</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Course ID</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Semester ID</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Marks Obtained</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.rollNumber}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.courseId}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.semesterId}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.marksObtained}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.grade}</td>
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
                                    onClick={handleBulkUploadSubmit}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    Confirm & Upload
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Current Student Marks Overview</h2>
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Student Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Roll No</th>
                            {/* Dynamically generate headers for each course */}
                            {courses.map(course => (
                                <th key={course.courseId} className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                    {course.courseCode} ({course.courseName})
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.rollNumber} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.name}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.rollNumber}</td>
                                    {/* Display marks for each course for the selected semester */}
                                    {courses.map(course => {
                                        const markEntry = student.semesterMarks?.find(
                                            mark => mark.courseCode === course.courseCode &&
                                                    (selectedSemesterId ? mark.semesterNumber === semesters.find(s => s.semesterId === selectedSemesterId)?.semesterNumber : true)
                                        );

                                        return (
                                            <td key={`${student.rollNumber}-${course.courseId}`} className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                {markEntry ? `${markEntry.marksObtained} (${markEntry.grade})` : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2 + courses.length} className="px-5 py-4 border-b border-gray-200 bg-white text-center text-sm text-gray-500">
                                    {loading ? "Loading students..." : "No students found. Please upload student data."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
