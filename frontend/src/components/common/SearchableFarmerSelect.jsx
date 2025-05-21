import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
const SearchableFarmerSelect = ({ label = 'Farmer', onChange, onAddNewFarmer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await api.get('/farmers/latest', {
          params: { search: searchTerm }
        });
        setSuggestions(res.data);
      
      } catch (err) {
        console.error('Error fetching farmers:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchFarmers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search Farmer..."
        className="border px-3 py-2 rounded w-full"
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow max-h-60 overflow-y-auto">
          {suggestions.map((farmer) => (
            <li
              key={farmer._id}
              onClick={() => {
                onChange(farmer._id);
                setSearchTerm(farmer.name);
                setShowDropdown(false);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {farmer.name}
            </li>
          ))}
          <li
            onClick={() => {
              setSearchTerm('');
              onAddNewFarmer();
              setShowDropdown(false);
            }}
            className="px-4 py-2 text-blue-600 cursor-pointer hover:bg-gray-100"
          >
            ➕ Add New Farmer
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchableFarmerSelect;
