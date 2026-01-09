import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import MonthSelector from "./MonthSelector";
import { getWeeksForMonth } from "../../utils/generateWeeksForMonth";
import { FiLogIn, FiLogOut, FiMessageSquare, FiPaperclip, FiPhone, FiUser, FiX } from "react-icons/fi";
import VisitorFormPage from "./VisitorFormPage";
import StatusMessageWrapper from "../../components/common/StatusMessageWrapper";

const VisitorTimelinePage = () => {
    const [month, setMonth] = useState(new Date());
    const [weeks, setWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [visitors, setVisitors] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
const [message, setMessage] = useState({ type: "", text: "" });
const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    const dayRefs = useRef({});

    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5); // "HH:MM"
    };


    const showSuccess = (text) => {
    setMessage({ type: "success", text });

    setTimeout(() => {
        setMessage({ type: "", text: "" });
    }, 3000);
};
    // Format sidebar day item
    const formatDay = (d) =>
        new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
        });

    const scrollToDate = (date) => {
        const el = dayRefs.current[date];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // -------------------------------
    // 1. Generate Weeks When Month Changes
    // -------------------------------
    useEffect(() => {
    const wk = getWeeksForMonth(month);
    setWeeks(wk);

    const today = new Date();
    const current = wk.find(
        w => new Date(w.start) <= today && today <= new Date(w.end)
    );

    setSelectedWeek(current || wk[0]);
}, [month]);


    // -------------------------------
    // 2. Load Visitors For Week
    // -------------------------------
    useEffect(() => {
        if (!selectedWeek) return;

        api.get("/visitors/timeline/week", {
            params: {
                start: selectedWeek.start,
                end: selectedWeek.end,
            },
        })
        .then((res) => setVisitors(res.data.data))
        .catch((err) => console.error(err));
    }, [selectedWeek]);

    // -------------------------------
    // 3. Auto-Assign tempOutTime Only ONCE
    // -------------------------------
    useEffect(() => {
        if (!visitors.length) return;

        setVisitors((prev) =>
            prev.map((day) => ({
                ...day,
                visitors: day.visitors.map((v) => ({
                    ...v,
                    tempOutTime: v.tempOutTime ?? getCurrentTime(), // only if missing
                })),
            }))
        );
    }, [visitors.length]); // Runs only once when data is first loaded
const todayISO = new Date().toISOString().split("T")[0];

    // -------------------------------
    // 4. Update Selected Date on Scroll
    // -------------------------------
    useEffect(() => {
    if (!visitors.length) return;

    const todayISO = new Date().toISOString().split("T")[0];
    const todayEntry = visitors.find(d => d.date === todayISO);

    // 1. Highlight today in left sidebar
    setSelectedDate(todayEntry ? todayEntry.date : visitors[0].date);

    // 2. Scroll to today automatically
    setTimeout(() => {
        if (todayEntry) scrollToDate(todayEntry.date);
    }, 300);

    // 3. Intersection observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setSelectedDate(entry.target.dataset.date);
                }
            });
        },
        { threshold: 0.3 }
    );

    Object.values(dayRefs.current)
        .filter((el) => el instanceof Element)
        .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
}, [visitors]);


    // -------------------------------
    // 5. Checkout Handler (Uses tempOutTime)
    // -------------------------------
    const handleCheckout = async (visitor) => {
        const time = visitor.tempOutTime || getCurrentTime();

        const out = new Date();
        const [h, m] = time.split(":");

        out.setHours(h);
        out.setMinutes(m);
        out.setSeconds(0);
        out.setMilliseconds(0);

        try {
            const res = await api.put(`/visitors/${visitor._id}/checkout`, {
                outTime: out,
            });

            // Update UI after checkout
            setVisitors((prev) =>
                prev.map((day) => ({
                    ...day,
                    visitors: day.visitors.map((v) =>
                        v._id === visitor._id ? res.data.data : v
                    ),
                }))
            );
        } catch (err) {
            console.error("Checkout error", err);
        }
    };

    return (
        <div className="p-6 max-w-full mx-auto flex gap-10">

            {/* LEFT SIDE → MONTH + WEEK SELECTOR */}
            <div className="flex flex-col gap-3 my-4">

                <StatusMessageWrapper
    loading={isLoading}
    success={message.type === "success" ? message.text : ""}
    error={message.type === "error" ? message.text : ""}
/>
                <MonthSelector month={month} onChange={setMonth} />

                {/* Week Buttons */}
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {weeks.map((w, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedWeek(w)}
                                className={`px-4 py-2 rounded-lg border ${
                                    selectedWeek?.start === w.start
                                        ? "bg-blue-600 text-white"
                                        : "bg-white"
                                }`}
                            >
                                W{i + 1}
                            </button>
                        ))}
                    </div>

                    {/* Day Buttons */}
                    <div className="curent-week-days flex flex-col gap-2 py-3">
    {visitors.map((day) => {
        const isSelected = selectedDate === day.date;
        const isToday = todayISO === day.date;

        return (
            <button
                key={day.date}
                onClick={() => {
                    scrollToDate(day.date);
                    setSelectedDate(day.date);
                }}
                className={`px-3 py-2 rounded text-sm
                    ${
                        isSelected
                            ? "border border-gray-400 bg-gray-50"
                            : isToday
                            ? "bg-amber-100 border border-amber-400 text-amber-800"
                            : "bg-gray-100 hover:bg-gray-200"
                    }
                `}
            >
                {formatDay(day.date)}
            </button>
        );
    })}
</div>
                </div>
            </div>

            {/* RIGHT SIDE → VISITOR TIMELINE */}
            <div className="w-full pr-3 h-[100vh] bg-white py-6 px-10 rounded-2xl relative">

                {/* Add Visitor Button */}
                <button
                    onClick={() => setShowPopup(true)}
                    className=" fixed z-10 right-4 bottom-8 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg"
                >
                    + Add
                </button>

                {/* Scrollable Visitor List */}
                <div ref={scrollRef} className="overflow-y-auto h-[100vh] pr-7 hide-scrollbar">
                    {visitors.map((day) => (
                        <div
                            key={day.date}
                            data-date={day.date}
                            ref={(el) => (dayRefs.current[day.date] = el)}
                            className="mb-8 relative"
                        >
                            <div className="text-lg font-semibold sticky top-0 bg-white border-b mb-3">
                                <div className="text-sm text-gray-500 py-2">
                                    {new Date(day.date).toDateString()}
                                </div>
                            </div>

                            {day.visitors.length === 0 && (
                                <div className="text-gray-400">No visitors</div>
                            )}

                            {day.visitors.map((v) => (
                                <div
                                    key={v._id}
                                    className="bg-white flex justify-between shadow rounded border-l-2 border-amber-500 mb-3 mx-2"
                                >
                                    {/* In-Time */}
                                    <div className="bg-amber-100 py-3 px-2 text-amber-700 flex items-center gap-1 min-w-[120px]">
                                        <FiLogIn size={14} />
                                        {new Date(v.inTime).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </div>

                                    {/* Visitor Details */}
                                    <div className="py-3 px-4 flex gap-4 w-full">
                                        <div className="font-semibold w-40 truncate">
                                            {v.fullName}
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <FiPhone /> {v.mobile}
                                            <FiPaperclip />
                                            {v.visitType}
                                            <FiUser />
                                            {v.toMeet}
                                        </div>
                                      <div className="relative group flex items-center">
    <FiMessageSquare className="text-gray-600 cursor-pointer" />

    {/* Tooltip */}
    {v.remarks && (
        <div
            className="absolute left-1/2 top-0 -translate-x-1/2 mt-7  p-5
                       w-48 bg-gray-900 text-white text-xs 
                       rounded-md  shadow-lg z-50 
                       opacity-0 group-hover:opacity-100 
                       pointer-events-none transition-opacity duration-200"
        >
            {v.remarks}
        </div>
    )}
</div>
                                    </div>

                                    {/* Out-Time or Checkout */}
                                    {v.outTime ? (
                                        <div className="bg-amber-100 min-w-[120px] py-3 px-2 text-amber-700 flex items-center gap-1">
                                            <FiLogOut size={14} />
                                            {new Date(v.outTime).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 my-2 mx-2">
                                            <input
                                                type="time"
                                                className="border rounded p-2 text-xs"
                                                value={v.tempOutTime}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setVisitors((prev) =>
                                                        prev.map((day) => ({
                                                            ...day,
                                                            visitors: day.visitors.map((x) =>
                                                                x._id === v._id
                                                                    ? { ...x, tempOutTime: value }
                                                                    : x
                                                            ),
                                                        }))
                                                    );
                                                }}
                                            />

                                            <button
                                                onClick={() => handleCheckout(v)}
                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full"
                                            >
                                                Mark Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* POPUP FORM */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
                    <div className="w-[50%]  h-full shadow-xl p-5 overflow-y-auto relative">
                        <button
                            className=" w-full absolute top-10 right-10   flex justify-end"
                            onClick={() => setShowPopup(false)}
                        >
                            <FiX size={24} color="#000" />
                        </button>
<VisitorFormPage
  onDone={(msg = "Visitor added successfully", errorMsg = null) => {
    
    // 1. Close popup every time
    setShowPopup(false);

    // 2. Show success message
    if (msg) {
      showSuccess(msg);
    }

    // 3. Show error message if form reported one
    if (errorMsg) {
      setMessage({ type: "error", text: errorMsg });
      return; // do NOT reload data if save failed
    }

    // 4. Reload visitor data AFTER success
    api
      .get("/visitors/timeline/week", {
        params: {
          start: selectedWeek.start,
          end: selectedWeek.end,
        },
      })
      .then((res) => setVisitors(res.data.data))
      .catch(() => {
        setMessage({
          type: "error",
          text: "Failed to refresh visitor list.",
        });
      });
  }}
/>

                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorTimelinePage;
