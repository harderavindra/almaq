import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../../assets/almaq-logo.svg'; // Adjust the path as necessary
import { formatDate } from '../../utils/dateUtils';
import numberToWords from '../../utils/numberToWords';
import Button from '../../components/common/Button'
import StatusBubble from '../common/StatusBubble';

const InvoicePreview = ({ id }) => {
    const navigate = useNavigate()
    const [invoice, setInvoice] = useState(null);
    const [invoiceId, setInvoiceId] = useState(null)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/invoices/${id}`);
                console.log('Invoice fetched:', res.data);
                setInvoice(res.data);
                setInvoiceId(res.data?.orderId?.orderRefNo)
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
    const grossTotal = invoice?.vehicleFreight + invoice?.totalAmount;

    if (!invoice) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded  text-xs">
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
                            <p><label className='font-bold'>Date:</label> {formatDate(invoice.invoiceDate)}</p>
                        </td>
                        <td colSpan="2" className="text-left py-1 px-3">
                            <p><label className='font-bold'>Invoice:</label> {invoice.invoiceNumber}</p>
                        </td>

                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black w-1/4">
                            <p><label className='font-bold'>Order by</label></p>
                        </td>
                        <td colSpan="3" className="text-left py-1 px-3 ">
                            <p>{invoice?.orderId?.departmentId.name}, {invoice?.orderId?.departmentId.address}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Bill To</label></p>
                        </td>
                        <td colSpan="3" className="text-left py-1 px-3">
                            <p>{invoice.farmerId?.firstName} {invoice.farmerId?.lastName}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Address</label></p>
                        </td>
                        <td colSpan="3" className="text-left py-1 px-3">
                            <p>{invoice.farmerId?.address} {invoice.farmerId?.city}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Taluka</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p>{invoice.farmerId?.taluka}</p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>District</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3">
                            <p>{invoice.farmerId?.district}</p>
                        </td>
                    </tr>
                    <tr className="border border-black ">
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>State</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p>{invoice.farmerId?.state}</p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                            <p><label className='font-bold'>Contact No</label></p>
                        </td>
                        <td colSpan="1" className="text-left py-1 px-3">
                            <p>{invoice?.farmerId?.contactNumber}</p>
                        </td>
                    </tr>
                </tbody>


            </table>
            <table className="w-full mt-6 border-collapse border border-gray-300">
                <tbody>
                    <tr className="bg-gray-100">
                        <th className="border p-2">SR.No</th>
                        <th className="border p-2 text-left">Plant Particulars</th>
                        <th className="border p-2">HSN</th>
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
                                    <td className="border p-2 text-center w-10">{index + 1}</td>
                                    <td className="border p-2">{item?.itemId?.plantTypeId.name}</td>
                                    <td className="border p-2 text-center">{item?.itemId?.plantTypeId.HSN}</td>
                                    <td className="border p-2 text-center">{item.deliveredQuantity}</td>
                                    <td className="border p-2 text-center">₹{item.price}</td>
                                    <td className="border p-2 w-1/4 text-right">₹{item.subtotal}</td>
                                </tr>
                            )
                        })}

                </tbody>
            </table>
            <table className="w-full mt-6 border-collapse">
                <tbody>
                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Total Number of Plants</label></td>
                        <td className="border p-2 w-1/4">{totalPlants} </td>
                        <td className="border p-2 w-1/4"><label className='font-bold'>Total Amount</label></td>
                        <td className="border p-2 w-1/4 text-right font-bold">₹{invoice.totalAmount}</td>
                    </tr>
                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Order No</label></td>
                        <td className="border p-2 w-1/4">{invoice?.orderId?.orderRefNo} </td>
                        <td className="border p-2 w-1/4"><label className='font-bold'>
                            {
                                invoice.vehicleFreight > 0 ? 'Vehicle Freight' : ''
                            }
                        </label></td>
                        <td className="border p-2 w-1/4 text-right">
                            {invoice.vehicleFreight ? `₹${invoice.vehicleFreight}` : ``}

                        </td>
                    </tr>
                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Order Date</label></td>
                        <td className="border p-2 w-1/4 ">{formatDate(invoice?.orderId?.orderDate)}</td>

                        <td className="border p-2 w-1/4"><label className='font-bold'>Gross Total</label></td>
                        <td className="border p-2 w-1/4 text-right font-bold text-sm">₹{grossTotal}</td>
                    </tr>
                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Gross Total in word</label></td>

                        <td className="border p-2 w-1/4 font-bold text-sm" colSpan={3}>{numberToWords(grossTotal)}</td>
                    </tr>

                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Agronomist </label></td>
                        <td className="border p-2 w-1/4" colSpan={3}>{invoice.agronomist} </td>

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





            <section className="mt-8 flex justify-end gap-10 print:hidden">
                <Button variant='secondary'
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <Button

                    onClick={() => window.print()}
                >
                    Print Invoice
                </Button>

            </section>
            {
                invoice.paymentStatus === "Pending" &&

                <table className="text-xl w-full mt-6 border-collapse border border-gray-300 print:hidden">
                    <tbody>
                        <tr >
                            <th className="border p-2 w-30">Payment</th>
                            <td className="border p-2 text-left">{invoice?.paymentStatus}</td>

                        </tr>
                    </tbody>
                </table>
            }
            {
                invoice.paymentStatus === "Paid" &&

                <table className="text-base w-full mt-6 border-collapse border border-gray-300 print:hidden">
                    <tbody>
                        <tr >
                            <th className="border p-2 text-left">Payment Status</th>
                            <td className="border p-2 text-left"> <StatusBubble icon={'done'} status='success' /> {invoice?.paymentStatus}</td>
                            <th className="border p-2  text-left">Paid on</th>
                            <td className="border p-2 text-left">{formatDate(invoice?.paymentDate)}</td>
                        </tr>
                        <tr >
                            <th className="border p-2 text-left">Amount Recived</th>
                            <td className="border p-2 text-left">{invoice?.amountReceived}</td>
                            <th className="border p-2 text-left">Payment Mode</th>
                            <td className="border p-2 text-left">{invoice?.paymentMode}</td>
                        </tr>
                        <tr >
                            <th className="border p-2 text-left">paymentNotes</th>
                            <td className="border p-2 text-left">{invoice?.paymentNotes}</td>
                            <th className="border p-2 text-left">Updated by</th>
                            <td className="border p-2 text-left">{invoice?.paymentUpdatedBy}</td>
                        </tr>
                    </tbody>
                </table>
            }
        </div>
    );
};

export default InvoicePreview;
