import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const MonthSelector = ({ month, onChange }) => {
  const monthName = month.toLocaleString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    const m = new Date(month);
    m.setMonth(m.getMonth() - 1);
    onChange(m);
  };

  const nextMonth = () => {
    const m = new Date(month);
    m.setMonth(m.getMonth() + 1);
    onChange(m);
  };

  return (
    <div className="flex items-center justify-center gap-4 my-4">
      <button onClick={prevMonth}><FiChevronLeft size={22} /></button>

      <div className="text-xl font-semibold">
        {monthName}
      </div>

      <button onClick={nextMonth}><FiChevronRight size={22} /></button>
    </div>
  );
};

export default MonthSelector;
