
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  UserX,
  Activity,
  ShieldCheck,
  Building2,
  Flag,
  Bell,
  Check,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Megaphone,
} from "lucide-react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import {
  subscribeToAllJobs,
} from "../../services/jobService";

import {
  subscribeToAllWorkerAds,
} from "../../services/workerAdService";

import "./AdminDashboard.css";

// ======================================
// LOCAL STORAGE HELPER
// ======================================

const readStorage = (key) => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(key)
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ======================================
// DATE HELPERS
// ======================================

const getDate = (value) => {
  if (!value) return null;

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = getDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getLocalDateString = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// ======================================
// ADMIN DASHBOARD
// ======================================

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [workerAds, setWorkerAds] = useState([]);

  const [employers, setEmployers] = useState([]);
  const [reportedJobs, setReportedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  // ======================================
  // REAL-TIME FIRESTORE DATA
  // ======================================

  useEffect(() => {

    // USERS AND SKILLED WORKERS

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),

      (snapshot) => {
        const allUsers = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setUsers(
          allUsers.filter((user) => user.role === "user")
        );

        setWorkers(
          allUsers.filter((worker) => worker.role === "worker")
        );
      },

      (error) => {
        console.error("Unable to load users:", error);
      }
    );

    // JOBS

    const unsubscribeJobs = subscribeToAllJobs(
      (fetchedJobs) => {
        setJobs(fetchedJobs);
      },

      (error) => {
        console.error("Unable to load jobs:", error);
      }
    );

    // WORKER SERVICE ADVERTISEMENTS

    const unsubscribeWorkerAds = subscribeToAllWorkerAds(
      (fetchedAds) => {
        setWorkerAds(fetchedAds);
      },

      (error) => {
        console.error("Unable to load worker ads:", error);
      }
    );

    // LOCAL DATA

    const loadLocalData = () => {
      setEmployers(readStorage("jobmate_employers"));

      setReportedJobs(readStorage("jobmate_reported_jobs"));

      setNotifications(readStorage("jobmate_notifications"));

      setReminders(readStorage("jobmate_reminders"));
    };

    loadLocalData();

    window.addEventListener("storage", loadLocalData);

    // CLEANUP

    return () => {
      unsubscribeUsers();
      unsubscribeJobs();
      unsubscribeWorkerAds();

      window.removeEventListener("storage", loadLocalData);
    };

  }, []);

  // ======================================
  // WORKER STATISTICS
  // ======================================

  const activeWorkers = workers.filter(
    (worker) =>
      String(worker.status || "Active").toLowerCase() === "active"
  ).length;

  const inactiveWorkers = workers.filter(
    (worker) =>
      String(worker.status || "Active").toLowerCase() === "inactive"
  ).length;

  const pendingWorkers = workers.filter(
    (worker) =>
      String(worker.verificationStatus || "Pending").toLowerCase() ===
      "pending"
  );

  const verifiedWorkers = workers.filter(
    (worker) =>
      String(worker.verificationStatus || "").toLowerCase() ===
      "verified"
  ).length;

  // ======================================
  // WORKER ADVERTISEMENT STATISTICS
  // ======================================

  const pendingWorkerAds = workerAds.filter(
    (ad) => ad.status === "Pending"
  ).length;

  const approvedWorkerAds = workerAds.filter(
    (ad) => ad.status === "Approved"
  ).length;

  // ======================================
  // OTHER PENDING APPROVALS
  // ======================================

  const pendingEmployers = employers.filter((employer) => {
    const status =
      employer.approvalStatus ||
      employer.status ||
      "Pending";

    return String(status).toLowerCase() === "pending";
  });

  const pendingReports = reportedJobs.filter(
    (report) =>
      String(report.status || "Pending").toLowerCase() === "pending"
  );

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // ======================================
  // DASHBOARD STATISTICS
  // ======================================

  const statistics = [
    {
      title: "Total Jobs",
      value: jobs.length,
      icon: <BriefcaseBusiness size={25} />,
    },
    {
      title: "Total Job Seekers",
      value: users.length,
      icon: <Users size={25} />,
    },
    {
      title: "Total Skilled Workers",
      value: workers.length,
      icon: <UserCheck size={25} />,
    },
    {
      title: "Active Skilled Workers",
      value: activeWorkers,
      icon: <UserCheck size={25} />,
    },
    {
      title: "Inactive Skilled Workers",
      value: inactiveWorkers,
      icon: <UserX size={25} />,
    },
  ];

  // ======================================
  // RECENT ACTIVITIES
  // ======================================

  const recentActivities = useMemo(() => {
    const activityItems = [

      ...users.map((user) => ({
        id: `user-${user.id}`,
        title: `${user.name || "A Job Seeker"} registered`,
        type: "Job Seeker Registration",
        date: user.createdAt,
        icon: <Users size={17} />,
      })),

      ...workers.map((worker) => ({
        id: `worker-${worker.id}`,
        title: `${worker.name || "A Skilled Worker"} registered`,
        type: "Skilled Worker Registration",
        date: worker.createdAt,
        icon: <UserCheck size={17} />,
      })),

      ...jobs.map((job) => ({
        id: `job-${job.id}`,
        title: `${job.title || "A job"} was posted`,
        type: "New Job Post",
        date: job.createdAt,
        icon: <BriefcaseBusiness size={17} />,
      })),

      ...workerAds.map((ad) => ({
        id: `worker-ad-${ad.id}`,
        title: `${ad.workerName || "A Worker"} submitted a service post`,
        type: "Worker Advertisement Submission",
        date: ad.submittedAt,
        icon: <Megaphone size={17} />,
      })),

    ];

    return activityItems
      .filter((item) => getDate(item.date))
      .sort(
        (a, b) => getDate(b.date) - getDate(a.date)
      )
      .slice(0, 6);

  }, [users, workers, jobs, workerAds]);

  // ======================================
  // UPCOMING EVENTS
  // ======================================

  const today = new Date();
  const todayString = getLocalDateString(today);

  const upcomingEvents = useMemo(() => {
    const todayStart = new Date(
      `${todayString}T00:00:00`
    );

    const jobEvents = jobs
      .filter((job) => {
        const deadline = getDate(job.deadline);

        return deadline && deadline >= todayStart;
      })
      .map((job) => ({
        id: `job-${job.id}`,
        title: `${job.title || "Job"} deadline`,
        date: job.deadline,
        type: "Job Deadline",
      }));

    const reminderEvents = reminders
      .filter((reminder) => {
        const date = getDate(reminder.date);

        return date && date >= todayStart;
      })
      .map((reminder) => ({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date: reminder.date,
        type: "Reminder",
        reminderId: reminder.id,
      }));

    return [...jobEvents, ...reminderEvents]
      .sort(
        (a, b) => getDate(a.date) - getDate(b.date)
      )
      .slice(0, 8);

  }, [jobs, reminders, todayString]);

  // ======================================
  // ADD REMINDER
  // ======================================

  const handleAddReminder = (event) => {
    event.preventDefault();

    if (!reminderTitle.trim() || !reminderDate) return;

    const newReminder = {
      id: Date.now(),
      title: reminderTitle.trim(),
      date: reminderDate,
    };

    const updatedReminders = [
      ...reminders,
      newReminder,
    ];

    setReminders(updatedReminders);

    localStorage.setItem(
      "jobmate_reminders",
      JSON.stringify(updatedReminders)
    );

    setReminderTitle("");
    setReminderDate("");
  };

  // ======================================
  // DELETE REMINDER
  // ======================================

  const handleDeleteReminder = (id) => {
    const updatedReminders = reminders.filter(
      (reminder) => reminder.id !== id
    );

    setReminders(updatedReminders);

    localStorage.setItem(
      "jobmate_reminders",
      JSON.stringify(updatedReminders)
    );
  };

  // ======================================
  // MARK AS READ
  // ======================================

  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map(
      (notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "jobmate_notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  // ======================================
  // MARK ALL AS READ
  // ======================================

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(
      (notification) => ({
        ...notification,
        isRead: true,
      })
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "jobmate_notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="admin-dashboard">

      <main className="admin-dashboard-main">

        {/* HEADER */}

        <header className="admin-dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to the PattaJobs Admin Panel</p>
          </div>

          <span className="admin-profile">
            Admin
          </span>
        </header>

        {/* ======================================
            STATISTICS
        ====================================== */}

        <section className="admin-stat-grid">

          {statistics.map((stat) => (
            <div className="admin-stat-card" key={stat.title}>

              {stat.icon}

              <h3>{stat.title}</h3>

              <strong>{stat.value}</strong>

            </div>
          ))}

        </section>

        {/* ======================================
            RECENT ACTIVITIES
        ====================================== */}

        <section className="admin-dashboard-section">

          <div className="admin-section-heading">
            <div>
              <h2>
                <Activity size={20} />
                Recent Activities
              </h2>

              <p>
                Latest activities on your platform
              </p>
            </div>
          </div>

          {recentActivities.length > 0 ? (
            <div className="admin-activity-list">

              {recentActivities.map((activity) => (
                <div
                  className="admin-activity-item"
                  key={activity.id}
                >

                  <div className="admin-activity-icon">
                    {activity.icon}
                  </div>

                  <div className="admin-activity-info">
                    <strong>{activity.title}</strong>
                    <span>{activity.type}</span>
                  </div>

                  <time>{formatDate(activity.date)}</time>

                </div>
              ))}

            </div>
          ) : (
            <p className="admin-empty-message">
              No recent activities available.
            </p>
          )}

        </section>

        {/* ======================================
            PENDING APPROVALS
        ====================================== */}

        <section className="admin-dashboard-section">

          <div className="admin-section-heading">
            <div>
              <h2>
                <ShieldCheck size={20} />
                Pending Approvals
              </h2>

              <p>
                Items that require administrator attention
              </p>
            </div>
          </div>

          <div className="admin-approval-grid">

            {/* WORKER VERIFICATION */}

            <div className="admin-approval-card">
              <div className="admin-approval-icon worker">
                <UserCheck size={22} />
              </div>

              <div>
                <span>Worker Verification</span>
                <strong>{pendingWorkers.length}</strong>
              </div>
            </div>

            {/* WORKER SERVICE POSTS */}

            <div className="admin-approval-card">
              <div className="admin-approval-icon worker">
                <Megaphone size={22} />
              </div>

              <div>
                <span>Worker Service Posts</span>
                <strong>{pendingWorkerAds}</strong>
              </div>
            </div>

            {/* EMPLOYERS */}

            <div className="admin-approval-card">
              <div className="admin-approval-icon employer">
                <Building2 size={22} />
              </div>

              <div>
                <span>Employer Approvals</span>
                <strong>{pendingEmployers.length}</strong>
              </div>
            </div>

            {/* REPORTED JOBS */}

            <div className="admin-approval-card">
              <div className="admin-approval-icon report">
                <Flag size={22} />
              </div>

              <div>
                <span>Reported Jobs</span>
                <strong>{pendingReports.length}</strong>
              </div>
            </div>

          </div>

        </section>

        {/* ======================================
            WORKER SUMMARY
        ====================================== */}

        <section className="admin-dashboard-section">

          <div className="admin-section-heading">
            <div>
              <h2>
                <UserCheck size={20} />
                Skilled Worker Overview
              </h2>

              <p>Real-time worker registration and verification summary</p>
            </div>
          </div>

          <div className="admin-approval-grid">

            <div className="admin-approval-card">
              <div className="admin-approval-icon worker">
                <Users size={22} />
              </div>

              <div>
                <span>Total Workers</span>
                <strong>{workers.length}</strong>
              </div>
            </div>

            <div className="admin-approval-card">
              <div className="admin-approval-icon worker">
                <CheckCircle2Icon />
              </div>

              <div>
                <span>Verified Workers</span>
                <strong>{verifiedWorkers}</strong>
              </div>
            </div>

            <div className="admin-approval-card">
              <div className="admin-approval-icon worker">
                <Megaphone size={22} />
              </div>

              <div>
                <span>Approved Service Posts</span>
                <strong>{approvedWorkerAds}</strong>
              </div>
            </div>

          </div>

        </section>

        {/* ======================================
            NOTIFICATIONS CENTER
        ====================================== */}

        <section className="admin-dashboard-section">

          <div className="admin-section-heading">

            <div>
              <h2>
                <Bell size={20} />
                Notifications Center
              </h2>

              <p>
                {unreadNotifications} unread notification
                {unreadNotifications !== 1 ? "s" : ""}
              </p>
            </div>

            {unreadNotifications > 0 && (
              <button
                type="button"
                className="admin-text-button"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}

          </div>

          {notifications.length > 0 ? (
            <div className="admin-notification-list">

              {notifications.slice(0, 6).map((notification) => (
                <div
                  className={`admin-notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                  key={notification.id}
                >

                  <div className="admin-notification-dot" />

                  <div className="admin-notification-info">

                    <strong>
                      {notification.title || "New notification"}
                    </strong>

                    <p>{notification.message || ""}</p>

                    {notification.createdAt && (
                      <time>
                        {formatDate(notification.createdAt)}
                      </time>
                    )}

                  </div>

                  {!notification.isRead && (
                    <button
                      type="button"
                      className="admin-icon-button"
                      title="Mark as read"
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                    >
                      <Check size={17} />
                    </button>
                  )}

                </div>
              ))}

            </div>
          ) : (
            <p className="admin-empty-message">
              No notifications available.
            </p>
          )}

        </section>

        {/* ======================================
            LIVE CALENDAR
        ====================================== */}

        <section className="admin-dashboard-section admin-calendar-section">

          <div className="admin-section-heading">
            <div>
              <h2>
                <CalendarDays size={20} />
                Live Calendar
              </h2>

              <p>
                Today:{" "}
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* ADD REMINDER */}

          <form
            className="admin-reminder-form"
            onSubmit={handleAddReminder}
          >

            <input
              type="text"
              placeholder="Enter reminder title"
              value={reminderTitle}
              onChange={(event) =>
                setReminderTitle(event.target.value)
              }
              required
            />

            <input
              type="date"
              value={reminderDate}
              min={todayString}
              onChange={(event) =>
                setReminderDate(event.target.value)
              }
              required
            />

            <button type="submit">
              <Plus size={17} />
              Add Reminder
            </button>

          </form>

          {/* UPCOMING EVENTS */}

          <div className="admin-upcoming-heading">
            <Clock size={18} />
            <h3>Upcoming Events</h3>
          </div>

          {upcomingEvents.length > 0 ? (

            <div className="admin-event-list">

              {upcomingEvents.map((event) => {

                const eventDate = getDate(event.date);

                return (
                  <div
                    className="admin-event-item"
                    key={event.id}
                  >

                    <div className="admin-event-date">
                      <strong>
                        {eventDate?.getDate() ?? "–"}
                      </strong>

                      <span>
                        {eventDate?.toLocaleDateString(
                          "en-US",
                          { month: "short" }
                        ) ?? "N/A"}
                      </span>
                    </div>

                    <div className="admin-event-info">
                      <strong>{event.title}</strong>
                      <span>{event.type}</span>
                    </div>

                    {event.reminderId && (
                      <button
                        type="button"
                        className="admin-icon-button delete"
                        title="Delete reminder"
                        onClick={() =>
                          handleDeleteReminder(event.reminderId)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    )}

                  </div>
                );
              })}

            </div>

          ) : (
            <p className="admin-empty-message">
              No upcoming events or reminders.
            </p>
          )}

        </section>

      </main>

    </div>
  );
}

function CheckCircle2Icon() {
  return <ShieldCheck size={22} />;
}

export default AdminDashboard;
