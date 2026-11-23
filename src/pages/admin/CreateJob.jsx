
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJob.css";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    category: "",
    description: "",
    requirements: "",
    deadline: "",
  });

  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Save job
  const handleSaveJob = (status) => {
    // Required field validation for publishing
    if (status === "Active") {
      if (
        !formData.title.trim() ||
        !formData.company.trim() ||
        !formData.location.trim() ||
        !formData.type ||
        !formData.salary.trim() ||
        !formData.category ||
        !formData.description.trim()
      ) {
        setMessage("Please fill in all required fields before publishing.");
        return;
      }
    }

    // Get previously saved jobs
    const existingJobs = JSON.parse(
      localStorage.getItem("jobmate_jobs") || "[]"
    );

    // Create new job object
    const newJob = {
      id: Date.now(),
      ...formData,
      status,
      createdAt: new Date().toISOString(),
    };

    // Save job to local storage
    localStorage.setItem(
      "jobmate_jobs",
      JSON.stringify([...existingJobs, newJob])
    );

    if (status === "Draft") {
      alert("Job saved as draft successfully!");
    } else {
      alert("Job published successfully!");
    }

    // Go back to Manage Jobs
    navigate("/admin/jobs");
  };

  // Cancel
  const handleCancel = () => {
    navigate("/admin/jobs");
  };

  return (
    <div className="create-job-page">
      <div className="create-job-header">
        <h1>Create New Job</h1>
        <p>Add a new job vacancy to JobMate.</p>
      </div>

      <div className="create-job-card">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSaveJob("Active");
        }}>
          <div className="create-job-grid">
            <div className="create-job-field">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter job title"
              />
            </div>

            <div className="create-job-field">
              <label>Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </div>

            <div className="create-job-field">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter job location"
              />
            </div>

            <div className="create-job-field">
              <label>Job Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Select job type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="create-job-field">
              <label>Salary *</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary range"
              />
            </div>

            <div className="create-job-field">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="IT & Software">IT & Software</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="create-job-field full-width">
              <label>Job Description *</label>
              <textarea
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job role..."
              />
            </div>

            <div className="create-job-field full-width">
              <label>Requirements</label>
              <textarea
                rows="5"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Enter job requirements..."
              />
            </div>

            <div className="create-job-field">
              <label>Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          {message && (
            <p className="create-job-error">{message}</p>
          )}

          <div className="create-job-actions">
            <button
              type="button"
              className="create-job-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="create-job-draft"
              onClick={() => handleSaveJob("Draft")}
            >
              Save as Draft
            </button>

            <button
              type="submit"
              className="create-job-publish"
            >
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJob;
