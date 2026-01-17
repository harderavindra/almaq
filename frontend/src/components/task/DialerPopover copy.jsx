import React from "react";
import Button from "../common/Button";
import { FiPhone, FiX } from "react-icons/fi";

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
  if (!open || !task) return null;

  const activeDisposition = dispositions.find(
    (d) => d.code === selectedDisposition
  );

  return (
    <div className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-2xl border z-50 flex flex-col max-h-[80vh]">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-start">
        <div>
          <div className="font-semibold">
            {task.contactId.firstName} {task.contactId.lastName}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <FiPhone /> {task.contactId.mobile}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Attempt {task.attemptCount + 1}/{task.maxAttempts}
          </div>
        </div>
        <button onClick={onClose}>
          <FiX />
        </button>
      </div>

      {/* DISPOSITION GRID */}
      <div className="p-4 grid grid-cols-3 gap-2 border-b">
        {dispositions.map((d) => (
          <button
            key={d.code}
            onClick={() => setSelectedDisposition(d.code)}
            className={`border rounded-lg p-2 text-xs text-center transition
              ${
                selectedDisposition === d.code
                  ? "bg-blue-50 border-blue-500"
                  : "hover:border-gray-400"
              }
            `}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* CALL OUTCOME FORM */}
      {activeDisposition?.requiresCallOutcome && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {batch.callOutcomeForm?.fields?.map(
            (field) =>
              isFieldVisible(field) && (
                <div key={field.key}>
                  <label className="text-xs font-medium">
                    {field.label}
                  </label>

                  {field.type === "boolean" && (
                    <select
                      className="border p-2 w-full text-sm"
                      onChange={(e) =>
                        setCallOutcomeValues((p) => ({
                          ...p,
                          [field.key]: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}

                  {field.type === "datetime" && (
                    <input
                      type="datetime-local"
                      className="border p-2 w-full text-sm"
                      onChange={(e) =>
                        setCallOutcomeValues((p) => ({
                          ...p,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      rows={2}
                      className="border p-2 w-full text-sm"
                      onChange={(e) =>
                        setCallOutcomeValues((p) => ({
                          ...p,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              )
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="p-4 border-t flex gap-2">
        <Button size="sm" onClick={onEndCall}>
          End Call
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default DialerPopover;
