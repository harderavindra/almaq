import React from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  console.log("Pagination", currentPage, totalPages);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center p-10">
            <button
                className="bg-gray-500  text-white px-4 py-2 rounded-md mx-2 disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <FiChevronLeft size={24}/>
            </button>
            <span className="text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                className="bg-gray-500 px-4 py-2 text-white rounded-md mx-2 disabled:opacity-40"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <FiChevronRight size={24}/>
            </button>
        </div>
    );
};

export default Pagination;
