
import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Building2,
  Wallet,
  CalendarDays,
  Tag,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { usePublicJobs } from "../context/PublicJobsContext";
import { isJobExpired } from "../services/jobService";

import "./JobsPage.css";

// ========================================
// ANIMATION VARIANTS
// ========================================

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.96,
    transition: {
      duration: 0.2,
    },
  },
};

// ========================================
// FILTER OPTIONS
// ========================================

const JOB_CATEGORIES = [
  "IT & Software",
  "Finance",
  "Marketing",
  "Sales",
  "Design",
  "Customer Service",
  "Other",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Freelance",
  "Remote",
];

// ========================================
// DATE FORMAT
// ========================================

function formatDate(value) {
  if (!value) return "Not specified";

  // Job deadlines are stored as YYYY-MM-DD strings.
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ========================================
// JOBS PAGE
// ========================================

function JobsPage() {
  const { jobs, loading, error } = usePublicJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const [selectedJob, setSelectedJob] = useState(null);

  // Refresh deadline check once per minute
  const [dateCheck, setDateCheck] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateCheck(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // AVAILABLE DISTRICTS
  // ========================================

  const locations = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.location)
          .filter(Boolean)
      ),
    ].sort();
  }, [jobs]);

  // ========================================
  // FILTER JOBS
  // ========================================

  const filteredJobs = useMemo(() => {
    // Re-check deadlines when dateCheck changes.
    void dateCheck;

    return jobs.filter((job) => {
      if (job.status !== "Active" || isJobExpired(job)) {
        return false;
      }

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        String(job.title || "").toLowerCase().includes(search) ||
        String(job.company || "").toLowerCase().includes(search) ||
        String(job.location || "").toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        job.category === categoryFilter;

      const matchesType =
        typeFilter === "All" ||
        job.type === typeFilter;

      const matchesLocation =
        locationFilter === "All" ||
        job.location === locationFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesLocation
      );
    });
  }, [
    jobs,
    searchTerm,
    categoryFilter,
    typeFilter,
    locationFilter,
    dateCheck,
  ]);

  // ========================================
  // RESET FILTERS
  // ========================================

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setTypeFilter("All");
    setLocationFilter("All");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    categoryFilter !== "All" ||
    typeFilter !== "All" ||
    locationFilter !== "All";

  // ========================================
  // RENDER
  // ========================================

  return (
    <motion.main
      className="public-jobs-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ==================================
          HERO SECTION
      ================================== */}

      <motion.section
        className="jobs-hero"
        variants={fadeUp}
      >
        <motion.div
          className="jobs-hero-content"
          variants={pageVariants}
        >
          <motion.span 
            className="jobs-hero-label"
            variants={fadeUp}
          
          >
            FIND YOUR NEXT OPPORTUNITY
          </motion.span>

          <motion.h1 variants={fadeUp}>
            Find the Job That
            <br />
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              Moves You Forward.
            </motion.span>
          </motion.h1>

          <motion.p variants={fadeUp}>
            Explore opportunities, discover your potential,
            and take the next step in your career with PattaJobs.
          </motion.p>

          <motion.div
            className="jobs-hero-count"
            variants={fadeUp}
            whileHover={{ scale: 1.04 }}
          >
            <BriefcaseBusiness size={18} />
            <span>
              {filteredJobs.length} job opportunities available
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ==================================
          MAIN CONTENT
      ================================== */}

      <section className="jobs-main-container">

        {/* SEARCH AND FILTERS */}

        <motion.div
          className="jobs-filter-card"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.15,
            ease: "easeOut",
          }}
        >

          <div className="jobs-filter-heading">
            <div>
              <h2>Find Opportunities</h2>
              <p>Search and filter jobs to find your match.</p>
            </div>

            <SlidersHorizontal size={22} />
          </div>

          <div className="jobs-filter-controls">

            {/* SEARCH */}
            <div className="jobs-search-box">
              <Search size={20} />

              <input
                type="text"
                placeholder="Search job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>

              {JOB_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* JOB TYPE */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Job Types</option>

              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* LOCATION */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">All Districts</option>

              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <motion.button
              type="button"
              className="jobs-reset-btn"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              whileHover={hasActiveFilters ? { scale: 1.05 } : {}}
              whileTap={hasActiveFilters ? { scale: 0.95 } : {}}
            >
              Reset
            </motion.button>

          </div>
        </motion.div>

        {/* ==================================
            RESULTS HEADER
        ================================== */}

        <motion.div
          className="jobs-results-header"
          variants={fadeUp}
        >
          <div>
            <h2>Latest Job Opportunities</h2>
            <p>
              Explore available opportunities from our platform.
            </p>
          </div>

          <motion.span
            className="jobs-results-count"
            key={filteredJobs.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {filteredJobs.length} Results
          </motion.span>
        </motion.div>

        {/* ==================================
            LOADING
        ================================== */}

        {loading && (
          <motion.div
            className="jobs-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="jobs-loader" />
            <p>Loading available jobs...</p>
          </motion.div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <motion.div
            className="jobs-message jobs-error"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* ==================================
            JOB CARDS
        ================================== */}

        {!loading && !error && filteredJobs.length > 0 && (
          <motion.div
            className="public-jobs-grid"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => (
                <motion.article
                  className="public-job-card"
                  key={job.id}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{
                    y: -7,
                    transition: { duration: 0.2 },
                  }}
                >

                  <div className="public-job-card-top">

                    <motion.div
                      className="public-job-company-icon"
                      whileHover={{ rotate: 5, scale: 1.08 }}
                    >
                      <Building2 size={25} />
                    </motion.div>

                    <span className="public-job-category">
                      {job.category || "Other"}
                    </span>

                  </div>

                  <div className="public-job-card-body">

                    <h3>{job.title || "Untitled Job"}</h3>

                    <p className="public-job-company">
                      <Building2 size={15} />
                      {job.company || "Company not specified"}
                    </p>

                    <div className="public-job-info">

                      <span>
                        <MapPin size={16} />
                        {job.location || "Location not specified"}
                      </span>

                      <span>
                        <BriefcaseBusiness size={16} />
                        {job.type || "Not specified"}
                      </span>

                      <span>
                        <Wallet size={16} />
                        {job.salary || "Negotiable"}
                      </span>

                    </div>

                    <p className="public-job-description">
                      {job.description || "No description available."}
                    </p>

                  </div>

                  <div className="public-job-card-footer">

                    <div className="public-job-deadline">
                      <CalendarDays size={15} />
                      <span>
                        Deadline: {formatDate(job.deadline)}
                      </span>
                    </div>

                    <motion.button
                      type="button"
                      className="public-job-view-btn"
                      onClick={() => setSelectedJob(job)}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 5px 15px rgba(19, 133, 98, 0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>

                  </div>

                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ==================================
            EMPTY STATE
        ================================== */}

        {!loading && !error && filteredJobs.length === 0 && (
          <motion.div
            className="jobs-empty-state"
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <BriefcaseBusiness size={45} />
            </motion.div>

            <h3>No Jobs Found</h3>

            <p>
              {jobs.length === 0
                ? "There are currently no job opportunities available."
                : "No jobs match your search. Try changing your filters."}
            </p>

            {hasActiveFilters && (
              <motion.button
                type="button"
                onClick={handleResetFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        )}

      </section>

      {/* ==================================
          JOB DETAILS MODAL
      ================================== */}

      <AnimatePresence>
        {selectedJob && (
          <motion.div
            className="public-job-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedJob(null)}
          >

            <motion.div
              className="public-job-modal"
              initial={{
                opacity: 0,
                scale: 0.93,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
              }}
              onClick={(e) => e.stopPropagation()}
            >

              <div className="public-job-modal-header">

                <div>
                  <span className="jobs-hero-label">
                    JOB OPPORTUNITY
                  </span>

                  <h2>{selectedJob.title}</h2>

                  <p>
                    <Building2 size={16} />
                    {selectedJob.company}
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  aria-label="Close job details"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={22} />
                </motion.button>

              </div>

              <div className="public-job-modal-content">

                <div className="public-job-detail-grid">

                  <div>
                    <span><MapPin size={15} /> Location</span>
                    <strong>
                      {selectedJob.location || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span><BriefcaseBusiness size={15} /> Job Type</span>
                    <strong>
                      {selectedJob.type || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span><Tag size={15} /> Category</span>
                    <strong>
                      {selectedJob.category || "Other"}
                    </strong>
                  </div>

                  <div>
                    <span><Wallet size={15} /> Salary</span>
                    <strong>
                      {selectedJob.salary || "Negotiable"}
                    </strong>
                  </div>

                  <div>
                    <span><CalendarDays size={15} /> Deadline</span>
                    <strong>
                      {formatDate(selectedJob.deadline)}
                    </strong>
                  </div>

                </div>

                <div className="public-job-detail-section">
                  <h3>Job Description</h3>
                  <p>
                    {selectedJob.description || "No description provided."}
                  </p>
                </div>

                <div className="public-job-detail-section">
                  <h3>Requirements</h3>
                  <p>
                    {selectedJob.requirements || "No requirements specified."}
                  </p>
                </div>

              </div>

              <div className="public-job-modal-footer">
                <motion.button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Close
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.main>
  );
}

export default JobsPage;