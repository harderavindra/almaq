import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useParams } from 'react-router-dom';
import Logo from '../assets/almaq-logo.svg'; // Adjust the path as necessary
import { formatDate } from '../utils/dateUtils';

const ViewInvoicePage = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [invoiceId, setInvoiceId] = useState(null)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/invoices/${id}`);
                console.log('Invoice fetched:', res.data);
                setInvoice(res.data);
                setInvoiceId(res.data.orderId.orderRefNo)
            } catch (error) {
                console.error('Error fetching invoice:', error);
            }
        };

        fetchInvoice();
    }, [id]);

    useEffect(() => {
  document.title = `Invoice-${invoiceId}`;
}, [invoiceId]);
    const totalPlants = invoice?.items?.reduce(
        (total, item) => total + (item?.deliveredQuantity || 0),
        0
    );

    if (!invoice) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow text-xs">
            <table className="w-full mb-6 font-semibold">
                <tbody>
                    <tr>
                        <td className="pr-10">
                            <img src={Logo} alt="Company Logo" className="h-14 mb-4" />
                        </td>
                        <td className=" text-left">
                            <h1 className="text-sm font-bold mb-0">Almaq Biotech LLP</h1>
                            <p className="text-gray-600">At/p Lodga Dist Latur</p>
                            <p className="text-gray-600">Maharshtra 266782</p>
                            <p className="text-gray-600">Total Amount: ₹{invoice.totalAmount}</p>
                        </td>
                        <td colSpan={2} className=" text-left px-10 pb-5">
                            <h2>Invoice</h2>
                            <p>GST No. : 27AAECA1234A1Z5</p>
                            <p>NCS-TCP-Certificate LAB</p>
                            <p>Registartion No. - TC2020/R292 </p>
                            <p>Certification No. - TC2020/209 </p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="2" className="text-left py-1 px-3">
                            <p><label className='font-bold'>Date:</label> {formatDate(invoice.createdAt)}</p>
                        </td>
                        <td colSpan="2" className="text-left py-1 px-3">
                            <p><label className='font-bold'>Invoice:</label> {invoice._id}</p>
                        </td>

                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black w-1/4">
                            <p><label className='font-bold'>Dealer Name:</label></p>
                        </td>
                        <td colSpan="3" className="text-left py-1 px-3 ">
                            <p>{invoice?.deealerName || 'N/A'}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Bill To</label></p>
                        </td>
                        <td colSpan="3" className="text-left py-1 px-3">
                            <p>{invoice.farmerId?.name}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Address</label></p>
                        </td>
                        <td colSpan="3" className="text-left py-1 px-3">
                            <p>{invoice.farmerId?.address}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Taluka</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p>Latur</p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>District</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3">
                            <p>Latur</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>State</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p>Maharashtra</p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Contact No</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3">
                            <p>{invoice.farmerId.contactNumber}</p>
                        </td>
                    </tr>
                </tbody>


            </table>
            <table className="w-full mt-6 border-collapse border border-gray-300">
                <tbody>
                    <tr className="bg-gray-100">
                        <th className="border p-2">S.No</th>
                        <th className="border p-2">Item Name</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Price/Unit</th>
                        <th className="border p-2 text-right">Subtotal</th>
                    </tr>
                    {

                    }
                    {


                        invoice.items?.map((item, index) => {

                            return (
                                <tr key={index}>
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">{item?.itemId?.plantTypeId.name}</td>
                                    <td className="border p-2">{item.deliveredQuantity}</td>
                                    <td className="border p-2">₹{item.price}</td>
                                    <td className="border p-2 w-1/4 text-right">₹{item.subtotal}</td>
                                </tr>
                            )
                        })}

                </tbody>
            </table>
            <table className="w-full mt-6 border-collapse border border-gray-300">
                <tbody>
                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Total Number of Plants</label></td>
                        <td className="border p-2 w-1/4">{totalPlants} </td>
                        <td className="border p-2 w-1/4"><label className='font-bold'>Total Amount</label></td>
                        <td className="border p-2 w-1/4 text-right">₹{invoice.totalAmount}</td>
                    </tr>
                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Order No</label></td>
                        <td className="border p-2 w-1/4">{invoice.orderId.orderRefNo} </td>
                        <td className="border p-2 w-1/4"><label className='font-bold'>Order Date</label></td>
                        <td className="border p-2 w-1/4 text-right">{ formatDate(invoice.orderId.orderDate)}</td>
                    </tr>
                    <tr className="">
                        <td colSpan={4} className="border p-4 w-1/4">
                                  आज रोजी वरील प्रमाणे मिळालेली रोटे मी वैयक्तिक रित्या प्रत्यक्ष तपासून घेतली आहेत. सदर रूपे शेतात लागवडी योग्य असून हीरोपे पूर्ण निरोगी व जातिवंत आहेत. त्याबाबत माझी कोणतीही तक्रार नाही येथून पुढे रोपांची संपूर्ण जबाबदारी मी येत आहे

                        </td>
                        
                    </tr>
                     <tr className="">
                        <td colSpan={2} className=" p-4  text-left">
                             <div className='w-40 mr-auto text-center'>
                            <p className='h-20'></p>
                            <label className='font-bold'>Customer Sign</label>
                            </div>
                        </td>
                         <td colSpan={2} className=" p-4 w-1/2 text-right ">
                         <div className='w-80 ml-auto text-center'>
                            <p className='h-20'></p>
                            <p className='font-bold'>Authorized Signatory</p>
                            <p className='font-bold'>Almaq Biotech LLP</p>
                            </div>
                        </td>
                        
                    </tr>
                </tbody>
            </table>


           
          

            <section className="mt-8">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => window.print()}
                >
                    Print Invoice
                </button>
            </section>
        </div>
    );
};

export default ViewInvoicePage;
