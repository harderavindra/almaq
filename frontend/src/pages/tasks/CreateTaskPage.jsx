import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import RichTextEditor from "../../components/task/RichTextEditor";
import ContactSelector from "../../components/task/ContactSelector";
import CallOutcomeFormBuilder from "../../components/task/CallOutcomeFormBuilder";

/* =====================
   CALL OUTCOME FORM (STATIC)
===================== */
const CALL_OUTCOME_FORM = {
  version: 1,
  fields: [
    { key: "interested", label: "Is user interested?", type: "boolean" },
    {
      key: "demoScheduledAt",
      label: "Demo Time",
      type: "datetime",
      visibleWhen: { field: "interested", equals: true },
    },
    { key: "followUpRequired", label: "Follow-up Required?", type: "boolean" },
    {
      key: "followUpAt",
      label: "Follow-up Date",
      type: "datetime",
      visibleWhen: { field: "followUpRequired", equals: true },
    },
    { key: "remarks", label: "Additional Comments", type: "textarea" },
  ],
};

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { batchId } = useParams(); // optional (edit mode)

  /* =====================
     CORE FIELDS
  ===================== */
  const [name, setName] = useState("");
  const [taskType, setTaskType] = useState("call");
  const [priority, setPriority] = useState("medium");
  const [dueAt, setDueAt] = useState("");
const [callOutcomeForm, setCallOutcomeForm] = useState(CALL_OUTCOME_FORM);

  /* =====================
     PURPOSE & OBJECTIVE
  ===================== */
  const [objectiveTitle, setObjectiveTitle] = useState("");
  const [objectiveSummary, setObjectiveSummary] = useState("");
  const [agentGoal, setAgentGoal] = useState("");

  /* =====================
     CONTACTS (PAGINATED)
  ===================== */
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedContactPreview, setSelectedContactPreview] = useState({});

  const [contactPage, setContactPage] = useState(1);
  const [contactLimit] = useState(10);
  const [contactSearch, setContactSearch] = useState("");
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectAll, setSelectAll] = useState(false);

  /* =====================
     AGENTS
  ===================== */
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);

  /* =====================
     LOAD CONTACTS
  ===================== */
  const loadContacts = async () => {
    const res = await api.get("/contacts", {
      params: {
        page: contactPage,
        limit: contactLimit,
        search: contactSearch,
      },
    });

    setContacts(res.data.data || []);
    setTotalContacts(res.data.total || 0);
  };

  /* =====================
     LOAD AGENTS
  ===================== */
  const loadAgents = async () => {
    const res = await api.get("/auth/users?role=agent");
    setAgents(res.data.users || []);
  };

  useEffect(() => {
    loadContacts();
  }, [contactPage, contactSearch]);

  useEffect(() => {
    loadAgents();
  }, []);

  /* =====================
     EDIT MODE (OPTIONAL)
  ===================== */
  useEffect(() => {
    if (!batchId) return;

    api.get(`/taskBatches/${batchId}`).then((res) => {
      const b = res.data.batch;
      setName(b.name);
      setTaskType(b.taskConfig?.taskType || "call");
      setPriority(b.priority || "medium");
      setDueAt(b.taskConfig?.dueAt || "");

      setObjectiveTitle(b.purposeAndObjective?.title || "");
      setObjectiveSummary(b.purposeAndObjective?.summary || "");
      setAgentGoal(b.purposeAndObjective?.agentGoal || "");

      setSelectedContacts(b.contacts || []);
      setSelectedAgents(b.assignedUsers || []);
    });
  }, [batchId]);

  /* =====================
     DERIVED LISTS
  ===================== */
  const availableContacts = contacts.filter(
    (c) => !selectedContacts.includes(c._id)
  );

  const addedContacts = contacts.filter((c) =>
    selectedContacts.includes(c._id)
  );

  /* =====================
     CONTACT ACTIONS
  ===================== */
  const addContact = (id) => {
    setSelectedContacts((p) => [...new Set([...p, id])]);
  };

  const removeContact = (id) => {
    setSelectedContacts((p) => p.filter((x) => x !== id));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      const ids = availableContacts.map((c) => c._id);
      setSelectedContacts((p) => [...new Set([...p, ...ids])]);
    }
    setSelectAll(!selectAll);
  };

  /* =====================
     AGENT TOGGLE
  ===================== */
  const toggleAgent = (id) => {
    setSelectedAgents((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async () => {
    if (!name) return alert("Batch name required");
    if (!objectiveSummary) return alert("Objective summary required");
    if (!selectedContacts.length)
      return alert("Select at least one contact");
    if (!selectedAgents.length)
      return alert("Select at least one agent");

    const payload = {
      name,
      priority,
      purposeAndObjective: {
        title: objectiveTitle || name,
        summary: objectiveSummary,
        agentGoal,
      },
      taskConfig: { taskType, dueAt },
      contacts: selectedContacts,
      assignedUsers: selectedAgents,
      callOutcomeForm,
    };

    if (batchId) {
      await api.put(`/taskBatches/${batchId}`, payload);
    } else {
      await api.post("/taskBatches", payload);
    }

    navigate("/task/task-batches");
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl space-y-6">
      <h2 className="text-2xl font-semibold">
        {batchId ? "Update Task Batch" : "Create Task Batch"}
      </h2>

      {/* BASIC INFO */}
      <input
        className="border p-3 w-full"
        placeholder="Batch Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="border p-3 w-full"
        value={taskType}
        onChange={(e) => setTaskType(e.target.value)}
      >
        <option value="call">Call</option>
        <option value="follow_up">Follow-up</option>
        <option value="survey">Survey</option>
      </select>

      {/* PURPOSE */}
      <div className="border rounded p-4 space-y-3">
        <h3 className="font-semibold">Purpose & Objective</h3>
        <input
          className="border p-2 w-full"
          placeholder="Objective Title"
          value={objectiveTitle}
          onChange={(e) => setObjectiveTitle(e.target.value)}
        />
        <RichTextEditor
          value={objectiveSummary}
          onChange={setObjectiveSummary}
          placeholder="Explain what agents must do"
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Agent Goal"
          value={agentGoal}
          onChange={(e) => setAgentGoal(e.target.value)}
        />
      </div>

      {/* CONTACT SELECTION */}
      <ContactSelector
  selectedContacts={selectedContacts}
  setSelectedContacts={setSelectedContacts}
    selectedContactPreview={selectedContactPreview}
  setSelectedContactPreview={setSelectedContactPreview}
/>

      {/* AGENTS */}
      <div>
        <h3 className="font-semibold mb-2">Assign Agents</h3>
        <div className="grid grid-cols-3 gap-3 border p-3">
          {agents.map((a) => (
            <label key={a._id} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedAgents.includes(a._id)}
                onChange={() => toggleAgent(a._id)}
              />
              {a.firstName}
            </label>
          ))}
        </div>
      </div>

      <CallOutcomeFormBuilder
  value={callOutcomeForm}
  onChange={setCallOutcomeForm}
/>


      {/* DUE & PRIORITY */}
      <input
        type="datetime-local"
        className="border p-3 w-full"
        value={dueAt}
        onChange={(e) => setDueAt(e.target.value)}
      />

      <select
        className="border p-3 w-full"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <Button onClick={handleSubmit}>
        {batchId ? "Update Batch" : "Create Batch"}
      </Button>
    </div>
  );
};

export default CreateTaskPage;
