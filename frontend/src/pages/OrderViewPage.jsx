import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import OrderSidebar from '../components/layout/OrderSidebar';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatShortDate, formatShortDateTime } from '../utils/dateUtils';
import { FiCalendar, FiClipboard, FiMapPin, FiTruck, FiUser } from 'react-icons/fi';
import { OrderStatusIcon } from '../utils/constants';
import { hasAccess } from '../utils/permissions';
import Avatar from '../components/common/Avatar';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import StatusTimelineItem from '../components/common/StatusTimelineItem'; // ✅ correct

const OrderViewPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const canEdit = hasAccess(user?.role, ['admin', 'manager']);
  const canView = hasAccess(user?.role, ['admin', 'report_viewer']);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [summary, setSummary] = useState({ totalFarmers: 0, totalQuantity: 0, totalAmount: 0 });

  const fetchOrder = async () => {
    try {
      setIsLoading(true);

      const res = await api.get(`/orders/${id}`);
      // console.log('Order fetched:', res.data);
      setOrder(res.data.order);
      setSummary(res.data.summary);
            console.log(res.data.items, "res.data.summary")

      setItems(res.data.items);
      setMessage({ type: 'success', text: 'Data loaded successfully' });
    } catch (err) {
      console.error('Failed to fetch order', err);
      setMessage({ type: 'error', text: 'Failed to load dropdown data' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      
      fetchOrder(); // Refresh order data

    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    }
  };

  if (!order) return <p>Loading...</p>;

  return (
      <div className="flex flex-col md:flex-row h-full  gap-10">
      <OrderSidebar activeStatus={order.status} />

      <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
        <div className="flex items-center justify-between gap-4 pb-5 min-h-10" >
          <h2 className="text-3xl font-bold  ">Order :
            <span className="text-xl text-blue-700 font-medium"> {order?.departmentId?.name}</span>
          </h2>

          <StatusMessageWrapper
            loading={isLoading}
            success={message.type === 'success' ? message.text : ''}
            error={message.type === 'error' ? message.text : ''}
            className="sticky top-0 z-10"
          />
        </div>
        {/* <div className='flex gap-4'>
          {
            order?.statusHistory && (
              order?.statusHistory.map((status, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                    <span className={`text-sm ml-2 font-medium ${status.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                      <OrderStatusIcon status={status.status} size='18' color='primary' />
                    </span>
                  <div className="flex items-center  border border-blue-200 rounded-full pl-1 pr-3 py-1 gap-2">
                    <Avatar src={status.updatedBy?.profilePic} alt={status.updatedBy?.firstName} size="xs" />
                    <p className='text-sm'>{status.updatedBy?.firstName}</p>
                    <span className="text-xs text-gray-500">
                      {formatShortDateTime(status.updatedAt)}
                    </span>
                  </div>
                </div>
              ))
            )
          }
        </div> */}
        <div className="flex gap-4">
          {order?.statusHistory?.map((status, index) => (
            <StatusTimelineItem key={index} status={status} />
          ))}
        </div>
        {!order ? (
                    <div className="bg-blue-100/50 rounded-2xl p-8 animate-pulse">
                      <div className="flex gap-6 justify-between mb-4">
                        <div className="w-full flex gap-4 items-center">
                          <div className="h-5 w-5 bg-blue-200 rounded"></div>
                          <div className="h-5 w-32 bg-blue-200 rounded"></div>
                        </div>
                        <div className="w-full flex gap-4 items-center">
                          <div className="h-5 w-5 bg-blue-200 rounded"></div>
                          <div className="h-5 w-40 bg-blue-200 rounded"></div>
                        </div>
                        <div className="w-full">
                          <div className="h-10 bg-blue-200 rounded w-full"></div>
                        </div>
                      </div>
        
                      <div className="flex gap-8 justify-between">
                        <div className="w-full flex gap-4 items-center">
                          <div className="h-5 w-5 bg-blue-200 rounded"></div>
                          <div className="h-5 w-28 bg-blue-200 rounded"></div>
                        </div>
                        <div className="w-full flex gap-4 items-center">
                          <div className="h-5 w-5 bg-blue-200 rounded"></div>
                          <div className="h-5 w-36 bg-blue-200 rounded"></div>
                        </div>
                        <div className="w-full flex gap-4 items-center">
                          <div className="h-5 w-5 bg-blue-200 rounded"></div>
                          <div className="h-5 w-32 bg-blue-200 rounded"></div>
                        </div>
                      </div>
        
                      <div className="pt-5 border-t border-blue-300 mt-6">
                        <div className="flex gap-5 justify-between">
                          <div className="border border-blue-200 bg-white py-3 px-4 rounded-lg  flex gap-4 items-center">
                            <div className="h-4 w-24 bg-blue-100  rounded"></div>
                            <div className="h-6 w-16 bg-blue-200 rounded"></div>
                          </div>
                          <div className="border border-blue-200 bg-white py-3 px-4 rounded-lg  flex gap-4 items-center">
                            <div className="h-4 w-24 bg-blue-100  rounded"></div>
                            <div className="h-6 w-16 bg-blue-200 rounded"></div>
                          </div>
                          <div className="border border-blue-200 bg-white py-3 px-4 rounded-lg  flex gap-4 items-center">
                            <div className="h-4 w-24 bg-blue-100  rounded"></div>
                            <div className="h-6 w-16 bg-blue-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
        
                  ) : (
                    <>
                      <div className="bg-blue-100/50 rounded-2xl p-8 ">
                        <div className="flex gap-6 justify-between mb-4">
                          <div className='w-full flex gap-4 items-center'>
                            <FiClipboard size={18} />
                            <p className="text-lg text-blue-700 font-medium">{order.orderRefNo}</p>
                          </div>
                          <div className='w-full flex gap-4 items-center'>
                            <FiMapPin size={18} />
                            <p className="text-lg text-blue-700 font-medium">{order.departmentId?.taluka}, {order.departmentId?.district}</p>
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            {canEdit ? (
                              <select
                                value={order.status}
                                onChange={handleStatusChange}
                                className="text-lg text-blue-700 font-medium bg-white border rounded-md px-2 py-1"
                              >
                                <option value={order.status}>{order.status}</option>
        
                                {/* For Draft orders */}
                                {(order.status === 'Draft' && (user.role === 'admin' || user.role === 'manager')) && (
                                  <>
                                    <option value="Submitted">Submitted</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </>
                                )}
                                {(order.status === 'Submitted' && (user.role === 'admin' || user.role === 'manager')) && (
                                  <option value="Approved">Approved</option>
                                )}
        
        
                                {/* ✅ Updated condition for Delivered */}
                                {items?.every(group => group.items.every(item => item.status === 'Delivered')) && order?.status === 'Approved' && (
                                  <option value="Delivered">Delivered</option>
                                )}
                              </select>
        
                            ) : (
                              <p className="text-lg text-blue-700 font-medium capitalize">{order.status}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-8 justify-between">
                          <div className='w-full flex gap-4 items-center'>
                            <FiCalendar size={18} />
                            <p className="text-lg text-blue-700 font-medium">{new Date(order?.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div className='w-full flex gap-4 items-center'>
                            <FiUser size={18} />
                            <p className="text-lg text-blue-700 font-medium">{order?.departmentId?.contactPerson}</p>
                          </div>
                          <div className='w-full flex gap-4 items-center'>
                            <FiTruck size={18} />
                            <p className="text-lg text-blue-700 font-medium">{order.departmentId?.contactNumber}</p>
                          </div>
                        </div>
                        <div >
                          <div className='flex  gap-5 justify-between pt-5 border-t border-blue-500 mt-6'>
                            <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                              <label className='text-blue-400 leading-4 pr-5 '>Total Farmers</label>
                              <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'>{summary.totalFarmers}</h4>
                            </div>
                            <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                              <label className='text-blue-400 leading-4 pr-5 '>Total Quantity</label>
                              <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'>{summary.totalQuantity}</h4>
                            </div>
                            <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                              <label className='text-blue-400 leading-4 pr-5 '>Total Amount</label>
                              <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'> ₹{summary.totalAmount.toLocaleString()}</h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
        <h3 className="text-lg font-semibold mb-2">Items with Challans</h3>
        <table className="w-full border-collapse">
          <thead className="bg-blue-50 text-blue-500 font-semibold">
            <tr>
              <th className="px-4 py-2 text-left">Plant</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Price/Unit</th>
              <th className="px-4 py-2 text-left">Delivered</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Challans</th>
            </tr>
          </thead>
          <tbody>
            {items.map((itemGroup, idx) => {
              const allDelivered = itemGroup.items.every((item) => item.status === 'Delivered');
              console.log('Item Group2:', itemGroup);
              const hasInvoice = itemGroup.items.some((item) => item.invoiceId);
              const invoiceId = hasInvoice ? itemGroup.items.find((item) => item.invoiceId)?.invoiceId : null;
              const hasPaymentStatus = itemGroup.items.some((item) => item.paymentStatus);
              return (
                <React.Fragment key={idx}>
                  {/* Farmer Info Row */}
                  <tr className="bg-gray-100">
                    <td colSpan="6" className="px-4 py-3">
                      <div className="text-gray-700 flex items-center gap-2">
                        <FiUser/> {itemGroup.farmer?.firstName} {itemGroup.farmer?.lastName} <FiMapPin/> {itemGroup.farmer?.city} {itemGroup.farmer?.taluka} 
                      </div>
                    </td>
                  </tr>

                  {/* Items */}
                  {itemGroup.items.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td className="px-4 py-2">{item.plantTypeId?.name.trim()}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{item.pricePerUnit}</td>
                      <td className="px-4 py-2">{item.deliveredQuantity}</td>
                      <td className="px-4 py-2">{item.status}</td>
                      <td className="px-4 py-2">
                        {item.challanIds?.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {item.challanIds.map((challan) => (
                              <li key={challan._id}>
                                <span className="font-medium">{challan.challanNo}</span> ({challan.vehicleId?.vehicleNumber.trim()} - {challan.vehicleId?.driverName})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Create Invoice Link */}
                  {allDelivered && (
                    <tr>
                      <td>{itemGroup.invoice?.invoiceNumber}</td>
                      <td>{formatDate(itemGroup?.invoice?.invoiceDate)}</td>
                      <td>{itemGroup?.invoice?.amountReceived}- {itemGroup?.invoice?.paymentStatus}</td>
                      <td colSpan="6" className="px-4 py-2 text-right">
                        {hasInvoice && invoiceId ? (
                          <>
                            <a
                              href={`/view-invoice/${invoiceId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              View Invoice for {itemGroup.farmer?.name}
                            </a>
                            <a
                              href={`/payment-invoice/${invoiceId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              Payment Invoice {itemGroup.farmer?.name}
                            </a>
                          </>
                        ) : (
                          <Link
                            to={`/create-invoice/${order._id}/${itemGroup.farmer?._id}`}
                            className="text-green-600 font-semibold hover:underline"
                          >
                            Create Invoice for {itemGroup.farmer?.name}
                          </Link>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* <Link to="/orders" className="inline-block mt-4 text-blue-600 underline">← Back to Order List</Link> */}
      </div>
    </div>
  );
};

export default OrderViewPage;
