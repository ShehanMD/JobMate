
import React, { useEffect, useState } from "react";
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

import {
  subscribeToJob,
  getJobDisplayStatus,
} from "../../services/jobService";

import "./JobDetails.css";

function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Listen to the selected Firestore job
  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeToJob(
      id,
      (fetchedJob) => {
        setJob(fetchedJob);
        setLoading(false);
      },
      (error) => {
        console.error("Unable to load job details:", error);
        setError("Unable to load job details. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // Format Firestore Timestamp or date string
  const formatDate = (value) => {
    if (!value) return "Not specified";

    let parsedDate;

    if (typeof value.toDate === "function") {
      parsedDate = value.toDate();
    } else {
      parsedDate = new Date(value);
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return String(value);
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Loading
  if (loading) {
    return (
      <div className="job-details-page">
        <p className="job-details-not-found">
          Loading job details...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
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
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/admin/jobs")}>
            Return to Manage Jobs
          </button>
        </div>
      </div>
    );
  }

  // Job not found
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
          <p>
            This job may have been deleted or is no longer available.
          </p>
          <button onClick={() => navigate("/admin/jobs")}>
            Return to Manage Jobs
          </button>
        </div>
      </div>
    );
  }

  const displayStatus = getJobDisplayStatus(job);

  return (
    <div className="job-details-page">

      {/* Back Button */}
      <button
        className="job-details-back-btn"
        onClick={() => navigate("/admin/jobs")}
      >
        <ArrowLeft size={18} />
        Back to Manage Jobs
      </button>

      {/* Job Header */}
      <div className="job-details-header">
        <div>
          <span className="job-details-eyebrow">
            JOB LISTING DETAILS
          </span>

          <h2>{job.title || "Untitled Job"}</h2>

          <p>
            <Building2 size={16} />
            {job.company || "Company not specified"}
          </p>
        </div>

        <span
          className={`job-details-status ${displayStatus.toLowerCase()}`}
        >
          {displayStatus}
        </span>
      </div>

      {/* Job Content */}
      <div className="job-details-content">

        {/* Job Information */}
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
                <strong>
                  {job.location || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <Clock size={19} />
              <div>
                <span>Job Type</span>
                <strong>
                  {job.type || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <Wallet size={19} />
              <div>
                <span>Salary</span>
                <strong>
                  {job.salary || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <Tag size={19} />
              <div>
                <span>Category</span>
                <strong>
                  {job.category || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <CalendarDays size={19} />
              <div>
                <span>Application Deadline</span>
                <strong>
                  {formatDate(job.deadline)}
                </strong>
              </div>
            </div>

            <div className="job-details-info-item">
              <CalendarDays size={19} />
              <div>
                <span>Created Date</span>
                <strong>
                  {formatDate(job.createdAt)}
                </strong>
              </div>
            </div>

          </div>
        </section>

        {/* Description */}
        <section className="job-details-card">
          <h3>
            <FileText size={19} />
            Job Description
          </h3>

          <p className="job-details-description">
            {job.description || "No job description provided."}
          </p>
        </section>

        {/* Requirements */}
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
