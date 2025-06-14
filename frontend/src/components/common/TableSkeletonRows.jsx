const TableSkeletonRows = ({ rowCount = 5, columnWidths = [], hasActions = false }) => {
  return (
    <>
      {Array(rowCount).fill().map((_, rowIndex) => (
        <tr key={rowIndex} className="even:bg-gray-100/70 animate-pulse">
          {columnWidths.map((width, colIndex) => (
            <td key={colIndex} className="px-3 py-4">
              <div className={`h-4 bg-gray-300 rounded`} style={{ width }}></div>
            </td>
          ))}
          {hasActions && (
            <td className="px-3 py-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
};

export default TableSkeletonRows;