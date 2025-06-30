import React from 'react';

const ConfirmationModal = ({ message, onConfirm, onCancel, show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <p className="text-gray-800 text-lg mb-6 text-center">{message}</p>
                <div className="flex justify-around">
                    <button
                        onClick={onConfirm}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Confirm
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

