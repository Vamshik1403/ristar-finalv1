"use client";

import React, { useState } from "react";

interface PermissionFormProps {
  activeTab: "permissions" | "roles";
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ activeTab, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    module: "",
    permissions: "",
    status: "active",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg w-[500px] h-[400px] p-6">
        <div className="flex justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-bold">
            {activeTab === "permissions" ? "Add Permission" : "Add Role"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder={activeTab === "permissions" ? "Permission Name" : "Role Name"}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 mb-5"
            onChange={handleChange}
            required
          />
          <input
            name="description"
            type="text"
            placeholder="Description"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 mb-5"
            onChange={handleChange}
            required
          />
          {activeTab === "permissions" ? (
            <select
                name="module"
                value={formData.module}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 mb-5"
                required
              >
                <option value="">Select Module</option>
                <option value="admin">Roles</option>
                <option value="user">Users</option>
              </select>
          ) : (
            <input
              name="permissions"
              type="text"
              placeholder="Permissions (comma-separated)"
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 mb-5"
              onChange={handleChange}
            />
          )}
          <div className="mb-5">
          <label className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={formData.status === "active"}
                  onChange={e => setFormData({ ...formData, status: e.target.checked ? "active" : "inactive" })}
                  className="accent-blue-500 w-4 h-4"
                />
                Active
              </label>
              </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default PermissionForm;



