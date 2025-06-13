import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import SelectDropdown from './SelectDropdown';
import LocationDropdowns from './LocationDropdowns';
import { FiPlus, FiUser } from 'react-icons/fi';
const SearchableFarmerSelect = ({ label = 'Farmer', onChange, onAddNewFarmer, district, taluka,disabled }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [locationFilter, setLocationFilter] = useState({
    state: 'Maharashtra',
    district: district,
    taluka: taluka,
    city: '',
  });
  const dropdownRef = useRef(null);
  const fetchFarmers = async () => {
    try {
      const res = await api.get('/farmers/latest', {
        params: {
          search: searchTerm,
          state: locationFilter.state,
          district: locationFilter.district,
          taluka: locationFilter.taluka,
          city: locationFilter.city,
        }
      });
      setSuggestions(res.data.data);
        console.log("res2", locationFilter.taluka)

    } catch (err) {
      console.error('Error fetching farmers:', err);
    }
  };
  useEffect(() => {


    const delayDebounce = setTimeout(() => {
      fetchFarmers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, locationFilter, district]);
  useEffect(() => {
    setLocationFilter(prev => ({
      ...prev,
      district: district || '',
      taluka: taluka || '',
    }));
  }, [district, taluka]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown2(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFarmers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, locationFilter]); // ← added locationFilter

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={dropdownRef}>
      <label className="">{label}</label>
      <input
        type="text"
        value={searchTerm}
        
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search Farmer..."
        className={`border border-gray-400 h-10 px-3 py-2 rounded-md w-full focus:border-blue-300 focus:outline-0 ${disabled? 'opacity-10':''}`}
        onFocus={() => {setShowDropdown2(true); setSearchTerm('');}}
        disabled={disabled}
      />
      {
        showDropdown2 && (


          <div className="absolute  min-w-sm bottom-[42px] z-10 w-xl p-0 bg-white border border-gray-300 rounded-md mt-1  shadow-lg max-h-md overflow-y-auto flex items-end">
  
            {showDropdown2 && suggestions.length > 0 ? (

              <ul className="w-full max-h-80 overflow-auto ">
                {suggestions.map((farmer, i) => (
                  <li
                    key={farmer._id}
                   
                    onClick={() => {
                      onChange(farmer._id);
                      setSearchTerm(farmer.firstName);
                      setShowDropdown2(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-l-4 border-white hover:border-blue-500 flex items-center gap-2"
                  >
                   {i+1} <FiUser className='text-gray-600' /> {farmer.firstName} {farmer.lastName}, {farmer.district}
                  </li>
                ))}

              </ul>
            ) : (<div className='w-full flex-1 h-full flex justify-center items-center pb-5'>
              <p>No farmer found</p></div>)
            }
            <div className='flex flex-col  border-l border-gray-200 px-5 py-2 min-w-50 min-full'>
              {/* <button
                onClick={() => {
                  setSearchTerm('');
                  onAddNewFarmer();
                  navigate('/master/farmers');
                }}
                className="px-4 py-1 bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-100 flex items-center gap-3 rounded-md mb-2 w-full"
              >
                <FiPlus /> Add New
              </button> */}
              <LocationDropdowns
                className={''}
                onChange={(locationData) => {
                  setLocationFilter(locationData); // ← Update state for filtering
                }}
                defaultState={locationFilter.state}
                defaultDistrict={locationFilter.district}
                defaultTaluka={locationFilter.taluka}
                defaultCity={locationFilter.city}
                showCityInput={false}
              />
            </div>
          </div>
        )
      }

    </div>
  );
};

export default SearchableFarmerSelect;
