
import React, { useEffect, useState } from "react";
import { Search, Pencil, Trash2, X } from "lucide-react";
import "./ManageWorkers.css";

const demoWorkers = [
  {
    id: 1,
    name: "Kasun Perera",
    email: "kasun@gmail.com",
    skill: "Electrician",
    location: "Colombo",
    status: "Active",
  },
  {
    id: 2,
    name: "Nimal Silva",
    email: "nimal@gmail.com",
    skill: "Plumber",
    location: "Gampaha",
    status: "Active",
  },
  {
    id: 3,
    name: "Sahan Fernando",
    email: "sahan@gmail.com",
    skill: "Carpenter",
    location: "Negombo",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Amila Jayasuriya",
    email: "amila@gmail.com",
    skill: "Painter",
    location: "Kalutara",
    status: "Active",
  },
];

function ManageWorkers() {
  // Load workers from localStorage
  const [workers, setWorkers] = useState(() => {
    try {
      const savedWorkers = localStorage.getItem("jobmate_workers");

      if (savedWorkers !== null) {
        return JSON.parse(savedWorkers);
      }

      return demoWorkers;
    } catch (error) {
      return demoWorkers;
    }
  });

  // Save workers whenever state changes
  useEffect(() => {
    localStorage.setItem("jobmate_workers", JSON.stringify(workers));
  }, [workers]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit modal states
  const [editingWorker, setEditingWorker] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    skill: "",
    location: "",
    status: "Active",
  });

  // Search and filter
  const filteredWorkers = workers.filter((worker) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (worker.name || "").toLowerCase().includes(search) ||
      (worker.email || "").toLowerCase().includes(search) ||
      (worker.skill || "").toLowerCase().includes(search) ||
      (worker.location || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || worker.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;
  const inactiveWorkers = workers.filter(
    (worker) => worker.status === "Inactive"
  ).length;

  // Delete worker
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this worker?"
    );

    if (confirmDelete) {
      setWorkers((previousWorkers) =>
        previousWorkers.filter((worker) => worker.id !== id)
      );
    }
  };

  // Open edit modal
  const handleEdit = (worker) => {
    setEditingWorker(worker);

    setEditForm({
      name: worker.name || "",
      email: worker.email || "",
      skill: worker.skill || "",
      location: worker.location || "",
      status: worker.status || "Active",
    });
  };

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Save edited worker
  const handleSaveEdit = (e) => {
    e.preventDefault();

    setWorkers((previousWorkers) =>
      previousWorkers.map((worker) =>
        worker.id === editingWorker.id
          ? { ...worker, ...editForm }
          : worker
      )
    );

    setEditingWorker(null);
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingWorker(null);
  };

  return (
    <div className="manage-workers-page">
      {/* Header */}
      <div className="manage-workers-header">
        <div>
          <h1>Manage Workers</h1>
          <p>View and manage registered skilled workers on JobMate.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="manage-workers-stats">
        <div className="manage-workers-stat-card">
          <h3>Total Workers</h3>
          <p>{totalWorkers}</p>
        </div>

        <div className="manage-workers-stat-card">
          <h3>Active Workers</h3>
          <p>{activeWorkers}</p>
        </div>

        <div className="manage-workers-stat-card">
          <h3>Inactive Workers</h3>
          <p>{inactiveWorkers}</p>
        </div>
      </div>

      {/* Workers Table */}
      <div className="manage-workers-table-card">
        <div className="manage-workers-table-header">
          <h2>All Registered Workers</h2>

          <div className="manage-workers-controls">
            <div className="manage-workers-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search workers..."
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
        <div className="manage-workers-table-wrapper">
          <table className="manage-workers-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Email</th>
                <th>Skill</th>
                <th>Location</th>
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
                    <td>{worker.location}</td>

                    <td>
                      <span
                        className={`worker-status ${worker.status.toLowerCase()}`}
                      >
                        {worker.status}
                      </span>
                    </td>

                    <td className="worker-actions">
                      <button
                        className="edit-worker-btn"
                        title="Edit Worker"
                        onClick={() => handleEdit(worker)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-worker-btn"
                        title="Delete Worker"
                        onClick={() => handleDelete(worker.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="manage-workers-empty">
                    No workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="edit-worker-modal-overlay">
          <div className="edit-worker-modal">
            <div className="edit-worker-modal-header">
              <div>
                <h2>Edit Worker</h2>
                <p>Update worker details.</p>
              </div>

              <button
                type="button"
                className="edit-worker-close-btn"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="edit-worker-form-grid">
                <div className="edit-worker-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
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
                    required
                  />
                </div>

                <div className="edit-worker-field">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-worker-field edit-worker-full-width">
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

              <div className="edit-worker-modal-actions">
                <button
                  type="button"
                  className="edit-worker-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button type="submit" className="edit-worker-save-btn">
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
