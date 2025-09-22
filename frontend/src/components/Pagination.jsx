import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
  const pages = [];
  const delta = 5; // how many pages around current to show
  let left = Math.max(2, currentPage - delta);
  let right = Math.min(totalPages - 1, currentPage + delta);

  // push first page
  pages.push(1);

  // dots before
  if (left > 2) pages.push("...");

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  // dots after
  if (right < totalPages - 1) pages.push("...");

  // last page
  if (totalPages > 1) pages.push(totalPages);

  return pages;
};

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-center p-6">
      <button
        className="min-w-10 min-h-10 bg-gray-50 text-gray-600 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 px-2 py-2 rounded-md mx-1 disabled:opacity-40 cursor-pointer group "
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FiChevronLeft className="group-hover:text-blue-400" size={20} />
      </button>

      {pageNumbers.map((page, idx) =>
        page === "..." ? (
    <span key={`dots-${idx}`} className="mx-1 text-gray-500 px-2 py-1">
            ...
          </span>
        ) : (
          <button
      key={`page-${page}-${idx}`} // <-- FIXED unique key
            onClick={() => onPageChange(page)}
            className={`px-2 min-w-10 min-h-10 py-1 rounded-md mx-1 border cursor-pointer   ${
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
