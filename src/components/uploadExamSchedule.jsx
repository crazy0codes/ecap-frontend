import React, { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from './confirmationModal.jsx'; // Corrected import path

export const UploadExamSchedule = () => {
    // Dummy data for dropdowns, matching backend IDs
    const dummySemesters = [
        { id: 1, name: 'Semester 1' },
        { id: 2, name: 'Semester 2' },
        { id: 3, name: 'Semester 3' },
        { id: 4, name: 'Semester 4' },
        { id: 5, name: 'Semester 5' },
        { id: 6, name: 'Semester 6' },
        { id: 7, name: 'Semester 7' },
        { id: 8, name: 'Semester 8' },
    ];

    const dummyRegulations = [
        { id: 'R20', name: 'Regulation R20' },
        { id: 'V20', name: 'Regulation V20' },
        { id: 'R18', name: 'Regulation R18' },
    ];

    // Exam schedule state now reflects backend structure (using IDs and dates)
    const [examSchedule, setExamSchedule] = useState([
        { id: '1', semesterId: 1, regulationId: 'R20', startDate: '2025-05-10', endDate: '2025-05-20', description: 'End Semester Exams' },
        { id: '2', semesterId: 2, regulationId: 'V20', startDate: '2025-12-01', endDate: '2025-12-10', description: 'Mid-Term Exams' },
    ]);

    const [formData, setFormData] = useState({
        id: '',
        semesterId: '',
        regulationId: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'

    // States for bulk upload
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Convert semesterId to number, others remain string
        setFormData({ ...formData, [name]: name === 'semesterId' ? parseInt(value, 10) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const examSchedulePayload = {
            semesterId: formData.semesterId,
            regulationId: formData.regulationId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            description: formData.description
        };

        setModalMessage('Uploading exam schedule entry...');
        setShowModal(true);

        try {
            if (isEditing) {
                // For editing, you'd typically have a PUT/PATCH endpoint with the entry ID.
                // For this example, we'll simulate client-side update.
                setExamSchedule(examSchedule.map(item => item.id === formData.id ? formData : item));
                setModalMessage('Exam schedule entry updated successfully!');
            } else {
                console.log('Adding new exam schedule entry to backend:', [examSchedulePayload]);
                const response = await fetch('/api/upload/exam-schedules', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'ROLE_FACULTY, ROLE_ADMIN' // As per your API spec
                    },
                    body: JSON.stringify([examSchedulePayload])
                });

                if (response.ok) {
                    const newEntryWithId = { ...examSchedulePayload, id: Date.now().toString() }; // Client-side ID
                    setExamSchedule(prev => [...prev, newEntryWithId]);
                    setModalMessage('Exam schedule entry added successfully!');
                } else {
                    let errorMessage = `Failed to add exam schedule entry: ${response.statusText || 'Unknown error'}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = `Failed to add exam schedule entry: ${errorData.message || response.statusText}`;
                    } catch (e) {
                        console.warn("Could not parse error response for individual entry add.", e);
                    }
                    setModalMessage(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error submitting exam schedule data:', error);
            setModalMessage('An error occurred while saving exam schedule data.');
        } finally {
            setShowModal(true);
            setFormData({ id: '', semesterId: '', regulationId: '', startDate: '', endDate: '', description: '' });
            setIsEditing(false);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
        setActiveTab('individual'); // Switch to individual tab for editing
    };

    const handleDelete = (id) => {
        setModalMessage('Are you sure you want to delete this exam schedule entry?');
        setModalAction(() => async () => {
            // In a real application, you'd make an API call here to delete
            console.log(`Simulating deletion of exam schedule entry with ID: ${id}`);
            setExamSchedule(examSchedule.filter(item => item.id !== id));
            setModalMessage('Exam schedule entry deleted successfully!');
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

    // Helper functions to get names from IDs for display
    const getSemesterName = (id) => dummySemesters.find(s => s.id === id)?.name || 'N/A';
    const getRegulationName = (id) => dummyRegulations.find(r => r.id === id)?.name || 'N/A';


    // --- CSV Upload Logic ---

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim()); // Headers are camelCase in payload, not snake_case
        const data = [];

        // Expected headers for exam schedule upload CSV
        const expectedHeaderMap = {
            'semesterId': 'semesterId',
            'regulationId': 'regulationId',
            'startDate': 'startDate',
            'endDate': 'endDate',
            'description': 'description'
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

            // Type conversions and validation for exam schedule data
            let semesterIdValue = parseInt(rowObject['semesterId'], 10);

            if (isNaN(semesterIdValue) || !rowObject['regulationId'] || !rowObject['startDate'] || !rowObject['endDate'] || !rowObject['description']) {
                console.warn(`Invalid or missing data in row ${i + 1}. Skipping.`);
                continue;
            }

            data.push({
                semesterId: semesterIdValue,
                regulationId: rowObject['regulationId'],
                startDate: rowObject['startDate'],
                endDate: rowObject['endDate'],
                description: rowObject['description']
            });
        }
        // Basic validation: ensure essential fields are present
        return data.filter(entry => entry.semesterId && entry.regulationId && entry.startDate && entry.endDate && entry.description);
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "semesterId,regulationId,startDate,endDate,description").');
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "semesterId,regulationId,startDate,endDate,description").');
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

        setModalMessage('Uploading bulk exam schedules...');
        setShowModal(true);

        try {
            const response = await fetch('/api/upload/exam-schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ROLE_FACULTY, ROLE_ADMIN'
                },
                body: JSON.stringify(csvData)
            });

            if (response.ok) {
                // Update local state with the new entries (assigning temporary IDs for client-side)
                const newEntriesWithIds = csvData.map(entry => ({
                    ...entry,
                    id: Date.now().toString() + Math.random().toString().substring(2, 8) // Unique client-side ID
                }));
                setExamSchedule(prev => [...prev, ...newEntriesWithIds]);
                setModalMessage('Bulk exam schedules uploaded successfully!');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Exam Schedule</h1>

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
                        onClick={() => { setActiveTab('bulk'); setFormData({ id: '', semesterId: '', regulationId: '', startDate: '', endDate: '', description: '' }); setIsEditing(false); }}
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
                <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Exam Schedule Entry' : 'Add New Exam Schedule Entry'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Semester Select */}
                        <div>
                            <label htmlFor="semesterId" className="block text-gray-700 text-sm font-semibold mb-2">Semester:</label>
                            <select
                                id="semesterId"
                                name="semesterId"
                                value={formData.semesterId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select Semester --</option>
                                {dummySemesters.map(semester => (
                                    <option key={semester.id} value={semester.id}>{semester.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Regulation Select */}
                        <div>
                            <label htmlFor="regulationId" className="block text-gray-700 text-sm font-semibold mb-2">Regulation:</label>
                            <select
                                id="regulationId"
                                name="regulationId"
                                value={formData.regulationId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select Regulation --</option>
                                {dummyRegulations.map(regulation => (
                                    <option key={regulation.id} value={regulation.id}>{regulation.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label htmlFor="startDate" className="block text-gray-700 text-sm font-semibold mb-2">Start Date:</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label htmlFor="endDate" className="block text-gray-700 text-sm font-semibold mb-2">End Date:</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="e.g., End Semester Exams, Mid-Term Exams"
                                rows="3"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {isEditing ? 'Update Entry' : 'Add Entry'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setFormData({ id: '', semesterId: '', regulationId: '', startDate: '', endDate: '', description: '' }); }}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
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
                            (Only CSV files are supported. Expected headers: "semesterId,regulationId,startDate,endDate,description")
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
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Semester</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Regulation</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Start Date</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">End Date</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getSemesterName(row.semesterId)}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getRegulationName(row.regulationId)}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.startDate}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.endDate}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{row.description}</td>
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

            {/* Exam Schedule List */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Current Exam Schedules</h2>
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Semester</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Regulation</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Start Date</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">End Date</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examSchedule.length > 0 ? (
                            examSchedule.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getSemesterName(item.semesterId)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getRegulationName(item.regulationId)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.startDate}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.endDate}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.description}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 font-semibold mr-3 transition duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
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
                                    No exam schedule entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
