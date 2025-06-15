import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../common/DataTable';
import InputText from '../common/InputText';
import IconButton from '../common/IconButton';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import LocationDropdowns from '../common/LocationDropdowns';
import { validateRequired } from '../../utils/validators';

const defaultFormData = {
  name: '',
  contactPerson: '',
  contactNumber: '',
  address: '',
  state: '',
  district: '',
  taluka: '',
  city: '',
  isActive: false,
};

const DepartmentsMaster = ({ setMessage, setIsLoading }) => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const ITEMS_PER_PAGE = 5;

  const columns = isModalOpen
    ? [{ header: 'Name', key: 'name' }]
    : [
        { header: 'Name', key: 'name' },
        { header: 'Contact Person', key: 'contactPerson' },
        { header: 'Contact Number', key: 'contactNumber' },
        { header: 'Address', key: 'fullAddress' },
        { header: 'Status', key: 'status' },
      ];

  const filteredData = (data || []).filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/departments', {
        params: { page: currentPage, limit: ITEMS_PER_PAGE },
      });

      const transformedData = (response.data?.data || []).map((item) => ({
        ...item,
        status: item.isActive ? 'Active' : 'Inactive',
        fullAddress: `${item.address}, ${item.city}, ${item.taluka}, ${item.district}, ${item.state}`,
      }));

      setData(transformedData);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Department?')) {
      setIsLoading(true);
      try {
        await api.delete(`/departments/${id}`);
        fetchData();
        setMessage({ type: 'success', text: 'Department deleted successfully' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete Department' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onEdit = async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      setCurrentItem(response.data.data);
      setFormData(response.data.data);
      setIsModalOpen(true);
      setSubmitted(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load Department for editing' });
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateRequired(value) }));
  };

  const onSave = async () => {
    const requiredFields = ['name', 'contactPerson', 'contactNumber', 'state', 'district', 'city', 'address'];
    const errors = {};
    setErrors({});

    requiredFields.forEach((field) => {
      const error = validateRequired(formData[field]);
      if (error) errors[field] = error;
    });

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsLoading(true);
    try {
      if (currentItem?._id) {
        await api.put(`/departments/${currentItem._id}`, formData);
        setMessage({ type: 'success', text: 'Department updated successfully' });
      } else {
        await api.post('/departments', formData);
        setMessage({ type: 'success', text: 'Department added successfully' });
      }

      setIsModalOpen(false);
      setFormData(defaultFormData);
      setCurrentItem(null);
      setSubmitted(false);
      setErrors({});
      fetchData();
    } catch (error) {
      const res = error.response;
      const message =
        res?.data?.error || res?.data?.message || 'Something went wrong.';
      setMessage({ type: 'error', text: message });
      console.error('Failed to save department:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      <div className={`w-full transition-all duration-500 ${isModalOpen ? 'hidden' : ''} 2xl:block`}>
        <div className="flex justify-between gap-10 items-center mb-4">
          <InputText
            placeholder="Search..."
            value={searchTerm}
            handleOnChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-100 w-full"
          />
          <div className="min-w-30 flex justify-end">
            <IconButton
              icon={<FiPlus />}
              label="Add"
              onClick={() => {
                setCurrentItem(null);
                setFormData(defaultFormData);
                setIsModalOpen(true);
              }}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={false}
          onEdit={onEdit}
          onDelete={onDelete}
          emptyMessage="No Departments found"
        />

        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
      </div>

      {/* Modal */}
      <div
        className={`flex justify-center items-start transition-all duration-500 pl-20 ${
          isModalOpen ? 'opacity-100 visible w-full min-w-xl' : 'opacity-0 invisible w-1 h-1'
        }`}
      >
        <div className="rounded-xl w-full max-w-lg relative">
          <h3 className="text-xl font-semibold bg-blue-500 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
            {currentItem ? 'Edit Department' : 'Add New Department'}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData(defaultFormData);
                setCurrentItem(null);
              }}
            >
              <FiX size={24} />
            </button>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="space-y-4 border border-blue-300 p-10 rounded-b-lg"
          >
            <InputText
              type="text"
              label="Name"
              value={formData.name}
              handleOnChange={handleInputChange('name')}
              hasError={errors.name}
            />

            <div className="flex gap-4">
              <InputText
                type="text"
                label="Contact Person"
                value={formData.contactPerson}
                handleOnChange={handleInputChange('contactPerson')}
                hasError={errors.contactPerson}
              />
              <InputText
                type="text"
                label="Contact Number"
                value={formData.contactNumber}
                handleOnChange={handleInputChange('contactNumber')}
                hasError={errors.contactNumber}
              />
            </div>

            <LocationDropdowns
              listStyle="grid"
              onChange={(locationData) => {
                setFormData((prev) => ({ ...prev, ...locationData }));
                const updatedErrors = {};
                Object.keys(locationData).forEach((field) => {
                  updatedErrors[field] = validateRequired(locationData[field]);
                });
                setErrors((prev) => ({ ...prev, ...updatedErrors }));
              }}
              defaultState={formData.state}
              defaultDistrict={formData.district}
              defaultTaluka={formData.taluka}
              defaultCity={formData.city}
              errors={{
                state: errors.state,
                district: errors.district,
                taluka: errors.taluka,
                city: errors.city,
              }}
            />

            <div className="flex gap-4 items-end">
              <InputText
                type="text"
                label="Address"
                value={formData.address}
                handleOnChange={handleInputChange('address')}
                hasError={errors.address}
              />
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 shadow-sm bg-white w-fit">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-gray-700 text-sm cursor-pointer select-none">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData(defaultFormData);
                  setCurrentItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{currentItem ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsMaster;
