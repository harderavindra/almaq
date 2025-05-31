import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import InvoicePrview from '../components/order/InvoicePreview';
import InvoicePreview from '../components/order/InvoicePreview';
import InputText from '../components/common/InputText';
import SelectDropdown from '../components/common/SelectDropdown';
const paymentOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
  { label: 'Cheque', value: 'Cheque' },
];
  const paymentStatusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Partially Paid', value: 'Partially Paid' },
    { label: 'Paid', value: 'Paid' },
  ];

const UpdatePayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const today = new Date().toISOString().split('T')[0];

  const [invoice, setInvoice] = useState(null);
  const [form, setForm] = useState({
    amountReceived: 0,
    paymentDate: today,
    paymentMode: '',
    paymentNotes: '',
    paymentStatus: '',
  });

  useEffect(() => {
    api.get(`/invoices/${id}`).then((res) => {
      setInvoice(res.data);

      setForm((preForm) => ({ ...preForm, amountReceived: res.data.totalAmount + res.data.vehicleFreight}))
    });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/invoices/${id}`, form);
    navigate(-1)
  };

  return (
    <div className="p-4 flex gap-20 items-start relative">
      {invoice && (
        <div className=" bg-white rounded-4x p-10">
          <InvoicePreview id={id} />
        </div>
      )}
      <div className="px-10 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl   sticky top-5 z-10 ">
        <h2 className="text-3xl font-bold mb-4">Update Payment</h2>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputText label={"Amount Received"} type="number" name="amountReceived" value={form.amountReceived} handleOnChange={handleChange} />
          </div>
          <div>
            <InputText type="date" label={'Payment Date'} name="paymentDate" value={form.paymentDate} handleOnChange={handleChange} />
          </div>
          <div>
            <SelectDropdown
              label="Payment Mode"
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              options={paymentOptions}
              placeholder="Select Payment Mode"
              required
              className="w-full"
            />
          </div>
          <div>
            <SelectDropdown
        label="Payment Status"
        name="paymentStatus"
        value={form.paymentStatus}
        onChange={handleChange}
        options={paymentStatusOptions}
        placeholder="Select Payment Status"
        required
        className="w-full"
      />
          </div>
          <div>
            <InputText label={'Payment Notes'} name="paymentNotes" value={form.paymentNotes} handleOnChange={handleChange} />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Update Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePayment;
