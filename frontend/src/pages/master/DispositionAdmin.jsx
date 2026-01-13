import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import DispositionForm from "../../components/master/DispositionForm";

const DispositionAdmin = () => {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const res = await api.get("/admin/dispositions");
    console.log("DISPOSITIONS:", res.data.data);
    setList(res.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id) => {
    await api.patch(`/admin/dispositions/${id}/toggle`);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Disposition Master
        </h2>
        <Button onClick={() => setEditing({})}>
          + New Disposition
        </Button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Label</th>
              <th className="p-3">Code</th>
              <th className="p-3">Category</th>
              <th className="p-3">Task Status</th>
              <th className="p-3">Attempts</th>
              <th className="p-3">Active</th>
              <th className="p-3">Call Outcome</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(d => (
              <tr key={d._id} className="border-t">
                <td className="p-3">{d.label}</td>
                <td className="p-3 text-xs">{d.code}</td>
                <td className="p-3">{d.category}</td>
                <td className="p-3">{d.taskStatus}</td>
                <td className="p-3 text-center">
                  {d.incrementAttempt ? "Yes" : "No"}
                </td>
                <td className="p-3 text-center">
                  {d.active ? "✔" : "—"}
                </td>
                <td className="p-4 text-center">
                    {d.requiresCallOutcome ? "✔" : "—"}
                </td>
                 <td className="p-3 flex gap-2">
                  <Button size="xs" onClick={() => setEditing(d)}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => toggleActive(d._id)}
                  >
                    {d.active ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <DispositionForm
          data={editing}
          onClose={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default DispositionAdmin;
