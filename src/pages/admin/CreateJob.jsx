
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CreateJob.css";
import DistrictDropdown from "../../components/common/DistrictDropdown";

import {
  createJob,
  getTodayColomboDate,
} from "../../services/jobService";

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
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSaveJob = async (status) => {
    if (saving) return;

    if (status === "Active") {
      if (
        !formData.title.trim() ||
        !formData.company.trim() ||
        !formData.location ||
        !formData.type ||
        !formData.salary.trim() ||
        !formData.category ||
        !formData.description.trim()
      ) {
        setMessage(
          "Please fill in all required fields before publishing."
        );
        return;
      }
    }

    if (
      formData.deadline &&
      formData.deadline < getTodayColomboDate()
    ) {
      setMessage("Please select a valid future deadline.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await createJob(formData, status);

      alert(
        status === "Draft"
          ? "Job saved as draft successfully!"
          : "Job published successfully!"
      );

      navigate("/admin/jobs");
    } catch (error) {
      console.error("Unable to save job:", error);
      setMessage(
        "Unable to save the job. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/jobs");
  };

  return (
    <div className="create-job-page">
      <div className="create-job-header">
        <h1>Create New Job</h1>
        <p>Add a new job vacancy to PattaJobs.</p>
      </div>

      <div className="create-job-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveJob("Active");
          }}
        >
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
              <DistrictDropdown
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Select District"
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
                min={getTodayColomboDate()}
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
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="create-job-draft"
              onClick={() => handleSaveJob("Draft")}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="submit"
              className="create-job-publish"
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJob;
