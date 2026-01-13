import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#7bd8cd",
    "#fd933d",
    "#fdc95b",
    "#eb4d4c", // Primary outcome
  "#c26db1",
  "#0a689c",
  "#1ca39f",
  "#9C2C72",
];

const DispositionAnalysis = ({ batchId }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!batchId) return;

    api
      .get(`/reports/batches/${batchId}/disposition-analysis`)
      .then((res) => setRows(res.data.data || []));
  }, [batchId]);

  if (!rows.length) {
    return (
      <div className="bg-white border rounded-xl p-4 text-sm text-gray-400">
        No disposition data available
      </div>
    );
  }

  const total = rows.reduce((s, r) => s + r.count, 0);

  const chartData = rows.map((r) => ({
    name: r._id
      ? r._id.replace(/-/g, " ")
      : "Not Dispositioned",
    value: r.count,
  }));

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4">
      <h3 className="font-semibold text-sm">
        Disposition Analysis
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            label={({ percent }) =>
              `${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value, name) => [
              `${value} calls`,
              name,
            ]}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-500 text-center">
        Total Calls: {total}
      </div>
    </div>
  );
};

export default DispositionAnalysis;
