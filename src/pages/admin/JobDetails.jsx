
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  Building2,
  Clock,
  Wallet,
  Tag,
  CalendarDays,
  FileText,
  ClipboardList,
} from "lucide-react";
import "./JobDetails.css";

function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job] = useState(() => {
    try {
      const savedJobs = JSON.parse(
        localStorage.getItem("jobmate_jobs") || "[]"
      );

      return savedJobs.find(
        (item) => String(item.id) === String(id)
      ) || null;
    } catch (error) {
      return null;
    }
  });

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!job) {
    return (
      <div className="job-details-page">
        <button
          className="job-details-back-btn"
          onClick={() => navigate("/admin/jobs")}
        >
          <ArrowLeft size={18} />
          Back to Manage Jobs
        </button>

        <div className="job-details-not-found">
          <BriefcaseBusiness size={45} />
          <h2>Job Not Found</h2>
          <p>This job may have been deleted or is no longer available.</p>
          <button onClick={() => navigate("/admin/jobs")}>
            Return to Manage Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <button
        className="job-details-back-btn"
        onClick={() => navigate("/admin/jobs")}
      >
        <ArrowLeft size={18} />
        Back to Manage Jobs
      </button>

      <div className="job-details-header">
        <div>
          <span className="job-details-eyebrow">JOB LISTING DETAILS</span>
          <h2>{job.title || "Untitled Job"}</h2>
          <p>
            <Building2 size={16} />
            {job.company || "Company not specified"}
          </p>
        </div>

        <span
          className={`job-details-status ${(job.status || "Draft").toLowerCase()}`}
        >
          {job.status || "Draft"}
        </span>
      </div>

      <div className="job-details-content">
        <section className="job-details-card">
          <h3>
            <BriefcaseBusiness size={19} />
            Job Information
          </h3>

          <div className="job-details-info-grid">
            <div className="job-details-info-item">
              <MapPin size={19} />
              <div>
                <span>Location</span>
                <strong>{job.location || "Not specified"}</strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <Clock size={19} />
              <div>
                <span>Job Type</span>
                <strong>{job.type || "Not specified"}</strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <Wallet size={19} />
              <div>
                <span>Salary</span>
                <strong>{job.salary || "Not specified"}</strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <Tag size={19} />
              <div>
                <span>Category</span>
                <strong>{job.category || "Not specified"}</strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <CalendarDays size={19} />
              <div>
                <span>Application Deadline</span>
                <strong>{formatDate(job.deadline)}</strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <CalendarDays size={19} />
              <div>
                <span>Created Date</span>
                <strong>{formatDate(job.createdAt)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="job-details-card">
          <h3>
            <FileText size={19} />
            Job Description
          </h3>

          <p className="job-details-description">
            {job.description || "No job description provided."}
          </p>
        </section>

        <section className="job-details-card">
          <h3>
            <ClipboardList size={19} />
            Requirements
          </h3>

          <p className="job-details-description">
            {job.requirements || "No requirements specified."}
          </p>
        </section>
      </div>
    </div>
  );
}

export default JobDetails;
