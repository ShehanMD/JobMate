
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
} from "lucide-react";

import DistrictDropdown from "../../components/common/DistrictDropdown";
import "./ManageWorkers.css";

const demoWorkers = [
  {
    id: 1,
    name: "Kasun Perera",
    email: "kasun@gmail.com",
    skill: "Electrician",
    location: "Colombo",
    status: "Active",
    verificationStatus: "Pending",
  },
  {
    id: 2,
    name: "Nimal Silva",
    email: "nimal@gmail.com",
    skill: "Plumber",
    location: "Gampaha",
    status: "Active",
    verificationStatus: "Pending",
  },
  {
    id: 3,
    name: "Sahan Fernando",
    email: "sahan@gmail.com",
    skill: "Carpenter",
    location: "Gampaha",
    status: "Inactive",
    verificationStatus: "Pending",
  },
  {
    id: 4,
    name: "Amila Jayasuriya",
    email: "amila@gmail.com",
    skill: "Painter",
    location: "Kalutara",
    status: "Active",
    verificationStatus: "Pending",
  },
];

const normalizeDistrict = (location) => {
  const value = String(location || "").trim().toLowerCase();

  const aliases = {
    negombo: "gampaha",
  };

  return aliases[value] || value;
};

function ManageWorkers() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState(() => {
    const savedWorkers = localStorage.getItem("jobmate_workers");

    if (savedWorkers) {
      try {
        const parsedWorkers = JSON.parse(savedWorkers);
        return Array.isArray(parsedWorkers) ? parsedWorkers : demoWorkers;
      } catch {
        return demoWorkers;
      }
    }

    return demoWorkers;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    skill: "",
    location: "",
    status: "Active",
  });

  useEffect(() => {
    localStorage.setItem("jobmate_workers", JSON.stringify(workers));
  }, [workers]);

  // View Worker Profile
  const handleViewProfile = (worker) => {
    navigate(`/admin/workers/${worker.id}`);
  };

  // Open Edit Modal
  const handleEdit = (worker) => {
    setEditingWorkerId(worker.id);

    setEditForm({
      name: worker.name || "",
      email: worker.email || "",
      skill: worker.skill || "",
      location:
        normalizeDistrict(worker.location) === "gampaha"
          ? "Gampaha"
          : worker.location || "",
      status: worker.status || "Active",
    });

    setIsEditModalOpen(true);
  };

  // Handle Form Changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update Worker
  const handleUpdateWorker = (e) => {
    e.preventDefault();

    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.skill.trim() ||
      !editForm.location
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedWorkers = workers.map((worker) =>
      worker.id === editingWorkerId
        ? { ...worker, ...editForm }
        : worker
    );

    setWorkers(updatedWorkers);
    setIsEditModalOpen(false);
    setEditingWorkerId(null);

    alert("Worker updated successfully!");
  };

  // Delete Worker
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this worker?"
    );

    if (!confirmDelete) return;

    setWorkers((prev) =>
      prev.filter((worker) => worker.id !== id)
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setLocationFilter("All");
  };

  // Filter Workers
  const filteredWorkers = workers.filter((worker) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      String(worker.name || "").toLowerCase().includes(search) ||
      String(worker.email || "").toLowerCase().includes(search) ||
      String(worker.skill || "").toLowerCase().includes(search) ||
      String(worker.location || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || worker.status === statusFilter;

    const matchesLocation =
      locationFilter === "All" ||
      normalizeDistrict(worker.location) ===
        normalizeDistrict(locationFilter);

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Statistics
  const totalWorkers = workers.length;

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;

  const inactiveWorkers = workers.filter(
    (worker) => worker.status === "Inactive"
  ).length;

  return (
    <div className="manage-workers-page">

      {/* Page Header */}
      <div className="manage-workers-header">
        <div>
          <h1>Manage Workers</h1>
          <p>Manage registered skilled workers.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="manage-workers-stats">

        <div className="manage-workers-stat-card">
          <h3>Total Workers</h3>
          <strong>{totalWorkers}</strong>
        </div>

        <div className="manage-workers-stat-card">
          <h3>Active Workers</h3>
          <strong>{activeWorkers}</strong>
        </div>

        <div className="manage-workers-stat-card">
          <h3>Inactive Workers</h3>
          <strong>{inactiveWorkers}</strong>
        </div>

      </div>

      {/* Workers Table */}
      <div className="manage-workers-table-card">

        <div className="manage-workers-table-header">

          <div>
            <h2>Skilled Workers</h2>
            <p>View and manage all registered workers.</p>
          </div>

          {/* Search and Filters */}
          <div className="manage-workers-controls">

            <div className="manage-workers-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search workers..."
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
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
            >
              Reset
            </button>

          </div>
        </div>

        {/* Table */}
        <div className="manage-workers-table-wrapper">

          <table className="manage-workers-table">

            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Email</th>
                <th>Skill</th>
                <th>District</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (

                  <tr key={worker.id}>

                    <td>{worker.name}</td>

                    <td>{worker.email}</td>

                    <td>{worker.skill}</td>

                    <td>
                      {normalizeDistrict(worker.location) === "gampaha"
                        ? "Gampaha"
                        : worker.location || "Not specified"}
                    </td>

                    <td>
                      <span
                        className={`worker-status-badge ${String(
                          worker.status || ""
                        ).toLowerCase()}`}
                      >
                        {worker.status || "Not specified"}
                      </span>
                    </td>

                    <td>
                      <div className="worker-action-buttons">

                        <button
                          type="button"
                          className="view-worker-btn"
                          title="View Worker Profile"
                          onClick={() => handleViewProfile(worker)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="edit-worker-btn"
                          title="Edit Worker"
                          onClick={() => handleEdit(worker)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="delete-worker-btn"
                          title="Delete Worker"
                          onClick={() => handleDelete(worker.id)}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-workers-found">
                    No workers found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

        <div className="manage-workers-results">
          Showing {filteredWorkers.length} of {workers.length} workers
        </div>

      </div>

      {/* Edit Worker Modal */}
      {isEditModalOpen && (

        <div
          className="worker-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >

          <div
            className="worker-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="worker-modal-header">

              <div>
                <h2>Edit Worker</h2>
                <p>Update worker details.</p>
              </div>

              <button
                type="button"
                className="close-worker-modal-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={handleUpdateWorker}>

              <div className="worker-edit-form-grid">

                <div className="edit-worker-field">
                  <label>Worker Name</label>

                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter worker name"
                    required
                  />
                </div>

                <div className="edit-worker-field">
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

                <div className="edit-worker-field">
                  <label>Skill</label>

                  <input
                    type="text"
                    name="skill"
                    value={editForm.skill}
                    onChange={handleEditChange}
                    placeholder="Enter worker skill"
                    required
                  />
                </div>

                <div className="edit-worker-field">
                  <label>District</label>

                  <DistrictDropdown
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                    placeholder="Select District"
                  />
                </div>

                <div className="edit-worker-field worker-edit-full-width">
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

              <div className="worker-modal-actions">

                <button
                  type="button"
                  className="cancel-worker-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-worker-btn"
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

export default ManageWorkers;
