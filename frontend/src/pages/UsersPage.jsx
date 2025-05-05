import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import UserCard from '../components/user/UserCard';
import { useToast } from '../context/ToastContext';
import LoaderSpinner from '../components/common/LoaderSpinner';
import SearchInput from '../components/common/SearchInput';
import { Link } from 'react-router-dom';
import ProfilePage from '../components/user/ProfilePage';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null)

  const { showToast } = useToast();

  const handleClick = () => {
    showToast('User created successfully!', 'success');
  };


  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get('/auth/users', {
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to page 1 on search
  };

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


  return (
    <div className="py-4 px-10 min-h-screen  w-full ">
      <div className="flex bg-white rounded-3xl border border-gray-200 min-h-screen">

        <div className="mb-4 flex flex-col w-full py-5 gap-7">
          <div className='p-5'>
          <SearchInput
            value={search}
            onDebouncedChange={handleDebouncedSearch}
            placeholder="Search by name or email"
          />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <LoaderSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div  className="flex flex-col w-full">
              <div className="flex flex-col w-full">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {


                      setSelectedUser(user._id);


                    }}
                    className="cursor-pointer"
                  >
                    <UserCard user={user} />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="font-semibold">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>



            </div>
          )}
        
        </div>
        {selectedUser && (
            <div id="profile-section" className="mt-10 w-full ">
              <ProfilePage userId={selectedUser} />
            </div>
          )}
      </div>
    </div>
  );
};

export default UsersPage;
