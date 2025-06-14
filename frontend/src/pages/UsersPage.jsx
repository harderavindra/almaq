import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import UserCard from '../components/user/UserCard';
import { useToast } from '../context/ToastContext';
import LoaderSpinner from '../components/common/LoaderSpinner';
import SearchInput from '../components/common/SearchInput';
import { Link } from 'react-router-dom';
import ProfilePage from '../components/user/ProfilePage';
import IconButton from '../components/common/IconButton';
import { FiPlus } from 'react-icons/fi';
import RegisterUserForm from '../components/user/RegisterUserForm';
import Pagination from '../components/Pagination';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null)
  const [sidePanel, setSidePanel] = useState(false)
  const { showToast } = useToast();



  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/auth/users', {
        params: { page, limit: 3, search }
      });

      setUsers(data.users);
      console.log(data.users)
      setTotalPages(data.totalPages);

      showToast('Users fetched successfully!', 'success');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Error fetching users. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const handleDebouncedSearch = (debouncedValue) => {
    if (search !== debouncedValue) {
      setSearch(debouncedValue);
      if (page !== 1) setPage(1);
    }
  };
  const handelUserRegister = () => {
   
  }


  return (
    <div className="py-4 px-10 min-h-screen  w-full ">
      <div className="flex bg-white rounded-3xl border border-gray-200 min-h-screen">

        <div className="mb-4 flex flex-col w-full py-5 gap-7">
          <div className='p-5 gap-2 flex justify-between items-center'>
          <SearchInput
            name="search"
            value={search}

            onDebouncedChange={handleDebouncedSearch}
            placeholder="Search by name or email"
          />
          <IconButton icon={<FiPlus />}  label='' onClick={()=>setSidePanel('register')} />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <LoaderSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div  className="flex flex-col w-full">
              <div className={`flex flex-col w-full justify-between px-5`}>
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {


                      setSelectedUser(user._id);
                      setSidePanel('profile')


                    }}
                    className={`${user._id === selectedUser ? 'bg-gray-50 border border-gray-300' : ''} cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition duration-200 ease-in-out rounded-lg p-4 mb-4`}
                  >
                    <UserCard user={user} />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={handlePageChange}
  />
</div>
            </div>
          )}
        
        </div>

        {sidePanel === "profile"  && (
          <div className="px-5 py-10 min-w-lg">
            <div id="profile-section" className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-gray-300 ">
              <ProfilePage userId={selectedUser} onUserUpdated={fetchUsers}  onClose={()=>setSelectedUser('')} />
            </div>
            </div>
          )}
          {sidePanel === "register" && (
              <div className="px-5 py-10 min-w-lg">
            <div id="profile-section" className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-gray-300 ">
              <RegisterUserForm onClose={()=>setSidePanel('')} onUserRegistered={handelUserRegister} />
            </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default UsersPage;
