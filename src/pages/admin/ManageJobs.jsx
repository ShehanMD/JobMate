
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, X, Plus, Eye } from "lucide-react";
import DistrictDropdown from "../../components/common/DistrictDropdown";
import "./ManageJobs.css";

const demoJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "ABC Technologies",
    location: "Colombo",
    type: "Full-time",
    salary: "Rs. 80,000",
    category: "IT",
    description: "Frontend developer required.",
    requirements: "React, JavaScript, CSS",
    deadline: "2026-12-30",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Graphic Designer",
    company: "Creative Solutions",
    location: "Gampaha",
    type: "Part-time",
    salary: "Rs. 45,000",
    category: "Design",
    description: "Looking for a creative graphic designer.",
    requirements: "Photoshop, Illustrator",
    deadline: "2026-12-25",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Software Engineer",
    company: "Tech Lanka",
    location: "Negombo",
    type: "Full-time",
    salary: "Rs. 100,000",
    category: "IT",
    description: "Software engineer vacancy.",
    requirements: "Java, React, SQL",
    deadline: "2026-12-20",
    status: "Draft",
    createdAt: new Date().toISOString(),
  },
];

const normalizeDistrict = (location) => {
  const value = String(location || "").trim().toLowerCase();

  const aliases = {
    negombo: "gampaha",
  };

  return aliases[value] || value;
};

function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem("jobmate_jobs");

    if (savedJobs) {
      try {
        return JSON.parse(savedJobs);
      } catch {
        return demoJobs;
      }
    }

    return demoJobs;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    status: "",
  });

  useEffect(() => {
    localStorage.setItem("jobmate_jobs", JSON.stringify(jobs));
  }, [jobs]);

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
      status: job.status || "Active",
    });

    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateJob = (e) => {
    e.preventDefault();

    if (
      !editForm.title.trim() ||
      !editForm.company.trim() ||
      !editForm.location ||
      !editForm.type
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedJobs = jobs.map((job) =>
      job.id === editingJobId
        ? {
            ...job,
            ...editForm,
          }
        : job
    );

    setJobs(updatedJobs);
    setIsEditModalOpen(false);
    setEditingJobId(null);

    alert("Job updated successfully!");
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setLocationFilter("All");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const filteredJobs = jobs.filter((job) => {
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

    const matchesStatus =
      statusFilter === "All" || job.status === statusFilter;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesStatus
    );
  });

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "Active").length;
  const inactiveJobs = jobs.filter(
    (job) => job.status === "Inactive"
  ).length;
  const draftJobs = jobs.filter((job) => job.status === "Draft").length;

  return (
    <div className="manage-jobs-page">
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
      </div>

      <div className="manage-jobs-table-card">
        <div className="manage-jobs-table-header">
          <div>
            <h2>Job Listings</h2>
            <p>Manage all posted jobs from here.</p>
          </div>

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
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>
                      {normalizeDistrict(job.location) === "gampaha"
                        ? "Gampaha"
                        : job.location || "Not specified"}
                    </td>
                    <td>{job.type || "Not specified"}</td>
                    <td>
                      <span
                        className={`job-status-badge ${String(
                          job.status || ""
                        ).toLowerCase()}`}
                      >
                        {job.status || "Not specified"}
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
                ))
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

        <div className="manage-jobs-results">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

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
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleUpdateJob}>
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
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={editForm.company}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="edit-job-field">
                <label>Location / District</label>
                <DistrictDropdown
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  required
                  placeholder="Select District"
                />
              </div>

              <div className="edit-job-field">
                <label>Job Type</label>
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
                  <option value="Remote">Remote</option>
                </select>
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
                </select>
              </div>

              <div className="job-modal-actions">
                <button
                  type="button"
                  className="cancel-job-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-job-btn">
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