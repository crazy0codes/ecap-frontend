import React, { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from './confirmationModal.jsx';

export const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        rollNo: '',
        email: '',
        fatherName: '',
        motherName: '',
        address: '',
        mobileno: '',
        bloodgroup: '',
        branchId: '',
        regulationId: '',
        password: 'studentpass'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);
    const [activeTab, setActiveTab] = useState('individual');

    // States for bulk upload
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    // Dummy data for demonstration (adjust to new structure if needed for initial display)
    useEffect(() => {
        setStudents([
            { id: '1', name: 'John Doe', rollNo: '22A81A0601', email: 'john.doe@example.com', section: 'A', year: 'III', fatherName: 'Robert Doe', motherName: 'Martha Doe', address: '123 Main St', mobileno: '9876543210', bloodgroup: 'O+', branchId: '1', regulationId: 'V20' },
            { id: '2', name: 'Jane Smith', rollNo: '22A81A0602', email: 'jane.smith@example.com', section: 'B', year: 'III', fatherName: 'David Smith', motherName: 'Linda Smith', address: '456 Oak Ave', mobileno: '8765432109', bloodgroup: 'A-', branchId: '2', regulationId: 'R20' },
            { id: '3', name: 'Alice Johnson', rollNo: '22A81A0603', email: 'alice.j@example.com', section: 'A', year: 'IV', fatherName: 'Frank Johnson', motherName: 'Carol Johnson', address: '789 Pine Ln', mobileno: '7654321098', bloodgroup: 'B+', branchId: '1', regulationId: 'V20' },
        ]);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const studentPayload = {
            rollNumber: formData.rollNo,
            name: formData.name,
            regulationId: formData.regulationId,
            branchId: parseInt(formData.branchId, 10),
            address: formData.address,
            email: formData.email,
            mobileno: formData.mobileno,
            bloodgroup: formData.bloodgroup,
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            password: formData.password || 'studentpass'
        };

        try {
            if (isEditing) {
                // For editing, you'd typically have a PUT/PATCH endpoint with student ID
                // For this example, we'll just update client-side.
                setStudents(students.map(s => s.id === formData.id ? formData : s));
                setModalMessage('Student updated successfully!');
                setShowModal(true);
            } else {
                console.log('Adding new student to backend:', [studentPayload]);
                const response = await fetch('http://20.244.28.21:8080/api/upload/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'ROLE_ADMIN'
                    },
                    body: JSON.stringify([studentPayload])
                });

                if (response.ok && response.status === 201) {
                    const newStudentWithId = {
                        ...studentPayload,
                        id: Date.now().toString(),
                        rollNo: studentPayload.rollNumber,
                        section: 'N/A',
                        year: 'N/A'
                    };
                    setStudents(prev => [...prev, newStudentWithId]);
                    setModalMessage('Student added successfully!');
                } else {
                    let errorMessage = `Failed to add student: ${response.statusText || 'Unknown error'}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = `Failed to add student: ${errorData.message || response.statusText}`;
                    } catch (e) {
                        console.warn("Could not parse error response for individual student add.", e);
                    }
                    setModalMessage(errorMessage);
                }
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error submitting student data:', error);
            setModalMessage('An error occurred while saving student data.');
            setShowModal(true);
        }

        setFormData({ id: '', name: '', rollNo: '', email: '', fatherName: '', motherName: '', address: '', mobileno: '', bloodgroup: '', branchId: '', regulationId: '', password: 'studentpass' });
        setIsEditing(false);
    };

    const handleEdit = (student) => {
        setFormData({
            id: student.id,
            name: student.name,
            rollNo: student.rollNo,
            email: student.email,
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            address: student.address || '',
            mobileno: student.mobileno || '',
            bloodgroup: student.bloodgroup || '',
            branchId: student.branchId || '',
            regulationId: student.regulationId || '',
            password: 'studentpass'
        });
        setIsEditing(true);
        setActiveTab('individual');
    };

    const handleDelete = (id) => {
        setModalMessage('Are you sure you want to delete this student?');
        setModalAction(() => async () => {
            console.log(`Simulating deletion of student with ID: ${id}`);
            setStudents(students.filter(s => s.id !== id));
            setModalMessage('Student deleted successfully!');
            setShowModal(true);
        });
        setShowModal(true);
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

    // --- CSV Upload Logic ---

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        const expectedHeaderMap = {
            'roll_number': 'rollNumber',
            'name': 'name',
            'regulation_id': 'regulationId',
            'branch_id': 'branchId',
            'address': 'address',
            'email': 'email',
            'mobileno': 'mobileno',
            'bloodgroup': 'bloodgroup',
            'fathername': 'fatherName',
            'mothername': 'motherName'
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

            let branchIdValue = parseInt(rowObject['branchId'], 10);
            if (isNaN(branchIdValue)) {
                branchIdValue = null;
                console.warn(`Invalid branch_id for roll number ${rowObject.rollNumber || 'N/A'}: ${rowObject['branchId']}`);
            }

            data.push({
                rollNumber: rowObject['rollNumber'] || '',
                name: rowObject['name'] || '',
                regulationId: rowObject['regulationId'] || '',
                branchId: branchIdValue,
                address: rowObject['address'] || '',
                email: rowObject['email'] || '',
                mobileno: rowObject['mobileno'] || '',
                bloodgroup: rowObject['bloodgroup'] || '',
                fatherName: rowObject['fatherName'] || '',
                motherName: rowObject['motherName'] || '',
                password: 'studentpass'
            });
        }
        return data.filter(s => s.rollNumber && s.name && s.email);
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "roll_number,name,regulation_id,branch_id,address,email,mobileno,bloodgroup,fathername,mothername").');
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "roll_number,name,regulation_id,branch_id,address,email,mobileno,bloodgroup,fathername,mothername").');
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

        setModalMessage('Uploading data...');
        setShowModal(true);

        try {
            const response = await fetch('http://20.244.28.21:8080/api/upload/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ROLE_ADMIN'
                },
                body: JSON.stringify(csvData)
            });

            if (response.ok && response.status === 201) {
                const newStudentsWithIds = csvData.map(s => ({
                    ...s,
                    id: s.rollNumber + Math.random().toString().substring(2, 8),
                    rollNo: s.rollNumber,
                    section: 'N/A',
                    year: 'N/A'
                }));
                setStudents(prev => [...prev, ...newStudentsWithIds]);
                setModalMessage('Bulk upload successful!');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Students</h1>

            {/* Confirmation Modal */}
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
                        onClick={() => { setActiveTab('bulk'); setIsEditing(false); setFormData({ id: '', name: '', rollNo: '', email: '', fatherName: '', motherName: '', address: '', mobileno: '', bloodgroup: '', branchId: '', regulationId: '', password: 'studentpass' }); }}
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
                    {/* Create/Edit Student Form */}
                    <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Student Name"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleInputChange}
                                placeholder="Roll Number"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleInputChange}
                                placeholder="Father's Name"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleInputChange}
                                placeholder="Mother's Name"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="mobileno"
                                value={formData.mobileno}
                                onChange={handleInputChange}
                                placeholder="Mobile Number"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="bloodgroup"
                                value={formData.bloodgroup}
                                onChange={handleInputChange}
                                placeholder="Blood Group"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                             <input
                                type="number"
                                name="branchId"
                                value={formData.branchId}
                                onChange={handleInputChange}
                                placeholder="Branch ID"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                             <input
                                type="text"
                                name="regulationId"
                                value={formData.regulationId}
                                onChange={handleInputChange}
                                placeholder="Regulation ID (e.g., V20, R20)"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Password (default: studentpass)"
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                {isEditing ? 'Update Student' : 'Add Student'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', rollNo: '', email: '', fatherName: '', motherName: '', address: '', mobileno: '', bloodgroup: '', branchId: '', regulationId: '', password: 'studentpass' }); }}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </>
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
                            (Only CSV files are supported. Expected headers: "roll_number,name,regulation_id,branch_id,address,email,mobileno,bloodgroup,fathername,mothername")
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
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Roll No</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Father's Name</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Mother's Name</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Mobile No</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Blood Group</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Branch ID</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Regulation ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.rollNumber}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.name}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.email}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.fatherName}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.motherName}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.mobileno}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.bloodgroup}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.branchId}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.regulationId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end gap-4"> {/* Added gap for spacing */}
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

            {/* Search Student (remains visible for both tabs) */}
            <div className="mb-6 mt-8">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search students by name, roll number, or email..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Student List (remains visible for both tabs) */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Current Students</h2>
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Roll No</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Section</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Year</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Father's Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Mother's Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Address</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Mobile No</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Blood Group</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Branch ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Regulation ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.name}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.rollNo}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.email}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.fatherName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.motherName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.mobileno}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.bloodgroup}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.branchId}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.regulationId}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.section}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.year}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <button
                                            onClick={() => handleEdit(student)}
                                            className="text-blue-600 hover:text-blue-900 font-semibold mr-3 transition duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="text-red-600 hover:text-red-900 font-semibold transition duration-200"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="13" className="px-5 py-4 border-b border-gray-200 bg-white text-center text-sm text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};