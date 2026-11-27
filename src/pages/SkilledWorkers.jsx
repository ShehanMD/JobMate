import React, { useEffect, useMemo, useState } from "react";
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
import "./SkilledWorkers.css";

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

// Demo Approved Ads (Backend connect කළාම මේ ටික අයින් කරන්න)
const SAMPLE_WORKER_ADS = [
  {
    id: "sample-1",
    workerName: "Amara Perera",
    workerPhone: "0714448885",
    title: "Professional House Wiring & Electrical Repair Service",
    skill: "Electrician",
    district: "Gampaha",
    rate: "Rs. 3,500 / day",
    description:
      "Full house wiring, trip switch repairs, ceiling fan & light installations. 6+ years of experience with NVQ Level 4 qualification.",
    status: "Approved",
    isVerified: true,
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-2",
    workerName: "Kamal Bandara",
    workerPhone: "0778234561",
    title: "Experienced Mason for House Construction & Tiling",
    skill: "Mason",
    district: "Colombo",
    rate: "Rs. 4,000 / day",
    description:
      "Brickwork, plastering, floor tiling, and bathroom renovations. Clean and reliable work guaranteed.",
    status: "Approved",
    isVerified: true,
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-3",
    workerName: "Nimal Silva",
    workerPhone: "0765512390",
    title: "24/7 Emergency Plumbing & Pipe Fitting",
    skill: "Plumber",
    district: "Kandy",
    rate: "Rs. 2,500 / visit",
    description:
      "Water tank installation, leak repairs, bathroom fittings, and motor pump fixing around Kandy district.",
    status: "Approved",
    isVerified: false,
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const getRemainingDays = (approvedAt) => {
  if (!approvedAt) return 7;
  const start = new Date(approvedAt);
  const now = new Date();
  const daysPassed = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, 7 - daysPassed);
};

function SkilledWorkers() {
  const [ads, setAds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const localApprovedAds = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("pattajobs_worker_ad_")) {
          const item = JSON.parse(localStorage.getItem(key) || "null");
          if (
            item &&
            item.status === "Approved" &&
            getRemainingDays(item.approvedAt) > 0
          ) {
            localApprovedAds.push(item);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load local worker ads:", err);
    }

    setAds([...localApprovedAds, ...SAMPLE_WORKER_ADS]);
  }, []);

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (ad.title || "").toLowerCase().includes(q) ||
        (ad.workerName || "").toLowerCase().includes(q) ||
        (ad.skill || "").toLowerCase().includes(q) ||
        (ad.description || "").toLowerCase().includes(q);

      const matchesSkill = !selectedSkill || ad.skill === selectedSkill;
      const matchesDistrict =
        !selectedDistrict || ad.district === selectedDistrict;

      return matchesSearch && matchesSkill && matchesDistrict;
    });
  }, [ads, searchTerm, selectedSkill, selectedDistrict]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSkill("");
    setSelectedDistrict("");
  };

  return (
    <div className="sw-page">
      {/* Hero Banner (Matches /jobs page) */}
      <section className="sw-hero">
        <div className="sw-hero-inner">
          <span className="sw-hero-kicker">TRUSTED LOCAL PROFESSIONALS</span>
          <h1>
            Find Skilled Workers <br />
            <span>Near You.</span>
          </h1>
          <p>
            Connect directly with verified electricians, plumbers, masons, and
            technicians across Sri Lanka.
          </p>
          <div className="sw-hero-pill">
            <Wrench size={15} />
            <span>{filteredAds.length} skilled services available</span>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="sw-container">
        {/* Floating Search & Filter Card */}
        <section className="sw-filter-card">
          <div className="sw-filter-header">
            <h2>Find Skilled Workers</h2>
            <p>Search by service, skill, or district to find the right person.</p>
          </div>

          <div className="sw-filter-controls">
            <div className="sw-search-box">
              <Search size={17} className="sw-search-icon" />
              <input
                type="text"
                placeholder="Search service, skill, or worker name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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

            <button
              type="button"
              className="sw-reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </section>

        {/* Results Header */}
        <div className="sw-results-header">
          <div>
            <h2>Available Skilled Services</h2>
            <p>Admin-reviewed service advertisements from skilled workers</p>
          </div>
          <span className="sw-results-badge">
            {filteredAds.length}{" "}
            {filteredAds.length === 1 ? "Result" : "Results"}
          </span>
        </div>

        {/* Cards Grid */}
        {filteredAds.length > 0 ? (
          <div className="sw-grid">
            {filteredAds.map((ad) => {
              const daysLeft = getRemainingDays(ad.approvedAt);
              return (
                <article key={ad.id} className="sw-card">
                  <div className="sw-card-top">
                    <div className="sw-card-icon">
                      <Briefcase size={20} />
                    </div>
                    <span className="sw-skill-tag">{ad.skill}</span>
                  </div>

                  <h3 className="sw-card-title">{ad.title}</h3>

                  <div className="sw-worker-row">
                    <span className="sw-worker-name">
                      <User size={15} />
                      {ad.workerName}
                    </span>
                    {ad.isVerified && (
                      <span className="sw-verified-chip" title="Verified Worker">
                        <ShieldCheck size={13} />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="sw-card-desc">
                    {ad.description || "Contact for more service details."}
                  </p>

                  <div className="sw-card-meta">
                    <span>
                      <MapPin size={15} /> {ad.district}, Sri Lanka
                    </span>
                    <span className="sw-card-rate">{ad.rate}</span>
                  </div>

                  <div className="sw-card-footer">
                    <a
                      href={`tel:${ad.workerPhone}`}
                      className="sw-call-btn"
                    >
                      <Phone size={15} />
                      <span>{ad.workerPhone}</span>
                    </a>

                    <button
                      type="button"
                      className="sw-view-btn"
                      onClick={() => setSelectedAd(ad)}
                    >
                      <Eye size={15} />
                      <span>Details</span>
                    </button>
                  </div>

                  <div className="sw-card-expiry">
                    <Clock size={12} />
                    <span>Valid for {daysLeft} more days</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sw-empty">
            <Wrench size={34} />
            <h3>No skilled workers found</h3>
            <p>
              Try changing your search keywords, skill category, or district
              filter.
            </p>
            <button
              type="button"
              className="sw-reset-btn primary"
              onClick={handleReset}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {selectedAd && (
        <div className="sw-modal-overlay" onClick={() => setSelectedAd(null)}>
          <div className="sw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sw-modal-header">
              <div>
                <span className="sw-skill-tag">{selectedAd.skill}</span>
                <h2>{selectedAd.title}</h2>
              </div>
              <button
                type="button"
                className="sw-modal-close"
                onClick={() => setSelectedAd(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sw-modal-body">
              <div className="sw-modal-worker-box">
                <div className="sw-modal-worker-left">
                  <div className="sw-modal-avatar">
                    <User size={22} />
                  </div>
                  <div>
                    <strong>{selectedAd.workerName}</strong>
                    <span>
                      <MapPin size={13} /> {selectedAd.district}, Sri Lanka
                    </span>
                  </div>
                </div>
                <div className="sw-modal-rate">{selectedAd.rate}</div>
              </div>

              <div className="sw-modal-section">
                <h4>Service Description</h4>
                <p>
                  {selectedAd.description ||
                    "No additional description provided. Call the worker directly for details."}
                </p>
              </div>

              <div className="sw-modal-contact">
                <a
                  href={`tel:${selectedAd.workerPhone}`}
                  className="sw-modal-call-btn"
                >
                  <Phone size={18} />
                  <span>Call {selectedAd.workerPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkilledWorkers;