import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Map,
  Briefcase,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Award,
  Pencil,
  X,
  Check,
  AlertCircle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

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

const AVAILABILITY_OPTIONS = [
  "Full-time", "Part-time", "Weekends Only", "On-Call / Contract",
];

const formatDate = (value) => {
  if (!value) return "";
  if (typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safeText = (value) => {
  if (
    value === undefined ||
    value === null ||
    typeof value === "object" ||
    String(value).trim() === ""
  ) {
    return "";
  }
  return String(value);
};

function WorkerProfile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const firebaseUser = auth?.currentUser || {};
  const userData = auth?.userData || {};

  const email = userData.email || firebaseUser.email || "";
  const storageKey = `pattajobs_worker_profile_${email}`;

  const buildBaseWorker = () => ({
    name:
      userData.name ||
      userData.fullName ||
      firebaseUser.displayName ||
      "Skilled Worker",
    email,
    phone: userData.phone || userData.phoneNumber || "",
    location: userData.location || userData.district || "",
    dateOfBirth: userData.dateOfBirth || userData.dob || "",
    gender: userData.gender || "",
    address: userData.address || "",
    skill: userData.skill || userData.mainSkill || "",
    experienceYears: userData.experienceYears ?? userData.experience ?? "",
    skills: Array.isArray(userData.skills)
      ? userData.skills.join(", ")
      : userData.skills || userData.otherSkills || "",
    qualifications: userData.qualifications || "",
    workExperience:
      userData.workExperience || userData.previousWorkExperience || "",
    expectedSalary: userData.expectedSalary || "",
    availability: userData.availability || "",
    status: userData.status || "Active",
    verificationStatus: userData.verificationStatus || "Pending",
    createdAt:
      formatDate(userData.createdAt || userData.joinedDate) ||
      formatDate(new Date()),
    lastActive: formatDate(userData.lastActive) || "N/A",
    verifiedAt: formatDate(userData.verifiedAt || userData.verifiedDate) || "",
  });

  const [worker, setWorker] = useState(buildBaseWorker);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState(worker);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const base = buildBaseWorker();
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...base, ...parsed, email };
        setWorker(merged);
        setFormData(merged);
        return;
      } catch {
        // ignore invalid localStorage data
      }
    }
    setWorker(base);
    setFormData(base);
  }, [email, auth?.userData]);

  const isProfileIncomplete =
    !safeText(worker.name) ||
    !safeText(worker.phone) ||
    !safeText(worker.location) ||
    !safeText(worker.skill) ||
    !safeText(worker.address);

  const openEditModal = () => {
    setFormData(worker);
    setPhoneError("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setFormData(worker);
    setPhoneError("");
    setIsEditOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      if (digitsOnly.length === 10 || digitsOnly.length === 0) {
        setPhoneError("");
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.phone && formData.phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }
    const updated = { ...worker, ...formData };
    setWorker(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setPhoneError("");
    setIsEditOpen(false);
  };

  const verificationStatus = worker.verificationStatus || "Pending";

  return (
    <div className="pj-profile-page">
      <div className="pj-profile-container">
        {/* Top-Left Back Button */}
        <div className="pj-back-row">
          <button
            type="button"
            className="pj-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        {/* Incomplete Profile Banner */}
        {isProfileIncomplete && (
          <div className="pj-incomplete-banner">
            <div className="pj-incomplete-left">
              <div className="pj-incomplete-icon">
                <AlertCircle size={20} />
              </div>
              <div>
                <strong>Complete your worker profile</strong>
                <p>
                  Add your skills, experience, and contact details so clients
                  can find and hire you on PattaJobs.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="pj-complete-btn"
              onClick={openEditModal}
            >
              Update Profile
            </button>
          </div>
        )}

        {/* Hero Profile Card */}
        <section className="pj-hero-card">
          <div className="pj-hero-left">
            <div className="pj-avatar-wrap">
              <div className="pj-avatar-circle">
                <User size={44} strokeWidth={2} />
              </div>
              <span className="pj-avatar-check" title={worker.status}>
                <Check size={12} strokeWidth={3} />
              </span>
            </div>

            <div className="pj-hero-details">
              <span className="pj-active-pill">
                <span className="pj-active-dot" />
                {worker.status} • {worker.skill || "Skilled Worker"}
              </span>

              <h1>{worker.name}</h1>

              <div className="pj-hero-meta-list">
                <div className="pj-hero-meta-item">
                  <Mail size={15} />
                  <span>{worker.email}</span>
                </div>
                <div className="pj-hero-meta-item">
                  <MapPin size={15} />
                  <span>
                    {worker.location
                      ? `${worker.location}, Sri Lanka`
                      : "Sri Lanka"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pj-hero-divider" />

          <div
            className="pj-hero-right"
            style={{ flexDirection: "column", alignItems: "flex-start", gap: "14px" }}
          >
            <div className="pj-member-since">
              <Calendar size={18} className="pj-green-icon" />
              <div>
                <span>Member Since</span>
                <strong>{worker.createdAt}</strong>
              </div>
            </div>

            <div className="pj-member-since">
              <ShieldCheck size={18} className="pj-green-icon" />
              <div>
                <span>Verification Status</span>
                <strong>{verificationStatus}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Information Card */}
        <section className="pj-card">
          <div className="pj-card-header">
            <div className="pj-card-title-group">
              <User size={21} className="pj-green-icon" />
              <div>
                <h2>Personal Information</h2>
                <p>Your account details and contact information</p>
              </div>
            </div>

            <button
              type="button"
              className="pj-edit-profile-btn"
              onClick={openEditModal}
            >
              <Pencil size={15} />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="pj-info-grid">
            <div className="pj-info-item">
              <Mail size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Email Address</span>
                <strong>{worker.email}</strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Phone size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Phone Number</span>
                <strong className={!safeText(worker.phone) ? "pj-muted" : ""}>
                  {safeText(worker.phone) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <MapPin size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>District</span>
                <strong className={!safeText(worker.location) ? "pj-muted" : ""}>
                  {safeText(worker.location) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Calendar size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Date of Birth</span>
                <strong className={!safeText(worker.dateOfBirth) ? "pj-muted" : ""}>
                  {safeText(worker.dateOfBirth)
                    ? formatDate(worker.dateOfBirth)
                    : "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <User size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Gender</span>
                <strong className={!safeText(worker.gender) ? "pj-muted" : ""}>
                  {safeText(worker.gender) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <div className="pj-info-text">
                <span>Full Address</span>
                <strong className={!safeText(worker.address) ? "pj-muted" : ""}>
                  {safeText(worker.address) || "Not provided"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Information Card */}
        <section className="pj-card">
          <div className="pj-card-header">
            <div className="pj-card-title-group">
              <Briefcase size={21} className="pj-green-icon" />
              <div>
                <h2>Professional Information</h2>
                <p>Your skills, work experience, and expected rates</p>
              </div>
            </div>
          </div>

          <div className="pj-info-grid">
            <div className="pj-info-item">
              <Briefcase size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Main Skill</span>
                <strong className={!safeText(worker.skill) ? "pj-muted" : ""}>
                  {safeText(worker.skill) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Clock size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Experience</span>
                <strong
                  className={!safeText(worker.experienceYears) ? "pj-muted" : ""}
                >
                  {safeText(worker.experienceYears)
                    ? `${worker.experienceYears} years`
                    : "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Award size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Other Skills</span>
                <strong className={!safeText(worker.skills) ? "pj-muted" : ""}>
                  {safeText(worker.skills) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <FileText size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Qualifications</span>
                <strong
                  className={!safeText(worker.qualifications) ? "pj-muted" : ""}
                >
                  {safeText(worker.qualifications) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Briefcase size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Previous Work Experience</span>
                <strong
                  className={!safeText(worker.workExperience) ? "pj-muted" : ""}
                >
                  {safeText(worker.workExperience) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <BarChart3 size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Expected Salary / Rate</span>
                <strong
                  className={!safeText(worker.expectedSalary) ? "pj-muted" : ""}
                >
                  {safeText(worker.expectedSalary) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Calendar size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Availability</span>
                <strong
                  className={!safeText(worker.availability) ? "pj-muted" : ""}
                >
                  {safeText(worker.availability) || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <ShieldCheck size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Verified Date</span>
                <strong className={!safeText(worker.verifiedAt) ? "pj-muted" : ""}>
                  {safeText(worker.verifiedAt) || "Not verified yet"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Account Overview KPI Cards */}
        <section className="pj-card">
          <div className="pj-card-header">
            <div className="pj-card-title-group">
              <BarChart3 size={21} className="pj-green-icon" />
              <div>
                <h2>Account Overview</h2>
                <p>Summary of your PattaJobs worker account</p>
              </div>
            </div>
          </div>

          <div className="pj-kpi-grid">
            <div className="pj-kpi-card">
              <div className="pj-kpi-icon-circle">
                <CheckCircle2 size={20} />
              </div>
              <div className="pj-kpi-text">
                <strong>{worker.status}</strong>
                <span>Account Status</span>
              </div>
            </div>

            <div className="pj-kpi-card">
              <div className="pj-kpi-icon-circle">
                <ShieldCheck size={20} />
              </div>
              <div className="pj-kpi-text">
                <strong>{verificationStatus}</strong>
                <span>Verification Status</span>
              </div>
            </div>

            <div className="pj-kpi-card">
              <div className="pj-kpi-icon-circle">
                <Clock size={20} />
              </div>
              <div className="pj-kpi-text">
                <strong>{worker.lastActive || "N/A"}</strong>
                <span>Last Active</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Worker Profile Modal */}
      {isEditOpen && (
        <div className="pj-modal-overlay" onClick={closeEditModal}>
          <div className="pj-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pj-modal-header">
              <div>
                <h2>Edit Worker Profile</h2>
                <p>Update your personal and professional details.</p>
              </div>
              <button
                type="button"
                className="pj-modal-close-btn"
                onClick={closeEditModal}
              >
                <X size={20} />
              </button>
            </div>

            <form className="pj-modal-form" onSubmit={handleSave}>
              <div className="pj-form-grid">
                <div className="pj-form-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="pj-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    disabled
                    className="pj-input-disabled"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Phone Number (10 Digits)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="07XXXXXXXX"
                  />
                  {phoneError && (
                    <span className="pj-field-error">{phoneError}</span>
                  )}
                </div>

                <div className="pj-form-group">
                  <label>District</label>
                  <select
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select District</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pj-form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="pj-form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pj-form-group">
                  <label>Full Address</label>
                  <input
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="Enter home address"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Main Skill</label>
                  <select
                    name="skill"
                    value={formData.skill || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Main Skill</option>
                    {WORKER_SKILLS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pj-form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears || ""}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Other Skills</label>
                  <input
                    name="skills"
                    value={formData.skills || ""}
                    onChange={handleChange}
                    placeholder="e.g., AC Repair, CCTV"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Qualifications</label>
                  <input
                    name="qualifications"
                    value={formData.qualifications || ""}
                    onChange={handleChange}
                    placeholder="e.g., NVQ Level 4"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Previous Work Experience</label>
                  <input
                    name="workExperience"
                    value={formData.workExperience || ""}
                    onChange={handleChange}
                    placeholder="e.g., ABC Electricals"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Expected Salary / Rate</label>
                  <input
                    name="expectedSalary"
                    value={formData.expectedSalary || ""}
                    onChange={handleChange}
                    placeholder="e.g., Rs. 3,500 / day"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Availability</label>
                  <select
                    name="availability"
                    value={formData.availability || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Availability</option>
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pj-modal-footer">
                <button
                  type="button"
                  className="pj-btn-cancel"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button type="submit" className="pj-btn-save">
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

export default WorkerProfile;