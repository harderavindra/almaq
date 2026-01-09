import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable'; 
import InputText from '../../components/common/InputText'; 
import IconButton from '../../components/common/IconButton'; 
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import LocationDropdowns from '../../components/common/LocationDropdowns';
import SelectDropdown from '../../components/common/SelectDropdown';
import { validateRequired } from '../../utils/validators';

const ContactMaster = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ text: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [locationFilter, setLocationFilter] = useState({});
    const [errors, setErrors] = useState({});

    const ITEMS_PER_PAGE = 20;

    const columns = [
        { header: 'Name', key: 'firstName, lastName' },
        { header: 'Mobile', key: 'mobile' },
        { header: 'Email', key: 'email' },
        { header: 'Category', key: 'category' },
    ];

    // Debounce Search Input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch Contacts
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/contacts', {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: debouncedSearchTerm,
                    ...locationFilter
                }
            });

            setData(response.data.data || []);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            const res = error.response;
            if (res?.data?.message) {
                setShowMessage({ type: 'error', text: res.data.message });
            } else {
                setShowMessage({ type: 'error', text: 'Failed to fetch contacts' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, debouncedSearchTerm, locationFilter]);

    // Handle Input Change
    const handleInputChange = (field) => (e) => {
        const value = e.target.value;

        setFormData((prev) => ({ ...prev, [field]: value }));

        setErrors((prev) => ({
            ...prev,
            [field]: validateRequired(value)
        }));
    };

    // Delete Contact
    const onDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;

        setIsLoading(true);
        try {
            await api.delete(`/contacts/${id}`);
            fetchData();
            setShowMessage({ type: 'success', text: 'Contact deleted successfully' });
        } catch {
            setShowMessage({ type: 'error', text: 'Failed to delete contact' });
        } finally {
            setIsLoading(false);
        }
    };

    // Edit Contact
  const onEdit = async (id) => {
    try {
        const response = await api.get(`/contacts/${id}`);
        const contact = response.data.data;

        setCurrentItem(contact);

        // Flatten address fields
        setFormData({
            ...contact,
            state: contact.address?.state || "",
            district: contact.address?.district || "",
            taluka: contact.address?.taluka || "",
            city: contact.address?.city || "",
            address: contact.address?.address || "",
        });

        setIsModalOpen(true);
    } catch {
        setShowMessage({ type: 'error', text: 'Failed to load contact for editing' });
    }
};


   const onSave = async () => {
    const requiredFields = ['firstName', 'mobile'];
    const validationErrors = {};

    setErrors({});

    requiredFields.forEach((field) => {
        const error = validateRequired(formData[field]);
        if (error) validationErrors[field] = error;
    });

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
        setShowMessage({ type: 'error', text: 'Please fill required fields.' });
        return;
    }

    // Build the correct payload
    const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        email: formData.email,
        category: formData.category,

        address: {
            state: formData.state,
            district: formData.district,
            taluka: formData.taluka,
            city: formData.city,
            address: formData.address,
        },
    };

    try {
        if (currentItem?._id) {
            await api.put(`/contacts/${currentItem._id}`, payload);
            setShowMessage({ type: 'success', text: 'Contact updated successfully' });
        } else {
            await api.post('/contacts', payload);
            setShowMessage({ type: 'success', text: 'Contact added successfully' });
        }

        setIsModalOpen(false);
        setFormData({});
        setCurrentItem(null);
        fetchData();
    } catch {
        setShowMessage({ type: 'error', text: 'Failed to save contact' });
    }
};


    return (
        <div className="flex flex-col md:flex-row w-full">
            <div className="w-full transition-all duration-500">
                <div className="flex justify-between gap-10 items-center mb-4">
                    <div className="flex gap-4 items-end">
                        <InputText
                            placeholder="Search..."
                            value={searchTerm}
                            handleOnChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="max-w-xs mt-1"
                        />

                        {/* Location Filter (Optional) */}
                        <LocationDropdowns
                            onChange={(loc) => {
                                setLocationFilter(loc);
                                setCurrentPage(1);
                            }}
                            defaultState={locationFilter.state}
                            showCityInput={false}
                            hideLabel={true}
                        />

                        {(searchTerm || Object.keys(locationFilter).length > 0) && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setLocationFilter({});
                                    setCurrentPage(1);
                                }}
                                className="h-10"
                            >
                                <FiX />
                            </Button>
                        )}
                    </div>

                    <IconButton
                        icon={<FiPlus />}
                        label="Add Contact"
                        onClick={() => {
                            setCurrentItem(null);
                            setFormData({});
                            setIsModalOpen(true);
                        }}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    emptyMessage="No contacts found"
                />

                <Pagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    totalPages={totalPages}
                />
            </div>

            {/* Modal */}
            <div className={`flex justify-center items-start transition-all duration-500 pl-20 ${isModalOpen ? 'opacity-100 visible w-full' : 'opacity-0 invisible w-1 h-1'}`}>
                <div className="rounded-xl w-full max-w-lg relative">
                    <h3 className="text-xl font-semibold bg-blue-500 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                        {currentItem ? 'Edit Contact' : 'Add Contact'}
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setFormData({});
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
                        <div className="grid grid-cols-2 gap-4">

                            <InputText
                                type="text"
                                label="First Name"
                                value={formData.firstName || ''}
                                handleOnChange={handleInputChange('firstName')}
                                hasError={errors.firstName}
                            />

                            <InputText
                                type="text"
                                label="Last Name"
                                value={formData.lastName || ''}
                                handleOnChange={handleInputChange('lastName')}
                                hasError={errors.lastName}
                            />

                            <InputText
                                type="text"
                                label="Mobile"
                                value={formData.mobile || ''}
                                handleOnChange={handleInputChange('mobile')}
                                hasError={errors.mobile}
                            />

                            <InputText
                                type="text"
                                label="Email"
                                value={formData.email || ''}
                                handleOnChange={handleInputChange('email')}
                            />

                            <InputText
                                type="text"
                                label="Category"
                                value={formData.category || ''}
                                handleOnChange={handleInputChange('category')}
                            />
                        </div>

                       <LocationDropdowns
    onChange={(locationData) =>
        setFormData((prev) => ({
            ...prev,
            ...locationData,
        }))
    }
    defaultState={formData.state}
    defaultDistrict={formData.district}
    defaultTaluka={formData.taluka}
    defaultCity={formData.city}
/>
<InputText
    label="Address Line"
    type="text"
    value={formData.address || ''}
    handleOnChange={handleInputChange('address')}
/>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setFormData({});
                                    setCurrentItem(null);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button type="submit">
                                {currentItem ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactMaster;
