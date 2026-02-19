'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';

export default function UsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    type: 'delete' | 'reset' | null;
    userId: number | null;
    username: string;
  }>({
    show: false,
    type: null,
    userId: null,
    username: '',
  });
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  // Only Admin can view user management
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Check if filters are applied to show list
  const shouldShowList = search.trim() !== '' || roleFilter !== '';

  useEffect(() => {
    if (shouldShowList) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [search, roleFilter]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDialog.userId) return;

    try {
      const response = await fetch(`/api/users/${confirmDialog.userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          show: true,
          type: 'success',
          message: 'User deleted successfully',
        });
        fetchUsers(); // Refresh the list
      } else {
        setToast({
          show: true,
          type: 'error',
          message: data.message || 'Failed to delete user',
        });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'An error occurred while deleting the user',
      });
    } finally {
      setConfirmDialog({ show: false, type: null, userId: null, username: '' });
    }
  };

  const handleResetPassword = async () => {
    if (!confirmDialog.userId) return;

    try {
      const response = await fetch(`/api/users/${confirmDialog.userId}/reset-password`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.emailSent) {
          setToast({
            show: true,
            type: 'success',
            message: `Password reset successfully! New credentials sent to: ${data.data.email}`,
          });
        } else {
          setToast({
            show: true,
            type: 'info',
            message: `Password reset successfully! Email failed. New password: ${data.data.newPassword}`,
          });
        }
      } else {
        setToast({
          show: true,
          type: 'error',
          message: data.message || 'Failed to reset password',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'An error occurred while resetting the password',
      });
    } finally {
      setConfirmDialog({ show: false, type: null, userId: null, username: '' });
    }
  };

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-[#0c2340]">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system users, roles, and access controls</p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white rounded-xl shadow-lg transition-all font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100"
            />
          </div>

          {/* Role Filter */}
          <div className="relative w-full md:w-56">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 appearance-none cursor-pointer"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="StationAdmin">Station Admin</option>
              <option value="Officer">Officer</option>

            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(search || roleFilter) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <span className="text-sm text-slate-500">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-sm">
                Search: {search}
                <button onClick={() => setSearch('')} className="hover:text-red-500">×</button>
              </span>
            )}
            {roleFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-sm">
                Role: {roleFilter}
                <button onClick={() => setRoleFilter('')} className="hover:text-red-500">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setRoleFilter(''); }}
              className="text-sm text-red-500 hover:text-red-700 ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Instruction message when no filters */}
        {!shouldShowList && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-4 rounded-xl">
              <svg className="w-6 h-6 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                Use the <strong>search bar</strong> to find users, or select a <strong>Role</strong> filter to view the users list.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      {shouldShowList && (
        <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50 text-[#0c2340]/80 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Linked Officer</th>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-500">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const fullName = [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(' ');

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#0c2340]">{u.username}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                              u.role === 'StationAdmin' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                u.role === 'Officer' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {fullName ? (
                            <div className="flex flex-col">
                              <span className="text-[#0c2340]">{fullName}</span>
                              <span className="text-xs text-slate-500">{u.badge_number}</span>
                            </div>
                          ) : (
                            <span className="text-[#0c2340]/30 italic">Not Linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {u.station_name ? (
                            <div className="flex flex-col">
                              <span className="text-[#0c2340]">{u.station_name}</span>
                              <span className="text-xs text-slate-500">{u.station_code}</span>
                            </div>
                          ) : (
                            <span className="text-[#0c2340]/30 italic">No Station</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${u.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  show: true,
                                  type: 'reset',
                                  userId: u.id,
                                  username: u.username,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                              title="Reset Password"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              Reset
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  show: true,
                                  type: 'delete',
                                  userId: u.id,
                                  username: u.username,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                              title="Delete User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {confirmDialog.type === 'delete' ? (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-[#0c2340]">
                  {confirmDialog.type === 'delete' ? 'Delete User' : 'Reset Password'}
                </h3>
                <p className="text-sm text-slate-500">
                  {confirmDialog.type === 'delete'
                    ? 'This action cannot be undone'
                    : 'A new password will be generated and emailed'}
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                {confirmDialog.type === 'delete' ? (
                  <>
                    Are you sure you want to delete the user <strong className="text-[#0c2340]">{confirmDialog.username}</strong>?
                    This will permanently remove their access to the system.
                  </>
                ) : (
                  <>
                    Are you sure you want to reset the password for <strong className="text-[#0c2340]">{confirmDialog.username}</strong>?
                    A new password will be generated and sent to their email address.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ show: false, type: null, userId: null, username: '' })}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.type === 'delete' ? handleDeleteUser : handleResetPassword}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${confirmDialog.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
                  }`}
              >
                {confirmDialog.type === 'delete' ? 'Delete User' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 min-w-[320px] max-w-md ${toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : toast.type === 'error' ? (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <p className="font-medium text-sm leading-relaxed">{toast.message}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${toast.type === 'success'
                  ? 'hover:bg-green-100'
                  : toast.type === 'error'
                    ? 'hover:bg-red-100'
                    : 'hover:bg-blue-100'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





