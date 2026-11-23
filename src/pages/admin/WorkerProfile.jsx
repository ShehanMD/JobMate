
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  ShieldCheck,
  FileText,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import "./WorkerProfile.css";

const STORAGE_KEY = "jobmate_workers";

function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);

  useEffect(() => {
    try {
      const savedWorkers = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const selectedWorker = savedWorkers.find(
        (item) => String(item.id) === String(id)
      );

      setWorker(selectedWorker || null);
    } catch (error) {
      console.error("Unable to load worker profile:", error);
      setWorker(null);
    }
  }, [id]);

  const updateVerification = (status) => {
    const action = status === "Verified" ? "verify" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this worker?`
    );

    if (!confirmed) return;

    try {
      const savedWorkers = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const updatedWorkers = savedWorkers.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              verificationStatus: status,
              verifiedAt:
                status === "Verified" ? new Date().toISOString() : null,
            }
          : item
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedWorkers)
      );

      const updatedWorker = updatedWorkers.find(
        (item) => String(item.id) === String(id)
      );

      setWorker(updatedWorker);
      alert(
        status === "Verified"
          ? "Worker verified successfully!"
          : "Worker verification rejected."
      );
    } catch (error) {
      console.error("Unable to update verification:", error);
      alert("Unable to update worker verification.");
    }
  };

  const displayValue = (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return "Not provided";
    }

    return value;
  };

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!worker) {
    return (
      <div className="worker-profile-page">
        <div className="worker-profile-not-found">
          <h2>Worker Not Found</h2>
          <p>This worker profile could not be found.</p>
          <button onClick={() => navigate("/admin/workers")}>
            <ArrowLeft size={17} /> Back to Manage Workers
          </button>
        </div>
      </div>
    );
  }

  const verificationStatus = worker.verificationStatus || "Pending";
  const isVerified = verificationStatus === "Verified";

  return (
    <div className="worker-profile-page">
      <div className="worker-profile-topbar">
        <button
          type="button"
          className="worker-profile-back-btn"
          onClick={() => navigate("/admin/workers")}
        >
          <ArrowLeft size={18} />
          Back to Manage Workers
        </button>

        <span className={`verification-badge ${verificationStatus.toLowerCase()}`}>
          {verificationStatus}
        </span>
      </div>

      <div className="worker-profile-heading">
        <div>
          <h1>Worker Profile</h1>
          <p>View worker information and manage verification.</p>
        </div>
      </div>

      <section className="worker-profile-summary">
        <div className="worker-profile-avatar">
          {worker.profileImage ? (
            <img src={worker.profileImage} alt={worker.name || "Worker"} />
          ) : (
            <UserRound size={42} />
          )}
        </div>

        <div className="worker-profile-summary-info">
          <h2>{displayValue(worker.name)}</h2>
          <p>{displayValue(worker.skill)}</p>
          <span className={`worker-account-status ${String(worker.status || "").toLowerCase()}`}>
            {displayValue(worker.status)}
          </span>
        </div>

        <div className="worker-profile-verification">
          <ShieldCheck size={30} />
          <div>
            <strong>{verificationStatus}</strong>
            <span>Verification Status</span>
          </div>
        </div>
      </section>

      <div className="worker-profile-grid">
        <section className="worker-profile-card">
          <div className="worker-profile-card-title">
            <UserRound size={20} />
            <h3>Personal Information</h3>
          </div>

          <div className="worker-detail-grid">
            <div className="worker-detail-item">
              <span><UserRound size={16} /> Full Name</span>
              <strong>{displayValue(worker.name)}</strong>
            </div>

            <div className="worker-detail-item">
              <span><Mail size={16} /> Email Address</span>
              <strong>{displayValue(worker.email)}</strong>
            </div>

            <div className="worker-detail-item">
              <span><Phone size={16} /> Phone Number</span>
              <strong>{displayValue(worker.phone)}</strong>
            </div>

            <div className="worker-detail-item">
              <span><MapPin size={16} /> District</span>
              <strong>{displayValue(worker.location)}</strong>
            </div>

            <div className="worker-detail-item">
              <span><CalendarDays size={16} /> Date of Birth</span>
              <strong>{formatDate(worker.dateOfBirth)}</strong>
            </div>

            <div className="worker-detail-item">
              <span><UserRound size={16} /> Gender</span>
              <strong>{displayValue(worker.gender)}</strong>
            </div>

            <div className="worker-detail-item full-width">
              <span><MapPin size={16} /> Full Address</span>
              <strong>{displayValue(worker.address)}</strong>
            </div>
          </div>
        </section>

        <section className="worker-profile-card">
          <div className="worker-profile-card-title">
            <BriefcaseBusiness size={20} />
            <h3>Professional Information</h3>
          </div>

          <div className="worker-detail-grid">
            <div className="worker-detail-item">
              <span><BriefcaseBusiness size={16} /> Main Skill</span>
              <strong>{displayValue(worker.skill)}</strong>
            </div>

            <div className="worker-detail-item">
              <span><Clock size={16} /> Experience</span>
              <strong>
                {worker.experienceYears !== undefined &&
                worker.experienceYears !== ""
                  ? `${worker.experienceYears} years`
                  : "Not provided"}
              </strong>
            </div>

            <div className="worker-detail-item full-width">
              <span><Award size={16} /> Other Skills</span>
              <strong>
                {Array.isArray(worker.skills)
                  ? worker.skills.join(", ") || "Not provided"
                  : displayValue(worker.skills)}
              </strong>
            </div>

            <div className="worker-detail-item full-width">
              <span><FileText size={16} /> Qualifications</span>
              <strong>{displayValue(worker.qualifications)}</strong>
            </div>

            <div className="worker-detail-item full-width">
              <span><FileText size={16} /> Previous Work Experience</span>
              <strong>{displayValue(worker.workExperience)}</strong>
            </div>

            <div className="worker-detail-item">
              <span>Expected Salary / Rate</span>
              <strong>{displayValue(worker.expectedSalary)}</strong>
            </div>

            <div className="worker-detail-item">
              <span>Availability</span>
              <strong>{displayValue(worker.availability)}</strong>
            </div>
          </div>
        </section>

        <section className="worker-profile-card">
          <div className="worker-profile-card-title">
            <CalendarDays size={20} />
            <h3>Account Information</h3>
          </div>

          <div className="worker-detail-grid">
            <div className="worker-detail-item">
              <span>Registration Date</span>
              <strong>{formatDate(worker.createdAt || worker.joinedDate)}</strong>
            </div>

            <div className="worker-detail-item">
              <span>Account Status</span>
              <strong>{displayValue(worker.status)}</strong>
            </div>

            <div className="worker-detail-item">
              <span>Last Active</span>
              <strong>{formatDate(worker.lastActive)}</strong>
            </div>

            <div className="worker-detail-item">
              <span>Verified Date</span>
              <strong>{formatDate(worker.verifiedAt)}</strong>
            </div>
          </div>
        </section>

        <section className="worker-profile-card">
          <div className="worker-profile-card-title">
            <FileText size={20} />
            <h3>Verification Documents</h3>
          </div>

          {Array.isArray(worker.certificates) && worker.certificates.length > 0 ? (
            <div className="worker-document-list">
              {worker.certificates.map((certificate, index) => (
                <div className="worker-document-item" key={index}>
                  <FileText size={18} />
                  <span>
                    {typeof certificate === "string"
                      ? certificate
                      : certificate.name || `Certificate ${index + 1}`}
                  </span>
                  {typeof certificate === "object" && certificate.url && (
                    <a href={certificate.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : worker.certificateUrl ? (
            <div className="worker-document-item">
              <FileText size={18} />
              <span>Certificate document</span>
              <a href={worker.certificateUrl} target="_blank" rel="noreferrer">
                View
              </a>
            </div>
          ) : (
            <p className="worker-empty-message">
              No verification documents have been uploaded.
            </p>
          )}
        </section>
      </div>

      <section className="worker-verification-action-card">
        <div>
          <h3>Worker Verification</h3>
          <p>
            Review the worker's information and documents before approving
            their permission to publish advertisements.
          </p>
          <p className="worker-verification-note">
            Only verified workers should be allowed to publish advertisements.
          </p>
        </div>

        <div className="worker-verification-buttons">
          <button
            type="button"
            className="reject-worker-btn"
            onClick={() => updateVerification("Rejected")}
            disabled={verificationStatus === "Rejected"}
          >
            <XCircle size={18} />
            Reject
          </button>

          <button
            type="button"
            className="verify-worker-btn"
            onClick={() => updateVerification("Verified")}
            disabled={isVerified}
          >
            <CheckCircle size={18} />
            {isVerified ? "Already Verified" : "Verify Worker"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default WorkerProfile;
