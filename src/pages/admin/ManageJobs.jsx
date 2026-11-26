import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Search,
  Pencil,
  Trash2,
  X,
  Plus,
  Eye,
} from "lucide-react";

import DistrictDropdown from "../../components/common/DistrictDropdown";

import {
  subscribeToAllJobs,
  updateJob,
  deleteJob,
  getJobDisplayStatus,
} from "../../services/jobService";

import "./ManageJobs.css";


// ======================================
// ANIMATION SETTINGS
// ======================================

const pageAnimation = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
    },
  },
};


const fadeUp = {
  hidden: {
    opacity: 0,
    y: 22,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};


// ======================================
// DISTRICT NORMALIZATION
// ======================================

const normalizeDistrict = (location) => {
  const value = String(location || "")
    .trim()
    .toLowerCase();

  const aliases = {
    negombo: "gampaha",
  };

  return aliases[value] || value;
};


// ======================================
// MANAGE JOBS COMPONENT
// ======================================

function ManageJobs() {

  const navigate = useNavigate();


  // ======================================
  // STATES
  // ======================================

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");


  const [searchTerm, setSearchTerm] = useState("");

  const [locationFilter, setLocationFilter] = useState("All");

  const [typeFilter, setTypeFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingJobId, setEditingJobId] = useState(null);

  const [saving, setSaving] = useState(false);


  const [editForm, setEditForm] = useState({

    title: "",

    company: "",

    location: "",

    type: "",

    salary: "",

    category: "",

    description: "",

    requirements: "",

    deadline: "",

    status: "Active",

  });


  // ======================================
  // REAL-TIME FIRESTORE SUBSCRIPTION
  // ======================================

  useEffect(() => {

    setLoading(true);


    const unsubscribe = subscribeToAllJobs(

      (fetchedJobs) => {

        setJobs(fetchedJobs);

        setLoading(false);

        setLoadError("");

      },


      (error) => {

        console.error(
          "Unable to load jobs:",
          error
        );

        setLoadError(
          "Unable to load jobs. Please check Firebase permissions."
        );

        setLoading(false);

      }

    );


    return () => unsubscribe();

  }, []);


  // ======================================
  // EDIT JOB
  // ======================================

  const handleEdit = (job) => {

    setEditingJobId(job.id);


    setEditForm({

      title: job.title || "",

      company: job.company || "",

      location:
        normalizeDistrict(job.location) === "gampaha"
          ? "Gampaha"
          : job.location || "",

      type: job.type || "",

      salary: job.salary || "",

      category: job.category || "",

      description: job.description || "",

      requirements: job.requirements || "",

      deadline: job.deadline || "",

      status: job.status || "Draft",

    });


    setIsEditModalOpen(true);

  };


  // ======================================
  // HANDLE EDIT INPUTS
  // ======================================

  const handleEditChange = (event) => {

    const { name, value } = event.target;


    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // ======================================
  // UPDATE JOB
  // ======================================

  const handleUpdateJob = async (event) => {

    event.preventDefault();

    if (saving) return;


    if (
      !editForm.title.trim() ||
      !editForm.company.trim() ||
      !editForm.location ||
      !editForm.type ||
      !editForm.salary.trim() ||
      !editForm.category ||
      !editForm.description.trim()
    ) {

      alert("Please fill all required fields.");

      return;

    }


    try {

      setSaving(true);


      await updateJob(
        editingJobId,
        {

          ...editForm,

          title: editForm.title.trim(),

          company: editForm.company.trim(),

          salary: editForm.salary.trim(),

          description: editForm.description.trim(),

          requirements: editForm.requirements.trim(),

          deadline: editForm.deadline || null,

        }
      );


      setIsEditModalOpen(false);

      setEditingJobId(null);


      alert("Job updated successfully!");


    } catch (error) {

      console.error(
        "Unable to update job:",
        error
      );

      alert(
        "Unable to update job. Please try again."
      );

    } finally {

      setSaving(false);

    }

  };


  // ======================================
  // DELETE JOB
  // ======================================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );


    if (!confirmDelete) return;


    try {

      await deleteJob(id);


      alert("Job deleted successfully!");


    } catch (error) {

      console.error(
        "Unable to delete job:",
        error
      );

      alert(
        "Unable to delete job. Please try again."
      );

    }

  };


  // ======================================
  // RESET FILTERS
  // ======================================

  const handleResetFilters = () => {

    setSearchTerm("");

    setLocationFilter("All");

    setTypeFilter("All");

    setStatusFilter("All");

  };


  // ======================================
  // FILTER JOBS
  // ======================================

  const filteredJobs = useMemo(() => {

    return jobs.filter((job) => {

      const search = searchTerm.trim().toLowerCase();


      const matchesSearch =

        String(job.title || "")
          .toLowerCase()
          .includes(search) ||

        String(job.company || "")
          .toLowerCase()
          .includes(search) ||

        String(job.location || "")
          .toLowerCase()
          .includes(search);


      const matchesLocation =
        locationFilter === "All" ||

        normalizeDistrict(job.location) ===
          normalizeDistrict(locationFilter);


      const matchesType =
        typeFilter === "All" ||
        job.type === typeFilter;


      const displayStatus = getJobDisplayStatus(job);


      const matchesStatus =
        statusFilter === "All" ||
        displayStatus === statusFilter;


      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesStatus
      );

    });

  }, [
    jobs,
    searchTerm,
    locationFilter,
    typeFilter,
    statusFilter,
  ]);


  // ======================================
  // STATISTICS
  // ======================================

  const totalJobs = jobs.length;


  const activeJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Active"
  ).length;


  const inactiveJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Inactive"
  ).length;


  const draftJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Draft"
  ).length;


  const expiredJobs = jobs.filter(
    (job) => getJobDisplayStatus(job) === "Expired"
  ).length;


  const statistics = [

    {
      title: "Total Jobs",
      value: totalJobs,
    },

    {
      title: "Active Jobs",
      value: activeJobs,
    },

    {
      title: "Inactive Jobs",
      value: inactiveJobs,
    },

    {
      title: "Draft Jobs",
      value: draftJobs,
    },

    {
      title: "Expired Jobs",
      value: expiredJobs,
    },

  ];


  // ======================================
  // CLOSE EDIT MODAL
  // ======================================

  const closeEditModal = () => {

    if (saving) return;

    setIsEditModalOpen(false);

    setEditingJobId(null);

  };


  // ======================================
  // RENDER
  // ======================================

  return (

    <motion.div
      className="manage-jobs-page"
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
    >

      {/* PAGE HEADER */}

      <motion.div
        className="manage-jobs-header"
        variants={fadeUp}
      >

        <div>

          <h1>Manage Jobs</h1>

          <p>
            View, manage and monitor job listings.
          </p>

        </div>


        <motion.button
          className="create-job-btn"
          onClick={() =>
            navigate("/admin/create-job")
          }
          whileHover={{
            scale: 1.04,
            y: -3,
          }}
          whileTap={{
            scale: 0.96,
          }}
        >

          <Plus size={18} />

          Create Job

        </motion.button>

      </motion.div>


      {/* STATISTICS */}

      <motion.div
        className="manage-jobs-stats"
        variants={fadeUp}
      >

        {statistics.map((stat, index) => (

          <motion.div
            className="manage-jobs-stat-card"
            key={stat.title}
            initial={{
              opacity: 0,
              y: 25,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
              delay: 0.1 + index * 0.08,
              ease: "easeOut",
            }}
            whileHover={{
              y: -6,
              transition: {
                duration: 0.2,
              },
            }}
          >

            <h3>
              {stat.title}
            </h3>


            <motion.strong
              key={stat.value}
              initial={{
                opacity: 0.5,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              {stat.value}
            </motion.strong>

          </motion.div>

        ))}

      </motion.div>


      {/* JOB TABLE CARD */}

      <motion.div
        className="manage-jobs-table-card"
        variants={fadeUp}
      >

        <div className="manage-jobs-table-header">

          <div>

            <h2>Job Listings</h2>

            <p>
              Manage all posted jobs from here.
            </p>

          </div>


          {/* SEARCH AND FILTERS */}

          <div className="manage-jobs-controls">

            <div className="manage-jobs-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>


            <DistrictDropdown
              value={
                locationFilter === "All"
                  ? ""
                  : locationFilter
              }
              onChange={(event) =>
                setLocationFilter(
                  event.target.value || "All"
                )
              }
              placeholder="All Districts"
            />


            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >

              <option value="All">All Job Types</option>

              <option value="Full-time">Full-time</option>

              <option value="Part-time">Part-time</option>

              <option value="Contract">Contract</option>

              <option value="Internship">Internship</option>

              <option value="Freelance">Freelance</option>

              <option value="Remote">Remote</option>

            </select>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="All">All Statuses</option>

              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>

              <option value="Draft">Draft</option>

              <option value="Expired">Expired</option>

            </select>


            <motion.button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              Reset
            </motion.button>

          </div>

        </div>


        {/* JOBS TABLE */}

        <div className="manage-jobs-table-wrapper">

          <table className="manage-jobs-table">

            <thead>

              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Job Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="6" className="no-jobs-found">
                    Loading jobs...
                  </td>
                </tr>

              ) : loadError ? (

                <tr>
                  <td colSpan="6" className="no-jobs-found">
                    {loadError}
                  </td>
                </tr>

              ) : (

                <AnimatePresence initial={false}>

                  {filteredJobs.length > 0 ? (

                    filteredJobs.map((job, index) => {

                      const displayStatus =
                        getJobDisplayStatus(job);


                      return (

                        <motion.tr
                          key={job.id}
                          initial={{
                            opacity: 0,
                            y: 12,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -15,
                          }}
                          transition={{
                            duration: 0.25,
                            delay: Math.min(
                              index * 0.035,
                              0.2
                            ),
                          }}
                        >

                          <td>
                            {job.title || "Untitled Job"}
                          </td>


                          <td>
                            {job.company || "Not specified"}
                          </td>


                          <td>
                            {normalizeDistrict(job.location) === "gampaha"
                              ? "Gampaha"
                              : job.location || "Not specified"}
                          </td>


                          <td>
                            {job.type || "Not specified"}
                          </td>


                          <td>

                            <span
                              className={`job-status-badge ${displayStatus.toLowerCase()}`}
                            >
                              {displayStatus}
                            </span>

                          </td>


                          <td>

                            <div className="job-action-buttons">

                              {/* VIEW JOB */}

                              <motion.button
                                type="button"
                                className="view-job-btn"
                                title="View Job"
                                onClick={() =>
                                  navigate(`/admin/jobs/${job.id}`)
                                }
                                whileHover={{
                                  scale: 1.12,
                                }}
                                whileTap={{
                                  scale: 0.9,
                                }}
                              >
                                <Eye size={17} />
                              </motion.button>


                              {/* EDIT JOB */}

                              <motion.button
                                type="button"
                                className="edit-job-btn"
                                title="Edit Job"
                                onClick={() => handleEdit(job)}
                                whileHover={{
                                  scale: 1.12,
                                }}
                                whileTap={{
                                  scale: 0.9,
                                }}
                              >
                                <Pencil size={17} />
                              </motion.button>


                              {/* DELETE JOB */}

                              <motion.button
                                type="button"
                                className="delete-job-btn"
                                title="Delete Job"
                                onClick={() => handleDelete(job.id)}
                                whileHover={{
                                  scale: 1.12,
                                }}
                                whileTap={{
                                  scale: 0.9,
                                }}
                              >
                                <Trash2 size={17} />
                              </motion.button>

                            </div>

                          </td>

                        </motion.tr>

                      );

                    })

                  ) : (

                    <motion.tr
                      key="empty"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                    >

                      <td
                        colSpan="6"
                        className="no-jobs-found"
                      >
                        No jobs found.
                      </td>

                    </motion.tr>

                  )}

                </AnimatePresence>

              )}

            </tbody>

          </table>

        </div>


        {/* RESULTS */}

        <motion.div
          className="manage-jobs-results"
          key={`${filteredJobs.length}-${jobs.length}`}
          initial={{
            opacity: 0,
            y: 5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          Showing {filteredJobs.length} of {jobs.length} jobs
        </motion.div>

      </motion.div>


      {/* ======================================
          EDIT JOB MODAL
      ====================================== */}

      <AnimatePresence>

        {isEditModalOpen && (

          <motion.div
            className="job-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={closeEditModal}
          >

            <motion.div
              className="job-edit-modal"
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
                stiffness: 260,
                damping: 24,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="job-modal-header">

                <div>

                  <h2>Edit Job</h2>

                  <p>
                    Update job listing details.
                  </p>

                </div>


                <motion.button
                  type="button"
                  className="close-job-modal-btn"
                  onClick={closeEditModal}
                  disabled={saving}
                  whileHover={{
                    rotate: 90,
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <X size={21} />
                </motion.button>

              </div>


              {/* EDIT FORM */}

              <form onSubmit={handleUpdateJob}>

                {/* JOB TITLE */}

                <div className="edit-job-field">

                  <label>Job Title *</label>

                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                  />

                </div>


                {/* COMPANY */}

                <div className="edit-job-field">

                  <label>Company *</label>

                  <input
                    type="text"
                    name="company"
                    value={editForm.company}
                    onChange={handleEditChange}
                    required
                  />

                </div>


                {/* LOCATION */}

                <div className="edit-job-field">

                  <label>Location / District *</label>

                  <DistrictDropdown
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                    placeholder="Select District"
                  />

                </div>


                {/* JOB TYPE */}

                <div className="edit-job-field">

                  <label>Job Type *</label>

                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    required
                  >

                    <option value="">
                      Select Job Type
                    </option>

                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Freelance">
                      Freelance
                    </option>

                    <option value="Remote">
                      Remote
                    </option>

                  </select>

                </div>


                {/* SALARY */}

                <div className="edit-job-field">

                  <label>Salary *</label>

                  <input
                    type="text"
                    name="salary"
                    value={editForm.salary}
                    onChange={handleEditChange}
                    required
                  />

                </div>


                {/* CATEGORY */}

                <div className="edit-job-field">

                  <label>Category *</label>

                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                  >

                    <option value="">
                      Select Category
                    </option>

                    <option value="IT & Software">
                      IT & Software
                    </option>

                    <option value="Finance">
                      Finance
                    </option>

                    <option value="Marketing">
                      Marketing
                    </option>

                    <option value="Sales">
                      Sales
                    </option>

                    <option value="Design">
                      Design
                    </option>

                    <option value="Customer Service">
                      Customer Service
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* APPLICATION DEADLINE */}

                <div className="edit-job-field">

                  <label>Application Deadline</label>

                  <input
                    type="date"
                    name="deadline"
                    value={editForm.deadline}
                    onChange={handleEditChange}
                  />

                </div>


                {/* STATUS */}

                <div className="edit-job-field">

                  <label>Status</label>

                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                    <option value="Draft">
                      Draft
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="edit-job-field">

                  <label>Job Description *</label>

                  <textarea
                    name="description"
                    rows="4"
                    value={editForm.description}
                    onChange={handleEditChange}
                    required
                  />

                </div>


                {/* REQUIREMENTS */}

                <div className="edit-job-field">

                  <label>Requirements</label>

                  <textarea
                    name="requirements"
                    rows="4"
                    value={editForm.requirements}
                    onChange={handleEditChange}
                  />

                </div>


                {/* MODAL ACTIONS */}

                <div className="job-modal-actions">

                  <motion.button
                    type="button"
                    className="cancel-job-btn"
                    onClick={closeEditModal}
                    disabled={saving}
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                  >
                    Cancel
                  </motion.button>


                  <motion.button
                    type="submit"
                    className="save-job-btn"
                    disabled={saving}
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"
                    }
                  </motion.button>

                </div>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.div>
  );
}

export default ManageJobs;