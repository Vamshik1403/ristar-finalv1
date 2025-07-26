'use client'

import React, { useState } from 'react'

// Modal component for Add User
const AddUserModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;

  // Dummy form state for demonstration
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    password: '',
    confirmPassword: '',
    active: true,
    administrator: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-lg w-[500px]">
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-white">Add User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-white mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                required
              />
            </div>
            {/* First Name & Last Name */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-white mb-1">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
            </div>
            {/* Role */}
            <div>
              <label className="block text-xs text-white mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                required
              >
                <option value="">Select a role</option>
                <option value="admin">Administrator</option>
                <option value="user">User</option>
              </select>
            </div>
            {/* Password */}
            <div>
              <label className="block text-xs text-white mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                required
              />
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-white mb-1">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                required
              />
            </div>
            {/* Checkboxes */}
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="accent-blue-500 w-4 h-4"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={form.administrator}
                  onChange={e => setForm({ ...form, administrator: e.target.checked })}
                  className="accent-blue-500 w-4 h-4"
                />
                Administrator
              </label>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;