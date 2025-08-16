import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, redirect } from 'react-router-dom';
import api from '../api/axios';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import SelectDropdown from '../components/common/SelectDropdown';
import Logo from '../assets/almaq-logo.svg'; // Adjust the path as necessary
import { formatDate } from '../utils/dateUtils';
import numberToWords from '../utils/numberToWords';
const agronomistName = [
    { name: 'Sanjeev Rathe', contact: '1234567890' },
    { name: 'Bhim Yevale', contact: '0987654321' },
]
const CreateInvoicePage = () => {
    const { orderId, farmerId } = useParams();
    const navigate = useNavigate();

    const [orderData, setOrderData] = useState(null); // Holds the full data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [vehicleFreight, setVehicleFreight] = useState(0);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [agronomist, setAgronomist] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [res, invoiceNumber] = await Promise.all([
                    api.get(`/orderItems/invoice-items?orderId=${orderId}&farmerId=${farmerId}`),
                    api.get('/utility/generate-number?type=INV')
                ]);

                console.log('Fetched invoice data:', invoiceNumber.data, res.data);
                setOrderData(res.data);
                setInvoiceNumber(invoiceNumber.data.number);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId, farmerId]);

    const handleCreateInvoice = async () => {
        setCreating(true);
        try {
            const res = await api.post('/invoices', { orderId, farmerId, invoiceNumber, invoiceDate, vehicleFreight, agronomist });
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create invoice');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <p className="text-center mt-6 text-gray-500">Loading...</p>;
    if (error) return <p className="text-center mt-6 text-red-600">{error}</p>;

    const { order, farmer, items } = orderData || {};

    const totalAmount = items?.reduce(
        (sum, item) => sum + (item.pricePerUnit || 0) * (item.deliveredQuantity || 0),
        0
    ) || 0;
    const totalPlants = orderData?.items?.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0) || 0;
const grossTotal = Number(vehicleFreight || 0) + Number(totalAmount || 0);


    return (
        <div className=" flex gap-20 mx-10 align-top justify-start relative ">
            <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow text-xs">
                <h1 className="text-2xl font-bold text-center mb-4">Invoice Preview</h1>
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
                                <p className=''><label className='font-bold '>Date:</label> <span className='font-bold text-md text-blue-500'>{invoiceDate}</span></p>
                            </td>
                            <td colSpan="2" className="text-left py-1 px-3">
                                <p><label className='font-bold'>Invoice:</label><span className='font-bold text-md text-blue-500'>{invoiceNumber}</span></p>
                            </td>

                        </tr>
                        <tr className="border border-black ">
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black w-1/4">
                                <p><label className='font-bold'>Order by</label></p>
                            </td>
                            <td colSpan="3" className="text-left py-1 px-3 ">
                                <p>{order?.department?.name}, {order?.department?.address}</p>
                            </td>
                        </tr>
                        <tr className="border border-black ">
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p><label className='font-bold'>Bill To</label></p>
                            </td>
                            <td colSpan="3" className="text-left py-1 px-3">
                                <p>{farmer?.firstName} {farmer?.lastName}</p>
                            </td>
                        </tr>
                        <tr className="border border-black ">
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p><label className='font-bold'>Address</label></p>
                            </td>
                            <td colSpan="3" className="text-left py-1 px-3">
                                <p>{farmer?.address} {farmer?.city}</p>
                            </td>
                        </tr>
                        <tr className="border border-black ">
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p><label className='font-bold'>Taluka</label></p>
                            </td>
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p>{farmer?.taluka}</p>
                            </td>
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p><label className='font-bold'>District</label></p>
                            </td>
                            <td colSpan="1" className="text-left py-1 px-3">
                                <p>{farmer?.district}</p>
                            </td>
                        </tr>
                        <tr className="border border-black ">
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p><label className='font-bold'>State</label></p>
                            </td>
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p>{farmer?.state}</p>
                            </td>
                            <td colSpan="1" className="text-left py-1 px-3 border-r border-black">
                                <p><label className='font-bold'>Contact No</label></p>
                            </td>
                            <td colSpan="1" className="text-left py-1 px-3">
                                <p>{farmer.contactNumber}</p>
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


                            items?.map((item, index) => {

                                return (
                                    <tr key={index}>
                                        <td className="border p-2">{index + 1}</td>
                                        <td className="border p-2">{item?.plantTypeId.name}</td>
                                        <td className="border p-2 text-center">{item?.plantTypeId.HSN}</td>
                                        <td className="border p-2 text-center">{item.deliveredQuantity}</td>
                                        <td className="border p-2 text-center">₹{item.pricePerUnit}</td>
                                        <td className="border p-2 w-1/4 text-right"> ₹ {(item.pricePerUnit || 0) * (item.deliveredQuantity || 0).toFixed(2)}</td>
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
                            <td className="border p-2 w-1/4 text-right">₹{totalAmount}</td>
                        </tr>
                        <tr className="">
                            <td className="border p-2 w-1/4"><label className='font-bold'>Order No</label></td>
                            <td className="border p-2 w-1/4">{order.orderRefNo} </td>
                            <td className="border p-2 w-1/4"></td>
                            <td className="border p-2 w-1/4 text-right"></td>
                        </tr>
                           <tr className="">
                            <td className="border p-2 w-1/4"><label className='font-bold'>Order Date</label></td>
                            <td className="border p-2 w-1/4 ">{formatDate(order.orderDate)}</td>
                            <td className="border p-2 w-1/4"><label className='font-bold'>Gross Total	</label></td>
                        <td className="border p-2 w-1/4 text-right font-bold text-sm font-bold text-md text-blue-500">₹{grossTotal}</td>
                        </tr>
                        <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Gross Total in word</label></td>

                        <td className="border p-2 w-1/4 font-bold text-sm" colSpan={3}>{numberToWords(grossTotal)}</td>
                    </tr>

                    <tr className="">
                        <td className="border p-2 w-1/4"><label className='font-bold'>Agronomist </label></td>
                        <td className="border p-2 w-1/4 font-bold text-md text-blue-500" colSpan={3}>{agronomist} </td>

                    </tr>
                        <tr className="">
                            <td colSpan={4} className="border p-4 w-1/4">
                                आज रोजी वरील प्रमाणे मिळालेली रोपे मी वैयक्तिक रित्या प्रत्यक्ष तपासून घेतली आहेत. सदर रोपे शेतात लागवडी योग्य असून ही रोपे पूर्ण निरोगी व जातिवंत आहेत. त्याबाबत माझी कोणतीही तक्रार नाही येथून पुढे रोपांची संपूर्ण जबाबदारी मी घेत आहे.

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
                

            </div>
            <div className="w-sm bg-white p-6 shadow-lg rounded-2xl h-auto self-start sticky top-10">

                <div className=' flex flex-col gap-5 items-start justify-between'>
                    <InputText value={invoiceNumber} handleOnChange={(e) => setInvoiceNumber(e.target.value)} label={'Invoice Number'} />
                    <InputText
                        type='date'
                        label={'Invoice Date'}
                        value={invoiceDate}
                        handleOnChange={(e) => setInvoiceDate(e.target.value)}
                    />                    <SelectDropdown
                        label="Agronomist"
                        options={agronomistName.map(agro => ({ value: agro.name, label: `${agro.name} (${agro.contact})` }))}
                        onChange={(e) => setAgronomist(e.target.value)}
                        className='w-full'
                        value={agronomist}
                        placeholder="Select Agronomist"
                    />
                    <InputText
                        value={vehicleFreight}
                        handleOnChange={(e) => setVehicleFreight(e.target.value)}
                        label={'Vehicle Freight'}
                        type='number'
                        min='0' />
                </div>
                <div className='flex flex-col gap-2 justify-between mt-4'>
                    <Button
                        onClick={handleCreateInvoice}
                        disabled={creating}
                        width='auto'
                        variant="primary"
                    >
                        {creating ? 'Creating...' : 'Confirm & Create Invoice'}
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="secondary" width="auto">Back </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoicePage;
