'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, GraduationCap, UserCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error('Failed to change role');
      }
    } catch (err) {
      toast.error('Role update error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Identity & Access Management
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          User Management ({users.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all registered students, alumni, and administrators. Manage role assignments and platform permissions.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">College & Department</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Submissions</th>
                  <th className="py-3 px-4 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {u.name[0]}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span>{u.college || '—'}</span>
                      <span className="block text-[10px] text-slate-400">{u.branch || ''}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : u.role === 'ALUMNI'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-brand-50 text-brand-700 border border-brand-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {u._count.internships} posts • {u._count.experiences} reviews • {u._count.reports} reports
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs p-1 rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="ALUMNI">ALUMNI</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
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
}
