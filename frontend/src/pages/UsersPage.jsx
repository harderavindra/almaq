import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import UserCard from '../components/user/UserCard';
import { useToast } from '../context/ToastContext';
import LoaderSpinner from '../components/common/LoaderSpinner';
import SearchInput from '../components/common/SearchInput';
import { Link } from 'react-router-dom';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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
    <div className="p-4">
        
      <div className="mb-4 flex justify-between items-center">

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
                    <Link to={`/users/${user._id}`} key={user._id}>

              <UserCard key={user._id} user={user} />
              </Link>
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
        </>
      )}
    </div>
  );
};

export default UsersPage;
