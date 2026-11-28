
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
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import {
  updateWorkerVerification,
} from "../../services/workerService";

import "./WorkerProfile.css";

// ======================================
// FORMAT DATE
// ======================================

const formatDate = (value) => {
  if (!value) return "Not provided";

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ======================================
// DISPLAY VALUE
// ======================================

const displayValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? value.join(", ")
      : "Not provided";
  }

  return String(value);
};

// ======================================
// WORKER PROFILE - ADMIN
// ======================================

function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  // ======================================
  // REAL-TIME FIRESTORE PROFILE
  // ======================================

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Worker ID is missing.");
      return;
    }

    const workerRef = doc(db, "users", id);

    const unsubscribe = onSnapshot(
      workerRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setWorker(null);
          setError("This worker profile could not be found.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        if (data.role !== "worker") {
          setWorker(null);
          setError("This account is not a skilled worker.");
          setLoading(false);
          return;
        }

        setWorker({
          id: snapshot.id,
          ...data,
        });

        setError("");
        setLoading(false);
      },
      (firebaseError) => {
        console.error("Worker profile loading error:", firebaseError);

        setError("Unable to load worker profile. Check Firestore permissions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // ======================================
  // VERIFY / REJECT WORKER
  // ======================================

  const updateVerification = async (status) => {
    if (!worker || saving) return;

    const action =
      status === "Verified" ? "verify" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${worker.name || "this worker"}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await updateWorkerVerification(
        worker.id,
        status
      );

      alert(
        status === "Verified"
          ? "Worker verified successfully!"
          : "Worker verification rejected."
      );
    } catch (firebaseError) {
      console.error("Worker verification error:", firebaseError);

      alert(
        firebaseError.message ||
        "Unable to update worker verification."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="worker-profile-page">

        <div className="worker-profile-not-found">

          <LoaderCircle size={35} />

          <h2>Loading Worker Profile...</h2>

          <p>Please wait while we retrieve the worker details.</p>

        </div>

      </div>
    );
  }

  // ======================================
  // NOT FOUND
  // ======================================

  if (!worker) {
    return (
      <div className="worker-profile-page">

        <div className="worker-profile-not-found">

          <AlertCircle size={40} />

          <h2>Worker Not Found</h2>

          <p>
            {error || "This worker profile could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/workers")}
          >
            <ArrowLeft size={17} />
            Back to Manage Workers
          </button>

        </div>

      </div>
    );
  }

  // ======================================
  // STATUS
  // ======================================

  const verificationStatus =
    worker.verificationStatus || "Pending";

  const isVerified =
    verificationStatus.toLowerCase() === "verified";

  const isRejected =
    verificationStatus.toLowerCase() === "rejected";

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="worker-profile-page">

      {/* TOP BAR */}

      <div className="worker-profile-topbar">

        <button
          type="button"
          className="worker-profile-back-btn"
          onClick={() => navigate("/admin/workers")}
        >
          <ArrowLeft size={18} />
          Back to Manage Workers
        </button>

        <span
          className={`verification-badge ${verificationStatus.toLowerCase()}`}
        >
          {verificationStatus}
        </span>

      </div>


      {/* PAGE HEADING */}

      <div className="worker-profile-heading">

        <div>
          <h1>Worker Profile</h1>
          <p>View worker information and manage verification.</p>
        </div>

      </div>


      {/* PROFILE SUMMARY */}

      <section className="worker-profile-summary">

        <div className="worker-profile-avatar">

          {worker.photoURL || worker.profileImage ? (
            <img
              src={worker.photoURL || worker.profileImage}
              alt={worker.name || "Worker"}
            />
          ) : (
            <UserRound size={42} />
          )}

        </div>


        <div className="worker-profile-summary-info">

          <h2>{displayValue(worker.name)}</h2>

          <p>{displayValue(worker.skill)}</p>

          <span
            className={`worker-account-status ${String(
              worker.status || "Active"
            ).toLowerCase()}`}
          >
            {worker.status || "Active"}
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


      {/* ======================================
          PROFILE INFORMATION
      ====================================== */}

      <div className="worker-profile-grid">

        {/* PERSONAL INFORMATION */}

        <section className="worker-profile-card">

          <div className="worker-profile-card-title">
            <UserRound size={20} />
            <h3>Personal Information</h3>
          </div>


          <div className="worker-detail-grid">

            <div className="worker-detail-item">
              <span>
                <UserRound size={16} />
                Full Name
              </span>

              <strong>{displayValue(worker.name)}</strong>
            </div>


            <div className="worker-detail-item">
              <span>
                <Mail size={16} />
                Email Address
              </span>

              <strong>{displayValue(worker.email)}</strong>
            </div>


            <div className="worker-detail-item">
              <span>
                <Phone size={16} />
                Phone Number
              </span>

              <strong>{displayValue(worker.phone)}</strong>
            </div>


            <div className="worker-detail-item">
              <span>
                <MapPin size={16} />
                District
              </span>

              <strong>{displayValue(worker.location)}</strong>
            </div>


            <div className="worker-detail-item">
              <span>
                <CalendarDays size={16} />
                Date of Birth
              </span>

              <strong>{formatDate(worker.dateOfBirth)}</strong>
            </div>


            <div className="worker-detail-item">
              <span>
                <UserRound size={16} />
                Gender
              </span>

              <strong>{displayValue(worker.gender)}</strong>
            </div>


            <div className="worker-detail-item full-width">
              <span>
                <MapPin size={16} />
                Full Address
              </span>

              <strong>{displayValue(worker.address)}</strong>
            </div>

          </div>

        </section>


        {/* PROFESSIONAL INFORMATION */}

        <section className="worker-profile-card">

          <div className="worker-profile-card-title">
            <BriefcaseBusiness size={20} />
            <h3>Professional Information</h3>
          </div>


          <div className="worker-detail-grid">

            <div className="worker-detail-item">
              <span>
                <BriefcaseBusiness size={16} />
                Main Skill
              </span>

              <strong>{displayValue(worker.skill)}</strong>
            </div>


            <div className="worker-detail-item">
              <span>
                <Clock size={16} />
                Experience
              </span>

              <strong>
                {worker.experienceYears !== undefined &&
                worker.experienceYears !== null &&
                worker.experienceYears !== ""
                  ? `${worker.experienceYears} years`
                  : "Not provided"}
              </strong>
            </div>


            <div className="worker-detail-item full-width">
              <span>
                <Award size={16} />
                Other Skills
              </span>

              <strong>
                {displayValue(worker.skills)}
              </strong>
            </div>


            <div className="worker-detail-item full-width">
              <span>
                <FileText size={16} />
                Qualifications
              </span>

              <strong>
                {displayValue(worker.qualifications)}
              </strong>
            </div>


            <div className="worker-detail-item full-width">
              <span>
                <FileText size={16} />
                Previous Work Experience
              </span>

              <strong>
                {displayValue(worker.workExperience)}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>
                Expected Salary / Rate
              </span>

              <strong>
                {displayValue(worker.expectedSalary)}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>Availability</span>

              <strong>
                {displayValue(worker.availability)}
              </strong>
            </div>

          </div>

        </section>


        {/* ACCOUNT INFORMATION */}

        <section className="worker-profile-card">

          <div className="worker-profile-card-title">
            <CalendarDays size={20} />
            <h3>Account Information</h3>
          </div>


          <div className="worker-detail-grid">

            <div className="worker-detail-item">
              <span>Registration Date</span>

              <strong>
                {formatDate(worker.createdAt)}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>Account Status</span>

              <strong>
                {displayValue(worker.status)}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>Last Active</span>

              <strong>
                {formatDate(worker.lastActive) || "Not available"}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>Total Logins</span>

              <strong>
                {worker.totalLogins ?? 0}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>Verification Status</span>

              <strong>
                {verificationStatus}
              </strong>
            </div>


            <div className="worker-detail-item">
              <span>Verified Date</span>

              <strong>
                {formatDate(worker.verifiedAt)}
              </strong>
            </div>

          </div>

        </section>


        {/* VERIFICATION DOCUMENTS */}

        <section className="worker-profile-card">

          <div className="worker-profile-card-title">
            <FileText size={20} />
            <h3>Verification Documents</h3>
          </div>


          {Array.isArray(worker.certificates) &&
          worker.certificates.length > 0 ? (

            <div className="worker-document-list">

              {worker.certificates.map((certificate, index) => {

                const isObject =
                  typeof certificate === "object" &&
                  certificate !== null;

                const name = isObject
                  ? certificate.name || `Certificate ${index + 1}`
                  : certificate;

                const url = isObject
                  ? certificate.url
                  : null;

                return (
                  <div
                    className="worker-document-item"
                    key={index}
                  >

                    <FileText size={18} />

                    <span>{name}</span>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    )}

                  </div>
                );
              })}

            </div>

          ) : worker.certificateUrl ? (

            <div className="worker-document-item">
              <FileText size={18} />
              <span>Certificate Document</span>

              <a
                href={worker.certificateUrl}
                target="_blank"
                rel="noreferrer"
              >
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


      {/* ======================================
          VERIFICATION ACTIONS
      ====================================== */}

      <section className="worker-verification-action-card">

        <div>

          <h3>Worker Verification</h3>

          <p>
            Review the worker's information and documents before
            approving their verification.
          </p>

          <p className="worker-verification-note">
            Only verified workers should receive the Verified
            badge on their service advertisements.
          </p>

        </div>


        <div className="worker-verification-buttons">

          <button
            type="button"
            className="reject-worker-btn"
            disabled={saving || isRejected}
            onClick={() => updateVerification("Rejected")}
          >
            <XCircle size={18} />
            {saving ? "Updating..." : "Reject"}
          </button>


          <button
            type="button"
            className="verify-worker-btn"
            disabled={saving || isVerified}
            onClick={() => updateVerification("Verified")}
          >
            <CheckCircle size={18} />

            {saving
              ? "Updating..."
              : isVerified
                ? "Already Verified"
                : "Verify Worker"}
          </button>

        </div>

      </section>

    </div>
  );
}

export default WorkerProfile;
