import { useState } from "react";
import Button from "../common/Button";

/* =====================
   CONSTANTS
===================== */
const FIELD_TYPES = [
  { value: "boolean", label: "Yes / No" },
    {
    value: "select",
    label: "Single Choice",
    supports: ["options"]
  },
  { value: "datetime", label: "Date & Time" },
  { value: "textarea", label: "Text Area" },
];

const getFieldType = (type) =>
  FIELD_TYPES.find((t) => t.value === type);
const generateKeyFromLabel = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w, i) =>
      i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join("");

const CallOutcomeFormBuilder = ({ value, onChange }) => {
  const [form, setForm] = useState(
    value || { version: 1, fields: [] }
  );
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const update = (next) => {
    setForm(next);
    onChange?.(next);
  };

  const booleanFields = form.fields.filter(
    (f) => f.type === "boolean" && f.key
  );

  /* =====================
     FIELD HELPERS
  ===================== */
  const moveField = (from, to) => {
    if (to < 0 || to >= form.fields.length) return;
    const fields = [...form.fields];
    const [moved] = fields.splice(from, 1);
    fields.splice(to, 0, moved);
    update({ ...form, fields });
  };

  const addField = () => {
    update({
      ...form,
      fields: [
        ...form.fields,
        {
          key: "",
          label: "",
          type: "boolean",
          autoKey: true,
        },
      ],
    });
    setExpandedIndex(form.fields.length);
  };

  const updateField = (index, patch) => {
    const fields = [...form.fields];
    fields[index] = { ...fields[index], ...patch };
    update({ ...form, fields });
  };

  const removeField = (index) => {
    update({
      ...form,
      fields: form.fields.filter((_, i) => i !== index),
    });
    setExpandedIndex(null);
  };

  /* =====================
     DRAG & DROP
  ===================== */
  const onDragStart = (index) => setDragIndex(index);
  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    moveField(dragIndex, index);
    setDragIndex(null);
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-semibold">
        Call Outcome Form Configuration
      </h3>

      {form.fields.map((f, i) => {
        const isOpen = expandedIndex === i;
const fieldType = getFieldType(f.type);

        return (
          <div
            key={i}
            // draggable
            // onDragStart={() => onDragStart(i)}
            // onDragOver={(e) => e.preventDefault()}
            // onDrop={() => onDrop(i)}
            className="border rounded-lg bg-white"
          >
            {/* =====================
               ACCORDION HEADER
            ===================== */}
            <div
              className="flex justify-between items-center p-3 cursor-pointer bg-gray-50"
              onClick={() =>
                setExpandedIndex(isOpen ? null : i)
              }
            >
              <div>
                <div className="font-medium">
                  {i + 1}. {f.label || "Untitled Field"}
                </div>
                <div className="text-xs text-gray-500">
                  {f.type}
                  {f.visibleWhen?.field &&
                    ` • shown when ${f.visibleWhen.field} = ${f.visibleWhen.equals}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={i === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveField(i, i - 1);
                  }}
                  className="px-2 border rounded disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  disabled={i === form.fields.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveField(i, i + 1);
                  }}
                  className="px-2 border rounded disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* =====================
               EXPANDED CONTENT
            ===================== */}
            {isOpen && (
              <div className="p-4 space-y-3 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="border p-2"
                    placeholder="Field Key"
                    value={f.key}
                    onChange={(e) =>
                      updateField(i, {
                        key: e.target.value,
                        autoKey: false,
                      })
                    }
                  />

                  <input
                    className="border p-2"
                    placeholder="Label"
                    value={f.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      const patch = { label };
                      if (f.autoKey || !f.key) {
                        patch.key = generateKeyFromLabel(label);
                        patch.autoKey = true;
                      }
                      updateField(i, patch);
                    }}
                  />
                </div>

                <select
                  className="border p-2 w-full"
                  value={f.type}
                  onChange={(e) =>
                    updateField(i, {
                      type: e.target.value,
                      visibleWhen: undefined,
                    })
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                {/* SELECT OPTIONS */}
{fieldType?.supports?.includes("options") && (
  <div className="space-y-2">
    <label className="text-sm font-medium">
      Options (one per line)
    </label>

    <textarea
  rows={3}
  className="border p-2 w-full rounded"
  placeholder="Option 1\nOption 2\nOption 3"
  value={(f.options || []).join("\n")}
  onChange={(e) =>
    updateField(i, {
      options: e.target.value.split("\n"),
    })
  }
/>
  </div>
)}


                {booleanFields.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Conditional Visibility
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="border p-2"
                        value={f.visibleWhen?.field || ""}
                        onChange={(e) =>
                          updateField(i, {
                            visibleWhen: e.target.value
                              ? {
                                  field: e.target.value,
                                  equals: true,
                                }
                              : undefined,
                          })
                        }
                      >
                        <option value="">Always visible</option>
                        {booleanFields.map((bf) => (
                          <option
                            key={bf.key}
                            value={bf.key}
                          >
                            {bf.label || bf.key}
                          </option>
                        ))}
                      </select>

                      {f.visibleWhen?.field && (
                        <select
                          className="border p-2"
                          value={String(f.visibleWhen.equals)}
                          onChange={(e) =>
                            updateField(i, {
                              visibleWhen: {
                                ...f.visibleWhen,
                                equals:
                                  e.target.value === "true",
                              },
                            })
                          }
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => removeField(i)}
                >
                  Remove Field
                </Button>
              </div>
            )}
          </div>
        );
      })}

      <Button onClick={addField}>Add Field</Button>
    </div>
  );
};

export default CallOutcomeFormBuilder;
