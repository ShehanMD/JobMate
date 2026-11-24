
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Pencil,
  Trash2,
  X,
  Plus,
  Eye,
} from "lucide-react";

import DistrictDropdown from "../../components/common/DistrictDropdown";

import {
  subscribeToAllJobs,
  updateJob,
  deleteJob,
  getJobDisplayStatus,
} from "../../services/jobService";

import "./ManageJobs.css";

// Normalize district names
const normalizeDistrict = (location) => {
  const value = String(location || "").trim().toLowerCase();

  const aliases = {
    negombo: "gampaha",
  };

  return aliases[value] || value;
};

function ManageJobs() {
  const navigate = useNavigate();

  // Jobs from Firestore
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    category: "",
    description: "",
    requirements: "",
    deadline: "",
    status: "Active",
  });

  // ------------------------------------------------
  // 1. Listen to Firestore jobs
  // ------------------------------------------------

  useEffect(() => {
    setLoading(true);
    setLoadError("");

    const unsubscribe = subscribeToAllJobs(
      (fetchedJobs) => {
        setJobs(fetchedJobs);
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("Unable to load jobs:", error);

        setLoadError(
          "Unable to load jobs. Please check your Firebase permissions."
        );

        setLoading(false);
      }
    );

    // Stop listening when component unmounts
    return () => unsubscribe();
  }, []);

  // ------------------------------------------------
  // 2. Edit job
  // ------------------------------------------------

  const handleEdit = (job) => {
    setEditingJobId(job.id);

    setEditForm({
      title: job.title || "",
      company: job.company || "",
      location:
        normalizeDistrict(job.location) === "gampaha"
          ? "Gampaha"
          : job.location || "",
      type: job.type || "",
      salary: job.salary || "",
      category: job.category || "",
      description: job.description || "",
      requirements: job.requirements || "",
      deadline: job.deadline || "",
      status: job.status || "Draft",
    });

    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Save updated job to Firestore
  const handleUpdateJob = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (
      !editForm.title.trim() ||
      !editForm.company.trim() ||
      !editForm.location ||
      !editForm.type ||
      !editForm.salary.trim() ||
      !editForm.category ||
      !editForm.description.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        ...editForm,
        title: editForm.title.trim(),
        company: editForm.company.trim(),
        salary: editForm.salary.trim(),
        description: editForm.description.trim(),
        requirements: editForm.requirements.trim(),
        deadline: editForm.deadline || null,
      };

      await updateJob(editingJobId, updatedData);

      setIsEditModalOpen(false);
      setEditingJobId(null);

      alert("Job updated successfully!");
    } catch (error) {
      console.error("Unable to update job:", error);
      alert("Unable to update job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // 3. Delete job from Firestore
  // ------------------------------------------------

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {
      await deleteJob(id);

      alert("Job deleted successfully!");
    } catch (error) {
      console.error("Unable to delete job:", error);
      alert("Unable to delete job. Please try again.");
    }
  };

  // ------------------------------------------------
  // 4. Reset filters
  // ------------------------------------------------

  const handleResetFilters = () => {
    setSearchTerm("");
    setLocationFilter("All");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  // ------------------------------------------------
  // 5. Filter jobs
  // ------------------------------------------------

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        String(job.title || "").toLowerCase().includes(search) ||
        String(job.company || "").toLowerCase().includes(search) ||
        String(job.location || "").toLowerCase().includes(search);

      const matchesLocation =
        locationFilter === "All" ||
        normalizeDistrict(job.location) ===
          normalizeDistrict(locationFilter);

      const matchesType =
        typeFilter === "All" || job.type === typeFilter;

      const displayStatus = getJobDisplayStatus(job);

      const matchesStatus =
        statusFilter === "All" ||
        displayStatus === statusFilter;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    jobs,
    searchTerm,
    locationFilter,
    typeFilter,
    statusFilter,
  ]);

  // ------------------------------------------------
  // 6. Job statistics
  // ------------------------------------------------

  const totalJobs = jobs.length;

  const activeJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Active"
  ).length;

  const inactiveJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Inactive"
  ).length;

  const draftJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Draft"
  ).length;

  const expiredJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Expired"
  ).length;

  // ------------------------------------------------
  // 7. Render
  // ------------------------------------------------

  return (
    <div className="manage-jobs-page">

      {/* Page Header */}
      <div className="manage-jobs-header">
        <div>
          <h1>Manage Jobs</h1>
          <p>View, manage and monitor job listings.</p>
        </div>

        <button
          className="create-job-btn"
          onClick={() => navigate("/admin/create-job")}
        >
          <Plus size={18} />
          Create Job
        </button>
      </div>

      {/* Statistics */}
      <div className="manage-jobs-stats">

        <div className="manage-jobs-stat-card">
          <h3>Total Jobs</h3>
          <strong>{totalJobs}</strong>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Active Jobs</h3>
          <strong>{activeJobs}</strong>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Inactive Jobs</h3>
          <strong>{inactiveJobs}</strong>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Draft Jobs</h3>
          <strong>{draftJobs}</strong>
        </div>

        <div className="manage-jobs-stat-card">
          <h3>Expired Jobs</h3>
          <strong>{expiredJobs}</strong>
        </div>

      </div>

      {/* Jobs Table */}
      <div className="manage-jobs-table-card">

        <div className="manage-jobs-table-header">

          <div>
            <h2>Job Listings</h2>
            <p>Manage all posted jobs from here.</p>
          </div>

          {/* Search and Filters */}
          <div className="manage-jobs-controls">

            <div className="manage-jobs-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search jobs..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
              <option value="Expired">Expired</option>
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
        <div className="manage-jobs-table-wrapper">

          <table className="manage-jobs-table">

            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Job Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="6" className="no-jobs-found">
                    Loading jobs...
                  </td>
                </tr>

              ) : loadError ? (

                <tr>
                  <td colSpan="6" className="no-jobs-found">
                    {loadError}
                  </td>
                </tr>

              ) : filteredJobs.length > 0 ? (

                filteredJobs.map((job) => {
                  const displayStatus = getJobDisplayStatus(job);

                  return (
                    <tr key={job.id}>

                      <td>{job.title || "Untitled Job"}</td>

                      <td>{job.company || "Not specified"}</td>

                      <td>
                        {normalizeDistrict(job.location) === "gampaha"
                          ? "Gampaha"
                          : job.location || "Not specified"}
                      </td>

                      <td>{job.type || "Not specified"}</td>

                      <td>
                        <span
                          className={`job-status-badge ${displayStatus.toLowerCase()}`}
                        >
                          {displayStatus}
                        </span>
                      </td>

                      <td>
                        <div className="job-action-buttons">

                          <button
                            type="button"
                            className="view-job-btn"
                            title="View Job"
                            onClick={() =>
                              navigate(`/admin/jobs/${job.id}`)
                            }
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="edit-job-btn"
                            title="Edit Job"
                            onClick={() => handleEdit(job)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="delete-job-btn"
                            title="Delete Job"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>
                  <td colSpan="6" className="no-jobs-found">
                    No jobs found.
                  </td>
                </tr>

              )}

            </tbody>
          </table>
        </div>

        {/* Results */}
        <div className="manage-jobs-results">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>

      </div>

      {/* Edit Job Modal */}
      {isEditModalOpen && (

        <div className="job-modal-overlay">

          <div className="job-edit-modal">

            <div className="job-modal-header">
              <div>
                <h2>Edit Job</h2>
                <p>Update job listing details.</p>
              </div>

              <button
                type="button"
                className="close-job-modal-btn"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingJobId(null);
                }}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleUpdateJob}>

              <div className="edit-job-field">
                <label>Job Title *</label>

                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="edit-job-field">
                <label>Company *</label>

                <input
                  type="text"
                  name="company"
                  value={editForm.company}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="edit-job-field">
                <label>Location / District *</label>

                <DistrictDropdown
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  required
                  placeholder="Select District"
                />
              </div>

              <div className="edit-job-field">
                <label>Job Type *</label>

                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="edit-job-field">
                <label>Salary *</label>

                <input
                  type="text"
                  name="salary"
                  value={editForm.salary}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="edit-job-field">
                <label>Category *</label>

                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="edit-job-field">
                <label>Application Deadline</label>

                <input
                  type="date"
                  name="deadline"
                  value={editForm.deadline}
                  onChange={handleEditChange}
                />
              </div>

              <div className="edit-job-field">
                <label>Status</label>

                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="edit-job-field">
                <label>Job Description *</label>

                <textarea
                  name="description"
                  rows="4"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="edit-job-field">
                <label>Requirements</label>

                <textarea
                  name="requirements"
                  rows="4"
                  value={editForm.requirements}
                  onChange={handleEditChange}
                />
              </div>

              <div className="job-modal-actions">

                <button
                  type="button"
                  className="cancel-job-btn"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingJobId(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-job-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
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
