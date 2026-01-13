import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
    Legend,
  ResponsiveContainer,
} from "recharts";

/* =========================
   COLORS
========================= */
const COLORS = {
  yes: "#22c55e",
  no: "#ef4444",
};

/* =========================
   AGGREGATORS (NO DATE)
========================= */
const booleanDonut = (rows, key) => {
  let yes = 0;
  let no = 0;

  rows.forEach(r => {
    const v = r.callOutcome?.[key];
    if (v === true) yes++;
    if (v === false) no++;
  });

  return [
    { name: "Yes", value: yes },
    { name: "No", value: no },
  ];
};

const datetimeTotal = (rows, key) => {
  let count = 0;
  rows.forEach(r => {
    if (r.callOutcome?.[key]) count++;
  });
  return count;
};

const numberStats = (rows, key) => {
  const values = rows
    .map(r => r.callOutcome?.[key])
    .filter(v => typeof v === "number");

  if (!values.length) return null;

  const sum = values.reduce((a, b) => a + b, 0);

  return {
    average: +(sum / values.length).toFixed(2),
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

/* =========================
   UI COMPONENTS
========================= */
const renderLabel = ({ percent }) =>
  `${(percent * 100).toFixed(0)}%`;

const BooleanDonutChart = ({ data }) => {
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={4}
            label={renderLabel}
          >
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.name === "Yes" ? "#22c55e" : "#ef4444"}
              />
            ))}
ref
          </Pie>

          <Tooltip
            formatter={(value, name) => [`${value}`, name]}
          />

      
        </PieChart>
      </ResponsiveContainer>

      {/* TOTAL + BREAKDOWN */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          Yes: {data.find(d => d.name === "Yes")?.value || 0}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          No: {data.find(d => d.name === "No")?.value || 0}
        </div>

        <div className="text-gray-500">
          Total: {total}
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value }) => (
  <div className="bg-gray-50 border rounded-xl p-4 text-center">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
  </div>
);

const NumberStats = ({ stats }) => (
  <div className="grid grid-cols-3 gap-3">
    <KpiCard label="Average" value={stats.average} />
    <KpiCard label="Min" value={stats.min} />
    <KpiCard label="Max" value={stats.max} />
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
const CallOutcomeAnalytics = ({ batchId, batch }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!batchId) return;

    setLoading(true);
    api
      .get(`/reports/batches/${batchId}/call-outcome-analytics`)
      .then(res => setRows(res.data.data || []))
      .finally(() => setLoading(false));
  }, [batchId]);

  const analytics = useMemo(() => {
    if (!batch?.callOutcomeForm?.fields) return [];

    return batch.callOutcomeForm.fields.map(field => {
      if (field.type === "boolean") {
        return {
          field,
          type: "boolean",
          data: booleanDonut(rows, field.key),
        };
      }

      if (field.type === "datetime") {
        return {
          field,
          type: "datetime",
          total: datetimeTotal(rows, field.key),
        };
      }

      if (field.type === "number") {
        return {
          field,
          type: "number",
          stats: numberStats(rows, field.key),
        };
      }

      return null;
    }).filter(Boolean);
  }, [rows, batch]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Loading call outcome analytics…
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className="p-4 text-sm text-gray-400">
        No call outcome analytics available
      </div>
    );
  }

  return (
    <div className="space-y-8 ">
      <h2 className="text-lg font-semibold">
        Call Outcome Analytics
      </h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {analytics.map(item => {
        const { field } = item;

        if (item.type === "boolean") {
          return (
            <div
              key={field.key}
              className="border rounded-xl p-4 bg-white"
            >
              <div className="font-medium mb-2">
                {field.label}
              </div>
              <BooleanDonutChart data={item.data} />
            </div>
          );
        }

        if (item.type === "datetime") {
          return (
            <KpiCard
              key={field.key}
              label={field.label}
              value={item.total}
            />
          );
        }

        if (item.type === "number" && item.stats) {
          return (
            <div key={field.key}>
              <div className="font-medium mb-2">
                {field.label}
              </div>
              <NumberStats stats={item.stats} />
            </div>
          );
        }

        return null;
      })}
    </div>
    </div>
  );
};

export default CallOutcomeAnalytics;
