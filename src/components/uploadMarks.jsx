import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import ConfirmationModal from './confirmationModal.jsx';

export const UploadMarks = () => {
    // Dummy data for courses, matching your provided database schema
    const dummyCourses = [
        { course_id: 1, course_code: 'V20MAT02', course_name: 'NUMERICAL METHODS AND VECTOR CALCULUS', credits: 3 },
        { course_id: 2, course_code: 'V20PHT01', course_name: 'ENGINEERING PHYSICS', credits: 3 },
        { course_id: 3, course_code: 'V20ECT01', course_name: 'SWITCHING THEORY AND LOGIC DESIGN', credits: 3 },
        { course_id: 4, course_code: 'V20CST02', course_name: 'PYTHON PROGRAMMING', credits: 3 },
        { course_id: 5, course_code: 'V20MET01', course_name: 'ENGINEERING GRAPHICS', credits: 3 },
        { course_id: 6, course_code: 'V20PHTL01', course_name: 'ENGINEERING PHYSICS LAB', credits: 1.5 },
        { course_id: 7, course_code: 'V20CSL02', course_name: 'PYTHON PROGRAMMING LAB', credits: 1.5 },
        { course_id: 8, course_code: 'V20ENL02', course_name: 'HONE YOUR COMMUNICATION SKILLS LAB-II', credits: 1.5 },
        { course_id: 9, course_code: 'V20CHT02', course_name: 'ENVIRONMENTAL STUDIES', credits: 0 },
    ];

    // Dummy data for semesters
    const dummySemesters = [
        { id: 1, name: 'Semester 1' },
        { id: 2, name: 'Semester 2' },
        { id: 3, name: 'Semester 3' },
        { id: 4, name: 'Semester 4' },
    ];

    // Dummy student data, now including a nested structure for semesterMarks
    // semesterMarks: { [semesterId]: { [courseId]: { marksObtained: number, grade: string } } }
    const [students, setStudents] = useState([
        {
            id: '1',
            name: 'John Doe',
            rollNo: '22A81A0601',
            semesterMarks: {
                '1': {
                    '1': { marksObtained: 85, grade: 'A' }, // Semester 1, Course 1 (NUMERICAL METHODS AND VECTOR CALCULUS)
                    '2': { marksObtained: 70, grade: 'B' }, // Semester 1, Course 2 (ENGINEERING PHYSICS)
                },
                '2': {
                    '4': { marksObtained: 92, grade: 'A+' }, // Semester 2, Course 4 (PYTHON PROGRAMMING)
                }
            }
        },
        {
            id: '2',
            name: 'Jane Smith',
            rollNo: '22A81A0602',
            semesterMarks: {
                '1': {
                    '1': { marksObtained: 78, grade: 'B+' },
                    '5': { marksObtained: 65, grade: 'C' },
                }
            }
        },
    ]);

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [currentMarksData, setCurrentMarksData] = useState({ marksObtained: '', grade: '' });

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'

    // States for bulk upload
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);


    // Effect to reset marks when student, course, or semester changes
    useEffect(() => {
        if (selectedStudentId && selectedCourseId && selectedSemesterId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student && student.semesterMarks[selectedSemesterId] && student.semesterMarks[selectedSemesterId][selectedCourseId]) {
                setCurrentMarksData(student.semesterMarks[selectedSemesterId][selectedCourseId]);
            } else {
                setCurrentMarksData({ marksObtained: '', grade: '' });
            }
        } else {
            setCurrentMarksData({ marksObtained: '', grade: '' });
        }
    }, [selectedStudentId, selectedCourseId, selectedSemesterId, students]);


    const handleStudentSelect = (e) => {
        setSelectedStudentId(e.target.value);
        // Reset course and marks when student changes
        setSelectedCourseId('');
        setSelectedSemesterId('');
    };

    const handleCourseSelect = (e) => {
        setSelectedCourseId(parseInt(e.target.value, 10)); // Ensure it's a number
    };

    const handleSemesterSelect = (e) => {
        setSelectedSemesterId(parseInt(e.target.value, 10)); // Ensure it's a number
    };

    const handleMarkChange = (e) => {
        const { name, value } = e.target;
        setCurrentMarksData({ ...currentMarksData, [name]: value });
    };

    const handleSubmitMarks = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedCourseId || !selectedSemesterId || currentMarksData.marksObtained === '' || currentMarksData.grade === '') {
            setModalMessage('Please select a student, course, semester, and enter both marks and grade.');
            setShowModal(true);
            return;
        }

        const student = students.find(s => s.id === selectedStudentId);
        if (!student) {
            setModalMessage('Selected student not found.');
            setShowModal(true);
            return;
        }

        const payload = [{
            rollNumber: student.rollNo,
            courseId: selectedCourseId,
            semesterId: selectedSemesterId,
            marksObtained: parseFloat(currentMarksData.marksObtained),
            grade: currentMarksData.grade.toUpperCase()
        }];

        setModalMessage('Uploading marks...');
        setShowModal(true);

        try {
            const response = await fetch('http://localhost:8008/api/upload/semester-marks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ROLE_FACULTY'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setStudents(prevStudents =>
                    prevStudents.map(s => {
                        if (s.id === selectedStudentId) {
                            const updatedSemesterMarks = { ...s.semesterMarks };
                            if (!updatedSemesterMarks[selectedSemesterId]) {
                                updatedSemesterMarks[selectedSemesterId] = {};
                            }
                            updatedSemesterMarks[selectedSemesterId][selectedCourseId] = {
                                marksObtained: parseFloat(currentMarksData.marksObtained),
                                grade: currentMarksData.grade.toUpperCase()
                            };
                            return { ...s, semesterMarks: updatedSemesterMarks };
                        }
                        return s;
                    })
                );
                setModalMessage('Marks uploaded successfully!');
            } else {
                let errorMessage = `Failed to upload marks: ${response.statusText || 'Unknown error'}`;
                try {
                    const errorData = await response.json();
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
            setSelectedStudentId('');
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

        // Expected headers for marks upload CSV
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

            // Type conversions and validation for marks data
            let courseIdValue = parseInt(rowObject['courseId'], 10);
            let semesterIdValue = parseInt(rowObject['semesterId'], 10);
            let marksObtainedValue = parseFloat(rowObject['marksObtained']);

            if (isNaN(courseIdValue) || isNaN(semesterIdValue) || isNaN(marksObtainedValue)) {
                console.warn(`Invalid numeric data in row ${i + 1}. Skipping.`);
                continue;
            }

            data.push({
                rollNumber: rowObject['rollNumber'] || '',
                courseId: courseIdValue,
                semesterId: semesterIdValue,
                marksObtained: marksObtainedValue,
                grade: (rowObject['grade'] || '').toUpperCase()
            });
        }
        // Basic validation: ensure essential fields are present
        return data.filter(entry => entry.rollNumber && entry.courseId && entry.semesterId && entry.marksObtained !== '' && entry.grade);
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
            const response = await fetch('http://localhost:8008/api/upload/semester-marks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ROLE_FACULTY' // Or ROLE_ADMIN
                },
                body: JSON.stringify(csvData)
            });

            if (response.ok) {
                // Assuming success, update local student data based on uploaded CSV
                // This is a simplified update; a real app might re-fetch student data
                setStudents(prevStudents => {
                    const updatedStudents = [...prevStudents];
                    csvData.forEach(newMark => {
                        const studentIndex = updatedStudents.findIndex(s => s.rollNo === newMark.rollNumber);
                        if (studentIndex !== -1) {
                            const studentToUpdate = { ...updatedStudents[studentIndex] };
                            if (!studentToUpdate.semesterMarks[newMark.semesterId]) {
                                studentToUpdate.semesterMarks[newMark.semesterId] = {};
                            }
                            studentToUpdate.semesterMarks[newMark.semesterId][newMark.courseId] = {
                                marksObtained: newMark.marksObtained,
                                grade: newMark.grade
                            };
                            updatedStudents[studentIndex] = studentToUpdate;
                        } else {
                            // If student not found locally, add a new dummy student for display
                            // In a real app, you'd fetch this student from backend or handle differently
                            updatedStudents.push({
                                id: newMark.rollNumber + '_new', // Dummy ID
                                name: `New Student (${newMark.rollNumber})`, // Placeholder name
                                rollNo: newMark.rollNumber,
                                semesterMarks: {
                                    [newMark.semesterId]: {
                                        [newMark.courseId]: {
                                            marksObtained: newMark.marksObtained,
                                            grade: newMark.grade
                                        }
                                    }
                                }
                            });
                        }
                    });
                    return updatedStudents;
                });
                setModalMessage('Bulk marks uploaded successfully!');
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
                        onClick={() => { setActiveTab('bulk'); setSelectedStudentId(''); setSelectedCourseId(''); setSelectedSemesterId(''); setCurrentMarksData({ marksObtained: '', grade: '' }); }}
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
                <form onSubmit={handleSubmitMarks} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Student Select */}
                        <div>
                            <label htmlFor="studentSelect" className="block text-gray-700 text-sm font-semibold mb-2">Select Student:</label>
                            <select
                                id="studentSelect"
                                value={selectedStudentId}
                                onChange={handleStudentSelect}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select a student --</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.rollNo})
                                    </option>
                                ))}
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
                                disabled={!selectedStudentId}
                            >
                                <option value="">-- Select a semester --</option>
                                {dummySemesters.map(semester => (
                                    <option key={semester.id} value={semester.id}>
                                        {semester.name}
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
                                disabled={!selectedStudentId || !selectedSemesterId}
                            >
                                <option value="">-- Select a course --</option>
                                {dummyCourses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_code} - {course.course_name}
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
                                disabled={!selectedStudentId || !selectedCourseId || !selectedSemesterId}
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
                                disabled={!selectedStudentId || !selectedCourseId || !selectedSemesterId}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        disabled={!selectedStudentId || !selectedCourseId || !selectedSemesterId || currentMarksData.marksObtained === '' || currentMarksData.grade === ''}
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
                            {dummyCourses.map(course => (
                                <th key={course.course_id} className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                    {course.course_code} ({course.course_name}) - S{selectedSemesterId || 'All'}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.name}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.rollNo}</td>
                                {/* Display marks for each course */}
                                {dummyCourses.map(course => {
                                    const marksEntry = selectedSemesterId
                                        ? student.semesterMarks[selectedSemesterId]?.[course.course_id]
                                        : Object.values(student.semesterMarks).flatMap(sem => Object.values(sem)).find(mark => mark.courseId === course.course_id);

                                    return (
                                        <td key={`${student.id}-${course.course_id}`} className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            {marksEntry ? `${marksEntry.marksObtained} (${marksEntry.grade})` : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
