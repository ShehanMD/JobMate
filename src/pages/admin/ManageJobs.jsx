
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import "./ManageJobs.css";

const demoJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "ABC Technologies",
    location: "Colombo",
    type: "Full-time",
    status: "Active",
  },
  {
    id: 2,
    title: "Graphic Designer",
    company: "Creative Studio",
    location: "Negombo",
    type: "Part-time",
    status: "Active",
  },
  {
    id: 3,
    title: "Data Entry Operator",
    company: "Global Solutions",
    location: "Gampaha",
    type: "Contract",
    status: "Inactive",
  },
];

function ManageJobs() {
  const navigate = useNavigate();

  // Load jobs from localStorage
  const [jobs, setJobs] = useState(() => {
    try {
      const savedJobs = localStorage.getItem("jobmate_jobs");

      if (savedJobs !== null) {
        return JSON.parse(savedJobs);
      }

      return demoJobs;
    } catch (error) {
      return demoJobs;
    }
  });

  // Save jobs whenever jobs state changes
  useEffect(() => {
    localStorage.setItem("jobmate_jobs", JSON.stringify(jobs));
  }, [jobs]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit modal states
  const [editingJob, setEditingJob] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    status: "Active",
  });

  // Search and filter
  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (job.title || "").toLowerCase().includes(search) ||
      (job.company || "").toLowerCase().includes(search) ||
      (job.location || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "Active").length;
  const inactiveJobs = jobs.filter((job) => job.status === "Inactive").length;
  const draftJobs = jobs.filter((job) => job.status === "Draft").length;

  // Delete job
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (confirmDelete) {
      setJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== id)
      );
    }
  };

  // Open edit modal
  const handleEdit = (job) => {
    setEditingJob(job);

    setEditForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "Full-time",
      status: job.status || "Active",
    });
  };

  // Handle form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Save edited job
  const handleSaveEdit = (e) => {
    e.preventDefault();

    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job.id === editingJob.id ? { ...job, ...editForm } : job
      )
    );

    setEditingJob(null);
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingJob(null);
  };

  return (
    <div className="manage-jobs-page">
      {/* Header */}
      <div className="manage-jobs-header">
        <div>
          <h1>Manage Jobs</h1>
          <p>View and manage all job listings.</p>
        </div>

        <button
          className="add-job-btn"
          onClick={() => navigate("/admin/create-job")}
        >
          <Plus size={18} />
          Add New Job
        </button>
      </div>

      {/* Statistics */}
      <div className="manage-jobs-stats">
        <div className="manage-jobs-stat-card">
          <h3>Total Jobs</h3>
          <p>{totalJobs}</p>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Active Jobs</h3>
          <p>{activeJobs}</p>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Inactive Jobs</h3>
          <p>{inactiveJobs}</p>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Draft Jobs</h3>
          <p>{draftJobs}</p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="manage-jobs-table-card">
        <div className="manage-jobs-table-header">
          <h2>All Job Listings</h2>

          <div className="manage-jobs-controls">
            <div className="manage-jobs-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search jobs..."
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
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="manage-jobs-table-wrapper">
          <table className="manage-jobs-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>{job.type}</td>

                    <td>
                      <span className={`job-status ${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="job-actions">
                      <button
                        className="edit-job-btn"
                        title="Edit Job"
                        onClick={() => handleEdit(job)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-job-btn"
                        title="Delete Job"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="manage-jobs-empty">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="edit-job-modal-overlay">
          <div className="edit-job-modal">
            <div className="edit-job-modal-header">
              <div>
                <h2>Edit Job</h2>
                <p>Update job listing details.</p>
              </div>

              <button
                className="edit-job-close-btn"
                onClick={handleCloseModal}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="edit-job-form-grid">
                <div className="edit-job-field">
                  <label>Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-job-field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={editForm.company}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-job-field">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-job-field">
                  <label>Job Type</label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="edit-job-field edit-job-full-width">
                  <label>Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="edit-job-modal-actions">
                <button
                  type="button"
                  className="edit-job-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button type="submit" className="edit-job-save-btn">
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

export default ManageJobs;
