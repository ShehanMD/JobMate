
import React, { useEffect, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Activity,
  Clock,
  LogIn,
  UserRound,
} from "lucide-react";

import DistrictDropdown from "../../components/common/DistrictDropdown";
import "./ManageUsers.css";

const demoUsers = [
  {
    id: 1,
    name: "Kavindu Perera",
    email: "kavindu@gmail.com",
    phone: "0771234567",
    location: "Colombo",
    joinedDate: "2026-11-10",
    status: "Active",
    totalActiveDays: 8,
    totalLogins: 15,
    lastActive: "2026-11-23",
    activityHistory: [
      { id: 1, action: "Logged into the platform", date: "2026-11-23", time: "09:30 AM" },
      { id: 2, action: "Updated profile information", date: "2026-11-22", time: "02:15 PM" },
      { id: 3, action: "Browsed job listings", date: "2026-11-21", time: "10:45 AM" },
    ],
  },
  {
    id: 2,
    name: "Nethmi Silva",
    email: "nethmi@gmail.com",
    phone: "0712345678",
    location: "Gampaha",
    joinedDate: "2026-11-12",
    status: "Active",
    totalActiveDays: 6,
    totalLogins: 11,
    lastActive: "2026-11-23",
    activityHistory: [
      { id: 1, action: "Logged into the platform", date: "2026-11-23", time: "11:20 AM" },
      { id: 2, action: "Viewed a job listing", date: "2026-11-22", time: "04:10 PM" },
    ],
  },
  {
    id: 3,
    name: "Tharushi Fernando",
    email: "tharushi@gmail.com",
    phone: "0751234567",
    location: "Kandy",
    joinedDate: "2026-11-15",
    status: "Inactive",
    totalActiveDays: 2,
    totalLogins: 4,
    lastActive: "2026-11-18",
    activityHistory: [
      { id: 1, action: "Logged into the platform", date: "2026-11-18", time: "08:30 AM" },
      { id: 2, action: "Created a job seeker profile", date: "2026-11-15", time: "01:15 PM" },
    ],
  },
  {
    id: 4,
    name: "Dasun Jayawardena",
    email: "dasun@gmail.com",
    phone: "0761234567",
    location: "Kalutara",
    joinedDate: "2026-11-18",
    status: "Active",
    totalActiveDays: 4,
    totalLogins: 9,
    lastActive: "2026-11-23",
    activityHistory: [
      { id: 1, action: "Logged into the platform", date: "2026-11-23", time: "03:00 PM" },
      { id: 2, action: "Browsed job listings", date: "2026-11-20", time: "09:45 AM" },
    ],
  },
];

function ManageUsers() {
  // Load Job Seekers from localStorage
  const [users, setUsers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem("jobmate_users");

      if (savedUsers !== null) {
        const parsedUsers = JSON.parse(savedUsers);
        return Array.isArray(parsedUsers) ? parsedUsers : demoUsers;
      }

      return demoUsers;
    } catch {
      return demoUsers;
    }
  });

  // Save users
  useEffect(() => {
    localStorage.setItem("jobmate_users", JSON.stringify(users));
  }, [users]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    status: "Active",
  });

  // Filter Job Seekers
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      String(user.name || "").toLowerCase().includes(search) ||
      String(user.email || "").toLowerCase().includes(search) ||
      String(user.phone || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    const matchesLocation =
      locationFilter === "All" ||
      String(user.location || "").toLowerCase() ===
        locationFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Statistics
  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  // Delete Job Seeker
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Job Seeker?"
    );

    if (!confirmDelete) return;

    setUsers((previousUsers) =>
      previousUsers.filter((user) => user.id !== id)
    );

    if (selectedUser?.id === id) {
      setSelectedUser(null);
    }
  };

  // Open Edit Modal
  const handleEdit = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      status: user.status || "Active",
    });

    setSelectedUser(null);
  };

  // Handle Edit Inputs
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Save User Details
  const handleSaveEdit = (e) => {
    e.preventDefault();

    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.location
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id
        ? { ...user, ...editForm }
        : user
    );

    setUsers(updatedUsers);
    setEditingUser(null);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setLocationFilter("All");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayValue = (value) => {
    return value || "Not provided";
  };

  return (
    <div className="manage-users-page">

      {/* Page Header */}
      <div className="manage-users-header">
        <div>
          <h1>Manage Users</h1>
          <p>View and manage registered Job Seekers.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="manage-users-stats">

        <div className="manage-users-stat-card">
          <h3>Total Job Seekers</h3>
          <p>{totalUsers}</p>
        </div>

        <div className="manage-users-stat-card">
          <h3>Active Job Seekers</h3>
          <p>{activeUsers}</p>
        </div>

        <div className="manage-users-stat-card">
          <h3>Inactive Job Seekers</h3>
          <p>{inactiveUsers}</p>
        </div>

      </div>

      {/* Job Seekers Table */}
      <div className="manage-users-table-card">

        <div className="manage-users-table-header">

          <div className="manage-users-table-title">
            <h2>Registered Job Seekers</h2>
            <p>View and manage all registered Job Seeker profiles.</p>
          </div>

          {/* Search and Filters */}
          <div className="manage-users-controls">

            <div className="manage-users-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search job seekers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DistrictDropdown
              value={locationFilter === "All" ? "" : locationFilter}
              onChange={(e) =>
                setLocationFilter(e.target.value || "All")
              }
              placeholder="All Districts"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              type="button"
              className="manage-users-reset-btn"
              onClick={handleResetFilters}
            >
              Reset
            </button>

          </div>
        </div>

        {/* Table */}
        <div className="manage-users-table-wrapper">

          <table className="manage-users-table">

            <thead>
              <tr>
                <th>Job Seeker</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      <div className="manage-user-name">
                        <div className="manage-user-avatar">
                          <UserRound size={18} />
                        </div>
                        <span>{user.name || "Unnamed User"}</span>
                      </div>
                    </td>

                    <td>{user.email || "Not provided"}</td>

                    <td>{user.phone || "Not provided"}</td>

                    <td>{user.location || "Not provided"}</td>

                    <td>{formatDate(user.joinedDate)}</td>

                    <td>
                      <span
                        className={`user-status ${String(
                          user.status || ""
                        ).toLowerCase()}`}
                      >
                        {user.status || "Not specified"}
                      </span>
                    </td>

                    <td>
                      <div className="manage-user-actions">

                        <button
                          type="button"
                          className="view-user-btn"
                          title="View Profile"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="edit-user-btn"
                          title="Edit User"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="delete-user-btn"
                          title="Delete User"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td colSpan="7" className="manage-users-empty">
                    No Job Seekers found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

        <div className="manage-users-results">
          Showing {filteredUsers.length} of {users.length} Job Seekers
        </div>

      </div>

      {/* View Job Seeker Profile Modal */}
      {selectedUser && (

        <div
          className="user-profile-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >

          <div
            className="user-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="user-profile-modal-header">

              <div>
                <h2>Job Seeker Profile</h2>
                <p>View personal information and account activity.</p>
              </div>

              <button
                type="button"
                className="user-profile-close-btn"
                onClick={() => setSelectedUser(null)}
              >
                <X size={21} />
              </button>

            </div>

            {/* Profile Summary */}
            <div className="user-profile-summary">

              <div className="user-profile-avatar">
                <UserRound size={32} />
              </div>

              <div className="user-profile-identity">
                <h3>{selectedUser.name || "Unnamed User"}</h3>
                <p>{selectedUser.email || "No email provided"}</p>

                <span
                  className={`user-status ${String(
                    selectedUser.status || ""
                  ).toLowerCase()}`}
                >
                  {selectedUser.status || "Not specified"}
                </span>
              </div>

            </div>

            {/* Personal Information */}
            <div className="user-profile-section">

              <h3>
                <UserRound size={18} />
                Personal Information
              </h3>

              <div className="user-profile-details-grid">

                <div className="user-profile-detail">
                  <span><Mail size={16} /> Email Address</span>
                  <strong>{displayValue(selectedUser.email)}</strong>
                </div>

                <div className="user-profile-detail">
                  <span><Phone size={16} /> Phone Number</span>
                  <strong>{displayValue(selectedUser.phone)}</strong>
                </div>

                <div className="user-profile-detail">
                  <span><MapPin size={16} /> District</span>
                  <strong>{displayValue(selectedUser.location)}</strong>
                </div>

                <div className="user-profile-detail">
                  <span><CalendarDays size={16} /> Joined Date</span>
                  <strong>{formatDate(selectedUser.joinedDate)}</strong>
                </div>

              </div>

            </div>

            {/* Activity Overview */}
            <div className="user-profile-section">

              <h3>
                <Activity size={18} />
                Activity Overview
              </h3>

              <div className="user-activity-stats">

                <div className="user-activity-stat">
                  <CalendarDays size={19} />
                  <div>
                    <strong>{selectedUser.totalActiveDays ?? 0}</strong>
                    <span>Active Days</span>
                  </div>
                </div>

                <div className="user-activity-stat">
                  <LogIn size={19} />
                  <div>
                    <strong>{selectedUser.totalLogins ?? 0}</strong>
                    <span>Total Logins</span>
                  </div>
                </div>

                <div className="user-activity-stat">
                  <Clock size={19} />
                  <div>
                    <strong>
                      {formatDate(selectedUser.lastActive)}
                    </strong>
                    <span>Last Active</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Activity History */}
            <div className="user-profile-section">

              <h3>
                <Clock size={18} />
                Recent Activity
              </h3>

              {selectedUser.activityHistory?.length > 0 ? (

                <div className="user-activity-history">

                  {selectedUser.activityHistory.map((activity, index) => (

                    <div
                      className="user-activity-history-item"
                      key={activity.id || index}
                    >

                      <div className="user-activity-dot"></div>

                      <div className="user-activity-history-content">
                        <strong>{activity.action}</strong>
                        <span>
                          {formatDate(activity.date)} · {activity.time || ""}
                        </span>
                      </div>

                    </div>

                  ))}

                </div>

              ) : (
                <p className="user-no-activity">
                  No activity records available.
                </p>
              )}

            </div>

            {/* Profile Actions */}
            <div className="user-profile-modal-footer">

              <button
                type="button"
                className="user-profile-edit-btn"
                onClick={() => handleEdit(selectedUser)}
              >
                <Pencil size={16} />
                Edit Profile
              </button>

              <button
                type="button"
                className="user-profile-done-btn"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>

            </div>

          </div>
        </div>

      )}

      {/* Edit Job Seeker Modal */}
      {editingUser && (

        <div
          className="edit-user-modal-overlay"
          onClick={handleCloseEdit}
        >

          <div
            className="edit-user-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="edit-user-modal-header">

              <div>
                <h2>Edit Job Seeker</h2>
                <p>Update Job Seeker account details.</p>
              </div>

              <button
                type="button"
                className="edit-user-close-btn"
                onClick={handleCloseEdit}
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
                    placeholder="Enter full name"
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
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="edit-user-field">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="edit-user-field">
                  <label>District</label>

                  <DistrictDropdown
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                    placeholder="Select District"
                  />
                </div>

                <div className="edit-user-field edit-user-full-width">
                  <label>Account Status</label>

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
                  onClick={handleCloseEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-user-save-btn"
                >
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
