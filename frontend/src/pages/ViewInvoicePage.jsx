import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../assets/almaq-logo.svg'; // Adjust the path as necessary
import { formatDate } from '../utils/dateUtils';
import numberToWords from '../utils/numberToWords';
import Button from '../components/common/Button'
import InvoicePreview from '../components/order/InvoicePreview';

const ViewInvoicePage = () => {
    const navigate = useNavigate()
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
    const grossTotal = invoice?.vehicleFreight || 0 + invoice?.totalAmount;

    if (!invoice) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded  text-xs">
            <InvoicePreview id={id} />
        </div>
    );
};

export default ViewInvoicePage;
