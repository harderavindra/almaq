const CallOutcomeFormRenderer = ({
  fields = [],
  values,
  onChange,
  readOnly = false,
}) => {
  const isVisible = (field) => {
    if (!field.visibleWhen) return true;
    return values[field.visibleWhen.field] === field.visibleWhen.equals;
  };

  return (
    <div className="space-y-4">
      {fields
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((field) => {
          if (!isVisible(field)) return null;

          return (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {field.type === "boolean" && (
                <select
                  disabled={readOnly}
                  className="border p-2 w-full"
                  value={
                    values[field.key] === undefined
                      ? ""
                      : String(values[field.key])
                  }
                  onChange={(e) =>
                    onChange(field.key, e.target.value === "true")
                  }
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              )}

              {field.type === "datetime" && (
                <input
                  disabled={readOnly}
                  type="datetime-local"
                  className="border p-2 w-full"
                  value={values[field.key] || ""}
                  onChange={(e) =>
                    onChange(field.key, e.target.value)
                  }
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  disabled={readOnly}
                  className="border p-2 w-full"
                  rows={3}
                  value={values[field.key] || ""}
                  onChange={(e) =>
                    onChange(field.key, e.target.value)
                  }
                />
              )}
            </div>
          );
        })}
    </div>
  );
};
export default CallOutcomeFormRenderer; 