// src/components/Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [1];

    if (currentPage > 3) pages.push('ellipsis-start');

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('ellipsis-end');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex justify-center mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Prev
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') return <span key={index}>...</span>;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 mx-1 rounded-md ${
              currentPage === page
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;