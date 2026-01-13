import React, { useState } from "react";
import api from "../../api/axios";
import Button from "../common/Button";

const DispositionForm = ({ data, onClose }) => {
  const [form, setForm] = useState({
    code: data.code || "",
    label: data.label || "",
    category: data.category || "final",
    taskStatus: data.taskStatus || "completed",
    incrementAttempt: data.incrementAttempt || false,
    requiresFollowUpDate: data.requiresFollowUpDate || false,
      requiresCallOutcome: data.requiresCallOutcome || false,
    order: data.order || 0,
  });

  const save = async () => {
    if (!form.code || !form.label) {
      return alert("Code and label required");
    }

    if (data._id) {
      await api.put(`/admin/dispositions/${data._id}`, form);
    } else {
      await api.post("/admin/dispositions", form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h3 className="font-semibold">
          {data._id ? "Edit" : "New"} Disposition
        </h3>

        <input
          className="border p-2 w-full"
          placeholder="Code (unique)"
          value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value })}
        />

        <input
          className="border p-2 w-full"
          placeholder="Label"
          value={form.label}
          onChange={e => setForm({ ...form, label: e.target.value })}
        />

        <select
          className="border p-2 w-full"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        >
          <option value="final">Final</option>
          <option value="retry">Retry</option>
        </select>

        <select
          className="border p-2 w-full"
          value={form.taskStatus}
          onChange={e => setForm({ ...form, taskStatus: e.target.value })}
        >
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.incrementAttempt}
            onChange={e =>
              setForm({ ...form, incrementAttempt: e.target.checked })
            }
          />
          Increment Attempt Count
        </label>

        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.requiresFollowUpDate}
            onChange={e =>
              setForm({ ...form, requiresFollowUpDate: e.target.checked })
            }
          />
          Requires Follow-up Date
        </label>
        <label className="flex gap-2 text-sm">
  <input
    type="checkbox"
    checked={form.requiresCallOutcome}
    onChange={e =>
      setForm({ ...form, requiresCallOutcome: e.target.checked })
    }
  />
  Requires Call Outcome Form
</label>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default DispositionForm;
