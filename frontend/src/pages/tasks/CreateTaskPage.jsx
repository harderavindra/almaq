import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../../components/task/RichTextEditor";

const CreateTaskPage = () => {
  const navigate = useNavigate();

  /* =====================
     CORE FIELDS
  ===================== */
  const [name, setName] = useState("");
  const [taskType, setTaskType] = useState("call");
  const [priority, setPriority] = useState("medium");
  const [dueAt, setDueAt] = useState("");

  /* =====================
     PURPOSE & OBJECTIVE (CMS-LITE)
  ===================== */
  const [objectiveTitle, setObjectiveTitle] = useState("");
  const [objectiveSummary, setObjectiveSummary] = useState("");
  const [agentGoal, setAgentGoal] = useState("");

  /* =====================
     DATA SOURCES
  ===================== */
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);

  /* =====================
     LOAD CONTACTS & AGENTS
  ===================== */
  useEffect(() => {
    api.get("/contacts?limit=50").then(res =>
      setContacts(res.data.data || [])
    );

    api.get("/auth/users?role=agent").then(res =>
      setAgents(res.data.users || [])
    );
  }, []);

  /* =====================
     HELPERS
  ===================== */
  const toggleSelect = (id, list, setList) => {
    setList(
      list.includes(id)
        ? list.filter(x => x !== id)
        : [...list, id]
    );
  };

  /* =====================
     CREATE BATCH
  ===================== */
  const handleCreate = async () => {
    if (!name) return alert("Batch name is required");
    if (!objectiveSummary) return alert("Objective summary is required");
    if (selectedContacts.length === 0)
      return alert("Select at least one contact");
    if (selectedAgents.length === 0)
      return alert("Select at least one agent");

    await api.post("/taskBatches", {
      name,
      priority,

      purposeAndObjective: {
        title: objectiveTitle || name,
        summary: objectiveSummary,
        agentGoal,
      },

      taskConfig: {
        taskType,
        dueAt,
      },

      contacts: selectedContacts,
      assignedUsers: selectedAgents,
    });

    alert("Task batch created successfully");
    navigate("/task/task-batches");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Create Task Batch
      </h2>

      {/* =====================
         BASIC INFO
      ===================== */}
      <input
        className="border p-3 w-full mb-4"
        placeholder="Campaign / Batch Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <select
        className="border p-3 w-full mb-4"
        value={taskType}
        onChange={e => setTaskType(e.target.value)}
      >
        <option value="call">Call</option>
        <option value="follow_up">Follow-up</option>
        <option value="survey">Survey</option>
      </select>

      {/* =====================
         PURPOSE & OBJECTIVE
      ===================== */}
      <div className="border rounded p-4 mb-6">
        <h3 className="font-semibold mb-3">
          Purpose & Objective
        </h3>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Objective Title"
          value={objectiveTitle}
          onChange={e => setObjectiveTitle(e.target.value)}
        />

         <RichTextEditor
          value={objectiveSummary}
          onChange={setObjectiveSummary}
          placeholder="Explain clearly what agents must do"
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Agent Goal (what exactly agents must do)"
          value={agentGoal}
          onChange={e => setAgentGoal(e.target.value)}
        />
      </div>

      {/* =====================
         CONTACTS
      ===================== */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Contacts</h3>
        <div className="grid grid-cols-3 gap-3 max-h-48 overflow-auto border p-3">
          {contacts.map(c => (
            <label key={c._id} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedContacts.includes(c._id)}
                onChange={() =>
                  toggleSelect(
                    c._id,
                    selectedContacts,
                    setSelectedContacts
                  )
                }
              />
              {c.firstName} {c.lastName}
            </label>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Selected: {selectedContacts.length}
        </div>
      </div>

      {/* =====================
         AGENTS
      ===================== */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Assign Agents</h3>
        <div className="grid grid-cols-3 gap-3 border p-3">
          {agents.map(a => (
            <label key={a._id} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedAgents.includes(a._id)}
                onChange={() =>
                  toggleSelect(
                    a._id,
                    selectedAgents,
                    setSelectedAgents
                  )
                }
              />
              {a.firstName}
            </label>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Selected: {selectedAgents.length}
        </div>
      </div>

      {/* =====================
         DUE DATE & PRIORITY
      ===================== */}
      <input
        type="datetime-local"
        className="border p-3 w-full mb-4"
        value={dueAt}
        onChange={e => setDueAt(e.target.value)}
      />

      <select
        className="border p-3 w-full mb-6"
        value={priority}
        onChange={e => setPriority(e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <Button onClick={handleCreate}>
        Create Task Batch
      </Button>
    </div>
  );
};

export default CreateTaskPage;
