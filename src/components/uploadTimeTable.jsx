// import React, { useState, useEffect, useCallback } from 'react';
// import ConfirmationModal from './confirmationModal.jsx'; // Corrected import path

// export const UploadTimeTable = () => {
//     // Dummy data for dropdowns, matching backend IDs
//     const dummyBranches = [
//         { id: 1, name: 'Computer Science Engineering (CSE)' },
//         { id: 2, name: 'Electronics and Communication Engineering (ECE)' },
//         { id: 3, name: 'Mechanical Engineering (ME)' },
//     ];

//     const dummySemesters = [
//         { id: 1, name: 'Semester 1' },
//         { id: 2, name: 'Semester 2' },
//         { id: 3, name: 'Semester 3' },
//         { id: 4, name: 'Semester 4' },
//         { id: 5, name: 'Semester 5' },
//         { id: 6, name: 'Semester 6' },
//         { id: 7, name: 'Semester 7' },
//         { id: 8, name: 'Semester 8' },
//     ];

//     const dummyDays = [
//         { id: 1, name: 'Monday' },
//         { id: 2, name: 'Tuesday' },
//         { id: 3, name: 'Wednesday' },
//         { id: 4, name: 'Thursday' },
//         { id: 5, name: 'Friday' },
//         { id: 6, name: 'Saturday' },
//     ];

//     const dummyPeriods = [
//         { id: 1, time: '09:00 - 10:00' },
//         { id: 2, time: '10:00 - 11:00' },
//         { id: 3, time: '11:00 - 12:00' },
//         { id: 4, time: '12:00 - 01:00' },
//         { id: 5, time: '02:00 - 03:00' },
//         { id: 6, time: '03:00 - 04:00' },
//     ];

//     // Reusing dummyCourses structure from UploadMarks for consistency
//     const dummyCourses = [
//         { course_id: 1, course_code: 'V20MAT02', course_name: 'NUMERICAL METHODS AND VECTOR CALCULUS', credits: 3 },
//         { course_id: 2, course_code: 'V20PHT01', course_name: 'ENGINEERING PHYSICS', credits: 3 },
//         { course_id: 3, course_code: 'V20ECT01', course_name: 'SWITCHING THEORY AND LOGIC DESIGN', credits: 3 },
//         { course_id: 4, course_code: 'V20CST02', course_name: 'PYTHON PROGRAMMING', credits: 3 },
//         { course_id: 5, course_code: 'V20MET01', course_name: 'ENGINEERING GRAPHICS', credits: 3 },
//         { course_id: 6, course_code: 'V20PHTL01', course_name: 'ENGINEERING PHYSICS LAB', credits: 1.5 },
//         { course_id: 7, course_code: 'V20CSL02', course_name: 'PYTHON PROGRAMMING LAB', credits: 1.5 },
//         { course_id: 8, course_code: 'V20ENL02', course_name: 'HONE YOUR COMMUNICATION SKILLS LAB-II', credits: 1.5 },
//         { course_id: 9, course_code: 'V20CHT02', course_name: 'ENVIRONMENTAL STUDIES', credits: 0 },
//     ];

//     // Timetable state now reflects backend structure (using IDs)
//     const [timetable, setTimetable] = useState([
//         { id: '1', branchId: 1, semesterId: 3, dayId: 1, periodId: 1, courseId: 4 }, // Monday, Period 1, Python Programming for CSE Sem 3
//         { id: '2', branchId: 1, semesterId: 3, dayId: 2, periodId: 2, courseId: 3 }, // Tuesday, Period 2, Switching Theory for CSE Sem 3
//         { id: '3', branchId: 2, semesterId: 5, dayId: 3, periodId: 3, courseId: 5 }, // Wednesday, Period 3, Engineering Graphics for ECE Sem 5
//     ]);

//     const [formData, setFormData] = useState({
//         id: '',
//         branchId: '',
//         semesterId: '',
//         dayId: '',
//         periodId: '',
//         courseId: ''
//     });
//     const [isEditing, setIsEditing] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [modalMessage, setModalMessage] = useState('');
//     const [modalAction, setModalAction] = useState(null);
//     const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'

//     // States for bulk upload
//     const [csvData, setCsvData] = useState([]);
//     const [fileName, setFileName] = useState('');
//     const [isDragOver, setIsDragOver] = useState(false);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         // Convert to number for ID fields, if applicable
//         setFormData({ ...formData, [name]: ['branchId', 'semesterId', 'dayId', 'periodId', 'courseId'].includes(name) ? parseInt(value, 10) : value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const timetablePayload = {
//             branchId: formData.branchId,
//             semesterId: formData.semesterId,
//             dayId: formData.dayId,
//             periodId: formData.periodId,
//             courseId: formData.courseId
//         };

//         setModalMessage('Uploading timetable entry...');
//         setShowModal(true);

//         try {
//             if (isEditing) {
//                 // For editing, you'd typically have a PUT/PATCH endpoint with the entry ID.
//                 // For this example, we'll simulate client-side update.
//                 setTimetable(timetable.map(item => item.id === formData.id ? formData : item));
//                 setModalMessage('Time table entry updated successfully!');
//             } else {
//                 console.log('Adding new timetable entry to backend:', [timetablePayload]);
//                 const response = await fetch('/api/upload/timetable-entries', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': 'ROLE_ADMIN'
//                     },
//                     body: JSON.stringify([timetablePayload])
//                 });

//                 if (response.ok) {
//                     const newEntryWithId = { ...timetablePayload, id: Date.now().toString() }; // Client-side ID
//                     setTimetable(prev => [...prev, newEntryWithId]);
//                     setModalMessage('Time table entry added successfully!');
//                 } else {
//                     let errorMessage = `Failed to add timetable entry: ${response.statusText || 'Unknown error'}`;
//                     try {
//                         const errorData = await response.json();
//                         errorMessage = `Failed to add timetable entry: ${errorData.message || response.statusText}`;
//                     } catch (e) {
//                         console.warn("Could not parse error response for individual entry add.", e);
//                     }
//                     setModalMessage(errorMessage);
//                 }
//             }
//         } catch (error) {
//             console.error('Error submitting timetable data:', error);
//             setModalMessage('An error occurred while saving timetable data.');
//         } finally {
//             setShowModal(true);
//             setFormData({ id: '', branchId: '', semesterId: '', dayId: '', periodId: '', courseId: '' });
//             setIsEditing(false);
//         }
//     };

//     const handleEdit = (item) => {
//         setFormData(item);
//         setIsEditing(true);
//         setActiveTab('individual'); // Switch to individual tab for editing
//     };

//     const handleDelete = (id) => {
//         setModalMessage('Are you sure you want to delete this time table entry?');
//         setModalAction(() => async () => {
//             // In a real application, you'd make an API call here to delete
//             console.log(`Simulating deletion of timetable entry with ID: ${id}`);
//             setTimetable(timetable.filter(item => item.id !== id));
//             setModalMessage('Time table entry deleted successfully!');
//             setShowModal(true);
//         });
//         setShowModal(true);
//     };

//     const confirmModal = () => {
//         if (modalAction) {
//             modalAction();
//             setModalAction(null);
//         }
//         setShowModal(false);
//     };

//     const cancelModal = () => {
//         setShowModal(false);
//         setModalAction(null);
//     };

//     // Helper functions to get names from IDs for display
//     const getBranchName = (id) => dummyBranches.find(b => b.id === id)?.name || 'N/A';
//     const getSemesterName = (id) => dummySemesters.find(s => s.id === id)?.name || 'N/A';
//     const getDayName = (id) => dummyDays.find(d => d.id === id)?.name || 'N/A';
//     const getPeriodTime = (id) => dummyPeriods.find(p => p.id === id)?.time || 'N/A';
//     const getCourseName = (id) => dummyCourses.find(c => c.course_id === id)?.course_name || 'N/A';
//     const getCourseCode = (id) => dummyCourses.find(c => c.course_id === id)?.course_code || 'N/A';


//     // --- CSV Upload Logic ---

//     const parseCSV = (text) => {
//         const lines = text.split('\n').filter(line => line.trim() !== '');
//         if (lines.length === 0) return [];

//         const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
//         const data = [];

//         // Expected headers for timetable upload CSV
//         const expectedHeaderMap = {
//             'branchid': 'branchId',
//             'semesterid': 'semesterId',
//             'dayid': 'dayId',
//             'periodid': 'periodId',
//             'courseid': 'courseId'
//         };

//         for (let i = 1; i < lines.length; i++) {
//             const values = lines[i].split(',').map(v => v.trim());
//             if (values.length !== headers.length) {
//                 console.warn(`Skipping row ${i + 1} due to column mismatch or malformed line.`);
//                 continue;
//             }
//             let rowObject = {};
//             headers.forEach((header, index) => {
//                 const propertyName = expectedHeaderMap[header];
//                 if (propertyName) {
//                     rowObject[propertyName] = values[index];
//                 } else {
//                     console.warn(`Unexpected header in CSV: ${header}. Skipping this value.`);
//                 }
//             });

//             // Type conversions and validation for timetable data
//             let branchIdValue = parseInt(rowObject['branchId'], 10);
//             let semesterIdValue = parseInt(rowObject['semesterId'], 10);
//             let dayIdValue = parseInt(rowObject['dayId'], 10);
//             let periodIdValue = parseInt(rowObject['periodId'], 10);
//             let courseIdValue = parseInt(rowObject['courseId'], 10);

//             if (isNaN(branchIdValue) || isNaN(semesterIdValue) || isNaN(dayIdValue) || isNaN(periodIdValue) || isNaN(courseIdValue)) {
//                 console.warn(`Invalid numeric data in row ${i + 1}. Skipping.`);
//                 continue;
//             }

//             data.push({
//                 branchId: branchIdValue,
//                 semesterId: semesterIdValue,
//                 dayId: dayIdValue,
//                 periodId: periodIdValue,
//                 courseId: courseIdValue
//             });
//         }
//         // Basic validation: ensure essential fields are present
//         return data.filter(entry => entry.branchId && entry.semesterId && entry.dayId && entry.periodId && entry.courseId);
//     };

//     const handleFileDrop = useCallback((e) => {
//         e.preventDefault();
//         setIsDragOver(false);

//         const file = e.dataTransfer.files[0];
//         if (file && file.type === 'text/csv') {
//             setFileName(file.name);
//             const reader = new FileReader();
//             reader.onload = (event) => {
//                 const text = event.target.result;
//                 const parsed = parseCSV(text);
//                 setCsvData(parsed);
//                 if (parsed.length === 0) {
//                     setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "branchId,semesterId,dayId,periodId,courseId").');
//                     setShowModal(true);
//                 }
//             };
//             reader.readAsText(file);
//         } else {
//             setModalMessage('Please drop a valid CSV file.');
//             setShowModal(true);
//             setCsvData([]);
//             setFileName('');
//         }
//     }, []);

//     const handleDragOver = useCallback((e) => {
//         e.preventDefault();
//         setIsDragOver(true);
//     }, []);

//     const handleDragLeave = useCallback((e) => {
//         e.preventDefault();
//         setIsDragOver(false);
//     }, []);

//     const handleFileInputChange = (e) => {
//         const file = e.target.files[0];
//         if (file && file.type === 'text/csv') {
//             setFileName(file.name);
//             const reader = new FileReader();
//             reader.onload = (event) => {
//                 const text = event.target.result;
//                 const parsed = parseCSV(text);
//                 setCsvData(parsed);
//                 if (parsed.length === 0) {
//                     setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "branchId,semesterId,dayId,periodId,courseId").');
//                     setShowModal(true);
//                 }
//             };
//             reader.readAsText(file);
//         } else if (file) {
//             setModalMessage('Please select a valid CSV file.');
//             setShowModal(true);
//             setCsvData([]);
//             setFileName('');
//         }
//     };

//     const handleClearCsvData = () => {
//         setCsvData([]);
//         setFileName('');
//         setModalMessage('CSV data cleared successfully.');
//         setShowModal(true);
//     };

//     const handleBulkUploadSubmit = async () => {
//         if (csvData.length === 0) {
//             setModalMessage('No data to upload. Please upload a CSV file.');
//             setShowModal(true);
//             return;
//         }

//         setModalMessage('Uploading bulk timetable entries...');
//         setShowModal(true);

//         try {
//             const response = await fetch('/api/upload/timetable-entries', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': 'ROLE_ADMIN'
//                 },
//                 body: JSON.stringify(csvData)
//             });

//             if (response.ok) {
//                 // Update local state with the new entries (assigning temporary IDs for client-side)
//                 const newEntriesWithIds = csvData.map(entry => ({
//                     ...entry,
//                     id: Date.now().toString() + Math.random().toString().substring(2, 8) // Unique client-side ID
//                 }));
//                 setTimetable(prev => [...prev, ...newEntriesWithIds]);
//                 setModalMessage('Bulk timetable entries uploaded successfully!');
//             } else {
//                 let errorMessage = `Bulk upload failed: ${response.statusText || 'Unknown error'}`;
//                 try {
//                     const errorData = await response.json();
//                     errorMessage = `Bulk upload failed: ${errorData.message || response.statusText}`;
//                 } catch (e) {
//                     console.warn("Could not parse error response for bulk upload.", e);
//                 }
//                 setModalMessage(errorMessage);
//             }
//         } catch (error) {
//             console.error('Error during bulk upload:', error);
//             setModalMessage('An error occurred during bulk upload.');
//         } finally {
//             setShowModal(true);
//             setCsvData([]); // Clear CSV data after attempting upload
//             setFileName('');
//         }
//     };

//     return (
//         <div className="p-8 bg-white rounded-lg shadow-md">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Time Table</h1>

//             <ConfirmationModal
//                 show={showModal}
//                 message={modalMessage}
//                 onConfirm={confirmModal}
//                 onCancel={modalAction ? cancelModal : undefined}
//             />

//             {/* Tab Navigation */}
//             <div className="mb-6 border-b border-gray-200">
//                 <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//                     <button
//                         onClick={() => { setActiveTab('individual'); setCsvData([]); setFileName(''); }}
//                         className={`${
//                             activeTab === 'individual'
//                                 ? 'border-blue-500 text-blue-600'
//                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                         } cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-200 focus:outline-none`}
//                     >
//                         Individual Entry
//                     </button>
//                     <button
//                         onClick={() => { setActiveTab('bulk'); setFormData({ id: '', branchId: '', semesterId: '', dayId: '', periodId: '', courseId: '' }); setIsEditing(false); }}
//                         className={`${
//                             activeTab === 'bulk'
//                                 ? 'border-blue-500 text-blue-600'
//                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                         } cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-200 focus:outline-none`}
//                     >
//                         Bulk Upload (CSV)
//                     </button>
//                 </nav>
//             </div>

//             {activeTab === 'individual' && (
//                 <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
//                     <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Time Table Entry' : 'Add New Time Table Entry'}</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Branch Select */}
//                         <div>
//                             <label htmlFor="branchId" className="block text-gray-700 text-sm font-semibold mb-2">Branch:</label>
//                             <select
//                                 id="branchId"
//                                 name="branchId"
//                                 value={formData.branchId}
//                                 onChange={handleInputChange}
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                                 required
//                             >
//                                 <option value="">-- Select Branch --</option>
//                                 {dummyBranches.map(branch => (
//                                     <option key={branch.id} value={branch.id}>{branch.name}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Semester Select */}
//                         <div>
//                             <label htmlFor="semesterId" className="block text-gray-700 text-sm font-semibold mb-2">Semester:</label>
//                             <select
//                                 id="semesterId"
//                                 name="semesterId"
//                                 value={formData.semesterId}
//                                 onChange={handleInputChange}
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                                 required
//                             >
//                                 <option value="">-- Select Semester --</option>
//                                 {dummySemesters.map(semester => (
//                                     <option key={semester.id} value={semester.id}>{semester.name}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Day Select */}
//                         <div>
//                             <label htmlFor="dayId" className="block text-gray-700 text-sm font-semibold mb-2">Day:</label>
//                             <select
//                                 id="dayId"
//                                 name="dayId"
//                                 value={formData.dayId}
//                                 onChange={handleInputChange}
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                                 required
//                             >
//                                 <option value="">-- Select Day --</option>
//                                 {dummyDays.map(day => (
//                                     <option key={day.id} value={day.id}>{day.name}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Period Select */}
//                         <div>
//                             <label htmlFor="periodId" className="block text-gray-700 text-sm font-semibold mb-2">Period Time:</label>
//                             <select
//                                 id="periodId"
//                                 name="periodId"
//                                 value={formData.periodId}
//                                 onChange={handleInputChange}
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                                 required
//                             >
//                                 <option value="">-- Select Period --</option>
//                                 {dummyPeriods.map(period => (
//                                     <option key={period.id} value={period.id}>{period.time}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Course Select */}
//                         <div className="md:col-span-2"> {/* Make course dropdown span full width */}
//                             <label htmlFor="courseId" className="block text-gray-700 text-sm font-semibold mb-2">Course:</label>
//                             <select
//                                 id="courseId"
//                                 name="courseId"
//                                 value={formData.courseId}
//                                 onChange={handleInputChange}
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                                 required
//                             >
//                                 <option value="">-- Select Course --</option>
//                                 {dummyCourses.map(course => (
//                                     <option key={course.course_id} value={course.course_id}>
//                                         {course.course_code} - {course.course_name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                     <div className="mt-6 flex gap-4">
//                         <button
//                             type="submit"
//                             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
//                         >
//                             {isEditing ? 'Update Entry' : 'Add Entry'}
//                         </button>
//                         {isEditing && (
//                             <button
//                                 type="button"
//                                 onClick={() => { setIsEditing(false); setFormData({ id: '', branchId: '', semesterId: '', dayId: '', periodId: '', courseId: '' }); }}
//                                 className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
//                             >
//                                 Cancel Edit
//                             </button>
//                         )}
//                     </div>
//                 </form>
//             )}

//             {activeTab === 'bulk' && (
//                 <>
//                     <div
//                         onDrop={handleFileDrop}
//                         onDragOver={handleDragOver}
//                         onDragLeave={handleDragLeave}
//                         className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 mb-8 ${
//                             isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
//                         }`}
//                     >
//                         <p className="text-gray-600 text-lg mb-4">
//                             Drag & drop your CSV file here, or
//                         </p>
//                         <label htmlFor="csv-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-3 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105">
//                             Browse Files
//                             <input
//                                 id="csv-upload"
//                                 type="file"
//                                 accept=".csv"
//                                 onChange={handleFileInputChange}
//                                 className="hidden"
//                             />
//                         </label>
//                         {fileName && <p className="mt-4 text-gray-700">File selected: <span className="font-medium">{fileName}</span></p>}
//                         <p className="mt-2 text-sm text-gray-500">
//                             (Only CSV files are supported. Expected headers: "branchId,semesterId,dayId,periodId,courseId")
//                         </p>
//                     </div>

//                     {/* Display Extracted CSV Data and Action Buttons */}
//                     {csvData.length > 0 && (
//                         <div className="mb-8">
//                             <h2 className="text-xl font-semibold text-gray-700 mb-4">Preview & Confirm Upload Data ({csvData.length} entries)</h2>
//                             <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 mb-4">
//                                 <table className="min-w-full leading-normal">
//                                     <thead>
//                                         <tr className="bg-blue-100 text-blue-800">
//                                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Branch</th>
//                                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Semester</th>
//                                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Day</th>
//                                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Period</th>
//                                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Course</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {csvData.map((row, index) => (
//                                             <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
//                                                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getBranchName(row.branchId)}</td>
//                                                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getSemesterName(row.semesterId)}</td>
//                                                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getDayName(row.dayId)}</td>
//                                                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getPeriodTime(row.periodId)}</td>
//                                                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getCourseCode(row.courseId)} - {getCourseName(row.courseId)}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                             <div className="mt-6 flex justify-end gap-4">
//                                 <button
//                                     onClick={handleClearCsvData}
//                                     className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
//                                 >
//                                     Clear Data
//                                 </button>
//                                 <button
//                                     onClick={handleBulkUploadSubmit}
//                                     className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
//                                 >
//                                     Confirm & Upload
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </>
//             )}

//             {/* Time Table List */}
//             <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Current Time Table Entries</h2>
//                 <table className="min-w-full leading-normal">
//                     <thead>
//                         <tr className="bg-blue-600 text-white">
//                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Branch</th>
//                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Semester</th>
//                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Day</th>
//                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Period</th>
//                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Course</th>
//                             <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {timetable.length > 0 ? (
//                             timetable.map(item => (
//                                 <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
//                                     <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getBranchName(item.branchId)}</td>
//                                     <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getSemesterName(item.semesterId)}</td>
//                                     <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getDayName(item.dayId)}</td>
//                                     <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getPeriodTime(item.periodId)}</td>
//                                     <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getCourseCode(item.courseId)}</td>
//                                     <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
//                                         <button
//                                             onClick={() => handleEdit(item)}
//                                             className="text-blue-600 hover:text-blue-900 font-semibold mr-3 transition duration-200"
//                                         >
//                                             Edit
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(item.id)}
//                                             className="text-red-600 hover:text-red-900 font-semibold transition duration-200"
//                                         >
//                                             Delete
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="6" className="px-5 py-4 border-b border-gray-200 bg-white text-center text-sm text-gray-500">
//                                     No time table entries found.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };



import React, { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from './confirmationModal.jsx'; // Corrected import path

export const UploadTimeTable = () => {
    // Dummy data for dropdowns, matching backend IDs
    const dummyBranches = [
        { id: 1, name: 'Computer Science Engineering (CSE)' },
        { id: 2, name: 'Electronics and Communication Engineering (ECE)' },
        { id: 3, name: 'Mechanical Engineering (ME)' },
    ];

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

    const dummyDays = [
        { id: 1, name: 'Monday' },
        { id: 2, name: 'Tuesday' },
        { id: 3, name: 'Wednesday' },
        { id: 4, name: 'Thursday' },
        { id: 5, name: 'Friday' },
        { id: 6, name: 'Saturday' },
    ];

    const dummyPeriods = [
        { id: 1, time: '09:00 - 10:00' },
        { id: 2, time: '10:00 - 11:00' },
        { id: 3, time: '11:00 - 12:00' },
        { id: 4, time: '12:00 - 01:00' },
        { id: 5, time: '02:00 - 03:00' },
        { id: 6, time: '03:00 - 04:00' },
    ];

    // Reusing dummyCourses structure from UploadMarks for consistency
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

    // Timetable state now reflects backend structure (using IDs)
    const [timetable, setTimetable] = useState([
        { id: '1', branchId: 1, semesterId: 3, dayId: 1, periodId: 1, courseId: 4 }, // Monday, Period 1, Python Programming for CSE Sem 3
        { id: '2', branchId: 1, semesterId: 3, dayId: 2, periodId: 2, courseId: 3 }, // Tuesday, Period 2, Switching Theory for CSE Sem 3
        { id: '3', branchId: 2, semesterId: 5, dayId: 3, periodId: 3, courseId: 5 }, // Wednesday, Period 3, Engineering Graphics for ECE Sem 5
    ]);

    const [formData, setFormData] = useState({
        id: '',
        branchId: '',
        semesterId: '',
        dayId: '',
        periodId: '',
        courseId: ''
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
        // Convert to number for ID fields, if applicable
        setFormData({ ...formData, [name]: ['branchId', 'semesterId', 'dayId', 'periodId', 'courseId'].includes(name) ? parseInt(value, 10) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const timetablePayload = {
            branchId: formData.branchId,
            semesterId: formData.semesterId,
            dayId: formData.dayId,
            periodId: formData.periodId,
            courseId: formData.courseId
        };

        setModalMessage('Uploading timetable entry...');
        setShowModal(true);

        try {
            if (isEditing) {
                // For editing, you'd typically have a PUT/PATCH endpoint with the entry ID.
                // For this example, we'll simulate client-side update.
                setTimetable(timetable.map(item => item.id === formData.id ? formData : item));
                setModalMessage('Time table entry updated successfully!');
            } else {
                console.log('Adding new timetable entry to backend:', [timetablePayload]);
                const response = await fetch('/api/upload/timetable-entries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'ROLE_ADMIN'
                    },
                    body: JSON.stringify([timetablePayload])
                });

                if (response.ok) {
                    const newEntryWithId = { ...timetablePayload, id: Date.now().toString() }; // Client-side ID
                    setTimetable(prev => [...prev, newEntryWithId]);
                    setModalMessage('Time table entry added successfully!');
                } else {
                    let errorMessage = `Failed to add timetable entry: ${response.statusText || 'Unknown error'}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = `Failed to add timetable entry: ${errorData.message || response.statusText}`;
                    } catch (e) {
                        console.warn("Could not parse error response for individual entry add.", e);
                    }
                    setModalMessage(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error submitting timetable data:', error);
            setModalMessage('An error occurred while saving timetable data.');
        } finally {
            setShowModal(true);
            setFormData({ id: '', branchId: '', semesterId: '', dayId: '', periodId: '', courseId: '' });
            setIsEditing(false);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
        setActiveTab('individual'); // Switch to individual tab for editing
    };

    const handleDelete = (id) => {
        setModalMessage('Are you sure you want to delete this time table entry?');
        setModalAction(() => async () => {
            // In a real application, you'd make an API call here to delete
            console.log(`Simulating deletion of timetable entry with ID: ${id}`);
            setTimetable(timetable.filter(item => item.id !== id));
            setModalMessage('Time table entry deleted successfully!');
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
    const getBranchName = (id) => dummyBranches.find(b => b.id === id)?.name || 'N/A';
    const getSemesterName = (id) => dummySemesters.find(s => s.id === id)?.name || 'N/A';
    const getDayName = (id) => dummyDays.find(d => d.id === id)?.name || 'N/A';
    const getPeriodTime = (id) => dummyPeriods.find(p => p.id === id)?.time || 'N/A';
    const getCourseName = (id) => dummyCourses.find(c => c.course_id === id)?.course_name || 'N/A';
    const getCourseCode = (id) => dummyCourses.find(c => c.course_id === id)?.course_code || 'N/A';


    // --- CSV Upload Logic ---

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        // Expected headers for timetable upload CSV - NOW MATCHING DATABASE COLUMN NAMES WITH UNDERSCORES
        const expectedHeaderMap = {
            'branch_id': 'branchId',
            'semester_id': 'semesterId',
            'day_id': 'dayId',
            'period_id': 'periodId',
            'course_id': 'courseId'
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

            // Type conversions and validation for timetable data
            let branchIdValue = parseInt(rowObject['branchId'], 10);
            let semesterIdValue = parseInt(rowObject['semesterId'], 10);
            let dayIdValue = parseInt(rowObject['dayId'], 10);
            let periodIdValue = parseInt(rowObject['periodId'], 10);
            let courseIdValue = parseInt(rowObject['courseId'], 10);

            if (isNaN(branchIdValue) || isNaN(semesterIdValue) || isNaN(dayIdValue) || isNaN(periodIdValue) || isNaN(courseIdValue)) {
                console.warn(`Invalid numeric data in row ${i + 1}. Skipping.`);
                continue;
            }

            data.push({
                branchId: branchIdValue,
                semesterId: semesterIdValue,
                dayId: dayIdValue,
                periodId: periodIdValue,
                courseId: courseIdValue
            });
        }
        // Basic validation: ensure essential fields are present
        return data.filter(entry => entry.branchId && entry.semesterId && entry.dayId && entry.periodId && entry.courseId);
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "branch_id,semester_id,day_id,period_id,course_id").'); // Updated message
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
                    setModalMessage('The CSV file is empty or could not be parsed. Please ensure it has data and correct formatting (e.g., "branch_id,semester_id,day_id,period_id,course_id").'); // Updated message
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

        setModalMessage('Uploading bulk timetable entries...');
        setShowModal(true);

        try {
            const response = await fetch('/api/upload/timetable-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ROLE_ADMIN'
                },
                body: JSON.stringify(csvData)
            });

            if (response.ok) {
                // Update local state with the new entries (assigning temporary IDs for client-side)
                const newEntriesWithIds = csvData.map(entry => ({
                    ...entry,
                    id: Date.now().toString() + Math.random().toString().substring(2, 8) // Unique client-side ID
                }));
                setTimetable(prev => [...prev, ...newEntriesWithIds]);
                setModalMessage('Bulk timetable entries uploaded successfully!');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Time Table</h1>

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
                        onClick={() => { setActiveTab('bulk'); setFormData({ id: '', branchId: '', semesterId: '', dayId: '', periodId: '', courseId: '' }); setIsEditing(false); }}
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
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Time Table Entry' : 'Add New Time Table Entry'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Branch Select */}
                        <div>
                            <label htmlFor="branchId" className="block text-gray-700 text-sm font-semibold mb-2">Branch:</label>
                            <select
                                id="branchId"
                                name="branchId"
                                value={formData.branchId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select Branch --</option>
                                {dummyBranches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>

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

                        {/* Day Select */}
                        <div>
                            <label htmlFor="dayId" className="block text-gray-700 text-sm font-semibold mb-2">Day:</label>
                            <select
                                id="dayId"
                                name="dayId"
                                value={formData.dayId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select Day --</option>
                                {dummyDays.map(day => (
                                    <option key={day.id} value={day.id}>{day.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Period Select */}
                        <div>
                            <label htmlFor="periodId" className="block text-gray-700 text-sm font-semibold mb-2">Period Time:</label>
                            <select
                                id="periodId"
                                name="periodId"
                                value={formData.periodId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select Period --</option>
                                {dummyPeriods.map(period => (
                                    <option key={period.id} value={period.id}>{period.time}</option>
                                ))}
                            </select>
                        </div>

                        {/* Course Select */}
                        <div className="md:col-span-2"> {/* Make course dropdown span full width */}
                            <label htmlFor="courseId" className="block text-gray-700 text-sm font-semibold mb-2">Course:</label>
                            <select
                                id="courseId"
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Select Course --</option>
                                {dummyCourses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_code} - {course.course_name}
                                    </option>
                                ))}
                            </select>
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
                                onClick={() => { setIsEditing(false); setFormData({ id: '', branchId: '', semesterId: '', dayId: '', periodId: '', courseId: '' }); }}
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
                            (Only CSV files are supported. Expected headers: "branch_id,semester_id,day_id,period_id,course_id")
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
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Branch</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Semester</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Day</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Period</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Course</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getBranchName(row.branchId)}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getSemesterName(row.semesterId)}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getDayName(row.dayId)}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getPeriodTime(row.periodId)}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getCourseCode(row.courseId)} - {getCourseName(row.courseId)}</td>
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

            {/* Time Table List */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Current Time Table Entries</h2>
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Branch</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Semester</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Day</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Period</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Course</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timetable.length > 0 ? (
                            timetable.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getBranchName(item.branchId)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getSemesterName(item.semesterId)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getDayName(item.dayId)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getPeriodTime(item.periodId)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{getCourseCode(item.courseId)}</td>
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
                                    No time table entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
