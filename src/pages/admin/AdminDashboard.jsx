
import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Users,
  UserCheck,
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
} from "lucide-react";

import "./AdminDashboard.css";

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const getDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
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

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [reportedJobs, setReportedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  useEffect(() => {
    const loadDashboardData = () => {
      setJobs(readStorage("jobmate_jobs"));
      setUsers(readStorage("jobmate_users"));
      setWorkers(readStorage("jobmate_workers"));
      setEmployers(readStorage("jobmate_employers"));
      setReportedJobs(readStorage("jobmate_reported_jobs"));
      setNotifications(readStorage("jobmate_notifications"));
      setReminders(readStorage("jobmate_reminders"));
    };

    loadDashboardData();

    // Refresh dashboard data when localStorage changes in another tab.
    window.addEventListener("storage", loadDashboardData);

    return () => {
      window.removeEventListener("storage", loadDashboardData);
    };
  }, []);

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const pendingWorkers = workers.filter(
    (worker) =>
      (worker.verificationStatus || "Pending").toLowerCase() === "pending"
  );

  const pendingEmployers = employers.filter(
    (employer) =>
      (employer.approvalStatus || employer.status || "Pending").toLowerCase() ===
      "pending"
  );

  const pendingReports = reportedJobs.filter(
    (report) =>
      (report.status || "Pending").toLowerCase() === "pending"
  );

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const recentActivities = useMemo(() => {
    const activityItems = [
      ...users.map((user) => ({
        id: `user-${user.id}`,
        title: `${user.name || "A Job Seeker"} registered`,
        type: "Job Seeker Registration",
        date: user.joinedAt || user.joinedDate || user.createdAt,
        icon: <Users size={17} />,
      })),

      ...workers.map((worker) => ({
        id: `worker-${worker.id}`,
        title: `${worker.name || "A Skilled Worker"} registered`,
        type: "Skilled Worker Registration",
        date: worker.joinedAt || worker.joinedDate || worker.createdAt,
        icon: <UserCheck size={17} />,
      })),

      ...jobs.map((job) => ({
        id: `job-${job.id}`,
        title: `${job.title || "A job"} was posted`,
        type: "New Job Post",
        date: job.createdAt,
        icon: <BriefcaseBusiness size={17} />,
      })),
    ];

    return activityItems
      .filter((item) => getDate(item.date))
      .sort((a, b) => getDate(b.date) - getDate(a.date))
      .slice(0, 6);
  }, [users, workers, jobs]);

  const upcomingEvents = useMemo(() => {
    const jobEvents = jobs
      .filter((job) => {
        const deadline = getDate(job.deadline);
        return deadline && deadline >= new Date(todayString);
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
        return date && date >= new Date(todayString);
      })
      .map((reminder) => ({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date: reminder.date,
        type: "Reminder",
        reminderId: reminder.id,
      }));

    return [...jobEvents, ...reminderEvents]
      .sort((a, b) => getDate(a.date) - getDate(b.date))
      .slice(0, 8);
  }, [jobs, reminders, todayString]);

  const handleAddReminder = (event) => {
    event.preventDefault();

    if (!reminderTitle.trim() || !reminderDate) return;

    const newReminder = {
      id: Date.now(),
      title: reminderTitle.trim(),
      date: reminderDate,
    };

    const updatedReminders = [...reminders, newReminder];

    setReminders(updatedReminders);
    localStorage.setItem(
      "jobmate_reminders",
      JSON.stringify(updatedReminders)
    );

    setReminderTitle("");
    setReminderDate("");
  };

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

  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map((notification) =>
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

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    setNotifications(updatedNotifications);
    localStorage.setItem(
      "jobmate_notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  return (
    <div className="admin-dashboard">
      <main className="admin-dashboard-main">
        {/* Dashboard Header */}
        <header className="admin-dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to the Workora Admin Panel</p>
          </div>

          <span className="admin-profile">Admin</span>
        </header>

        {/* Statistics Cards */}
        <section className="admin-stat-grid">
          <div className="admin-stat-card">
            <BriefcaseBusiness size={25} />
            <h3>Total Jobs</h3>
            <strong>{jobs.length}</strong>
          </div>

          <div className="admin-stat-card">
            <Users size={25} />
            <h3>Total Job Seekers</h3>
            <strong>{users.length}</strong>
          </div>

          <div className="admin-stat-card">
            <UserCheck size={25} />
            <h3>Total Skilled Workers</h3>
            <strong>{workers.length}</strong>
          </div>
        </section>

        {/* Recent Activities */}
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>
                <Activity size={20} /> Recent Activities
              </h2>
              <p>Latest activities on your platform</p>
            </div>
          </div>

          {recentActivities.length > 0 ? (
            <div className="admin-activity-list">
              {recentActivities.map((activity) => (
                <div className="admin-activity-item" key={activity.id}>
                  <div className="admin-activity-icon">{activity.icon}</div>

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

        {/* Pending Approvals */}
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>
                <ShieldCheck size={20} /> Pending Approvals
              </h2>
              <p>Items that require administrator attention</p>
            </div>
          </div>

          <div className="admin-approval-grid">
            <div className="admin-approval-card">
              <div className="admin-approval-icon worker">
                <UserCheck size={22} />
              </div>
              <div>
                <span>Worker Verification</span>
                <strong>{pendingWorkers.length}</strong>
              </div>
            </div>

            <div className="admin-approval-card">
              <div className="admin-approval-icon employer">
                <Building2 size={22} />
              </div>
              <div>
                <span>Employer Approvals</span>
                <strong>{pendingEmployers.length}</strong>
              </div>
            </div>

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

        {/* Notifications Center */}
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>
                <Bell size={20} /> Notifications Center
              </h2>
              <p>
                {unreadNotifications} unread notification
                {unreadNotifications !== 1 ? "s" : ""}
              </p>
            </div>

            {unreadNotifications > 0 && (
              <button
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
                      <time>{formatDate(notification.createdAt)}</time>
                    )}
                  </div>

                  {!notification.isRead && (
                    <button
                      className="admin-icon-button"
                      title="Mark as read"
                      onClick={() => handleMarkAsRead(notification.id)}
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

        {/* Live Calendar */}
        <section className="admin-dashboard-section admin-calendar-section">
          <div className="admin-section-heading">
            <div>
              <h2>
                <CalendarDays size={20} /> Live Calendar
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

          <form
            className="admin-reminder-form"
            onSubmit={handleAddReminder}
          >
            <input
              type="text"
              placeholder="Enter reminder title"
              value={reminderTitle}
              onChange={(event) => setReminderTitle(event.target.value)}
              required
            />

            <input
              type="date"
              value={reminderDate}
              min={todayString}
              onChange={(event) => setReminderDate(event.target.value)}
              required
            />

            <button type="submit">
              <Plus size={17} /> Add Reminder
            </button>
          </form>

          <div className="admin-upcoming-heading">
            <Clock size={18} />
            <h3>Upcoming Events</h3>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="admin-event-list">
              {upcomingEvents.map((event) => (
                <div className="admin-event-item" key={event.id}>
                  <div className="admin-event-date">
                    <strong>
                      {getDate(event.date).getDate()}
                    </strong>
                    <span>
                      {getDate(event.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="admin-event-info">
                    <strong>{event.title}</strong>
                    <span>{event.type}</span>
                  </div>

                  {event.reminderId && (
                    <button
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
              ))}
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

export default AdminDashboard;
