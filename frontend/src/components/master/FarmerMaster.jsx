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

const FarmerMaster = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ text: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [locationFilter, setLocationFilter] = useState({});


    const ITEMS_PER_PAGE = 2;

    const columns = isModalOpen
        ? [
            { header: 'First Name', key: 'firstName, lastName, name' },
            { header: 'Contact', key: 'contactNumber' },
        ]
        : [
            { header: 'Name', key: 'firstName, lastName' },
            { header: 'Contact', key: 'contactNumber' },
            { header: 'Address', key: 'address, city, taluka, district, state' }
        ];

    const filteredData = (data || []).filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, [currentPage, , searchTerm, locationFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/farmers', {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: searchTerm,
                    ...locationFilter
                }
            });
            console.log('Farmers:', response.data);
            setData(response.data?.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to fetch data' });
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async id => {
        if (window.confirm('Are you sure you want to delete this farmer?')) {
            setIsLoading(true);
            try {
                await api.delete(`/farmers/${id}`);
                fetchData();
                setShowMessage({ type: 'success', text: 'Farmer deleted successfully' });
            } catch (error) {
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
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to load farmer for editing' });
        }
    };

    const onSave = async () => {

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
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to save farmer' });
        }
    };

    return (
        <>
            {showMessage.text && (
                <div
                    className={`mb-4 p-2 rounded ${showMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                >
                    {showMessage.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row w-full ">


                <div className="w-full transition-all duration-500">
                    <div className="flex justify-between gap-10 items-center mb-4 ">
                        <div className='flex gap-4'>
                            <InputText
                                placeholder="Search..."
                                value={searchTerm}
                                handleOnChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-xs mt-1"
                            />
                            <LocationDropdowns
                                onChange={(locationData) => {
                                    setLocationFilter(locationData);
                                    setCurrentPage(1); // reset to first page
                                }}
                                defaultState={locationFilter.state}
                                showCityInput={false}
                                className='flex-row min-w-lg'
                                hideLabel={true}
                            />
                        </div>
                        <IconButton
                            icon={<FiPlus />}
                            label="Add Farmer"
                            onClick={() => {
                                setCurrentItem(null);
                                setFormData({});
                                setIsModalOpen(true);
                            }}
                        />
                    </div>


                    <DataTable
                        columns={columns}
                        data={filteredData}
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
                <div
                    className={` flex justify-center items-start  transition-all duration-500 pl-20 ${isModalOpen ? 'opacity-100 visible w-full' : 'opacity-0 invisible w-1 h-1'
                        }`}
                >
                    <div className="  rounded-xl w-full max-w-lg relative">
                        <h3 className="text-xl font-semibold  bg-blue-500 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                            {currentItem ? 'Edit Farmer' : 'Add New Farmer'}
                            <button
                                type="button"
                                variant='outline'
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
                            <InputText
                                type="text"
                                label="First Name"
                                value={formData.firstName || ''}
                                handleOnChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <InputText
                                type="text"
                                label="Last Name"
                                value={formData.lastName || ''}
                                handleOnChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <SelectDropdown name={'gender'} label={'Gender'}
                                options={['male', 'female', 'Other'].map(gender => ({

                                    label: gender,
                                    value: gender
                                })

                                )}
                                value={formData.gender || ''}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                placeholder="Select Gender"
                                className='w-full'
                            />
                            <InputText
                                type="text"
                                label="Contact Number"
                                value={formData.contactNumber || ''}
                                handleOnChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                required
                            />
                            <LocationDropdowns
                                onChange={(locationData) => {
                                    console.log('Location Data:', locationData);
                                    setFormData((prev) => ({
                                        ...prev,
                                        ...locationData // Directly updates state, district, taluka, city
                                    }));
                                }}
                                defaultState={formData.state}
                                defaultDistrict={formData.district}
                                defaultTaluka={formData.taluka}
                                defaultCity={formData.city}
                            />
                            {formData.district}                  <InputText label="Address Line" autoComplete={"Address line"}
                                type="text"
                                value={formData.address || ''}
                                handleOnChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            <InputText
                                type="text"
                                label="Identification Number "
                                value={formData.idNumber || ''}
                                handleOnChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                required
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant='outline'
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({});
                                        setCurrentItem(null);
                                    }}

                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"

                                >
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
