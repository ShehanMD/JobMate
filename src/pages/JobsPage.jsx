
import React, { useEffect, useMemo, useState } from "react";
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

import {
  subscribeToPublicJobs,
  isJobExpired,
} from "../services/jobService";

import "./JobsPage.css";

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

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  // Selected job for details modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Refresh deadline checks periodically
  const [dateCheck, setDateCheck] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToPublicJobs(
      (fetchedJobs) => {
        setJobs(fetchedJobs);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Unable to load public jobs:", err);
        setError("Unable to load jobs. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateCheck(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get available districts from published jobs
  const locations = useMemo(() => {
    return [...new Set(
      jobs
        .map((job) => job.location)
        .filter(Boolean)
    )].sort();
  }, [jobs]);

  // Remove expired jobs and apply filters
  const filteredJobs = useMemo(() => {
    // dateCheck intentionally triggers a fresh deadline check.
    void dateCheck;

    return jobs.filter((job) => {
      if (isJobExpired(job)) return false;

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

  // Reset all filters
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

  return (
    <div className="public-jobs-page">

      {/* Page Hero */}
      <section className="jobs-hero">
        <div className="jobs-hero-content">
          <span className="jobs-hero-label">
            FIND YOUR NEXT OPPORTUNITY
          </span>

          <h1 style={{color:"#8af0c6"}}>
            Find the Job That
            <span> Moves You Forward.</span>
          </h1>

          <p>
            Explore opportunities, discover your potential,
            and take the next step in your career with PattaJobs.
          </p>

          <div className="jobs-hero-count">
            <BriefcaseBusiness size={18} />
            <span>
              {filteredJobs.length} job opportunities available
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="jobs-main-container">

        {/* Search and Filters */}
        <div className="jobs-filter-card">

          <div className="jobs-filter-heading">
            <div>
              <h2>Find Opportunities</h2>
              <p>Search and filter jobs to find your match.</p>
            </div>

            <SlidersHorizontal size={22} />
          </div>

          <div className="jobs-filter-controls">

            {/* Search */}
            <div className="jobs-search-box">
              <Search size={20} />

              <input
                type="text"
                placeholder="Search job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category */}
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

            {/* Job Type */}
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

            {/* Location */}
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

            <button
              type="button"
              className="jobs-reset-btn"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
            >
              Reset
            </button>

          </div>
        </div>

        {/* Job Results */}
        <div className="jobs-results-header">
          <div>
            <h2>Latest Job Opportunities</h2>
            <p>
              Explore available opportunities from our platform.
            </p>
          </div>

          <span className="jobs-results-count">
            {filteredJobs.length} Results
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="jobs-message">
            <div className="jobs-loader" />
            <p>Loading available jobs...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="jobs-message jobs-error">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="jobs-empty-state">
            <BriefcaseBusiness size={45} />

            <h3>No Jobs Found</h3>

            <p>
              {jobs.length === 0
                ? "There are currently no job opportunities available."
                : "No jobs match your search. Try changing your filters."}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Job Cards */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="public-jobs-grid">

            {filteredJobs.map((job) => (
              <article className="public-job-card" key={job.id}>

                <div className="public-job-card-top">

                  <div className="public-job-company-icon">
                    <Building2 size={25} />
                  </div>

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

                  <button
                    type="button"
                    className="public-job-view-btn"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* Job Details Modal */}
      {selectedJob && (

        <div
          className="public-job-modal-overlay"
          onClick={() => setSelectedJob(null)}
        >

          <div
            className="public-job-modal"
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

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                aria-label="Close job details"
              >
                <X size={22} />
              </button>

            </div>

            <div className="public-job-modal-content">

              <div className="public-job-detail-grid">

                <div>
                  <span><MapPin size={15} /> Location</span>
                  <strong>{selectedJob.location || "Not specified"}</strong>
                </div>

                <div>
                  <span><BriefcaseBusiness size={15} /> Job Type</span>
                  <strong>{selectedJob.type || "Not specified"}</strong>
                </div>

                <div>
                  <span><Tag size={15} /> Category</span>
                  <strong>{selectedJob.category || "Other"}</strong>
                </div>

                <div>
                  <span><Wallet size={15} /> Salary</span>
                  <strong>{selectedJob.salary || "Negotiable"}</strong>
                </div>

                <div>
                  <span><CalendarDays size={15} /> Deadline</span>
                  <strong>{formatDate(selectedJob.deadline)}</strong>
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
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>

      )}

    </div>
  );
}

export default JobsPage;
