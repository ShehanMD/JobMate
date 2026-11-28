
import React, { useEffect, useMemo, useState } from "react";

import {
  subscribeToWorkerAds,
  createWorkerAd,
  updateWorkerAd,
  deleteWorkerAd,
} from "../../services/workerAdService";

import {
  Plus,
  ClipboardList,
  Eye,
  Clock,
  MapPin,
  Briefcase,
  Hourglass,
  AlertTriangle,
  Pencil,
  Trash2,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  X,
  Check,
  User,
  Phone,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./WorkerDashboard.css";

// ==========================================
// CONSTANTS
// ==========================================

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const WORKER_SKILLS = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Technician",
  "Construction Worker",
  "Mason",
  "Welder",
  "Mechanic",
  "Other",
];

const INITIAL_FORM_DATA = {
  title: "",
  skill: "",
  district: "",
  rate: "",
  description: "",
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Convert Firestore Timestamp or JavaScript Date
// into a valid JavaScript Date.

const toDate = (value) => {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

// Format dates for dashboard display.

const formatShortDate = (value) => {
  const date = toDate(value);

  if (!date) return "Not available";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

// Calculate remaining advertisement validity.

const calculateRemainingDays = (approvedAt, expiresAt) => {
  const expiryDate =
    toDate(expiresAt) ||
    (() => {
      const approvedDate = toDate(approvedAt);

      if (!approvedDate) return null;

      const expiry = new Date(approvedDate);
      expiry.setDate(expiry.getDate() + 7);

      return expiry;
    })();

  if (!expiryDate) return 7;

  const difference = expiryDate.getTime() - Date.now();

  return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
};

// ==========================================
// WORKER DASHBOARD
// ==========================================

function WorkerDashboard() {
  const auth = useAuth();

  // Firebase authenticated user
  const firebaseUser = auth?.currentUser || null;

  // User information from Firestore through AuthContext
  const userData = auth?.userData || {};

  const workerId = firebaseUser?.uid;

  // ==========================================
  // WORKER PROFILE INFORMATION
  // ==========================================

  // No localStorage is used here.
  // All information comes from Firebase AuthContext.

  const workerName =
    userData.name ||
    userData.fullName ||
    firebaseUser?.displayName ||
    "Worker";

  const workerPhone =
    userData.phone ||
    userData.phoneNumber ||
    firebaseUser?.phoneNumber ||
    "Not provided";

  const workerSkill =
    userData.skill ||
    userData.mainSkill ||
    "Skilled Worker";

  const workerDistrict =
    userData.district ||
    userData.location ||
    "Sri Lanka";

  const isVerified =
    String(userData.verificationStatus || "").toLowerCase() === "verified"
    userData.isVerified === true;

  // ==========================================
  // COMPONENT STATES
  // ==========================================

  const [ad, setAd] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoadingAds, setIsLoadingAds] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    skill: workerSkill !== "Skilled Worker" ? workerSkill : "",
    district: workerDistrict !== "Sri Lanka" ? workerDistrict : "",
  });

  // ==========================================
  // ADVERTISEMENT STATUS
  // ==========================================

  const remainingDays = useMemo(() => {
    if (!ad || ad.status !== "Approved") return null;

    return calculateRemainingDays(
      ad.approvedAt,
      ad.expiresAt
    );
  }, [ad]);

  const isExpired =
    ad?.status === "Approved" && remainingDays === 0;

  // A new advertisement can be submitted when:
  // 1. No advertisement exists.
  // 2. Existing advertisement was rejected.
  // 3. Existing approved advertisement expired.

  const canPostNew =
    !ad ||
    ad.status === "Rejected" ||
    isExpired;

  // ==========================================
  // REAL-TIME FIRESTORE ADVERTISEMENT LISTENER
  // ==========================================

  useEffect(() => {
    if (!workerId) {
      setAd(null);
      setIsLoadingAds(false);
      return;
    }

    setIsLoadingAds(true);
    setError("");

    const unsubscribe = subscribeToWorkerAds(
      workerId,

      (workerAds) => {
        setAd(workerAds?.[0] || null);
        setIsLoadingAds(false);
      },

      (err) => {
        console.error("Failed to load worker advertisements:", err);

        setError("Unable to load your advertisements. Please try again.");

        setIsLoadingAds(false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [workerId]);

  // ==========================================
  // OPEN POST / EDIT MODAL
  // ==========================================

  const openPostModal = (isEdit = false) => {
    setError("");

    if (isEdit && ad) {
      setFormData({
        title: ad.title || "",
        skill: ad.skill || "",
        district: ad.district || "",
        rate: ad.rate || "",
        description: ad.description || "",
      });
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        skill: workerSkill !== "Skilled Worker" ? workerSkill : "",
        district: workerDistrict !== "Sri Lanka" ? workerDistrict : "",
      });
    }

    setIsModalOpen(true);
  };

  // ==========================================
  // HANDLE FORM INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE / UPDATE ADVERTISEMENT
  // ==========================================

  const handleSubmitAd = async (e) => {
    e.preventDefault();

    if (!workerId) {
      alert("Please sign in to submit an advertisement.");
      return;
    }

    if (isSaving) return;

    const newAd = {
      workerName,
      workerPhone,
      title: formData.title.trim(),
      skill: formData.skill,
      district: formData.district,
      rate: formData.rate.trim(),
      description: formData.description.trim(),
    };

    if (
      !newAd.title ||
      !newAd.skill ||
      !newAd.district ||
      !newAd.rate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSaving(true);

      // Update an existing advertisement if it is not expired.
      // This also allows rejected advertisements to be corrected.

      if (ad && !isExpired) {
        await updateWorkerAd(ad.id, newAd);
      } else {
        await createWorkerAd(newAd);
      }

      setIsModalOpen(false);

    } catch (err) {
      console.error("Failed to submit advertisement:", err);

      alert(
        err?.message ||
        "Unable to submit your advertisement. Please try again."
      );

    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // DELETE ADVERTISEMENT
  // ==========================================

  const handleDeleteAd = async () => {
    if (!ad?.id || isDeleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your service advertisement?"
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      await deleteWorkerAd(ad.id);

    } catch (err) {
      console.error("Failed to delete advertisement:", err);

      alert(
        err?.message ||
        "Unable to delete your advertisement. Please try again."
      );

    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // AUTHENTICATION CHECK
  // ==========================================

  if (!firebaseUser) {
    return (
      <div className="wd-page">
        <div className="wd-container">
          <div className="wd-empty-card">
            <ShieldCheck size={35} />
            <h3>Please Sign In</h3>
            <p>You need to sign in to access your worker dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="wd-page">

      {/* ======================================
          HERO SECTION
      ====================================== */}

      <section className="wd-hero">
        <div className="wd-hero-inner">

          <div className="wd-hero-text">
            <h1>Welcome back, {workerName}!</h1>

            <p className="wd-hero-subtitle">
              {workerSkill} &bull; {workerDistrict}, Sri Lanka
            </p>

            <span
              className={`wd-verify-pill ${
                isVerified ? "verified" : "pending"
              }`}
            >
              <ShieldCheck size={15} />

              {isVerified
                ? "Verified Skilled Worker"
                : "Verification Pending"}
            </span>
          </div>

          <div className="wd-hero-actions">
            <button
              type="button"
              className="wd-post-btn"
              onClick={() => openPostModal(false)}
              disabled={!canPostNew || isLoadingAds}
              title={
                !canPostNew
                  ? "You already have an active or pending advertisement"
                  : "Post your weekly service advertisement"
              }
            >
              <Plus size={18} />
              <span>Post Service Ad</span>
            </button>
          </div>

        </div>
      </section>

      {/* ======================================
          MAIN DASHBOARD
      ====================================== */}

      <div className="wd-container">

        {/* Error Message */}

        {error && (
          <div className="wd-alert-box danger">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================
            STATISTICS CARDS
        ====================================== */}

        <section className="wd-stats-grid">

          {/* Active Ad Limit */}

          <div className="wd-stat-card">
            <div className="wd-stat-icon">
              <ClipboardList size={22} />
            </div>

            <div className="wd-stat-info">
              <span className="wd-stat-label">
                Active Ad Limit
              </span>

              <strong className="wd-stat-value">
                1 Ad / Week
              </strong>

              <span className="wd-stat-sub">
                Maximum 1 service advertisement per week
              </span>
            </div>
          </div>

          {/* Total Views */}

          <div className="wd-stat-card">
            <div className="wd-stat-icon">
              <Eye size={22} />
            </div>

            <div className="wd-stat-info">
              <span className="wd-stat-label">
                Total Views
              </span>

              <strong className="wd-stat-value">
                {ad?.views || 0} Views
              </strong>

              <span className="wd-stat-sub">
                People who viewed your advertisement
              </span>
            </div>
          </div>

          {/* Ad Expiry */}

          <div className="wd-stat-card">
            <div className="wd-stat-icon">
              <Clock size={22} />
            </div>

            <div className="wd-stat-info">
              <span className="wd-stat-label">
                Ad Expiry
              </span>

              <strong className="wd-stat-value">

                {isLoadingAds
                  ? "Loading..."
                  : !ad
                    ? "No Active Ad"
                    : ad.status === "Pending"
                      ? "Waiting for Approval"
                      : ad.status === "Rejected"
                        ? "Rejected"
                        : isExpired
                          ? "Expired"
                          : `${remainingDays} ${
                              remainingDays === 1 ? "Day" : "Days"
                            } Left`}

              </strong>

              <span className="wd-stat-sub">
                Service ads are valid for 7 days after approval
              </span>
            </div>
          </div>

        </section>

        {/* ======================================
            MAIN TWO COLUMN CONTENT
        ====================================== */}

        <div className="wd-main-grid">

          {/* LEFT COLUMN */}

          <div className="wd-left-col">

            <div className="wd-section-header">
              <h2>My Service Advertisement</h2>
              <span>(1 Ad Limit &bull; Valid for 7 Days)</span>
            </div>

            {/* Loading */}

            {isLoadingAds ? (

              <div className="wd-empty-card">
                <RefreshCw size={30} />
                <h3>Loading Advertisement...</h3>
                <p>Please wait while we retrieve your information.</p>
              </div>

            ) : error ? (

              <div className="wd-empty-card">
                <AlertTriangle size={30} />
                <h3>Unable to Load Advertisement</h3>
                <p>Please refresh the page and try again.</p>
              </div>

            ) : ad ? (

              /* ======================================
                 EXISTING ADVERTISEMENT
              ====================================== */

              <div className="wd-ad-card">

                <div className="wd-ad-top">

                  <div className="wd-ad-thumb">
                    <Briefcase size={30} />
                  </div>

                  <div className="wd-ad-content">

                    {/* Title and Rate */}

                    <div className="wd-ad-title-row">
                      <h3>{ad.title}</h3>

                      <span className="wd-ad-rate">
                        {ad.rate}
                      </span>
                    </div>

                    {/* Worker Contact Information */}

                    <div className="wd-ad-contact-strip">

                      <span>
                        <User size={15} />
                        {ad.workerName || workerName}
                      </span>

                      <span>
                        <Phone size={15} />
                        {ad.workerPhone || workerPhone}
                      </span>

                    </div>

                    {/* Advertisement Details */}

                    <div className="wd-ad-meta">

                      <span>
                        <MapPin size={15} />
                        {ad.district}, Sri Lanka
                      </span>

                      <span>
                        <Briefcase size={15} />
                        {ad.skill}
                      </span>

                    </div>

                    {/* Advertisement Status */}

                    <div className="wd-status-wrap">

                      {ad.status === "Pending" && (
                        <span className="wd-status-badge pending">
                          <Clock size={14} />
                          Wait for Admin Approval
                        </span>
                      )}

                      {ad.status === "Approved" && !isExpired && (
                        <span className="wd-status-badge approved">
                          <CheckCircle2 size={14} />
                          Published &bull; {remainingDays} Days Left
                        </span>
                      )}

                      {isExpired && (
                        <span className="wd-status-badge expired">
                          <Clock size={14} />
                          Ad Expired (7 Days Completed)
                        </span>
                      )}

                      {ad.status === "Rejected" && (
                        <span className="wd-status-badge rejected">
                          <XCircle size={14} />
                          Rejected by Admin
                        </span>
                      )}

                    </div>

                    {/* Pending Information */}

                    {ad.status === "Pending" && (
                      <>
                        <p className="wd-ad-subtext">
                          Submitted on {formatShortDate(ad.submittedAt)}
                          &bull; Admin is reviewing your ad. Ads publish
                          after approval.
                        </p>

                        <div className="wd-validity-line">
                          <Hourglass size={15} />
                          <span>
                            7 Days Validity (Pending Approval)
                          </span>
                        </div>

                        <div className="wd-alert-box warning">
                          <AlertTriangle size={16} />

                          <span>
                            Once approved, this ad will be live for 7 days.
                          </span>
                        </div>
                      </>
                    )}

                    {/* Approved Information */}

                    {ad.status === "Approved" && !isExpired && (
                      <div className="wd-alert-box success">
                        <CheckCircle2 size={16} />

                        <span>
                          Your advertisement is live! It will automatically
                          expire in <strong>{remainingDays} days</strong>.
                        </span>
                      </div>
                    )}

                    {/* Expired Information */}

                    {isExpired && (
                      <div className="wd-alert-box warning">
                        <Clock size={16} />

                        <span>
                          Your advertisement has expired.
                          You can submit a new advertisement.
                        </span>
                      </div>
                    )}

                    {/* Rejected Information */}

                    {ad.status === "Rejected" && (
                      <div className="wd-alert-box danger">
                        <XCircle size={16} />

                        <span>
                          <strong>Admin Rejection:</strong>{" "}
                          {ad.rejectionReason ||
                            "Your ad did not meet our guidelines. Please update the details and resubmit."}
                        </span>
                      </div>
                    )}

                    {/* Description */}

                    {ad.description && (
                      <p className="wd-ad-desc">
                        {ad.description}
                      </p>
                    )}

                    {/* Action Buttons */}

                    <div className="wd-ad-actions">

                      {ad.status === "Rejected" || isExpired ? (

                        <button
                          type="button"
                          className="wd-btn-resubmit"
                          onClick={() => openPostModal(true)}
                        >
                          <RefreshCw size={15} />
                          <span>Post Again</span>
                        </button>

                      ) : (

                        <button
                          type="button"
                          className="wd-btn-outline"
                          onClick={() => openPostModal(true)}
                          disabled={isLoadingAds}
                        >
                          <Pencil size={15} />
                          <span>Edit Advertisement</span>
                        </button>

                      )}

                      <button
                        type="button"
                        className="wd-btn-outline danger"
                        onClick={handleDeleteAd}
                        disabled={isDeleting}
                      >
                        <Trash2 size={15} />

                        <span>
                          {isDeleting ? "Deleting..." : "Delete Ad"}
                        </span>
                      </button>

                    </div>

                  </div>
                </div>
              </div>

            ) : (

              /* ======================================
                 EMPTY ADVERTISEMENT
              ====================================== */

              <div className="wd-empty-card">

                <div className="wd-empty-icon">
                  <Briefcase size={32} />
                </div>

                <h3>No Service Advertisement Yet</h3>

                <p>
                  Post your service advertisement to reach customers in{" "}
                  {workerDistrict}. You can publish 1 ad per week,
                  valid for 7 days after admin approval.
                </p>

                <button
                  type="button"
                  className="wd-empty-post-btn"
                  onClick={() => openPostModal(false)}
                >
                  <Plus size={18} />
                  <span>Post Service Ad</span>
                </button>

              </div>

            )}

            {/* Bottom Notice */}

            <div className="wd-notice-bar">

              <Info size={18} className="wd-notice-icon" />

              <p>
                <strong>Notice:</strong> If admin rejects your ad,
                it will show as 'Rejected'. You can modify and
                re-submit. Only 1 ad can be published per week.
              </p>

            </div>

          </div>

          {/* ======================================
              RIGHT COLUMN
          ====================================== */}

          <aside className="wd-right-col">

            {/* Advertisement Space */}

            <div className="wd-adsense-card">

              <div className="wd-adsense-placeholder">
                <strong>Advertisement Space</strong>
                <span>Sponsored / Google AdSense</span>
              </div>

            </div>

            {/* Guidelines */}

            <div className="wd-guidelines-card">

              <h3>Ad Guidelines &amp; Rules</h3>

              <ul className="wd-guidelines-list">

                <li>
                  <Check size={16} className="wd-check-icon" />
                  <span>1 Ad per week limit</span>
                </li>

                <li>
                  <Check size={16} className="wd-check-icon" />
                  <span>Ads automatically expire after 7 days</span>
                </li>

                <li>
                  <Check size={16} className="wd-check-icon" />
                  <span>Must pass Admin Review before appearing public</span>
                </li>

                <li>
                  <Check size={16} className="wd-check-icon" />
                  <span>Ensure contact number and district are correct</span>
                </li>

              </ul>

            </div>

          </aside>

        </div>
      </div>

      {/* ======================================
          POST / EDIT ADVERTISEMENT MODAL
      ====================================== */}

      {isModalOpen && (

        <div
          className="wd-modal-overlay"
          onClick={() => !isSaving && setIsModalOpen(false)}
        >

          <div
            className="wd-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="wd-modal-header">

              <div>

                <h2>
                  {ad
                    ? "Update Service Advertisement"
                    : "Post Service Ad"}
                </h2>

                <p>
                  Your ad will be reviewed by an admin before
                  going live for 7 days.
                </p>

              </div>

              <button
                type="button"
                className="wd-modal-close"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Form */}

            <form
              className="wd-modal-form"
              onSubmit={handleSubmitAd}
            >

              {/* Worker Profile Information */}

              <div className="wd-form-row">

                <div className="wd-form-group">

                  <label>Worker Name (From Profile)</label>

                  <input
                    type="text"
                    value={workerName}
                    disabled
                    className="wd-input-disabled"
                  />

                </div>

                <div className="wd-form-group">

                  <label>Phone Number (From Profile)</label>

                  <input
                    type="text"
                    value={workerPhone}
                    disabled
                    className="wd-input-disabled"
                  />

                </div>

              </div>

              {/* Service Title */}

              <div className="wd-form-group">

                <label>Service Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Professional House Wiring & Electrical Repair"
                  maxLength={100}
                  required
                  disabled={isSaving}
                />

              </div>

              {/* Skill and District */}

              <div className="wd-form-row">

                <div className="wd-form-group">

                  <label>Main Skill</label>

                  <select
                    name="skill"
                    value={formData.skill}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                  >

                    <option value="">Select Skill</option>

                    {WORKER_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="wd-form-group">

                  <label>District</label>

                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                  >

                    <option value="">Select District</option>

                    {SRI_LANKA_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              {/* Expected Rate */}

              <div className="wd-form-group">

                <label>Expected Rate / Price</label>

                <input
                  type="text"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  placeholder="e.g., Rs. 3,500 / day"
                  maxLength={60}
                  required
                  disabled={isSaving}
                />

              </div>

              {/* Description */}

              <div className="wd-form-group">

                <label>Service Description</label>

                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe your service, experience, and availability..."
                  maxLength={1000}
                  disabled={isSaving}
                />

              </div>

              {/* Modal Footer */}

              <div className="wd-modal-footer">

                <button
                  type="button"
                  className="wd-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="wd-btn-submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Submitting..."
                    : "Submit for Approval"}
                </button>

              </div>

            </form>

          </div>
        </div>

      )}

    </div>
  );
}

export default WorkerDashboard;
