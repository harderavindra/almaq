import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DISPOSITION_COLORS = {
  connected: "#2ecc71",        // green
  busy: "#f39c12",             // orange
  "no answer": "#f1c40f",       // yellow
  callback: "#3498db",          // blue
  "not interested": "#e74c3c",  // red
  "wrong number": "#9b59b6",    // purple
  dnd: "#34495e",               // dark gray
  "Not Disposed": "#95a5a6",    // light gray (attempts only)
};

const DispositionAnalysis = ({ batchId, onDispositionLoad, mode }) => {
  const [rows, setRows] = useState([]);
  console.log("DispositionAnalysis mode:", mode);
  const getColorForDisposition = (name) => {
  return DISPOSITION_COLORS[name] || "#bdc3c7"; // fallback gray
};
  /* =====================
     API MAPPING
  ===================== */
  const getAnalyticsUrl = (mode, batchId) => {
    switch (mode) {
      case "attempts":
        return `/reports/batches/${batchId}/disposition-attempts-analysis`; 
      case "completed":
        return `/reports/batches/${batchId}/disposition-completed-analysis`;
      case "contacts":
        return `/reports/batches/${batchId}/disposition-contact-analysis`;
      default:
        return null;
    }
  };

  /* =====================
     DATA FETCH
  ===================== */
  useEffect(() => {
    if (!batchId || !mode) return;

    const url = getAnalyticsUrl(mode, batchId);
    if (!url) return;

    // reset to avoid stale flash
    setRows([]);

    api.get(url).then((res) => {
      const data = res.data.data || [];
      setRows(data);
      onDispositionLoad?.(data);
    });
  }, [batchId, mode, onDispositionLoad]);

  /* =====================
     FORMATTERS
  ===================== */
  const formatDisposition = (val) => {
    if (!val) {
      return mode === "attempts" ? "Not Disposed" : "";
    }
    return val.replace(/-/g, " ");
  };

  const tooltipLabel =
    mode === "contacts"
      ? "contacts"
      : mode === "completed"
      ? "completed calls"
      : "attempts";

  /* =====================
     EMPTY STATE
  ===================== */
  if (!rows.length) {
    return (
      <div className="bg-white border rounded-xl p-4 text-sm text-gray-400 text-center">
        No disposition data available
      </div>
    );
  }

  /* =====================
     CHART DATA
  ===================== */
  const chartData = rows.map((r) => ({
    name: formatDisposition(r._id),
    value: r.count,
  }));

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="bg-blue-50/50 rounded-xl p-4 space-y-3">
      {/* <h2 className="font-semibold text-sm text-center">
        {mode === "attempts" && "Dial Attempts (Operational)"}
        {mode === "completed" && "Completed Calls (Performance)"}
        {mode === "contacts" && "Final Contact Outcome"}
      </h2> */}

      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={30}
            outerRadius={45}
            paddingAngle={3}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
          {chartData.map((entry, index) => (
  <Cell
    key={index}
    fill={getColorForDisposition(entry.name)}
  />
))}
          </Pie>

          <Tooltip
            formatter={(value, name) => [
              `${value} ${tooltipLabel}`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DispositionAnalysis;
