import { FiCheck, FiClock, FiCheckSquare, FiClipboard, FiThumbsUp, FiTrash2, FiHelpCircle, FiTruck, FiXCircle } from 'react-icons/fi';

 const STATUS_ICONS = {
  // Order statuses
  Draft: FiClipboard,
  Submitted: FiClock,
  Approved: FiCheckSquare,
  Delivered: FiThumbsUp,
  Cancelled: FiTrash2,

  // Challan statuses
  Issued: FiTruck,
  Returned: FiXCircle, // Example additional status if needed
};

const COLORS = {
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  white: '#FFFFFF',
  black: '#000000',
};

export const OrderStatusIcon = ({ status, size = '20', color = '' }) => {
  const IconComponent = STATUS_ICONS[status] || FiHelpCircle;
  return <IconComponent size={size} color={COLORS[color] || color} />;
};


export const locationData = {
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
        "Gadchiroli": ["Aheri", "Armori", "Bhamragad", "Chamorshi", "Dhanora", "Etapalli", "Gadchiroli", "Korchi", "Kurkheda", "Mulchera", "Sironcha"]
    }
};