import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const Metric = ({ label, value }) => (
  <div className="text-center">
    <div className="text-xl font-semibold">{value}</div>
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
    <div className="bg-white border rounded-xl p-4 grid grid-cols-5 gap-4">
      <Metric label="Total Tasks" value={data.tasks.total} />
      <Metric label="Completed" value={data.tasks.completed} />
      <Metric label="Pending" value={data.tasks.pending} />
      <Metric label="Calls Made" value={data.calls.totalCalls} />
      <Metric
        label="Completion %"
        value={`${data.completionRate}%`}
      />
    </div>
  );
};

export default BatchOverviewCard;
