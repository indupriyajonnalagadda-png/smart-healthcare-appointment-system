import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { UserCheck, UserX, Shield, Users } from 'lucide-react';

export const AdminPatientsPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllUsers({
        role: roleFilter || undefined,
        size: 50,
      });
      if (res?.success && res.data?.content) {
        setUsers(res.data.content);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentEnabled) => {
    setMessage(null);
    setError(null);
    try {
      await adminApi.updateUserStatus(userId, !currentEnabled);
      setMessage(`User account ${!currentEnabled ? 'activated' : 'deactivated'}.`);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Could not update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User & Patient Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage system users, view registration statuses, and toggle account access.
        </p>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        {[
          { label: 'All Users', val: '' },
          { label: 'Patients', val: 'ROLE_PATIENT' },
          { label: 'Doctors', val: 'ROLE_DOCTOR' },
          { label: 'Administrators', val: 'ROLE_ADMIN' },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setRoleFilter(tab.val)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === tab.val
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <SkeletonLoader count={5} type="table" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{u.fullName || `${u.firstName} ${u.lastName}`}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{u.phone || '-'}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={u.role === 'ROLE_ADMIN' ? 'danger' : u.role === 'ROLE_DOCTOR' ? 'primary' : 'default'}
                        size="sm"
                      >
                        {u.role?.replace('ROLE_', '')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success" size="sm">Active</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, true)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Toggle Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
