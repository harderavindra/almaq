import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-center p-6">
      <button
        className="min-w-10 min-h-10 bg-gray-50 text-gray-600 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 px-2 py-2 rounded-md mx-1 disabled:opacity-40 cursor-pointer group"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FiChevronLeft className="group-hover:text-blue-400" size={20} />
      </button>

      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="mx-1 text-gray-500 px-2 py-1">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2 min-w-10 min-h-10 py-1 rounded-md mx-1 border   ${
              currentPage === page
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-gray-50 text-gray-600  border-gray-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-400 "
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        className="min-w-10 min-h-10 bg-gray-50 text-gray-600 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 px-2 py-2 rounded-md mx-1 disabled:opacity-40 cursor-pointer group"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
