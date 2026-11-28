
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnimatePresence, motion } from "motion/react";

import {
  Search,
  MapPin,
  Briefcase,
  Phone,
  User,
  ShieldCheck,
  RotateCcw,
  Eye,
  Clock,
  X,
  Wrench,
} from "lucide-react";

import {
  subscribeToApprovedWorkerAds,
  getRemainingDays,
  isWorkerAdExpired,
} from "../services/workerAdService";

import "./SkilledWorkers.css";

// ======================================
// DISTRICTS
// ======================================

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa",
  "Colombo", "Galle", "Gampaha", "Hambantota",
  "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale",
  "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

// ======================================
// SKILLS
// ======================================

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

// ======================================
// SKILLED WORKERS PAGE
// ======================================

function SkilledWorkers() {
  const [ads, setAds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [selectedAd, setSelectedAd] = useState(null);

  // Refresh expiry calculations every minute.
  const [dateCheck, setDateCheck] = useState(Date.now());

  // ======================================
  // FIRESTORE REAL-TIME LISTENER
  // ======================================

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToApprovedWorkerAds(
      (fetchedAds) => {
        setAds(fetchedAds);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Failed to load worker advertisements:", err);

        setError(
          "Unable to load skilled services. Please try again later."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ======================================
  // UPDATE EXPIRY CHECK
  // ======================================

  useEffect(() => {
    const interval = setInterval(() => {
      setDateCheck(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ======================================
  // FILTER ADVERTISEMENTS
  // ======================================

  const filteredAds = useMemo(() => {
    // Recalculate remaining days when dateCheck changes.
    void dateCheck;

    return ads.filter((ad) => {
      // Only currently valid approved ads.
      if (
        ad.status !== "Approved" ||
        isWorkerAdExpired(ad)
      ) {
        return false;
      }

      const q = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !q ||
        String(ad.title || "").toLowerCase().includes(q) ||
        String(ad.workerName || "").toLowerCase().includes(q) ||
        String(ad.skill || "").toLowerCase().includes(q) ||
        String(ad.description || "").toLowerCase().includes(q);

      const matchesSkill =
        !selectedSkill ||
        ad.skill === selectedSkill;

      const matchesDistrict =
        !selectedDistrict ||
        ad.district === selectedDistrict;

      return (
        matchesSearch &&
        matchesSkill &&
        matchesDistrict
      );
    });
  }, [
    ads,
    searchTerm,
    selectedSkill,
    selectedDistrict,
    dateCheck,
  ]);

  // ======================================
  // RESET FILTERS
  // ======================================

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSkill("");
    setSelectedDistrict("");
  };

  // ======================================
  // CLOSE DETAILS
  // ======================================

  const closeDetails = () => {
    setSelectedAd(null);
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="sw-page">

      {/* ==================================
          HERO BANNER
      ================================== */}

      <motion.section
        className="sw-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="sw-hero-inner"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="sw-hero-kicker">
            TRUSTED LOCAL PROFESSIONALS
          </span>

          <h1>
            Find Skilled Workers <br />
            <span>Near You.</span>
          </h1>

          <p>
            Connect directly with electricians, plumbers, masons,
            and technicians across Sri Lanka.
          </p>

          <motion.div
            className="sw-hero-pill"
            key={filteredAds.length}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Wrench size={15} />

            <span>
              {filteredAds.length} skilled services available
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ==================================
          MAIN CONTENT
      ================================== */}

      <div className="sw-container">

        {/* SEARCH AND FILTER CARD */}

        <motion.section
          className="sw-filter-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="sw-filter-header">
            <h2>Find Skilled Workers</h2>

            <p>
              Search by service, skill, or district to find the right person.
            </p>
          </div>

          <div className="sw-filter-controls">

            {/* SEARCH */}

            <div className="sw-search-box">
              <Search size={17} className="sw-search-icon" />

              <input
                type="text"
                placeholder="Search service, skill, or worker name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* SKILL FILTER */}

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">All Skills</option>

              {WORKER_SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            {/* DISTRICT FILTER */}

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All Districts</option>

              {SRI_LANKA_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            {/* RESET */}

            <motion.button
              type="button"
              className="sw-reset-btn"
              onClick={handleReset}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </motion.button>

          </div>
        </motion.section>

        {/* ==================================
            RESULTS HEADER
        ================================== */}

        <motion.div
          className="sw-results-header"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div>
            <h2>Available Skilled Services</h2>

            <p>
              Admin-reviewed service advertisements from skilled workers
            </p>
          </div>

          <span className="sw-results-badge">
            {filteredAds.length}{" "}
            {filteredAds.length === 1 ? "Result" : "Results"}
          </span>
        </motion.div>

        {/* ==================================
            LOADING STATE
        ================================== */}

        {loading && (
          <motion.div
            className="sw-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="jobs-loader" />
            <p>Loading skilled services...</p>
          </motion.div>
        )}

        {/* ==================================
            ERROR STATE
        ================================== */}

        {!loading && error && (
          <motion.div
            className="sw-empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangleIcon />
            <h3>Unable to Load Services</h3>
            <p>{error}</p>
          </motion.div>
        )}

        {/* ==================================
            WORKER CARDS
        ================================== */}

        {!loading && !error && filteredAds.length > 0 && (
          <div className="sw-grid">

            <AnimatePresence mode="popLayout">
              {filteredAds.map((ad, index) => {
                const daysLeft = getRemainingDays(
                  ad.approvedAt,
                  ad.expiresAt
                );

                return (
                  <motion.article
                    key={ad.id}
                    className="sw-card"
                    layout
                    initial={{
                      opacity: 0,
                      y: 25,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 15,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(index * 0.07, 0.3),
                    }}
                    whileHover={{
                      y: -6,
                      transition: { duration: 0.2 },
                    }}
                  >

                    {/* CARD TOP */}

                    <div className="sw-card-top">

                      <div className="sw-card-icon">
                        <Briefcase size={20} />
                      </div>

                      <span className="sw-skill-tag">
                        {ad.skill || "Skilled Worker"}
                      </span>

                    </div>

                    {/* SERVICE TITLE */}

                    <h3 className="sw-card-title">
                      {ad.title}
                    </h3>

                    {/* WORKER NAME */}

                    <div className="sw-worker-row">

                      <span className="sw-worker-name">
                        <User size={15} />
                        {ad.workerName || "Skilled Worker"}
                      </span>

                      {ad.isVerified && (
                        <span
                          className="sw-verified-chip"
                          title="Verified Worker"
                        >
                          <ShieldCheck size={13} />
                          Verified
                        </span>
                      )}

                    </div>

                    {/* DESCRIPTION */}

                    <p className="sw-card-desc">
                      {ad.description ||
                        "Contact the worker for more service details."}
                    </p>

                    {/* LOCATION AND RATE */}

                    <div className="sw-card-meta">

                      <span>
                        <MapPin size={15} />
                        {ad.district}, Sri Lanka
                      </span>

                      <span className="sw-card-rate">
                        {ad.rate || "Contact for rate"}
                      </span>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="sw-card-footer">

                      <a
                        href={`tel:${String(ad.workerPhone || "").replace(/[^\d+]/g, "")}`}
                        className="sw-call-btn"
                      >
                        <Phone size={15} />
                        <span>
                          {ad.workerPhone || "Number unavailable"}
                        </span>
                      </a>

                      <motion.button
                        type="button"
                        className="sw-view-btn"
                        onClick={() => setSelectedAd(ad)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye size={15} />
                        <span>Details</span>
                      </motion.button>

                    </div>

                    {/* EXPIRY */}

                    <div className="sw-card-expiry">
                      <Clock size={12} />

                      <span>
                        {daysLeft === 1
                          ? "Valid for 1 more day"
                          : `Valid for ${daysLeft} more days`}
                      </span>
                    </div>

                  </motion.article>
                );
              })}
            </AnimatePresence>

          </div>
        )}

        {/* ==================================
            EMPTY STATE
        ================================== */}

        {!loading && !error && filteredAds.length === 0 && (
          <motion.div
            className="sw-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Wrench size={38} />

            <h3>No Skilled Workers Found</h3>

            <p>
              {ads.length === 0
                ? "There are currently no approved service advertisements available. Please check back later."
                : "Try changing your search keywords, skill category, or district filter."}
            </p>

            {(searchTerm || selectedSkill || selectedDistrict) && (
              <button
                type="button"
                className="sw-reset-btn primary"
                onClick={handleReset}
              >
                <RotateCcw size={15} />
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

      </div>

      {/* ==================================
          DETAILS MODAL
      ================================== */}

      <AnimatePresence>
        {selectedAd && (
          <motion.div
            className="sw-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetails}
          >
            <motion.div
              className="sw-modal"
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 24,
              }}
              onClick={(e) => e.stopPropagation()}
            >

              <div className="sw-modal-header">

                <div>
                  <span className="sw-skill-tag">
                    {selectedAd.skill}
                  </span>

                  <h2>{selectedAd.title}</h2>
                </div>

                <button
                  type="button"
                  className="sw-modal-close"
                  onClick={closeDetails}
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="sw-modal-body">

                {/* WORKER INFORMATION */}

                <div className="sw-modal-worker-box">

                  <div className="sw-modal-worker-left">

                    <div className="sw-modal-avatar">
                      <User size={22} />
                    </div>

                    <div>
                      <strong>{selectedAd.workerName}</strong>

                      <span>
                        <MapPin size={13} />
                        {selectedAd.district}, Sri Lanka
                      </span>

                      {selectedAd.isVerified && (
                        <span className="sw-verified-chip">
                          <ShieldCheck size={13} />
                          Verified
                        </span>
                      )}
                    </div>

                  </div>

                  <div className="sw-modal-rate">
                    {selectedAd.rate}
                  </div>

                </div>

                {/* DESCRIPTION */}

                <div className="sw-modal-section">
                  <h4>Service Description</h4>

                  <p>
                    {selectedAd.description ||
                      "No additional description provided. Call the worker directly for details."}
                  </p>
                </div>

                {/* SERVICE DETAILS */}

                <div className="sw-modal-section">
                  <h4>Service Information</h4>

                  <p>Skill: {selectedAd.skill}</p>
                  <p>
                    Location: {selectedAd.district}, Sri Lanka
                  </p>
                  <p>
                    Valid for{" "}
                    {getRemainingDays(
                      selectedAd.approvedAt,
                      selectedAd.expiresAt
                    )}{" "}
                    more days
                  </p>
                </div>

                {/* CONTACT */}

                <div className="sw-modal-contact">

                  <a
                    href={`tel:${String(selectedAd.workerPhone || "").replace(/[^\d+]/g, "")}`}
                    className="sw-modal-call-btn"
                  >
                    <Phone size={18} />
                    <span>
                      Call {selectedAd.workerPhone}
                    </span>
                  </a>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Small icon for error state
function AlertTriangleIcon() {
  return <ShieldCheck size={38} />;
}

export default SkilledWorkers;
