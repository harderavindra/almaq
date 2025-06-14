import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiClipboard, FiCreditCard, FiFile, FiTrash } from 'react-icons/fi';

import { FaRupeeSign, FaTrash, FaFilePdf, FaEye, FaMoneyCheck, FaMoneyBillWave } from 'react-icons/fa';
import StatusBubbleText from '../components/common/StatusBubbleText';
import StatusBubble from '../components/common/StatusBubble';
import { useNavigate } from 'react-router-dom';
import IconButton from '../components/common/IconButton';


const months = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' }),
}));

const InvoiceList = () => {
    const navigate = useNavigate()
    const [data, setData] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);

    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: '',
    });

    const minDate = availableDates.reduce((min, d) => {
    if (!min || d.year < min.year || (d.year === min.year && d.month < min.month)) {
        return d;
    }
    return min;
}, null);

const maxDate = availableDates.reduce((max, d) => {
    if (!max || d.year > max.year || (d.year === max.year && d.month > max.month)) {
        return d;
    }
    return max;
}, null);

const isPrevDisabled = !minDate ||
    filters.year < minDate.year ||
    (filters.year === minDate.year && filters.month <= minDate.month);

const isNextDisabled = !maxDate ||
    filters.year > maxDate.year ||
    (filters.year === maxDate.year && filters.month >= maxDate.month);

    const statusColors = {
        Paid: 'success',
        'Partially Paid': 'warning',
        Pending: 'error',
        Cash: 'error',
        UPI: 'info',
        Transfer: 'warning',
        Cheque: 'success',
    };

    const statusIcons = {
        Cash: <FaMoneyBillWave />,
        UPI: <FaMoneyCheck />,
        Transfer: <FaMoneyCheck />,
        'Pending': 'clock',
        'Paid': 'done',
        'Partially Paid': 'check',
        Cheque: <FaMoneyBillWave />,
    };

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/invoices/all', {
                params: {
                    month: filters.month,
                    year: filters.year,
                    status: filters.status,
                },
            });
            setData(res.data.invoices);
            setAvailableDates(res.data.availableMonthYear);
           
        } catch (err) {
            console.error('Error fetching invoices:', err);
        }

    };

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    const handleMonthChange = (direction) => {
        let current = parseInt(filters.month) || new Date().getMonth() + 1;
        let newMonth = current + direction;
        if (newMonth > 12) newMonth = 1;
        if (newMonth < 1) newMonth = 12;
        setFilters({ ...filters, month: newMonth });
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const response = await api.delete(`/invoices/${id}`); // Adjust the API route as per your backend
            alert(response.data.message || 'Invoice deleted successfully.');


        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert(error.response?.data?.message || 'Error deleting invoice.');
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">

            <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
                <div className='flex justify-between'>
                    <h1 className="text-3xl font-bold mb-4">Invoices by Department</h1>

                    <div className="flex items-center gap-2 mb-4">
                        <select
                            value={filters.status || ''}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="border border-blue-300 bg-blue-50 px-2 py-1 rounded-lg text-blue-600"
                        >
                            <option value="">Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Paid">Paid</option>
                        </select>
                        <select
                            value={filters.year || ''}
                            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                            className="border border-blue-300 bg-blue-50 px-2 py-1 rounded-lg text-blue-600"
                        >
                            <option value="">Year</option>
                            {[...new Set(availableDates.map(d => d.year))].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            disabled={isPrevDisabled}

                            onClick={() => handleMonthChange(-1)}
                            className={`p-2 bg-blue-50 rounded-lg cursor-pointer border border-blue-300 text-blue-500 ${isPrevDisabled ? 'opacity-30' : ''}`}
                        >
                            <FiChevronLeft />
                        </button>

                        <select
                            value={filters.month || ''}
                            onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                            className="border border-blue-300 bg-blue-50 px-2 py-1 rounded-lg text-blue-600"
                        >
                            <option value="">Month</option>
                            {[...new Set(availableDates
                                .filter(d => d.year === filters.year)
                                .map(d => d.month))].map(month => (
                                    <option key={month} value={month}>
                                        {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                        </select>

                        <button
                            type="button"
                                                        disabled={isNextDisabled}

                            onClick={() => handleMonthChange(1)}
                            className={`p-2 bg-blue-50 rounded-lg cursor-pointer border border-blue-300 text-blue-500 ${isNextDisabled ? 'opacity-30' : ''}`}
                        >
                            <FiChevronRight size={16} />
                        </button>




                    </div>
                </div>

                {data.length === 0 ? (
                    <p className="text-gray-500">No invoices found for selected filters.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full rounded-xl overflow-hidden" border="0">
                            <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                                <tr>
                                    <th className="px-3 py-3 font-semibold text-left">Invoice Number</th>
                                    <th className="px-3 py-3 font-semibold text-left">Invoice Date</th>
                                    <th className="px-3 py-3 font-semibold text-left">Payment Date</th>
                                    <th className="px-3 py-3 font-semibold text-left">Farmer / Dept</th>
                                    <th className="px-3 py-3 font-semibold text-left">Agronomist</th>
                                    <th className="px-3 py-3 font-semibold text-left">Total Amount (₹)</th>
                                    <th className="px-3 py-3 font-semibold text-left">Total Plants</th>
                                    <th className="px-3 py-3 font-semibold text-left">Payment Status</th>
                                    <th className="px-3 py-3 font-semibold text-left">Payment Mode</th>
                                    <th className="px-3 py-3 font-semibold text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.flatMap((group) =>
                                    group.invoices.map((invoice) => (
                                        <tr key={invoice._id} className="even:bg-gray-100/70">
                                            <td className="p-2 text-blue-600 underline cursor-pointer" onClick={() => console.log('Open Invoice', invoice._id)}>{invoice.invoiceNumber}</td>
                                            <td className="p-3">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                                            <td className="p-2">{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : '-'}</td>
                                            <td className="p-2">{invoice.farmerId?.name || group.department}</td>
                                            <td className="p-2">{invoice.agronomist || '-'}</td>
                                            <td className="p-2 font-semibold"><FaRupeeSign className="inline" /> {invoice.totalAmount}</td>
                                            <td className="p-2">{invoice.totalPlants}</td>
                                            <td className="p-2">
                                                <StatusBubble icon={statusIcons[invoice.paymentStatus]} status={statusColors[invoice.paymentStatus]} size='xs' />
                                                <span className={`px-2 py-1 text-xs rounded ${statusColors[invoice.paymentStatus]}`}>{invoice.paymentStatus}</span></td>
                                            <td className="p-2">
                                                <div className='flex gap-3 items-center'>{statusIcons[invoice.paymentMode] || '-'} {invoice.paymentMode}</div></td>
                                            <td className="p-2  gap-2">
                                                <div className='flex gap-4'>
                                                    <IconButton shape='pill' icon={<FiFile size={18} />} label='' onClick={() => navigate(`/view-invoice/${invoice._id}`)} title="View"></IconButton>
                                                    {
                                                        invoice.paymentStatus !== 'Paid' &&
                                                        <IconButton shape='pill' variant='success' icon={<FiCreditCard size={18} />} label='' onClick={() => navigate(`/payment-invoice/${invoice._id}`)} title="View"></IconButton>
                                                    }
                                                    <IconButton shape='pill' variant='danger' icon={<FiTrash size={18} />} label='' onClick={() => handleDelete(invoice._id)} title="Delete"></IconButton>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceList;
