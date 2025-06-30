import React, { useState, useEffect } from 'react';
import ConfirmationModal from './confirmationModal.jsx'; // Corrected import path

export const UploadMarks = () => {
    // Dummy student data, ideally fetched from a backend or shared context
    const [students, setStudents] = useState([
        { id: '1', name: 'John Doe', rollNo: '22A81A0601', marks: { Math: 0, Science: 0, English: 0 } },
        { id: '2', name: 'Jane Smith', rollNo: '22A81A0602', marks: { Math: 0, Science: 0, English: 0 } },
    ]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [currentMarks, setCurrentMarks] = useState({ Math: '', Science: '', English: '' });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        setSelectedStudentId(studentId);
        const student = students.find(s => s.id === studentId);
        if (student) {
            setCurrentMarks(student.marks);
        } else {
            setCurrentMarks({ Math: '', Science: '', English: '' });
        }
    };

    const handleMarkChange = (e) => {
        const { name, value } = e.target;
        setCurrentMarks({ ...currentMarks, [name]: value });
    };

    const handleSubmitMarks = (e) => {
        e.preventDefault();
        if (!selectedStudentId) {
            setModalMessage('Please select a student first.');
            setShowModal(true);
            return;
        }

        setStudents(prevStudents =>
            prevStudents.map(s =>
                s.id === selectedStudentId ? { ...s, marks: currentMarks } : s
            )
        );
        setModalMessage('Marks uploaded successfully!');
        setShowModal(true);
        setSelectedStudentId(''); // Clear selection after upload
        setCurrentMarks({ Math: '', Science: '', English: '' });
    };

    const confirmModal = () => {
        setShowModal(false);
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Marks</h1>

            <ConfirmationModal
                show={showModal}
                message={modalMessage}
                onConfirm={confirmModal}
            />

            <form onSubmit={handleSubmitMarks} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                <div className="mb-4">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label htmlFor="math" className="block text-gray-700 text-sm font-semibold mb-2">Math Marks:</label>
                        <input
                            type="number"
                            id="math"
                            name="Math"
                            value={currentMarks.Math}
                            onChange={handleMarkChange}
                            placeholder="Enter Math marks"
                            min="0"
                            max="100"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!selectedStudentId}
                        />
                    </div>
                    <div>
                        <label htmlFor="science" className="block text-gray-700 text-sm font-semibold mb-2">Science Marks:</label>
                        <input
                            type="number"
                            id="science"
                            name="Science"
                            value={currentMarks.Science}
                            onChange={handleMarkChange}
                            placeholder="Enter Science marks"
                            min="0"
                            max="100"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!selectedStudentId}
                        />
                    </div>
                    <div>
                        <label htmlFor="english" className="block text-gray-700 text-sm font-semibold mb-2">English Marks:</label>
                        <input
                            type="number"
                            id="english"
                            name="English"
                            value={currentMarks.English}
                            onChange={handleMarkChange}
                            placeholder="Enter English marks"
                            min="0"
                            max="100"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!selectedStudentId}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    disabled={!selectedStudentId}
                >
                    Upload Marks
                </button>
            </form>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 p-4 border-b border-gray-200">Current Student Marks Overview</h2>
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Student Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Roll No</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Math</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Science</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">English</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.name}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.rollNo}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.marks.Math || '-'}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.marks.Science || '-'}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{student.marks.English || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
