import React, { useEffect, useState } from "react";

import {
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Activity,
  Clock,
  LogIn,
  UserRound,
  Check,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import DistrictDropdown from "../../components/common/DistrictDropdown";

import "./ManageUsers.css";


// ======================================
// INITIAL FORM
// ======================================

const initialEditForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  status: "Pending",
};


// ======================================
// HELPER FUNCTIONS
// ======================================

const toDate = (value) => {
  if (!value) return null;

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};


const formatDate = (value) => {
  const date = toDate(value);

  if (!date) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatDateTime = (value) => {
  const date = toDate(value);

  if (!date) return "Not available";

  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};


const displayValue = (value) => {
  return value || "Not provided";
};


// Profiles without a status are treated as Pending.
const getUserStatus = (user) => {
  return user.status || "Pending";
};


// Calculate unique active days from activity records.
const getActiveDays = (activities) => {
  const activeDates = new Set();

  activities.forEach((activity) => {
    const date = toDate(activity.createdAt);

    if (date) {
      const dateKey = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      ].join("-");

      activeDates.add(dateKey);
    }
  });

  return activeDates.size;
};


// ======================================
// MANAGE USERS COMPONENT
// ======================================

function ManageUsers() {

  // ======================================
  // STATES
  // ======================================

  const [users, setUsers] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);

  const [usersError, setUsersError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [locationFilter, setLocationFilter] = useState("All");


  const [selectedUserId, setSelectedUserId] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);


  const [activities, setActivities] = useState([]);

  const [loadingActivities, setLoadingActivities] = useState(false);

  const [activityError, setActivityError] = useState("");


  const [editForm, setEditForm] = useState(initialEditForm);


  const [saving, setSaving] = useState(false);

  const [approvingUserId, setApprovingUserId] = useState(null);

  const [deletingUserId, setDeletingUserId] = useState(null);


  // Get selected user from current Firestore data.
  const selectedUser =
    users.find((user) => user.id === selectedUserId) || null;


  // ======================================
  // REAL-TIME JOB SEEKER LIST
  // ======================================

  useEffect(() => {

    const usersRef = collection(db, "users");

    // Only Job Seekers.
    const usersQuery = query(
      usersRef,
      where("role", "==", "user")
    );


    const unsubscribe = onSnapshot(
      usersQuery,

      (snapshot) => {

        const usersList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));


        // Sort newest registrations first.
        usersList.sort((a, b) => {

          const dateA =
            toDate(a.createdAt)?.getTime() || 0;

          const dateB =
            toDate(b.createdAt)?.getTime() || 0;

          return dateB - dateA;

        });


        setUsers(usersList);

        setLoadingUsers(false);

        setUsersError("");

      },


      (error) => {

        console.error(
          "Error loading Job Seekers:",
          error
        );

        setUsersError(
          "Unable to load Job Seekers. Please check your permissions."
        );

        setLoadingUsers(false);

      }
    );


    return () => unsubscribe();

  }, []);


  // ======================================
  // REAL-TIME SELECTED USER ACTIVITY
  // ======================================

  useEffect(() => {

    if (!selectedUserId) {

      setActivities([]);

      setLoadingActivities(false);

      setActivityError("");

      return undefined;

    }


    setLoadingActivities(true);

    setActivityError("");


    const activityRef = collection(
      db,
      "users",
      selectedUserId,
      "activity"
    );


    const activityQuery = query(
      activityRef,
      orderBy("createdAt", "desc")
    );


    const unsubscribe = onSnapshot(
      activityQuery,

      (snapshot) => {

        const activityList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));


        setActivities(activityList);

        setLoadingActivities(false);

        setActivityError("");

      },


      (error) => {

        console.error(
          "Error loading user activity:",
          error
        );

        setActivityError(
          "Unable to load activity history."
        );

        setLoadingActivities(false);

      }
    );


    return () => unsubscribe();

  }, [selectedUserId]);


  // ======================================
  // FILTER JOB SEEKERS
  // ======================================

  const filteredUsers = users.filter((user) => {

    const search = searchTerm.trim().toLowerCase();


    const matchesSearch =
      String(user.name || "").toLowerCase().includes(search) ||

      String(user.email || "").toLowerCase().includes(search) ||

      String(user.phone || "").toLowerCase().includes(search);


    const matchesStatus =
      statusFilter === "All" ||
      getUserStatus(user) === statusFilter;


    const matchesLocation =
      locationFilter === "All" ||

      String(user.location || "").toLowerCase() ===
        locationFilter.toLowerCase();


    return (
      matchesSearch &&
      matchesStatus &&
      matchesLocation
    );

  });


  // ======================================
  // STATISTICS
  // ======================================

  const totalUsers = users.length;


  const pendingUsers = users.filter(
    (user) => getUserStatus(user) === "Pending"
  ).length;


  const activeUsers = users.filter(
    (user) => getUserStatus(user) === "Active"
  ).length;


  const inactiveUsers = users.filter(
    (user) => getUserStatus(user) === "Inactive"
  ).length;


  // ======================================
  // FILTER RESET / MODALS
  // ======================================

  const handleResetFilters = () => {

    setSearchTerm("");

    setStatusFilter("All");

    setLocationFilter("All");

  };


  const handleViewUser = (user) => {

    setEditingUserId(null);

    setSelectedUserId(user.id);

  };


  const handleEdit = (user) => {

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      status: getUserStatus(user),
    });


    setSelectedUserId(null);

    setEditingUserId(user.id);

  };


  // ======================================
  // HANDLE EDIT INPUTS
  // ======================================

  const handleEditChange = (event) => {

    const { name, value } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

  };


  // ======================================
  // APPROVE USER
  // ======================================

  const handleApprove = async (user) => {

    if (approvingUserId) return;


    const confirmed = window.confirm(
      `Are you sure you want to approve ${
        user.name || "this user"
      }?`
    );


    if (!confirmed) return;


    try {

      setApprovingUserId(user.id);


      const userRef = doc(
        db,
        "users",
        user.id
      );


      await updateDoc(userRef, {

        status: "Active",

        approvedAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

      });


      alert("User approved successfully!");


    } catch (error) {

      console.error(
        "Error approving user:",
        error
      );

      alert(
        "Unable to approve user. Please try again."
      );

    } finally {

      setApprovingUserId(null);

    }

  };


  // ======================================
  // SAVE USER DETAILS
  // ======================================

  const handleSaveEdit = async (event) => {

    event.preventDefault();

    if (saving) return;


    if (!editForm.name.trim()) {

      alert("Please enter the user's name.");

      return;

    }


    try {

      setSaving(true);


      const userRef = doc(
        db,
        "users",
        editingUserId
      );


      await updateDoc(userRef, {

        name: editForm.name.trim(),

        phone: editForm.phone.trim(),

        location: editForm.location,

        status: editForm.status,

        updatedAt: serverTimestamp(),

      });


      setEditingUserId(null);

      setEditForm(initialEditForm);


      alert("Job Seeker updated successfully!");


    } catch (error) {

      console.error(
        "Error updating Job Seeker:",
        error
      );

      alert(
        "Unable to update Job Seeker. Please try again."
      );

    } finally {

      setSaving(false);

    }

  };


  // ======================================
  // CLOSE EDIT MODAL
  // ======================================

  const handleCloseEdit = () => {

    if (saving) return;

    setEditingUserId(null);

    setEditForm(initialEditForm);

  };


  // ======================================
  // CLOSE PROFILE MODAL
  // ======================================

  const handleCloseProfile = () => {

    setSelectedUserId(null);

  };


  // ======================================
  // DELETE USER PROFILE AND ACTIVITY
  // ======================================

  const handleDelete = async (user) => {

    if (deletingUserId) return;


    const confirmed = window.confirm(
      `Are you sure you want to delete the Firestore profile of ${
        user.name || "this Job Seeker"
      }? Their activity records will also be deleted. This will NOT delete their Firebase Authentication account.`
    );


    if (!confirmed) return;


    try {

      setDeletingUserId(user.id);


      const userRef = doc(
        db,
        "users",
        user.id
      );


      const activityRef = collection(
        db,
        "users",
        user.id,
        "activity"
      );


      const activitySnapshot = await getDocs(activityRef);

      const activityDocs = activitySnapshot.docs;


      // Firestore batches support up to 500 writes.
      // Use 450 operations per batch.

      for (
        let index = 0;
        index < activityDocs.length;
        index += 450
      ) {

        const batch = writeBatch(db);

        activityDocs
          .slice(index, index + 450)
          .forEach((activityDoc) => {

            batch.delete(activityDoc.ref);

          });

        await batch.commit();

      }


      // Delete main Firestore user document.
      await deleteDoc(userRef);


      if (selectedUserId === user.id) {
        setSelectedUserId(null);
      }

      if (editingUserId === user.id) {
        setEditingUserId(null);
      }


      alert(
        "Firestore user profile deleted successfully!"
      );


    } catch (error) {

      console.error(
        "Error deleting Job Seeker:",
        error
      );

      alert(
        "Unable to delete Job Seeker. Please try again."
      );

    } finally {

      setDeletingUserId(null);

    }

  };


  // ======================================
  // RENDER
  // ======================================

  return (

    <div className="manage-users-page">

      {/* PAGE HEADER */}

      <div className="manage-users-header">

        <div>

          <h1>Manage Users</h1>

          <p>
            View and manage registered Job Seekers.
          </p>

        </div>

      </div>


      {/* STATISTICS */}

      <div className="manage-users-stats">

        <div className="manage-users-stat-card">
          <h3>Total Job Seekers</h3>
          <p>{totalUsers}</p>
        </div>


        <div className="manage-users-stat-card">
          <h3>Pending Approvals</h3>
          <p>{pendingUsers}</p>
        </div>


        <div className="manage-users-stat-card">
          <h3>Active Job Seekers</h3>
          <p>{activeUsers}</p>
        </div>


        <div className="manage-users-stat-card">
          <h3>Inactive Job Seekers</h3>
          <p>{inactiveUsers}</p>
        </div>

      </div>


      {/* USERS TABLE */}

      <div className="manage-users-table-card">

        {/* TABLE HEADER */}

        <div className="manage-users-table-header">

          <div className="manage-users-table-title">

            <h2>Registered Job Seekers</h2>

            <p>
              View and manage all registered Job Seeker profiles.
            </p>

          </div>


          {/* SEARCH AND FILTERS */}

          <div className="manage-users-controls">

            <div className="manage-users-search-box">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search job seekers..."
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
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="All">All Status</option>

              <option value="Pending">Pending</option>

              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>

            </select>


            <button
              type="button"
              className="manage-users-reset-btn"
              onClick={handleResetFilters}
            >
              Reset
            </button>

          </div>

        </div>


        {/* USERS TABLE */}

        <div className="manage-users-table-wrapper">

          <table className="manage-users-table">

            <thead>

              <tr>
                <th>Job Seeker</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>


            <tbody>

              {loadingUsers ? (

                <tr>
                  <td colSpan="7" className="manage-users-empty">
                    Loading Job Seekers...
                  </td>
                </tr>

              ) : usersError ? (

                <tr>
                  <td colSpan="7" className="manage-users-empty">
                    {usersError}
                  </td>
                </tr>

              ) : filteredUsers.length > 0 ? (

                filteredUsers.map((user) => (

                  <tr key={user.id}>

                    {/* USER NAME */}

                    <td>

                      <div className="manage-user-name">

                        <div className="manage-user-avatar">
                          <UserRound size={18} />
                        </div>

                        <span>
                          {user.name || "Unnamed User"}
                        </span>

                      </div>

                    </td>


                    {/* EMAIL */}

                    <td>
                      {user.email || "Not provided"}
                    </td>


                    {/* PHONE */}

                    <td>
                      {user.phone || "Not provided"}
                    </td>


                    {/* DISTRICT */}

                    <td>
                      {user.location || "Not provided"}
                    </td>


                    {/* JOINED DATE */}

                    <td>
                      {formatDate(user.createdAt)}
                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`user-status ${getUserStatus(user).toLowerCase()}`}
                      >
                        {getUserStatus(user)}
                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="manage-user-actions">

                        {getUserStatus(user) === "Pending" && (

                          <button
                            type="button"
                            className="approve-user-btn"
                            title="Approve User"
                            disabled={approvingUserId === user.id}
                            onClick={() => handleApprove(user)}
                          >
                            <Check size={16} />
                          </button>

                        )}


                        <button
                          type="button"
                          className="view-user-btn"
                          title="View Profile"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye size={16} />
                        </button>


                        <button
                          type="button"
                          className="edit-user-btn"
                          title="Edit User"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil size={16} />
                        </button>


                        <button
                          type="button"
                          className="delete-user-btn"
                          title="Delete User Profile"
                          disabled={deletingUserId === user.id}
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="7" className="manage-users-empty">
                    No Job Seekers found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* RESULTS */}

        <div className="manage-users-results">

          Showing {filteredUsers.length} of {users.length} Job Seekers

        </div>

      </div>


      {/* ======================================
          VIEW USER PROFILE MODAL
      ====================================== */}

      {selectedUser && (

        <div
          className="user-profile-modal-overlay"
          onClick={handleCloseProfile}
        >

          <div
            className="user-profile-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* PROFILE HEADER */}

            <div className="user-profile-modal-header">

              <div>

                <h2>Job Seeker Profile</h2>

                <p>
                  View personal information and account activity.
                </p>

              </div>


              <button
                type="button"
                className="user-profile-close-btn"
                onClick={handleCloseProfile}
              >
                <X size={21} />
              </button>

            </div>


            {/* PROFILE SUMMARY */}

            <div className="user-profile-summary">

              <div className="user-profile-avatar">

                {selectedUser.photoURL ? (

                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.name || "User"}
                  />

                ) : (

                  <UserRound size={32} />

                )}

              </div>


              <div className="user-profile-identity">

                <h3>
                  {selectedUser.name || "Unnamed User"}
                </h3>

                <p>
                  {selectedUser.email || "No email provided"}
                </p>

                <span
                  className={`user-status ${getUserStatus(selectedUser).toLowerCase()}`}
                >
                  {getUserStatus(selectedUser)}
                </span>

              </div>

            </div>


            {/* PERSONAL INFORMATION */}

            <div className="user-profile-section">

              <h3>
                <UserRound size={18} />
                Personal Information
              </h3>


              <div className="user-profile-details-grid">

                <div className="user-profile-detail">

                  <span>
                    <Mail size={16} />
                    Email Address
                  </span>

                  <strong>
                    {displayValue(selectedUser.email)}
                  </strong>

                </div>


                <div className="user-profile-detail">

                  <span>
                    <Phone size={16} />
                    Phone Number
                  </span>

                  <strong>
                    {displayValue(selectedUser.phone)}
                  </strong>

                </div>


                <div className="user-profile-detail">

                  <span>
                    <MapPin size={16} />
                    District
                  </span>

                  <strong>
                    {displayValue(selectedUser.location)}
                  </strong>

                </div>


                <div className="user-profile-detail">

                  <span>
                    <CalendarDays size={16} />
                    Joined Date
                  </span>

                  <strong>
                    {formatDate(selectedUser.createdAt)}
                  </strong>

                </div>

              </div>

            </div>


            {/* ACTIVITY OVERVIEW */}

            <div className="user-profile-section">

              <h3>
                <Activity size={18} />
                Activity Overview
              </h3>


              <div className="user-activity-stats">

                <div className="user-activity-stat">

                  <CalendarDays size={19} />

                  <div>

                    <strong>
                      {getActiveDays(activities)}
                    </strong>

                    <span>
                      Recorded Active Days
                    </span>

                  </div>

                </div>


                <div className="user-activity-stat">

                  <LogIn size={19} />

                  <div>

                    <strong>
                      {selectedUser.totalLogins ?? 0}
                    </strong>

                    <span>
                      Total Logins
                    </span>

                  </div>

                </div>


                <div className="user-activity-stat">

                  <Clock size={19} />

                  <div>

                    <strong>
                      {formatDate(selectedUser.lastActive)}
                    </strong>

                    <span>
                      Last Active
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* ACTIVITY HISTORY */}

            <div className="user-profile-section">

              <h3>
                <Clock size={18} />
                Recent Activity
              </h3>


              {loadingActivities ? (

                <p className="user-no-activity">
                  Loading activity history...
                </p>

              ) : activityError ? (

                <p className="user-no-activity">
                  {activityError}
                </p>

              ) : activities.length > 0 ? (

                <div className="user-activity-history">

                  {activities.slice(0, 10).map((activity) => (

                    <div
                      className="user-activity-history-item"
                      key={activity.id}
                    >

                      <div className="user-activity-dot" />

                      <div className="user-activity-history-content">

                        <strong>
                          {activity.action}
                        </strong>

                        <span>
                          {formatDateTime(activity.createdAt)}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="user-no-activity">
                  No activity records available.
                </p>

              )}

            </div>


            {/* PROFILE FOOTER */}

            <div className="user-profile-modal-footer">

              <button
                type="button"
                className="user-profile-edit-btn"
                onClick={() => handleEdit(selectedUser)}
              >
                <Pencil size={16} />
                Edit Profile
              </button>


              <button
                type="button"
                className="user-profile-done-btn"
                onClick={handleCloseProfile}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          EDIT USER MODAL
      ====================================== */}

      {editingUserId && (

        <div
          className="edit-user-modal-overlay"
          onClick={handleCloseEdit}
        >

          <div
            className="edit-user-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* EDIT HEADER */}

            <div className="edit-user-modal-header">

              <div>

                <h2>Edit Job Seeker</h2>

                <p>
                  Update Job Seeker account details.
                </p>

              </div>


              <button
                type="button"
                className="edit-user-close-btn"
                onClick={handleCloseEdit}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>


            {/* EDIT FORM */}

            <form onSubmit={handleSaveEdit}>

              <div className="edit-user-form-grid">

                {/* NAME */}

                <div className="edit-user-field">

                  <label htmlFor="edit-user-name">
                    Full Name
                  </label>

                  <input
                    id="edit-user-name"
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter full name"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="edit-user-field">

                  <label htmlFor="edit-user-email">
                    Email Address
                  </label>

                  <input
                    id="edit-user-email"
                    type="email"
                    name="email"
                    value={editForm.email}
                    disabled
                    readOnly
                  />

                </div>


                {/* PHONE */}

                <div className="edit-user-field">

                  <label htmlFor="edit-user-phone">
                    Phone Number
                  </label>

                  <input
                    id="edit-user-phone"
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                  />

                </div>


                {/* DISTRICT */}

                <div className="edit-user-field">

                  <label>District</label>

                  <DistrictDropdown
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    placeholder="Select District"
                  />

                </div>


                {/* STATUS */}

                <div className="edit-user-field edit-user-full-width">

                  <label htmlFor="edit-user-status">
                    Account Status
                  </label>

                  <select
                    id="edit-user-status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >

                    <option value="Pending">Pending</option>

                    <option value="Active">Active</option>

                    <option value="Inactive">Inactive</option>

                  </select>

                </div>

              </div>


              {/* FORM ACTIONS */}

              <div className="edit-user-modal-actions">

                <button
                  type="button"
                  className="edit-user-cancel-btn"
                  onClick={handleCloseEdit}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="edit-user-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default ManageUsers;