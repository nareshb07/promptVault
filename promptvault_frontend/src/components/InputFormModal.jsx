import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InputFormModal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div
              className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {children}

              {/* Close Button (Optional X) */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InputFormModal;


// // components/Modal.js
// import React from 'react';
// import { useEffect } from 'react';

// const InputFormModal = ({ isOpen, onClose, children }) => {
//   if (!isOpen) return null;

//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === 'Escape') {
//         onClose();
//       }
//     };
//     window.addEventListener('keydown', handleEsc);
//     return () => window.removeEventListener('keydown', handleEsc);
//   }, [onClose]);

//   // Handle backdrop click
//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-100" onClick={handleBackdropClick}>
//       <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 relative dark:bg-gray-900">
//         <button
//           onClick={onClose}
//           className="absolute top-10 right-10 text-gray-400 hover:text-white"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// };

// export default InputFormModal;