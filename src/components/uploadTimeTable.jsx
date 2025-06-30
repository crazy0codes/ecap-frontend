import React, { useState } from 'react';
import ConfirmationModal from './confirmationModal.jsx'; // Corrected import path

export const UploadTimeTable = () => {
    const [timetable, setTimetable] = useState([
        { id: '1', day: 'Monday', subject: 'Math', time: '09:00 - 10:00', room: 'A101' },
        { id: '2', day: 'Tuesday', subject: 'Science', time: '10:00 - 11:00', room: 'B203' },
    ]);
    const [formData, setFormData] = useState({ id: '', day: '', subject: '', time: '', room: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setTimetable(timetable.map(item => item.id === formData.id ? formData : item));
            setModalMessage('Time table entry updated successfully!');
        } else {
            const newItem = { ...formData, id: Date.now().toString() };
            setTimetable([...timetable, newItem]);
            setModalMessage('Time table entry added successfully!');
        }
        setShowModal(true);
        setFormData({ id: '', day: '', subject: '', time: '', room: '' });
        setIsEditing(false);
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        setModalMessage('Are you sure you want to delete this time table entry?');
        setModalAction(() => () => {
            setTimetable(timetable.filter(item => item.id !== id));
            setModalMessage('Time table entry deleted successfully!');
            setShowModal(true); // Show confirmation for deletion
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

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Time Table</h1>

            <ConfirmationModal
                show={showModal}
                message={modalMessage}
                onConfirm={confirmModal}
                onCancel={modalAction ? cancelModal : undefined}
            />

            <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg mb-8 shadow-inner">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Time Table Entry' : 'Add New Time Table Entry'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="day"
                        value={formData.day}
                        onChange={handleInputChange}
                        placeholder="Day (e.g., Monday)"
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Subject"
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        placeholder="Time (e.g., 09:00 - 10:00)"
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        placeholder="Room No."
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                            onClick={() => { setIsEditing(false); setFormData({ id: '', day: '', subject: '', time: '', room: '' }); }}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            {/* Time Table List */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Day</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Subject</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Time</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">Room</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timetable.length > 0 ? (
                            timetable.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.day}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.subject}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.time}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{item.room}</td>
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
                                <td colSpan="5" className="px-5 py-4 border-b border-gray-200 bg-white text-center text-sm text-gray-500">
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
