import React, { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from './confirmationModal.jsx'; // Corrected import path

export const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ id: '', name: '', rollNo: '', email: '', section: '', year: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'

    // States for bulk upload
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    // Dummy data for demonstration
    useEffect(() => {
        setStudents([
            { id: '1', name: 'John Doe', rollNo: '22A81A0601', email: 'john.doe@example.com', section: 'A', year: 'III' },
            { id: '2', name: 'Jane Smith', rollNo: '22A81A0602', email: 'jane.smith@example.com', section: 'B', year: 'III' },
            { id: '3', name: 'Alice Johnson', rollNo: '22A81A0603', email: 'alice.j@example.com', section: 'A', year: 'IV' },
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setStudents(students.map(s => s.id === formData.id ? formData : s));
            setModalMessage('Student updated successfully!');
        } else {
            const newStudent = { ...formData, id: Date.now().toString() }; // Simple ID generation
            setStudents([...students, newStudent]);
            setModalMessage('Student added successfully!');
        }
        setShowModal(true);
        setFormData({ id: '', name: '', rollNo: '', email: '', section: '', year: '' });
        setIsEditing(false);
    };

    const handleEdit = (student) => {
        setFormData(student);
        setIsEditing(true);
        setActiveTab('individual'); // Switch to individual tab for editing
    };

    const handleDelete = (id) => {
        setModalMessage('Are you sure you want to delete this student?');
        setModalAction(() => () => {
            setStudents(students.filter(s => s.id !== id));
            setModalMessage('Student deleted successfully!');
            setShowModal(true); // Show confirmation for deletion
        });
        setShowModal(true);
    };

    const confirmModal = () => {
        if (modalAction) {
            modalAction();
            setModalAction(null); // Clear action
        }
        setShowModal(false); // Close confirmation/success modal
    };

    const cancelModal = () => {
        setShowModal(false);
        setModalAction(null); // Clear action
    };

    // --- CSV Upload Logic ---

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
                console.warn(`Skipping row ${i + 1} due to column mismatch.`);
                continue; // Skip malformed rows
            }
            let rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index];
            });
            // Map CSV headers to internal student model properties
            data.push({
                id: '', // Will be assigned on submission
                name: rowObject['Name'] || '',
                rollNo: rowObject['RollNo'] || '',
                email: rowObject['Email'] || '',
                section: rowObject['Section'] || '',
                year: rowObject['Year'] || ''
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "Name,RollNo,Email,Section,Year").');
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "Name,RollNo,Email,Section,Year").');
                    setShowModal(true);
                }
            };
            reader.readAsText(file);
        } else if (file) { // If a file was selected but it's not CSV
            setModalMessage('Please select a valid CSV file.');
            setShowModal(true);
            setCsvData([]);
            setFileName('');
        }
    };


    // Placeholder for sending data to backend
    const sendDataToBackend = async (data) => {
        console.log('Simulating sending data to backend:', data);
        console.log(data)
        // In a real application, you would make an API call here, e.g.:
        // const response = await fetch('/api/students/bulk-upload', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString().substring(2, 8) }))) // Assign new IDs
        // });
        // if (response.ok) {
        //     setModalMessage('Bulk upload successful!');
        // } else {
        //     setModalMessage('Bulk upload failed. Please try again.');
        // }
        // For demonstration, simulate success
        return new Promise(resolve => setTimeout(() => {
            // Assign unique IDs to new students before adding
            const newStudentsWithIds = data.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString().substring(2, 8) }));
            setStudents(prev => [...prev, ...newStudentsWithIds]);
            setModalMessage('Bulk upload successful!');
            setShowModal(true); // Re-show modal with success message
            resolve(true);
        }, 1000));
    };

    const handleBulkUploadSubmit = async () => {
        if (csvData.length === 0) {
            setModalMessage('No data to upload. Please upload a CSV file.');
            setShowModal(true);
            return;
        }

        setModalMessage('Uploading data...'); // Show loading message
        setShowModal(true);

        const success = await sendDataToBackend(csvData);
        if (success) {
            setCsvData([]); // Clear preview data after successful upload
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
                onCancel={modalAction ? cancelModal : undefined} // Only show cancel if a specific action needs confirmation
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
                        onClick={() => { setActiveTab('bulk'); setIsEditing(false); setFormData({ id: '', name: '', rollNo: '', email: '', section: '', year: '' }); }}
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
                                name="section"
                                value={formData.section}
                                onChange={handleInputChange}
                                placeholder="Section"
                                required
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                placeholder="Year"
                                required
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
                                    onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', rollNo: '', email: '', section: '', year: '' }); }}
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
                            (Only CSV files are supported)
                        </p>
                    </div>

                    {csvData.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Confirm Upload Data ({csvData.length} entries)</h2>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr className="bg-blue-100 text-blue-800">
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Name</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Roll No</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Section</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Year</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.name}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.rollNo}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.email}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.section}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.year}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end">
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
                                <td colSpan="6" className="px-5 py-4 border-b border-gray-200 bg-white text-center text-sm text-gray-500">
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
