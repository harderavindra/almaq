// components/reports/BatchOverview.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatCard from "./StatCard";

const BatchOverview = ({ batchId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/reports/batches/${batchId}/overview`)
      .then(res => setData(res.data.data));
  }, [batchId]);

  if (!data) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Total Calls" value={data.total} />
      <StatCard title="Completed" value={data.completed} />
      <StatCard title="Pending" value={data.pending} />
    </div>
  );
};

export default BatchOverview;
