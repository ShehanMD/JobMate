import React, { useEffect, useState } from "react";
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

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const WORKER_SKILLS = [
  "Electrician", "Plumber", "Carpenter", "Painter", "Technician",
  "Construction Worker", "Mason", "Welder", "Mechanic", "Other",
];

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getRemainingDays = (approvedAt) => {
  if (!approvedAt) return 7;
  const start = new Date(approvedAt);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const left = 7 - daysPassed;
  return left > 0 ? left : 0;
};

function WorkerDashboard() {
  const auth = useAuth();
  const firebaseUser = auth?.currentUser || {};
  const userData = auth?.userData || {};

  const email = userData.email || firebaseUser.email || "worker@pattajobs.com";

  // WorkerProfile එකේ save කරපු අලුත්ම name & phone ගන්නවා
  let savedProfile = {};
  try {
    savedProfile = JSON.parse(
      localStorage.getItem(`pattajobs_worker_profile_${email}`) || "{}"
    );
  } catch {
    savedProfile = {};
  }

  const workerName =
    savedProfile.name ||
    userData.name ||
    userData.fullName ||
    firebaseUser.displayName ||
    "Worker";
  const workerPhone =
    savedProfile.phone || userData.phone || userData.phoneNumber || "Not provided";
  const workerSkill =
    savedProfile.skill || userData.skill || userData.mainSkill || "Skilled Worker";
  const workerDistrict =
    savedProfile.location || userData.location || userData.district || "Sri Lanka";
  const isVerified =
    (userData.verificationStatus || "").toLowerCase() === "verified";

  const adStorageKey = `pattajobs_worker_ad_${email}`;

  const [ad, setAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    skill: workerSkill !== "Skilled Worker" ? workerSkill : "",
    district: workerDistrict !== "Sri Lanka" ? workerDistrict : "",
    rate: "",
    description: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(adStorageKey);
      if (saved) {
        setAd(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load service ad:", err);
    }
  }, [adStorageKey]);

  const openPostModal = (isEdit = false) => {
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
        title: "",
        skill: workerSkill !== "Skilled Worker" ? workerSkill : "",
        district: workerDistrict !== "Sri Lanka" ? workerDistrict : "",
        rate: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAd = (e) => {
    e.preventDefault();
    const newAd = {
      id: ad?.id || Date.now().toString(),
      workerName,
      workerPhone,
      title: formData.title.trim(),
      skill: formData.skill,
      district: formData.district,
      rate: formData.rate.trim(),
      description: formData.description.trim(),
      status: "Pending",
      rejectionReason: "",
      views: ad?.views || 0,
      submittedAt: new Date().toISOString(),
      approvedAt: null,
    };

    setAd(newAd);
    localStorage.setItem(adStorageKey, JSON.stringify(newAd));
    setIsModalOpen(false);
  };

  const handleDeleteAd = () => {
    const msg =
      ad?.status === "Approved"
        ? "Are you sure you want to delete this published advertisement? Note: You can still only publish 1 ad per week."
        : "Are you sure you want to delete your service advertisement?";

    if (window.confirm(msg)) {
      setAd(null);
      localStorage.removeItem(adStorageKey);
    }
  };

  const remainingDays =
    ad?.status === "Approved" ? getRemainingDays(ad.approvedAt) : null;
  const isExpired = ad?.status === "Approved" && remainingDays === 0;
  const canPostNew = !ad || ad.status === "Rejected" || isExpired;

  return (
    <div className="wd-page">
      {/* Dark Emerald Hero Banner */}
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
              {isVerified ? "Verified Skilled Worker" : "Verification Pending"}
            </span>
          </div>

          <div className="wd-hero-actions">
            <button
              type="button"
              className="wd-post-btn"
              onClick={() => openPostModal(false)}
              disabled={!canPostNew}
              title={
                !canPostNew
                  ? "You already have an active or pending ad this week"
                  : "Post your weekly service advertisement"
              }
            >
              <Plus size={18} />
              <span>Post Service Ad</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="wd-container">
        {/* Floating 3 KPI Cards */}
        <section className="wd-stats-grid">
          <div className="wd-stat-card">
            <div className="wd-stat-icon">
              <ClipboardList size={22} />
            </div>
            <div className="wd-stat-info">
              <span className="wd-stat-label">Active Ad Limit</span>
              <strong className="wd-stat-value">1 Ad / Week</strong>
              <span className="wd-stat-sub">
                Maximum 1 service advertisement per week
              </span>
            </div>
          </div>

          <div className="wd-stat-card">
            <div className="wd-stat-icon">
              <Eye size={22} />
            </div>
            <div className="wd-stat-info">
              <span className="wd-stat-label">Total Views</span>
              <strong className="wd-stat-value">{ad?.views || 0} Views</strong>
              <span className="wd-stat-sub">
                People who viewed your advertisement
              </span>
            </div>
          </div>

          <div className="wd-stat-card">
            <div className="wd-stat-icon">
              <Clock size={22} />
            </div>
            <div className="wd-stat-info">
              <span className="wd-stat-label">Ad Expiry</span>
              <strong className="wd-stat-value">
                {!ad
                  ? "No Active Ad"
                  : ad.status === "Pending"
                  ? "7 Days Validity"
                  : ad.status === "Rejected"
                  ? "Rejected"
                  : isExpired
                  ? "Expired"
                  : `${remainingDays} ${
                      remainingDays === 1 ? "Day" : "Days"
                    } Left`}
              </strong>
              <span className="wd-stat-sub">Service ads are valid for 7 days</span>
            </div>
          </div>
        </section>

        {/* Main 2-Column Content */}
        <div className="wd-main-grid">
          {/* Left Column: My Service Advertisement */}
          <div className="wd-left-col">
            <div className="wd-section-header">
              <h2>My Service Advertisement</h2>
              <span>(1 Ad Limit &bull; Valid for 7 Days)</span>
            </div>

            {ad ? (
              <div className="wd-ad-card">
                <div className="wd-ad-top">
                  <div className="wd-ad-thumb">
                    <Briefcase size={30} />
                  </div>

                  <div className="wd-ad-content">
                    <div className="wd-ad-title-row">
                      <h3>{ad.title}</h3>
                      <span className="wd-ad-rate">{ad.rate}</span>
                    </div>

                    {/* Worker Name & Phone Strip */}
                    <div className="wd-ad-contact-strip">
                      <span>
                        <User size={15} /> {ad.workerName || workerName}
                      </span>
                      <span>
                        <Phone size={15} /> {ad.workerPhone || workerPhone}
                      </span>
                    </div>

                    <div className="wd-ad-meta">
                      <span>
                        <MapPin size={15} /> {ad.district}, Sri Lanka
                      </span>
                      <span>
                        <Briefcase size={15} /> {ad.skill}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="wd-status-wrap">
                      {ad.status === "Pending" && (
                        <span className="wd-status-badge pending">
                          <Clock size={14} /> Wait for Admin Approval
                        </span>
                      )}

                      {ad.status === "Approved" && !isExpired && (
                        <span className="wd-status-badge approved">
                          <CheckCircle2 size={14} /> Published &bull;{" "}
                          {remainingDays} Days Left
                        </span>
                      )}

                      {isExpired && (
                        <span className="wd-status-badge expired">
                          <Clock size={14} /> Ad Expired (7 Days Completed)
                        </span>
                      )}

                      {ad.status === "Rejected" && (
                        <span className="wd-status-badge rejected">
                          <XCircle size={14} /> Rejected by Admin
                        </span>
                      )}
                    </div>

                    {/* Status Details & Info Boxes */}
                    {ad.status === "Pending" && (
                      <>
                        <p className="wd-ad-subtext">
                          Submitted on {formatShortDate(ad.submittedAt)} &bull;
                          Admin is reviewing your ad. Ads publish after
                          approval.
                        </p>
                        <div className="wd-validity-line">
                          <Hourglass size={15} />
                          <span>7 Days Validity (Pending Approval)</span>
                        </div>
                        <div className="wd-alert-box warning">
                          <AlertTriangle size={16} />
                          <span>
                            Once approved, this ad will be live for 7 days.
                          </span>
                        </div>
                      </>
                    )}

                    {ad.status === "Approved" && !isExpired && (
                      <div className="wd-alert-box success">
                        <CheckCircle2 size={16} />
                        <span>
                          Your advertisement is live! It will automatically
                          expire in <strong>{remainingDays} days</strong>.
                        </span>
                      </div>
                    )}

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

                    {ad.description && (
                      <p className="wd-ad-desc">{ad.description}</p>
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
                        >
                          <Pencil size={15} />
                          <span>Edit Advertisement</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="wd-btn-outline danger"
                        onClick={handleDeleteAd}
                      >
                        <Trash2 size={15} />
                        <span>Delete Ad</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="wd-empty-card">
                <div className="wd-empty-icon">
                  <Briefcase size={32} />
                </div>
                <h3>No Service Advertisement Yet</h3>
                <p>
                  Post your service advertisement to reach customers in{" "}
                  {workerDistrict}. You can publish 1 ad per week, valid for 7
                  days after admin approval.
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

            {/* Bottom Blue Notice */}
            <div className="wd-notice-bar">
              <Info size={18} className="wd-notice-icon" />
              <p>
                <strong>Notice:</strong> If admin rejects your ad, it will show
                as &apos;Rejected&apos;. You can modify and re-submit. Only 1 ad
                can be published per week.
              </p>
            </div>
          </div>

          {/* Right Column: AdSense Box & Guidelines */}
          <aside className="wd-right-col">
            {/* Blank Box for Google AdSense */}
            <div className="wd-adsense-card">
              <div className="wd-adsense-placeholder">
                <strong>Advertisement Space</strong>
                <span>Sponsored / Google AdSense</span>
              </div>
            </div>

            {/* Ad Guidelines & Rules */}
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

      {/* Post / Edit Service Ad Modal */}
      {isModalOpen && (
        <div
          className="wd-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="wd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wd-modal-header">
              <div>
                <h2>
                  {ad ? "Update Service Advertisement" : "Post Service Ad"}
                </h2>
                <p>
                  Your ad will be reviewed by an admin before going live for 7
                  days.
                </p>
              </div>
              <button
                type="button"
                className="wd-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form className="wd-modal-form" onSubmit={handleSubmitAd}>
              {/* Read-Only Saved Profile Info */}
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

              <div className="wd-form-group">
                <label>Service Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Professional House Wiring & Electrical Repair"
                  required
                />
              </div>

              <div className="wd-form-row">
                <div className="wd-form-group">
                  <label>Main Skill</label>
                  <select
                    name="skill"
                    value={formData.skill}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Skill</option>
                    {WORKER_SKILLS.map((s) => (
                      <option key={s} value={s}>
                        {s}
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
                  >
                    <option value="">Select District</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wd-form-group">
                <label>Expected Rate / Price</label>
                <input
                  type="text"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  placeholder="e.g., Rs. 3,500 / day"
                  required
                />
              </div>

              <div className="wd-form-group">
                <label>Service Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe your service, experience, and availability..."
                />
              </div>

              <div className="wd-modal-footer">
                <button
                  type="button"
                  className="wd-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="wd-btn-submit">
                  Submit for Approval
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