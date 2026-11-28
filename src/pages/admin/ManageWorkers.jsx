
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
} from "lucide-react";

import DistrictDropdown from "../../components/common/DistrictDropdown";

import {
  subscribeToWorkers,
  updateWorker,
  deleteWorkerProfile,
} from "../../services/workerService";

import {
  subscribeToAllWorkerAds,
  approveWorkerAd,
  rejectWorkerAd,
  adminDeleteWorkerAd,
  isWorkerAdExpired,
} from "../../services/workerAdService";

import "./ManageWorkers.css";


// ======================================
// DATE HELPERS
// ======================================

const getDate = (value) => {
  if (!value) return null;

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = getDate(value);

  if (!date) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ======================================
// NORMALIZE DISTRICT
// ======================================

const normalizeDistrict = (location) => {
  const value = String(location || "").trim().toLowerCase();

  const aliases = {
    negombo: "gampaha",
  };

  return aliases[value] || value;
};


// ======================================
// GET AD STATUS
// ======================================

const getAdStatus = (ad) => {
  if (isWorkerAdExpired(ad)) return "Expired";

  return ad.status || "Pending";
};


// ======================================
// MANAGE WORKERS
// ======================================

function ManageWorkers() {
  const navigate = useNavigate();


  // ======================================
  // MAIN STATES
  // ======================================

  const [activeTab, setActiveTab] = useState("workers");

  const [workers, setWorkers] = useState([]);
  const [workerAds, setWorkerAds] = useState([]);

  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingAds, setLoadingAds] = useState(true);

  const [workerError, setWorkerError] = useState("");
  const [adsError, setAdsError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");


  // ======================================
  // EDIT WORKER STATES
  // ======================================

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [savingWorker, setSavingWorker] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    status: "Active",
  });


  // ======================================
  // SERVICE POST STATES
  // ======================================

  const [selectedAd, setSelectedAd] = useState(null);
  const [processingAd, setProcessingAd] = useState(null);


  // ======================================
  // REAL-TIME WORKER LISTENER
  // ======================================

  useEffect(() => {
    setLoadingWorkers(true);

    const unsubscribe = subscribeToWorkers(
      (fetchedWorkers) => {
        setWorkers(fetchedWorkers);
        setLoadingWorkers(false);
        setWorkerError("");
      },
      (error) => {
        console.error("Worker loading error:", error);

        setWorkerError(
          "Unable to load workers. Check Firestore permissions."
        );

        setLoadingWorkers(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // ======================================
  // REAL-TIME WORKER ADS LISTENER
  // ======================================

  useEffect(() => {
    setLoadingAds(true);

    const unsubscribe = subscribeToAllWorkerAds(
      (fetchedAds) => {
        setWorkerAds(fetchedAds);
        setLoadingAds(false);
        setAdsError("");
      },
      (error) => {
        console.error("Worker ads loading error:", error);

        setAdsError(
          "Unable to load service advertisements."
        );

        setLoadingAds(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // ======================================
  // WORKER STATISTICS
  // ======================================

  const totalWorkers = workers.length;

  const activeWorkers = workers.filter(
    (worker) =>
      String(worker.status || "Active").toLowerCase() === "active"
  ).length;

  const inactiveWorkers = workers.filter(
    (worker) =>
      String(worker.status || "Active").toLowerCase() === "inactive"
  ).length;

  const pendingVerification = workers.filter(
    (worker) =>
      String(worker.verificationStatus || "Pending").toLowerCase() ===
      "pending"
  ).length;


  // ======================================
  // ADVERTISEMENT STATISTICS
  // ======================================

  const pendingAds = workerAds.filter(
    (ad) => getAdStatus(ad) === "Pending"
  ).length;

  const approvedAds = workerAds.filter(
    (ad) => getAdStatus(ad) === "Approved"
  ).length;

  const rejectedAds = workerAds.filter(
    (ad) => getAdStatus(ad) === "Rejected"
  ).length;

  const expiredAds = workerAds.filter(
    (ad) => getAdStatus(ad) === "Expired"
  ).length;


  // ======================================
  // WORKER FILTERING
  // ======================================

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        String(worker.name || "").toLowerCase().includes(search) ||
        String(worker.email || "").toLowerCase().includes(search) ||
        String(worker.phone || "").toLowerCase().includes(search) ||
        String(worker.skill || "").toLowerCase().includes(search) ||
        String(worker.location || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        String(worker.status || "Active").toLowerCase() ===
          statusFilter.toLowerCase();

      const verificationStatus =
        String(worker.verificationStatus || "Pending");

      const matchesVerification =
        verificationFilter === "All" ||
        verificationStatus.toLowerCase() ===
          verificationFilter.toLowerCase();

      const matchesLocation =
        locationFilter === "All" ||
        normalizeDistrict(worker.location) ===
          normalizeDistrict(locationFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesVerification &&
        matchesLocation
      );
    });
  }, [
    workers,
    searchTerm,
    statusFilter,
    verificationFilter,
    locationFilter,
  ]);


  // ======================================
  // EDIT WORKER
  // ======================================

  const handleEdit = (worker) => {
    setEditingWorkerId(worker.id);

    setEditForm({
      name: worker.name || "",
      email: worker.email || "",
      phone: worker.phone || "",

      location:
        normalizeDistrict(worker.location) === "gampaha"
          ? "Gampaha"
          : worker.location || "",

      status: worker.status || "Active",
    });

    setIsEditModalOpen(true);
  };


  // ======================================
  // HANDLE EDIT FORM CHANGES
  // ======================================

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ======================================
  // UPDATE WORKER
  // ======================================

  const handleUpdateWorker = async (event) => {
    event.preventDefault();

    if (savingWorker) return;

    if (
      !editForm.name.trim() ||
      !editForm.phone.trim() ||
      !editForm.location
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSavingWorker(true);

      await updateWorker(editingWorkerId, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        location: editForm.location,
        status: editForm.status,
      });

      setIsEditModalOpen(false);
      setEditingWorkerId(null);

      alert("Worker updated successfully!");

    } catch (error) {
      console.error("Worker update error:", error);

      alert(
        "Unable to update worker. Please try again."
      );

    } finally {
      setSavingWorker(false);
    }
  };


  // ======================================
  // DELETE WORKER
  // ======================================

  const handleDeleteWorker = async (worker) => {
    const confirmed = window.confirm(
      `Delete ${worker.name || "this worker"}'s Firestore profile and all their service advertisements? The Firebase Authentication account will not be deleted.`
    );

    if (!confirmed) return;

    try {
      await deleteWorkerProfile(worker.id);

      alert(
        "Worker profile and service advertisements deleted."
      );

    } catch (error) {
      console.error("Worker deletion error:", error);

      alert(
        "Unable to delete worker. Please try again."
      );
    }
  };


  // ======================================
  // RESET WORKER FILTERS
  // ======================================

  const resetWorkerFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setVerificationFilter("All");
    setLocationFilter("All");
  };


  // ======================================
  // APPROVE SERVICE POST
  // ======================================

  const handleApproveAd = async (ad) => {
    if (processingAd) return;

    const confirmed = window.confirm(
      `Approve "${ad.title}" by ${ad.workerName}?`
    );

    if (!confirmed) return;

    try {
      setProcessingAd(ad.id);

      await approveWorkerAd(ad.id, ad.workerId);

      alert(
        "Service advertisement approved successfully!"
      );

    } catch (error) {
      console.error(
        "Advertisement approval error:",
        error
      );

      alert(
        error.message || "Unable to approve advertisement."
      );

    } finally {
      setProcessingAd(null);
    }
  };


  // ======================================
  // REJECT SERVICE POST
  // ======================================

  const handleRejectAd = async (ad) => {
    if (processingAd) return;

    const reason = window.prompt(
      `Enter the rejection reason for "${ad.title}":`
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    try {
      setProcessingAd(ad.id);

      await rejectWorkerAd(
        ad.id,
        reason.trim()
      );

      setSelectedAd(null);

      alert(
        "Advertisement rejected successfully!"
      );

    } catch (error) {
      console.error(
        "Advertisement rejection error:",
        error
      );

      alert(
        "Unable to reject advertisement."
      );

    } finally {
      setProcessingAd(null);
    }
  };


  // ======================================
  // DELETE SERVICE POST
  // ======================================

  const handleDeleteAd = async (ad) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${ad.title}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingAd(ad.id);

      await adminDeleteWorkerAd(ad.id);

      setSelectedAd(null);

      alert(
        "Advertisement deleted successfully!"
      );

    } catch (error) {
      console.error(
        "Advertisement deletion error:",
        error
      );

      alert(
        "Unable to delete advertisement."
      );

    } finally {
      setProcessingAd(null);
    }
  };


  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="manage-workers-page">

      {/* PAGE HEADER */}

      <div className="manage-workers-header">
        <div>
          <h1>Manage Workers</h1>

          <p>
            Manage registered skilled workers and their service posts.
          </p>
        </div>
      </div>


      {/* ======================================
          TAB NAVIGATION
      ====================================== */}

      <div className="mw-tab-navigation">

        <button
          type="button"
          className={`mw-tab-btn ${
            activeTab === "workers" ? "active" : ""
          }`}
          onClick={() => setActiveTab("workers")}
        >
          <Users size={18} />

          <span>Workers</span>

          <span className="mw-tab-count">
            {totalWorkers}
          </span>
        </button>


        <button
          type="button"
          className={`mw-tab-btn ${
            activeTab === "posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          <Briefcase size={18} />

          <span>Service Posts</span>

          <span className="mw-tab-count">
            {workerAds.length}
          </span>

          {pendingAds > 0 && (
            <span className="mw-pending-count">
              {pendingAds}
            </span>
          )}
        </button>

      </div>


      {/* ======================================
          WORKERS TAB
      ====================================== */}

      {activeTab === "workers" && (
        <>

          {/* WORKER STATISTICS */}

          <div className="manage-workers-stats">

            <div className="manage-workers-stat-card">
              <Users size={21} />

              <h3>Total Workers</h3>

              <strong>{totalWorkers}</strong>
            </div>


            <div className="manage-workers-stat-card">
              <UserCheck size={21} />

              <h3>Active Workers</h3>

              <strong>{activeWorkers}</strong>
            </div>


            <div className="manage-workers-stat-card">
              <UserX size={21} />

              <h3>Inactive Workers</h3>

              <strong>{inactiveWorkers}</strong>
            </div>


            <div className="manage-workers-stat-card">
              <ShieldCheck size={21} />

              <h3>Pending Verification</h3>

              <strong>{pendingVerification}</strong>
            </div>

          </div>


          {/* WORKER TABLE CARD */}

          <div className="manage-workers-table-card">

            <div className="manage-workers-table-header">

              <div>
                <h2>Registered Skilled Workers</h2>

                <p>
                  View and manage registered worker accounts.
                </p>
              </div>


              {/* FILTERS */}

              <div className="manage-workers-controls">

                <div className="manage-workers-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Search workers..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                  />
                </div>


                <DistrictDropdown
                  value={
                    locationFilter === "All"
                      ? ""
                      : locationFilter
                  }
                  onChange={(e) =>
                    setLocationFilter(
                      e.target.value || "All"
                    )
                  }
                  placeholder="All Districts"
                />


                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Account Statuses
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>


                <select
                  value={verificationFilter}
                  onChange={(e) =>
                    setVerificationFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Verification
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Verified">
                    Verified
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>
                </select>


                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={resetWorkerFilters}
                >
                  Reset
                </button>

              </div>

            </div>


            {/* WORKER TABLE */}

            <div className="manage-workers-table-wrapper">

              <table className="manage-workers-table">

                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Skill</th>
                    <th>District</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>


                <tbody>

                  {loadingWorkers ? (

                    <tr>
                      <td
                        colSpan="8"
                        className="no-workers-found"
                      >
                        Loading workers from Firestore...
                      </td>
                    </tr>

                  ) : workerError ? (

                    <tr>
                      <td
                        colSpan="8"
                        className="no-workers-found"
                      >
                        {workerError}
                      </td>
                    </tr>

                  ) : filteredWorkers.length > 0 ? (

                    filteredWorkers.map((worker) => {

                      const verification =
                        worker.verificationStatus || "Pending";

                      const accountStatus =
                        worker.status || "Active";

                      return (
                        <tr key={worker.id}>

                          <td>
                            {worker.name || "Unnamed Worker"}
                          </td>

                          <td>
                            {worker.email || "Not provided"}
                          </td>

                          <td>
                            {worker.phone || "Not provided"}
                          </td>

                          <td>
                            {worker.skill || "Not provided"}
                          </td>

                          <td>
                            {normalizeDistrict(worker.location) === "gampaha"
                              ? "Gampaha"
                              : worker.location || "Not specified"}
                          </td>

                          <td>
                            <span
                              className={`worker-status-badge ${accountStatus.toLowerCase()}`}
                            >
                              {accountStatus}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`worker-status-badge ${verification.toLowerCase()}`}
                            >
                              {verification}
                            </span>
                          </td>

                          <td>
                            <div className="worker-action-buttons">

                              <button
                                type="button"
                                className="view-worker-btn"
                                title="View Worker Profile"
                                onClick={() =>
                                  navigate(
                                    `/admin/workers/${worker.id}`
                                  )
                                }
                              >
                                <Eye size={17} />
                              </button>


                              <button
                                type="button"
                                className="edit-worker-btn"
                                title="Edit Worker"
                                onClick={() =>
                                  handleEdit(worker)
                                }
                              >
                                <Pencil size={17} />
                              </button>


                              <button
                                type="button"
                                className="delete-worker-btn"
                                title="Delete Worker"
                                onClick={() =>
                                  handleDeleteWorker(worker)
                                }
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })

                  ) : (

                    <tr>
                      <td
                        colSpan="8"
                        className="no-workers-found"
                      >
                        No skilled workers found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            <div className="manage-workers-results">
              Showing {filteredWorkers.length} of {workers.length} workers
            </div>

          </div>

        </>
      )}


      {/* ======================================
          SERVICE POSTS TAB
      ====================================== */}

      {activeTab === "posts" && (
        <>

          {/* POST STATISTICS */}

          <div className="manage-workers-stats">

            <div className="manage-workers-stat-card">
              <Briefcase size={21} />

              <h3>Total Posts</h3>

              <strong>{workerAds.length}</strong>
            </div>


            <div className="manage-workers-stat-card">
              <Clock size={21} />

              <h3>Pending Approval</h3>

              <strong>{pendingAds}</strong>
            </div>


            <div className="manage-workers-stat-card">
              <CheckCircle2 size={21} />

              <h3>Approved Posts</h3>

              <strong>{approvedAds}</strong>
            </div>


            <div className="manage-workers-stat-card">
              <XCircle size={21} />

              <h3>Rejected / Expired</h3>

              <strong>
                {rejectedAds + expiredAds}
              </strong>
            </div>

          </div>


          {/* SERVICE POSTS TABLE */}

          <div className="manage-workers-table-card">

            <div className="manage-workers-table-header">

              <div>
                <h2>Worker Service Advertisements</h2>

                <p>
                  Review, approve, reject and manage worker advertisements.
                </p>
              </div>

            </div>


            <div className="manage-workers-table-wrapper">

              <table className="manage-workers-table">

                <thead>
                  <tr>
                    <th>Service Title</th>
                    <th>Worker</th>
                    <th>Skill</th>
                    <th>District</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>


                <tbody>

                  {loadingAds ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="no-workers-found"
                      >
                        Loading service posts...
                      </td>
                    </tr>

                  ) : adsError ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="no-workers-found"
                      >
                        {adsError}
                      </td>
                    </tr>

                  ) : workerAds.length > 0 ? (

                    workerAds.map((ad) => {

                      const displayStatus = getAdStatus(ad);

                      return (
                        <tr key={ad.id}>

                          <td>
                            {ad.title || "Untitled Service"}
                          </td>

                          <td>
                            {ad.workerName || "Unknown Worker"}
                          </td>

                          <td>
                            {ad.skill || "Not specified"}
                          </td>

                          <td>
                            {ad.district || "Not specified"}
                          </td>

                          <td>
                            {formatDate(ad.submittedAt)}
                          </td>

                          <td>
                            <span
                              className={`worker-status-badge ${displayStatus.toLowerCase()}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td>
                            <div className="worker-action-buttons">

                              <button
                                type="button"
                                className="view-worker-btn"
                                title="View Advertisement"
                                onClick={() =>
                                  setSelectedAd(ad)
                                }
                              >
                                <Eye size={17} />
                              </button>


                              {displayStatus === "Pending" && (
                                <>

                                  <button
                                    type="button"
                                    className="mw-approve-btn"
                                    title="Approve Advertisement"
                                    disabled={processingAd === ad.id}
                                    onClick={() =>
                                      handleApproveAd(ad)
                                    }
                                  >
                                    <Check size={17} />
                                  </button>


                                  <button
                                    type="button"
                                    className="delete-worker-btn"
                                    title="Reject Advertisement"
                                    disabled={processingAd === ad.id}
                                    onClick={() =>
                                      handleRejectAd(ad)
                                    }
                                  >
                                    <X size={17} />
                                  </button>

                                </>
                              )}


                              <button
                                type="button"
                                className="delete-worker-btn"
                                title="Delete Advertisement"
                                disabled={processingAd === ad.id}
                                onClick={() =>
                                  handleDeleteAd(ad)
                                }
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })

                  ) : (

                    <tr>
                      <td
                        colSpan="7"
                        className="no-workers-found"
                      >
                        No worker advertisements available.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            <div className="manage-workers-results">
              Showing {workerAds.length} service advertisements
            </div>

          </div>

        </>
      )}


      {/* ======================================
          EDIT WORKER MODAL
      ====================================== */}

      {isEditModalOpen && (

        <div
          className="worker-modal-overlay"
          onClick={() =>
            !savingWorker && setIsEditModalOpen(false)
          }
        >

          <div
            className="worker-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="worker-modal-header">

              <div>
                <h2>Edit Worker</h2>

                <p>
                  Update worker account details.
                </p>
              </div>


              <button
                type="button"
                className="close-worker-modal-btn"
                onClick={() =>
                  setIsEditModalOpen(false)
                }
                disabled={savingWorker}
              >
                <X size={21} />
              </button>

            </div>


            <form onSubmit={handleUpdateWorker}>

              <div className="worker-edit-form-grid">

                {/* WORKER NAME */}

                <div className="edit-worker-field">

                  <label>Worker Name</label>

                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter worker name"
                    required
                    disabled={savingWorker}
                  />

                </div>


                {/* EMAIL ADDRESS - READ ONLY */}

                <div className="edit-worker-field">

                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    readOnly
                    disabled
                    placeholder="Email not available"
                    title="Email address cannot be changed here."
                  />

                </div>


                {/* PHONE NUMBER */}

                <div className="edit-worker-field">

                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                    required
                    disabled={savingWorker}
                  />

                </div>


                {/* DISTRICT */}

                <div className="edit-worker-field">

                  <label>District</label>

                  <DistrictDropdown
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                    placeholder="Select District"
                  />

                </div>


                {/* ACCOUNT STATUS */}

                <div className="edit-worker-field worker-edit-full-width">

                  <label>Account Status</label>

                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    disabled={savingWorker}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

              </div>


              {/* MODAL ACTIONS */}

              <div className="worker-modal-actions">

                <button
                  type="button"
                  className="cancel-worker-btn"
                  onClick={() =>
                    setIsEditModalOpen(false)
                  }
                  disabled={savingWorker}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-worker-btn"
                  disabled={savingWorker}
                >
                  {savingWorker
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================
          SERVICE POST DETAILS MODAL
      ====================================== */}

      {selectedAd && (

        <div
          className="worker-modal-overlay"
          onClick={() => setSelectedAd(null)}
        >

          <div
            className="worker-edit-modal mw-post-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="worker-modal-header">

              <div>
                <h2>Service Advertisement Details</h2>

                <p>
                  Review worker submitted information.
                </p>
              </div>


              <button
                type="button"
                className="close-worker-modal-btn"
                onClick={() => setSelectedAd(null)}
              >
                <X size={21} />
              </button>

            </div>


            <div className="mw-post-details">

              <h3>{selectedAd.title}</h3>

              <p>
                <strong>Worker:</strong>{" "}
                {selectedAd.workerName}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedAd.workerPhone}
              </p>

              <p>
                <strong>Skill:</strong>{" "}
                {selectedAd.skill}
              </p>

              <p>
                <strong>District:</strong>{" "}
                {selectedAd.district}
              </p>

              <p>
                <strong>Expected Rate:</strong>{" "}
                {selectedAd.rate}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {getAdStatus(selectedAd)}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {formatDate(selectedAd.submittedAt)}
              </p>

              <p>
                <strong>Approved:</strong>{" "}
                {formatDate(selectedAd.approvedAt)}
              </p>

              <p>
                <strong>Expires:</strong>{" "}
                {formatDate(selectedAd.expiresAt)}
              </p>


              <div className="mw-post-description">

                <strong>Description</strong>

                <p>
                  {selectedAd.description ||
                    "No description provided."}
                </p>

              </div>


              {selectedAd.rejectionReason && (

                <div className="wd-alert-box danger">

                  <strong>Rejection reason:</strong>

                  {selectedAd.rejectionReason}

                </div>

              )}

            </div>


            <div className="worker-modal-actions">

              <button
                type="button"
                className="cancel-worker-btn"
                onClick={() => setSelectedAd(null)}
              >
                Close
              </button>


              {getAdStatus(selectedAd) === "Pending" && (

                <>

                  <button
                    type="button"
                    className="mw-reject-post-btn"
                    disabled={processingAd === selectedAd.id}
                    onClick={() =>
                      handleRejectAd(selectedAd)
                    }
                  >
                    <XCircle size={16} />
                    Reject
                  </button>


                  <button
                    type="button"
                    className="mw-approve-post-btn"
                    disabled={processingAd === selectedAd.id}
                    onClick={() =>
                      handleApproveAd(selectedAd)
                    }
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ManageWorkers;
