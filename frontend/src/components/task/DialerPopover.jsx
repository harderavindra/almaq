import { useEffect, useState } from "react";
import { FiPhone, FiPhoneCall, FiUser, FiX } from "react-icons/fi";
import Button from "../common/Button";
import DatePicker from "react-datepicker";

const Toggle = ({ value, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition
      ${value ? "bg-green-500" : "bg-gray-300"}
    `}
    >
        <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition
        ${value ? "left-6" : "left-0.5"}
      `}
        />
    </button>
);

const YesNoToggle = ({ value, onChange, disabled = false }) => {
    return (
        <div className="inline-flex border rounded-md overflow-hidden">
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(true)}
                className={`px-4 py-1 text-sm transition
          ${value === true
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700"}
        `}
            >
                Yes
            </button>

            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(false)}
                className={`px-4 py-1 text-sm transition
          ${value === false
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-700"}
        `}
            >
                No
            </button>
        </div>
    );
};

const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
};

const DialerPopover = ({
    open,
    task,
    dispositions,
    batch,
    selectedDisposition,
    setSelectedDisposition,
    callOutcomeValues,
    setCallOutcomeValues,
    isFieldVisible,
    onEndCall,
    onClose,
}) => {
    const [seconds, setSeconds] = useState(0);
    const [callStarted, setCallStarted] = useState(false);
    const activeDisposition = dispositions.find(
        (d) => d.code === selectedDisposition
    );



    /* ================= TIMER (START ONLY AFTER START CALL) ================= */
    useEffect(() => {
        if (!callStarted) return;

        const t = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);

        return () => clearInterval(t);
    }, [callStarted]);

    /* ================= RESET ON OPEN ================= */
    useEffect(() => {
        if (open) {
            setSeconds(0);
            setCallStarted(false);
            setSelectedDisposition(null);
            setCallOutcomeValues({});
        }
    }, [open]);

    if (!open || !task) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex gap-10 items-end justify-center">
            <div className="flex gap-10 ">
                <div className="min-w-[400]">
                    <div className="w-full max-w-md min-w-md bg-white rounded-2xl p-4 px-8 space-y-4 mb-10">

                        {/* HEADER */}
                        <div className="flex justify-between items-center ">
                            <div className="flex flex-col items-center justify-center w-full p-10 gap-2 ">
                                <span className=" w-20 h-20 flex items-center justify-center rounded-full bg-gray-200 mb-4">
                                    <FiUser size={32} />
                                </span>
                                <div className="text-3xl font-semibold flex items-center gap-2">
                                    +91 {task.contactId.mobile}
                                </div>
                                <div className="text-lg capitalize text-gray-400 font-medium">
                                    {task.contactId.firstName} {task.contactId.lastName}
                                </div>
                                {/* TIMER (ONLY AFTER START CALL) */}
                                {callStarted && (
                                    <div className="flex gap-2  justify-between items-center text-nase text-gray-600">
                                        <FiPhoneCall />
                                        <span className="font-mono text-base">
                                            {formatTimer(seconds)}
                                        </span>
                                    </div>
                                )}

                                {/* START CALL */}
                                {!callStarted && (
                                    <div className="flex justify-between w-full">
                                        <button className="w-20 h-20 bg-gray-50 border border-gray-200 text-black rounded-full flex items-center justify-center mt-6 shadow-lg hover:bg-gray-200 transition"

                                            onClick={onClose}>
                                            <FiX size={24} />
                                        </button>
                                        <button
                                            onClick={() => setCallStarted(true)}
                                            className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mt-6 shadow-lg hover:bg-green-600 transition"
                                        >
                                            <FiPhone size={24} />
                                        </button>

                                    </div>
                                )}

                            </div>


                        </div>



                        {/* DISPOSITIONS + OUTCOME */}
                        {callStarted && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    {dispositions.map((d) => {
                                        const isSelected = selectedDisposition === d.code;

                                        return (
                                            <button
                                                key={d.code}
                                                onClick={() => setSelectedDisposition(d.code)}
                                                className={`flex flex-col items-center gap-2 text-xs transition
          ${isSelected ? "text-blue-700 font-medium" : "text-gray-400"}
        `}
                                            >
                                                <span
                                                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition
            ${isSelected
                                                            ? "bg-amber-100 border border-amber-100"
                                                            : "bg-amber-50 hover:bg-amber-100"
                                                        }
          `}
                                                >
                                                    <FiPhoneCall
                                                        size={20}
                                                        className={isSelected ? "text-amber-600" : "text-amber-500"}
                                                    />
                                                </span>

                                                <span className="text-center leading-tight">
                                                    {d.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>



                                <div className="flex justify-between w-full">

                                    <button className="w-20 h-20 bg-gray-50 border border-gray-200 text-black rounded-full flex items-center justify-center mt-6 shadow-lg hover:bg-gray-200 transition"

                                        onClick={onClose}>
                                        <FiX size={24} />
                                    </button>
                                    <button
                                        onClick={onEndCall}
                                        disabled={!selectedDisposition}
                                        className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mt-6 shadow-lg hover:bg-red-600 transition"
                                    >
                                        <FiPhone size={24} />

                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
                {activeDisposition?.requiresCallOutcome &&
                    batch?.callOutcomeForm?.fields && (
                        <div className="w-full max-w-md min-w-md bg-white rounded-2xl p-4 px-8 space-y-4 mb-10 flex flex-col justify-end  items-start">
                            <h4 className="text-xl font-semibold text-gray-600 mb-2">
                                Call Outcome Details
                            </h4>
                            <div className="space-y-3 w-full">
                                {batch.callOutcomeForm.fields.map((field) =>
                                    isFieldVisible(field) ? (
                                        <div key={field.key}>


                                            {field.type === "boolean" && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        {field.label}
                                                    </span>

                                                    <YesNoToggle
                                                        value={callOutcomeValues[field.key]}   // ← no coercion
                                                        onChange={(val) =>
                                                            setCallOutcomeValues((p) => ({
                                                                ...p,
                                                                [field.key]: val,
                                                            }))
                                                        }
                                                    />

                                                    {/* <Toggle
                                                        value={!!callOutcomeValues[field.key]}
                                                        onChange={(val) =>
                                                            setCallOutcomeValues((p) => ({
                                                                ...p,
                                                                [field.key]: val,
                                                            }))
                                                        }
                                                    /> */}
                                                </div>
                                            )}

                                            {field.type === "select" && (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-700">
      {field.label}
    </label>

    <select
      className="border p-2 w-full rounded"
      value={callOutcomeValues[field.key] ?? ""}
      onChange={(e) =>
        setCallOutcomeValues((p) => ({
          ...p,
          [field.key]: e.target.value || undefined,
        }))
      }
    >
      <option value="">Select</option>
      {field.options?.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
)}

                                            {field.type === "datetime" && (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-medium text-gray-700">
                                                        {field.label}
                                                    </label>

                                                    <DatePicker
                                                        selected={callOutcomeValues[field.key] || null}
                                                        onChange={(date) =>
                                                            setCallOutcomeValues((p) => ({
                                                                ...p,
                                                                [field.key]: date,
                                                            }))
                                                        }
                                                        showTimeSelect
                                                        timeIntervals={15}
                                                        timeCaption="Time"
                                                        dateFormat="dd MMM yyyy, hh:mm aa"
                                                        minDate={new Date()}
                                                        className="border p-2 w-full rounded"
                                                        placeholderText="Select follow-up date & time"
                                                    />
                                                </div>
                                            )}


                                            {field.type === "textarea" && (
                                                <textarea
                                                    rows={3}
                                                    className="border p-2 w-full rounded"
                                                    onChange={(e) =>
                                                        setCallOutcomeValues((p) => ({
                                                            ...p,
                                                            [field.key]: e.target.value,
                                                        }))
                                                    }
                                                />
                                            )}
                                        </div>
                                    ) : null
                                )}
                            </div>


                            {/* END CALL */}</div>
                    )}
            </div>
        </div>
    );
};

export default DialerPopover;
