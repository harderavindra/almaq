import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const Metric = ({ label, value, size }) => (
  <div className="text-center rounded-xl gap-2   flex items-center">
    <div className={size === "lg" ? "text-3xl font-semibold" : "text-xl font-semibold"}>{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

const BatchOverviewCard = ({ batchId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/reports/batches/${batchId}/overview`)
      .then((res) => setData(res.data.data));
  }, [batchId]);

  if (!data) return null;

  return (
    <div>
    <div className="bg-white   p-4 grid grid-cols-5 gap-4">
      <Metric label="Total Tasks"  value={data.tasks.total} />
      <Metric label="Completed" value={data.tasks.completed} />
      <Metric label="Pending" value={data.tasks.pending} />
      <Metric label="Calls Made" value={data.calls.totalCalls} />
      
    </div>
    <div className="rounded-2xl border border-green-300 p-1 bg-green-50 ">
      <div className="bg-green-500 h-2 rounded-2xl" style={{ width: `${data.completionRate}%` }}></div>
    </div>
    </div>
  );
};

export default BatchOverviewCard;
