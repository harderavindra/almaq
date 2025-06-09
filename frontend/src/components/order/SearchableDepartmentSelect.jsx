import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import api from '../../api/axios';
import LocationDropdowns from '../common/LocationDropdowns';

const SearchableDepartmentSelect = ({ label = 'Department', onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationFilter, setLocationFilter] = useState({
    state: 'Maharashtra',
    district:  '',
    taluka: '',
    city: '',
  });

  const dropdownRef = useRef(null);



  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDepartments();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, locationFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDepartments = async () => {
    try {
      console.log(locationFilter)
      const res = await api.get('/departments/search', {
        params: {
          search: searchTerm,
          ...locationFilter,
        },
      });
      setSuggestions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={dropdownRef}>
      <label className="text-sm font-medium">{label}</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search Department..."
        className="border border-gray-400 h-10 px-3 py-2 rounded-md w-full focus:border-blue-300 focus:outline-0"
        onFocus={() => {setShowDropdown(true);setSearchTerm('')}}
      />

      {showDropdown && (
        <div className="absolute top-[100%] z-10 w-2xl flex bg-white border border-gray-300 rounded-md shadow-lg max-h-[300px] overflow-hidden">
          {/* Suggestions List */}
          <ul className="w-full overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((dept) => (
                <li
                  key={dept._id}
                  onClick={() => {
                    onChange(dept._id, dept);
                    setSearchTerm(dept.name);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-l-4 border-white hover:border-blue-500 flex items-start gap-2"
                >
                  <FiMapPin size={18} className="text-gray-500 w-4 mt-1"  />
                <p className='w-full'>  {dept.name}, {dept.district}</p>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500 italic">No results</li>
            )}
          </ul>

          {/* Location Filter */}
          <div className="border-l border-gray-200 px-4 py-2 min-w-[220px] bg-gray-50">
            <LocationDropdowns
              className=""
              onChange={(locationData) => {
                setLocationFilter(locationData);
              }}
              defaultState={locationFilter.state}
             
              showCityInput={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDepartmentSelect;
