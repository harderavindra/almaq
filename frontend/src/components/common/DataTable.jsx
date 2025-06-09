import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import IconButton from './IconButton';
// import LoadingSpinner from './LoadingSpinner';

const DataTable = ({ columns, data, isLoading, onEdit,isModalOpen, onDelete, emptyMessage }) => {
    if (data.length === 0) return <p className="text-gray-500 py-4">{emptyMessage}</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-blue-100/50 border-b border-blue-300 text-blue-700 font-light">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-3 text-left text-md font-medium capitalize tracking-wider">
                                {col.header}
                            </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs uppercase tracking-wider">
                            Actions
                        </th>

                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map(item => (
                        <tr key={item._id} className="hover:bg-gray-50 odd:bg-white even:bg-gray-50">
                            {columns.map(col => (
                                <td key={`${item._id}-${col.key}`} className="px-4 py-4">
                                    {col.render
                                        ? col.render(item)
                                        : col.key.includes(',')
                                        ? col.key
                                              .split(',')
                                              .map(k => item[k.trim()] ?? '-')
                                              .join(' ')
                                        : item[col.key] ?? '-'}
                                </td>
                            ))}
                            <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                                <div className="flex gap-2 justify-end">
                                    <IconButton onClick={() => onEdit(item._id)} icon={<FiEdit2 />} label="" />
                                    <IconButton onClick={() => onDelete(item._id)} icon={<FiTrash2 />} label="" />
                                </div>
                            </td>
                            
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;