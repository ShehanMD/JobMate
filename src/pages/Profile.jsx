import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Map,
  Calendar,
  BarChart3,
  LogIn,
  Clock,
  History,
  Pencil,
  X,
  AlertCircle,
  User,
  Check,
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

const formatLongDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return dateInput || "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Profile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user || auth?.currentUser || {};

  const userEmail = currentUser.email || "user@example.com";
  const storageKey = `pattajobs_profile_${userEmail}`;

  const initialName =
    currentUser.fullName ||
    currentUser.name ||
    currentUser.displayName ||
    currentUser.username ||
    "User";
  const initialPhone =
    currentUser.phone || currentUser.phoneNumber || currentUser.mobile || "";
  const initialDistrict = currentUser.district || "";
  const initialDob =
    currentUser.dob || currentUser.dateOfBirth || currentUser.birthday || "";
  const initialAddress = currentUser.address || "";
  const initialJoined = currentUser.joinedDate || formatLongDate();

  const [profile, setProfile] = useState({
    fullName: initialName,
    email: userEmail,
    phone: initialPhone,
    district: initialDistrict,
    dob: initialDob,
    address: initialAddress,
    status: currentUser.status || "Active Account",
    joinedDate: initialJoined,
    activeDays: currentUser.activeDays ?? 0,
    totalLogins: currentUser.totalLogins ?? 0,
    lastActive: currentUser.lastActive || "N/A",
    recentActivities: currentUser.recentActivities || [],
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const baseData = {
      fullName: initialName,
      email: userEmail,
      phone: initialPhone,
      district: initialDistrict,
      dob: initialDob,
      address: initialAddress,
      status: currentUser.status || "Active Account",
      joinedDate: initialJoined,
      activeDays: currentUser.activeDays ?? 0,
      totalLogins: currentUser.totalLogins ?? 0,
      lastActive: currentUser.lastActive || "N/A",
      recentActivities: currentUser.recentActivities || [],
    };

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = {
          ...baseData,
          ...parsed,
          email: userEmail,
          phone: parsed.phone || baseData.phone,
          district: parsed.district || baseData.district,
          dob: parsed.dob || baseData.dob,
          address: parsed.address || baseData.address,
        };
        setProfile(merged);
        setFormData(merged);
        return;
      } catch {
        // ignore invalid storage
      }
    }

    setProfile(baseData);
    setFormData(baseData);
  }, [
    storageKey,
    userEmail,
    initialName,
    initialPhone,
    initialDistrict,
    initialDob,
    initialAddress,
    initialJoined,
  ]);

  // Show orange banner ONLY if any required field is empty
  const isProfileIncomplete =
    !profile.fullName?.trim() ||
    !profile.phone?.trim() ||
    !profile.district?.trim() ||
    !profile.dob?.trim() ||
    !profile.address?.trim();

  const openEditModal = () => {
    setFormData(profile);
    setPhoneError("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setFormData(profile);
    setPhoneError("");
    setIsEditModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      if (digitsOnly.length === 10) {
        setPhoneError("");
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    const newActivity = {
      id: Date.now(),
      title: "Profile Updated",
      date: formatShortDate(new Date()),
    };

    const updatedProfile = {
      ...profile,
      fullName: formData.fullName.trim() || profile.fullName,
      phone: formData.phone,
      district: formData.district,
      dob: formData.dob,
      address: formData.address.trim(),
      recentActivities: [newActivity, ...(profile.recentActivities || [])].slice(
        0,
        10
      ),
    };

    setProfile(updatedProfile);
    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
    setPhoneError("");
    setIsEditModalOpen(false);
  };

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

        {/* Complete Profile Alert Banner - Only shown if incomplete */}
        {isProfileIncomplete && (
          <div className="pj-incomplete-banner">
            <div className="pj-incomplete-left">
              <div className="pj-incomplete-icon">
                <AlertCircle size={20} />
              </div>
              <div>
                <strong>Complete your profile</strong>
                <p>
                  Some profile details are missing. Please update your details
                  to complete your PattaJobs profile.
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
              <span className="pj-avatar-check" title="Active">
                <Check size={12} strokeWidth={3} />
              </span>
            </div>

            <div className="pj-hero-details">
              <span className="pj-active-pill">
                <span className="pj-active-dot" />
                {profile.status}
              </span>

              <h1>{profile.fullName}</h1>

              <div className="pj-hero-meta-list">
                <div className="pj-hero-meta-item">
                  <Mail size={15} />
                  <span>{profile.email}</span>
                </div>
                <div className="pj-hero-meta-item">
                  <MapPin size={15} />
                  <span>
                    {profile.district
                      ? `${profile.district}, Sri Lanka`
                      : "Sri Lanka"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pj-hero-divider" />

          <div className="pj-hero-right">
            <div className="pj-member-since">
              <Calendar size={18} className="pj-green-icon" />
              <div>
                <span>Member Since</span>
                <strong>{profile.joinedDate}</strong>
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
                <p>Your account details and profile information</p>
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
                <strong>{profile.email}</strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Phone size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Phone Number</span>
                <strong className={!profile.phone ? "pj-muted" : ""}>
                  {profile.phone || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <MapPin size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>District</span>
                <strong className={!profile.district ? "pj-muted" : ""}>
                  {profile.district || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Calendar size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Date of Birth</span>
                <strong className={!profile.dob ? "pj-muted" : ""}>
                  {profile.dob ? formatShortDate(profile.dob) : "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <div className="pj-info-text">
                <span>Address</span>
                <strong className={!profile.address ? "pj-muted" : ""}>
                  {profile.address || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="pj-info-item">
              <Calendar size={19} className="pj-info-icon" />
              <div className="pj-info-text">
                <span>Joined Date</span>
                <strong>{profile.joinedDate}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Overview Card */}
        <section className="pj-card">
          <div className="pj-card-header">
            <div className="pj-card-title-group">
              <BarChart3 size={21} className="pj-green-icon" />
              <div>
                <h2>Activity Overview</h2>
                <p>Summary of your PattaJobs account activity</p>
              </div>
            </div>
          </div>

          <div className="pj-kpi-grid">
            <div className="pj-kpi-card">
              <div className="pj-kpi-icon-circle">
                <Calendar size={20} />
              </div>
              <div className="pj-kpi-text">
                <strong>{profile.activeDays}</strong>
                <span>Recorded Active Days</span>
              </div>
            </div>

            <div className="pj-kpi-card">
              <div className="pj-kpi-icon-circle">
                <LogIn size={20} />
              </div>
              <div className="pj-kpi-text">
                <strong>{profile.totalLogins}</strong>
                <span>Total Logins</span>
              </div>
            </div>

            <div className="pj-kpi-card">
              <div className="pj-kpi-icon-circle">
                <Clock size={20} />
              </div>
              <div className="pj-kpi-text">
                <strong>{profile.lastActive || "N/A"}</strong>
                <span>Last Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Card */}
        <section className="pj-card">
          <div className="pj-card-header">
            <div className="pj-card-title-group">
              <History size={21} className="pj-green-icon" />
              <div>
                <h2>Recent Activity</h2>
                <p>Your latest account activities</p>
              </div>
            </div>
          </div>

          {profile.recentActivities && profile.recentActivities.length > 0 ? (
            <div className="pj-recent-list">
              {profile.recentActivities.map((item) => (
                <div key={item.id} className="pj-recent-item">
                  <div className="pj-recent-left">
                    <div className="pj-recent-icon-wrap">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <time>{item.date}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="pj-empty-activity">
              <History size={30} strokeWidth={1.6} />
              <p>No activity records available.</p>
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="pj-modal-overlay" onClick={closeEditModal}>
          <div
            className="pj-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pj-modal-header">
              <div>
                <h2>Edit Job Seeker</h2>
                <p>Update your Job Seeker account details.</p>
              </div>
              <button
                type="button"
                className="pj-modal-close-btn"
                onClick={closeEditModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form className="pj-modal-form" onSubmit={handleSave}>
              <div className="pj-form-grid">
                <div className="pj-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="pj-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="pj-input-disabled"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Phone Number (10 Digits)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                  {phoneError && (
                    <span className="pj-field-error">{phoneError}</span>
                  )}
                </div>

                <div className="pj-form-group">
                  <label>District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select District</option>
                    {SRI_LANKA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pj-form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="pj-form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter home address"
                    required
                  />
                </div>

                <div className="pj-form-group">
                  <label>Joined Date</label>
                  <input
                    type="text"
                    value={profile.joinedDate}
                    disabled
                    className="pj-input-disabled"
                  />
                </div>

                <div className="pj-form-group">
                  <label>Account Status</label>
                  <input
                    type="text"
                    value={profile.status}
                    disabled
                    className="pj-input-disabled"
                  />
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

export default Profile;