const DispositionReport = ({ data }) => {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d._id}>
          <div className="flex justify-between text-sm">
            <span className="capitalize">{d._id}</span>
            <span>{d.count} ({Math.round(d.count / total * 100)}%)</span>
          </div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${(d.count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
