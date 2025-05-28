import React from 'react';

const DeleteModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 relative border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-lg"
        >
          ✖
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
