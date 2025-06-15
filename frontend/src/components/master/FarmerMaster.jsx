import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../common/DataTable';
import InputText from '../common/InputText';
import IconButton from '../common/IconButton';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import LocationDropdowns from '../common/LocationDropdowns';
import SelectDropdown from '../common/SelectDropdown';
import { validateRequired } from '../../utils/validators';

const FarmerMaster = () => {
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
    const [errors, setErrors] = useState({})

    const ITEMS_PER_PAGE = 20;

    const columns = isModalOpen
        ? [
            { header: 'First Name', key: 'firstName, lastName' },
            { header: 'Contact', key: 'contactNumber' }
        ]
        : [
            { header: 'Name', key: 'firstName, lastName' },
            { header: 'Contact', key: 'contactNumber' },
            { header: 'Address', key: 'address, city, taluka, district, state' }
        ];

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/farmers', {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: debouncedSearchTerm,
                    ...locationFilter
                }
            });
            setData(response.data?.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            const res = error.response;
            if (res?.status === 400 && res.data?.errors) {
                setShowMessage({ type: 'error', text: res.data.errors.join(', ') });
            } else if (res?.data?.message) {
                setShowMessage({ type: 'error', text: res.data.message });
            } else {
                setShowMessage({ type: 'error', text: 'Failed to fetch farmers' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, debouncedSearchTerm, locationFilter]);
 const handleInputChange = (field) => (e) => {
        const value = e.target.value;

        // Update form data
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Update error for that field
        setErrors((prev) => ({
            ...prev,
            [field]: validateRequired(value),
        }));
    };
    const onDelete = async id => {
        if (window.confirm('Are you sure you want to delete this farmer?')) {
            setIsLoading(true);
            try {
                await api.delete(`/farmers/${id}`);
                fetchData();
                setShowMessage({ type: 'success', text: 'Farmer deleted successfully' });
            } catch {
                setShowMessage({ type: 'error', text: 'Failed to delete farmer' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const onEdit = async id => {
        try {
            const response = await api.get(`/farmers/${id}`);
            setCurrentItem(response.data.data);
            setFormData(response.data.data);
            setIsModalOpen(true);
        } catch {
            setShowMessage({ type: 'error', text: 'Failed to load farmer for editing' });
        }
    };

    const onSave = async () => {
         const requiredFields = ['firstName', 'lastName', 'gender','contactNumber', 'state', 'district',  'taluka', 'city', 'idNumber', 'address'];
                const errors = {};
        
                // Clear previous errors
                setErrors({});
        
        
        
                requiredFields.forEach((field) => {
                    const error = validateRequired(formData[field]);
                    if (error) {
                        errors[field] = error;
                    }
                });
        
                setErrors(errors);
        
                if (Object.keys(errors).length > 0) {
                    setShowMessage({ type: 'error', text: 'Please fill in all required fields.' });
                    console.warn('Validation errors:', errors);
                    return;
                }
        try {
            if (currentItem?._id) {
                await api.put(`/farmers/${currentItem._id}`, formData);
                setShowMessage({ type: 'success', text: 'Farmer updated successfully' });
            } else {
                await api.post('/farmers', formData);
                setShowMessage({ type: 'success', text: 'Farmer added successfully' });
            }
            setIsModalOpen(false);
            setFormData({});
            setCurrentItem(null);
            fetchData();
        } catch {
            setShowMessage({ type: 'error', text: 'Failed to save farmer' });
        }
    };

    return (
        <>
           

            <div className="flex flex-col md:flex-row w-full">
                <div className="w-full transition-all duration-500">
                    <div className="flex justify-between gap-10 items-center mb-4">
                        <div className="flex gap-4 items-end">
                            <InputText
                                placeholder="Search..."
                                value={searchTerm}
                                handleOnChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // reset page
                                }}
                                className="max-w-xs mt-1"
                            />

                            {!isModalOpen && (
                                <LocationDropdowns
                                    onChange={(locationData) => {
                                        setLocationFilter(locationData);
                                        setCurrentPage(1); // reset page
                                    }}
                                    defaultState={locationFilter.state}
                                    showCityInput={false}
                                    className="flex-row min-w-lg"
                                    hideLabel={true}
                                />
                            )}
                            {(searchTerm || Object.keys(locationFilter).length > 0) && (

                                <div className='w-12 '>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setLocationFilter({});
                                            setCurrentPage(1);
                                        }}
                                        className={'h-10'}
                                    >
                                        <FiX />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <IconButton
                            icon={<FiPlus />}
                            label="Add"
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
                        emptyMessage="No farmers found"
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
                            {currentItem ? 'Edit Farmer' : 'Add New Farmer'}
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
                                <SelectDropdown
                                    name="gender"
                                    label="Gender"
                                    options={['male', 'female', 'Other'].map(gender => ({ label: gender, value: gender }))}
                                    value={formData.gender || ''}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    placeholder="Select Gender"
                                    className="w-full"
                                    hasError={errors.gender}
                                />
                                <InputText
                                    type="text"
                                    label="Contact Number"
                                    value={formData.contactNumber || ''}
                                    handleOnChange={handleInputChange('contactNumber')}
                                    hasError={errors.contactNumber}

                                />
                            </div>

                            <LocationDropdowns
                                onChange={(locationData) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        ...locationData
                                    }))
                                }
                                defaultState={formData.state}
                                defaultDistrict={formData.district}
                                defaultTaluka={formData.taluka}
                                defaultCity={formData.city}
                                listStyle="grid"
                                 errors={{
                                    state: errors.state ,
                                    district:errors.district,
                                    taluka:  errors.taluka ,
                                    city:  errors.city ,
                                }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <InputText
                                    label="Address Line"
                                    type="text"
                                    value={formData.address || ''}
                                    handleOnChange={handleInputChange('address')}
                                    hasError={errors.address}

                                />
                                <InputText
                                    type="text"
                                    label="Identification Number"
                                    value={formData.idNumber || ''}
                                    handleOnChange={handleInputChange('idNumber')}
                                    hasError={errors.idNumber}
                                />
                            </div>

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
        </>
    );
};

export default FarmerMaster;
