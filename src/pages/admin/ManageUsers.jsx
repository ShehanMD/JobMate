
import React, { useEffect, useState } from "react";
import { Search, Pencil, Trash2, X } from "lucide-react";
import "./ManageUsers.css";

const demoUsers = [
  {
    id: 1,
    name: "Kavindu Perera",
    email: "kavindu@gmail.com",
    joinedDate: "2026-11-10",
    status: "Active",
  },
  {
    id: 2,
    name: "Nethmi Silva",
    email: "nethmi@gmail.com",
    joinedDate: "2026-11-12",
    status: "Active",
  },
  {
    id: 3,
    name: "Tharushi Fernando",
    email: "tharushi@gmail.com",
    joinedDate: "2026-11-15",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Dasun Jayawardena",
    email: "dasun@gmail.com",
    joinedDate: "2026-11-18",
    status: "Active",
  },
];

function ManageUsers() {
  // Load users from localStorage
  const [users, setUsers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem("jobmate_users");

      if (savedUsers !== null) {
        return JSON.parse(savedUsers);
      }

      return demoUsers;
    } catch (error) {
      return demoUsers;
    }
  });

  // Save users whenever state changes
  useEffect(() => {
    localStorage.setItem("jobmate_users", JSON.stringify(users));
  }, [users]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit modal
  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    status: "Active",
  });

  // Search and filter
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (user.name || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  // Delete user
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (confirmDelete) {
      setUsers((previousUsers) =>
        previousUsers.filter((user) => user.id !== id)
      );
    }
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name,
      email: user.email,
      status: user.status,
    });
  };

  // Handle input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Save changes
  const handleSaveEdit = (e) => {
    e.preventDefault();

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === editingUser.id ? { ...user, ...editForm } : user
      )
    );

    setEditingUser(null);
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingUser(null);
  };

  return (
    <div className="manage-users-page">
      {/* Header */}
      <div className="manage-users-header">
        <div>
          <h1>Manage Users</h1>
          <p>View and manage registered users on JobMate.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="manage-users-stats">
        <div className="manage-users-stat-card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>

        <div className="manage-users-stat-card">
          <h3>Active Users</h3>
          <p>{activeUsers}</p>
        </div>

        <div className="manage-users-stat-card">
          <h3>Inactive Users</h3>
          <p>{inactiveUsers}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="manage-users-table-card">
        <div className="manage-users-table-header">
          <h2>All Registered Users</h2>

          <div className="manage-users-controls">
            <div className="manage-users-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="manage-users-table-wrapper">
          <table className="manage-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.joinedDate}</td>

                    <td>
                      <span
                        className={`user-status ${user.status.toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="user-actions">
                      <button
                        className="edit-user-btn"
                        title="Edit User"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-user-btn"
                        title="Delete User"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="manage-users-empty">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="edit-user-modal-overlay">
          <div className="edit-user-modal">
            <div className="edit-user-modal-header">
              <div>
                <h2>Edit User</h2>
                <p>Update user details.</p>
              </div>

              <button
                type="button"
                className="edit-user-close-btn"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="edit-user-form-grid">
                <div className="edit-user-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-user-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-user-field edit-user-full-width">
                  <label>Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="edit-user-modal-actions">
                <button
                  type="button"
                  className="edit-user-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button type="submit" className="edit-user-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
