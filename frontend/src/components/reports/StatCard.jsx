// components/reports/StatCard.jsx
const StatCard = ({ title, value, hint }) => (
  <div className="bg-white border rounded-xl p-4">
    <div className="text-xs text-gray-500">{title}</div>
    <div className="text-2xl font-semibold">{value ?? "—"}</div>
    {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
  </div>
);

export default StatCard;
