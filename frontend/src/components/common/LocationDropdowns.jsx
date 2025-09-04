// LocationDropdowns.js
import React, { useState, useEffect } from 'react';
import SelectDropdown from './SelectDropdown'; // Adjust path as needed
import InputText from './InputText';

// Constant location data
const locationData = {
    Maharashtra: {
        "Ahmednagar": ["Akole", "Jamkhed", "Karjat", "Kopargaon", "Nagar", "Nevasa", "Parner", "Pathardi", "Rahata", "Rahuri", "Sangamner", "Shrigonda", "Shevgaon", "Shrirampur"],
        "Pune": ["Ambegaon", "Baramati", "Bhor", "Daund", "Haveli", "Indapur", "Junnar", "Khed", "Mulshi", "Maval", "Purandar", "Shirur", "Velhe"],
        "Mumbai City": ["Mumbai City"],
        "Mumbai Suburban": ["Andheri", "Borivali", "Kurla"],
        "Thane": ["Ambernath", "Bhiwandi", "Kalyan", "Murbad", "Shahapur", "Thane", "Ulhasnagar", "Vada"],
        "Nagpur": ["Nagpur", "Hingna", "Kamptee", "Narkhed", "Ramtek", "Katol", "Parseoni", "Saoner", "Kalmeshwar", "Bhiwapur", "Umred", "Kuhi"],
        "Nashik": ["Baglan", "Chandvad", "Deola", "Dindori", "Igatpuri", "Malegaon", "Nandgaon", "Nashik", "Peint", "Sinnar", "Trimbakeshwar", "Yeola"],
        "Aurangabad": ["Aurangabad", "Kannad", "Soegaon", "Vaijapur", "Sillod", "Gangapur", "Paithan", "Khultabad"],
        "Solapur": ["Akkalkot", "Barshi", "Karmala", "Madha", "Malshiras", "Mangalvedhe", "Mohol", "Pandharpur", "Sangola", "Solapur North", "Solapur South"],
        "Satara": ["Jaoli", "Khandala", "Khatav", "Koregaon", "Mahabaleshwar", "Man", "Patan", "Phaltan", "Satara", "Wai"],
        "Kolhapur": ["Ajara", "Bhudargad", "Chandgad", "Gadhinglaj", "Hatkanangle", "Kagal", "Karveer", "Panhala", "Radhanagari", "Shahuwadi"],
        "Sangli": ["Atpadi", "Jat", "Kadegaon", "Kavathe Mahankal", "Khanapur", "Miraj", "Palus", "Shirala", "Tasgaon", "Walwa"],
        "Amravati": ["Achalpur", "Anjangaon Surji", "Chandur Bazar", "Chandur Railway", "Daryapur", "Dhamangaon", "Morshi", "Nandgaon Khandeshwar", "Teosa", "Warud"],
        "Yavatmal": ["Arni", "Babulgaon", "Darwha", "Digras", "Ghatanji", "Kalamb", "Kelapur", "Mahagaon", "Maregaon", "Ner", "Pandharkawada", "Pusad", "Ralegaon", "Umarkhed", "Wani", "Yavatmal"],
        "Latur": ["Ahmedpur", "Ausa", "Chakur", "Deoni", "Jalkot", "Latur", "Nilanga", "Renapur", "Shirur Anantpal", "Udgir"],
        "Osmanabad": ["Bhoom", "Kalamb", "Lohara", "Osmanabad", "Paranda", "Tuljapur", "Umarga", "Vashi"],
        "Nanded": ["Ardhapur", "Bhokar", "Biloli", "Deglur", "Dharmabad", "Hadgaon", "Himayatnagar", "Kinwat", "Loha", "Mahur", "Mudkhed", "Mukhed", "Nanded"],
        "Beed": ["Ambajogai", "Ashti", "Beed", "Dharur", "Georai", "Kaij", "Majalgaon", "Parli", "Patoda", "Shirur", "Wadvani"],
        "Parbhani": ["Gangakhed", "Jintur", "Manwath", "Palam", "Parbhani", "Pathri", "Purna", "Sailu", "Sonpeth"],
        "Hingoli": ["Aundha", "Basmath", "Hingoli", "Kalamnuri", "Sengaon"],
        "Jalna": ["Ambad", "Bhokardan", "Badnapur", "Ghansawangi", "Jafrabad", "Jalna", "Mantha", "Partur"],
        "Dhule": ["Dhule", "Sakri", "Shirpur", "Sindkheda"],
        "Nandurbar": ["Akkalkuwa", "Akrani", "Nandurbar", "Nawapur", "Shahada", "Taloda"],
        "Jalgaon": ["Amalner", "Bhadgaon", "Bhusawal", "Bodwad", "Chalisgaon", "Chopda", "Dharangaon", "Erandol", "Jalgaon", "Jamner", "Muktainagar", "Pachora", "Parola", "Raver", "Yawal"],
        "Raigad": ["Alibag", "Karjat", "Khalapur", "Mahad", "Mangaon", "Mhasla", "Murud", "Panvel", "Pen", "Poladpur", "Roha", "Shrivardhan", "Sudhagad", "Tala", "Uran"],
        "Ratnagiri": ["Chiplun", "Dapoli", "Guhagar", "Khed", "Lanja", "Mandangad", "Rajapur", "Ratnagiri", "Sangameshwar"],
        "Sindhudurg": ["Devgad", "Dodamarg", "Kankavli", "Kudal", "Malvan", "Sawantwadi", "Vaibhavwadi", "Vengurla", "Sindhudurg"],
        "Wardha": ["Arvi", "Ashti", "Deoli", "Hinganghat", "Karanja", "Samudrapur", "Seloo", "Wardha"],
        "Gondia": ["Amgaon", "Arjuni Morgaon", "Deori", "Gondia", "Goregaon", "Sadak Arjuni", "Salekasa", "Tirora"],
        "Bhandara": ["Bhandara", "Lakhandur", "Lakhani", "Mohadi", "Pauni", "Sakoli", "Tumsar"],
        "Chandrapur": ["Ballarpur", "Bhadravati", "Brahmapuri", "Chandrapur", "Chimur", "Gondpipri", "Mul", "Nagbhid", "Pombhurna", "Rajura", "Saoli", "Sindewahi", "Warora"],
        "Gadchiroli": ["Aheri", "Armori", "Bhamragad", "Chamorshi", "Dhanora", "Etapalli", "Gadchiroli", "Korchi", "Kurkheda", "Mulchera", "Sironcha"],
        "Palghar": ["Vikramgad","Jawhar", "Dahanu", "Palghar", "Vasai", "Mokhada", "Talasari","Wada","kolgaon"]

    }
};

const LocationDropdowns = ({
  onChange,
  defaultState = '',
  defaultDistrict = '',
  defaultTaluka = '',
  defaultCity = '',
  className = '',
  showCityInput = true,
  hideLabel = false,
  listStyle = 'flex',
  errors = {}
}) => {
  const [selectedState, setSelectedState] = useState(defaultState);
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [selectedTaluka, setSelectedTaluka] = useState(defaultTaluka);
  const [selectedCity, setSelectedCity] = useState(defaultCity);

  const listClass = listStyle === 'flex' ? 'flex flex-col' : 'grid grid-cols-2';

  useEffect(() => {
    setSelectedState(defaultState);
    setSelectedDistrict(defaultDistrict);
    setSelectedTaluka(defaultTaluka);
    setSelectedCity(defaultCity);
  }, [defaultState, defaultDistrict, defaultTaluka, defaultCity]);

  useEffect(() => {
    onChange({
      state: selectedState,
      district: selectedDistrict,
      taluka: selectedTaluka,
      city: selectedCity,
    });
  }, [selectedState, selectedDistrict, selectedTaluka, selectedCity]);

  const stateOptions = Object.keys(locationData).map((state) => ({
    label: state,
    value: state,
  }));

  const districtOptions = selectedState && locationData[selectedState]
    ? Object.keys(locationData[selectedState]).map((district) => ({
        label: district,
        value: district,
      }))
    : [];

  const talukaOptions = selectedState &&
    selectedDistrict &&
    locationData[selectedState] &&
    locationData[selectedState][selectedDistrict]
    ? locationData[selectedState][selectedDistrict].map((taluka) => ({
        label: taluka,
        value: taluka,
      }))
    : [];

  return (
    <div className={`${listClass} gap-3 ${className} w-full `}>
      <SelectDropdown
        label={hideLabel ? '' : 'State'}
        value={selectedState}
        onChange={(e) => {
          setSelectedState(e.target.value);
          setSelectedDistrict('');
          setSelectedTaluka('');
        }}
        options={stateOptions}
        placeholder="Select State"
        className="w-full "
        hasError={errors.state}
      />
  
      {selectedState && (
        <SelectDropdown
          label={hideLabel ? '' : 'District'}
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setSelectedTaluka('');
          }}
          options={districtOptions}
          placeholder="Select District"
          className="w-full"
          hasError={errors.district}
        />
      )}

      {selectedDistrict && (
        <SelectDropdown
          label={hideLabel ? '' : 'Taluka'}
          value={selectedTaluka}
          onChange={(e) => setSelectedTaluka(e.target.value)}
          options={talukaOptions}
          placeholder="Select Taluka"
          className="w-full"
          hasError={errors.taluka}
        />
      )}

      {showCityInput && (
        <InputText
          label={hideLabel ? '' : 'City/Village'}
          name="city"
          placeholder="Enter City or Village"
          handleOnChange={(e) => setSelectedCity(e.target.value)}
          value={selectedCity}
          className="w-full"
          hasError={errors.city}
        />
      )}
    </div>
  );
};

export default LocationDropdowns;