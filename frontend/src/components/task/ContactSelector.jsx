import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/common/Button";

/**
 * Props
 * selectedContacts: string[]  (IDs only – source of truth)
 * setSelectedContacts: fn
 */
const ContactSelector = ({ selectedContacts, setSelectedContacts, selectedContactPreview, setSelectedContactPreview }) => {
    /* =====================
       DATA + PAGINATION
    ===================== */
    const [contacts, setContacts] = useState([]);
    const [page, setPage] = useState(1);
    const limit = 5;
    const [total, setTotal] = useState(0);

    /* =====================
       PAGE-SCOPED CHECKBOX STATE
    ===================== */
    const [checkedAvailable, setCheckedAvailable] = useState([]);
    const [checkedAdded, setCheckedAdded] = useState([]);

    /* =====================
       LOAD CONTACTS (SERVER-AUTHORITATIVE)
       Excludes already selected contacts
    ===================== */
    useEffect(() => {
        api
            .get("/contacts/taskbatch", {
                params: {
                    page,
                    limit,
                    excludeIds: selectedContacts.join(","), // ⭐ enterprise-grade
                },
            })
            .then((res) => {
                setContacts(res.data.data || []);
                setTotal(res.data.pagination?.total || 0);

                // reset page-scoped selection
                setCheckedAvailable([]);
                setCheckedAdded([]);
            });
    }, [page, selectedContacts]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    /* =====================
       AUTO-FIX EMPTY PAGE (CRITICAL UX FIX)
    ===================== */
    useEffect(() => {
        if (contacts.length === 0 && page > 1) {
            setPage((p) => p - 1);
        }
    }, [contacts, page]);

    /* =====================
       DERIVED LISTS (PAGE-SCOPED)
    ===================== */
    const availableContacts = contacts;
    const addedContacts = []; // already excluded server-side

    /* =====================
       CHECKBOX HELPERS
    ===================== */
    const toggle = (id, list, setList) => {
        setList((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (items, checked, setChecked) => {
        const ids = items.map((c) => c._id);
        const allSelected =
            ids.length > 0 && ids.every((id) => checked.includes(id));
        setChecked(allSelected ? [] : ids);
    };

    /* =====================
       ADD / REMOVE
    ===================== */
    const addSelected = () => {
        if (!checkedAvailable.length) return;

        setSelectedContacts((prev) => [
            ...new Set([...prev, ...checkedAvailable]),
        ]);

        setSelectedContactPreview((prev) => {
            const next = { ...prev };

            contacts.forEach((c) => {
                if (checkedAvailable.includes(c._id)) {
                    next[c._id] = {
                        fullName: c.fullName,
                        mobile: c.mobile,
                    };
                }
            });

            return next;
        });

        setCheckedAvailable([]);
    };


    const removeSelected = () => {
        if (!checkedAdded.length) return;

        setSelectedContacts((prev) =>
            prev.filter((id) => !checkedAdded.includes(id))
        );

        setSelectedContactPreview((prev) => {
            const next = { ...prev };
            checkedAdded.forEach((id) => delete next[id]);
            return next;
        });

        setCheckedAdded([]);
    };


    const removeOne = (id) => {
        setSelectedContacts((prev) => prev.filter((x) => x !== id));

        setSelectedContactPreview((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };
const removeChecked = () => {
  if (!checkedAdded.length) return;

  setSelectedContacts((prev) =>
    prev.filter((id) => !checkedAdded.includes(id))
  );

  setSelectedContactPreview((prev) => {
    const next = { ...prev };
    checkedAdded.forEach((id) => delete next[id]);
    return next;
  });

  setCheckedAdded([]);
};

const clearAllSelection = () => {
  if (!selectedContacts.length) return;

  setSelectedContacts([]);
  setSelectedContactPreview({});
  setCheckedAdded([]);
};
    /* =====================
       RENDER
    ===================== */
    return (
        <div className="space-y-4">
            {/* ===== SELECTION SUMMARY (ENTERPRISE UX) ===== */}
            <div className="text-sm text-gray-600">
                <strong>{selectedContacts.length}</strong> contacts selected
                <span className="ml-2 text-xs text-gray-400">
                    (selection persists across pages)
                </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
                {/* =====================
           AVAILABLE CONTACTS
        ===================== */}
                <div className="border rounded">
                    <div className="flex justify-between items-center p-2 text-sm font-medium">
                        <span>
                            Page {page} / {totalPages}
                        </span>

                        <label className="flex gap-2 items-center text-xs">
                            Select page
                            <input
                                type="checkbox"
                                checked={
                                    availableContacts.length > 0 &&
                                    availableContacts.every((c) =>
                                        checkedAvailable.includes(c._id)
                                    )
                                }
                                onChange={() =>
                                    toggleSelectAll(
                                        availableContacts,
                                        checkedAvailable,
                                        setCheckedAvailable
                                    )
                                }
                            />
                        </label>
                    </div>

                    <table className="w-full text-sm border-t">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Name</th>
                                <th>Number</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-3 text-xs text-gray-400">
                                        No contacts available
                                    </td>
                                </tr>
                            ) : (
                                availableContacts.map((c) => (
                                    <tr key={c._id} className="border-t">
                                        <td className="p-2">{c.fullName}</td>
                                        <td>{c.mobile}</td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={checkedAvailable.includes(c._id)}
                                                onChange={() =>
                                                    toggle(
                                                        c._id,
                                                        checkedAvailable,
                                                        setCheckedAvailable
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-between p-2 text-xs">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                            Prev
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* =====================
           ACTION BUTTONS
        ===================== */}
                <div className="flex flex-col justify-center gap-4">
                    <Button size="sm" disabled={!checkedAvailable.length} onClick={addSelected}>
                        Add →
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={!checkedAdded.length}
                        onClick={removeSelected}
                    >
                        ← Remove
                    </Button>
                </div>

                {/* =====================
           ADDED CONTACTS (SUMMARY PANEL)
        ===================== */}
                <div className="border rounded p-2">
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-medium">
      Selected Contacts ({selectedContacts.length})
    </span>

    <Button
      size="xs"
      variant="ghost"
      disabled={!selectedContacts.length}
      onClick={clearAllSelection}
    >
      Clear All
    </Button>
  </div>

  {selectedContacts.length === 0 ? (
    <div className="text-xs text-gray-400">No contacts selected</div>
  ) : (
    <table className="w-full text-xs border-t">
      <tbody>
        {Object.entries(selectedContactPreview).map(([id, c]) => (
          <tr key={id} className="border-t">
            <td className="p-1">{c.fullName}</td>
            <td className="p-1 text-right">{c.mobile}</td>
            <td className="p-1 text-right">
              <button
                className="text-red-500"
                onClick={() => removeOne(id)}
              >
                ×
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>


            </div>
        </div>
    );
};

export default ContactSelector;
