import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
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

  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    api.get(`/invoices/${id}`).then((res) => {
      setInvoice(res.data);
      setForm((prevForm) => ({
        ...prevForm,
        amountReceived: res.data.totalAmount + res.data.vehicleFreight,
      }));
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'paymentStatus') {
      if (value === 'Pending') {
        setForm((prevForm) => ({
          ...prevForm,
          paymentStatus: value,
          amountReceived: 0,
          paymentDate: '',
          paymentMode: '',
          paymentNotes: '',
        }));
      } else if (value === 'Paid' && invoice) {
        setForm((prevForm) => ({
          ...prevForm,
          paymentStatus: value,
          amountReceived: invoice.totalAmount + invoice.vehicleFreight,
          paymentDate: today,
        }));
      } else {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }

    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!form.paymentStatus) {
      errors.paymentStatus = 'Select payment status.';
    }

    if (form.paymentStatus === 'Paid') {
      if (!form.amountReceived || isNaN(form.amountReceived)) {
        errors.amountReceived = 'Valid amount is required.';
      }
      if (!form.paymentDate) {
        errors.paymentDate = 'Payment date is required.';
      }
      if (!form.paymentMode) {
        errors.paymentMode = 'Select a payment mode.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await api.put(`/invoices/${id}`, form);
      navigate(-1);
    } catch (err) {
      setGlobalError('Failed to update payment. Please try again.');
    }
  };

  return (
    <div className="p-4 flex gap-20 items-start relative">
      {invoice && (
        <div className="bg-white rounded-4x p-10">
          <InvoicePreview id={id} />
        </div>
      )}
      <div className="px-10 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl sticky top-5 z-10">
        <h2 className="text-3xl font-bold mb-4">Update Payment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectDropdown
            label="Payment Status"
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={handleChange}
            options={paymentStatusOptions}
            placeholder="Select Payment Status"
            className="w-full"
            hasError={!!fieldErrors.paymentStatus}
            error={fieldErrors.paymentStatus}
          />

          <InputText
            label="Amount Received"
            type="number"
            name="amountReceived"
            value={form.amountReceived}
            handleOnChange={handleChange}
            hasError={!!fieldErrors.amountReceived}
            error={fieldErrors.amountReceived}
            readOnly={form.paymentStatus === 'Paid'}
            disabled={form.paymentStatus === 'Pending'}
          />

          {form.paymentStatus === 'Paid' && (
            <>
              <InputText
                type="date"
                label="Payment Date"
                name="paymentDate"
                value={form.paymentDate}
                handleOnChange={handleChange}
                hasError={!!fieldErrors.paymentDate}
                error={fieldErrors.paymentDate}
              />

              <SelectDropdown
                label="Payment Mode"
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                options={paymentOptions}
                placeholder="Select Payment Mode"
                className="w-full"
                hasError={!!fieldErrors.paymentMode}
                error={fieldErrors.paymentMode}
              />
            </>
          )}

          <InputText
            label="Payment Notes"
            name="paymentNotes"
            value={form.paymentNotes}
            handleOnChange={handleChange}
            hasError={!!fieldErrors.paymentNotes}
            error={fieldErrors.paymentNotes}
            disabled={form.paymentStatus === 'Pending'}
          />

          {globalError && <div className="text-red-600">{globalError}</div>}

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Update Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePayment;
