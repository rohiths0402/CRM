import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clapperboard,
  Users,
  CalendarDays,
  Wallet,
  FileText,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  MapPin,
  MoreHorizontal,
  TrendingUp,
  CircleAlert,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../services/crmApi";
import "./DashboardPage.css";

const statusOptions = [
  "All",
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
];

const activityIcons = {
  project: Clapperboard,
  schedule: Clapperboard,
  location: Clapperboard,
  "cast-crew": Users,
  "production-house": Users,
  contract: FileText,
  payment: FileText,
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Zero-padded count, e.g. 8 -> "08"
const padCount = (value) => String(Number(value) || 0).padStart(2, "0");

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// "2026-11-02" -> "02 Nov 2026"
const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = String(value).split("-");
  const monthName = monthNames[Number(month) - 1];
  if (!year || !monthName || !day) return value;
  return `${day.padStart(2, "0")} ${monthName} ${year}`;
};

// "14:30" -> "02:30 PM"
const formatTime = (value) => {
  if (!value) return "-";
  const [hourText, minute = "00"] = String(value).split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(displayHour).padStart(2, "0")}:${minute.slice(0, 2)} ${suffix}`;
};

// ISO instant -> "10 minutes ago", "2 hours ago", "3 days ago"
const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, size] of units) {
    const amount = Math.floor(seconds / size);
    if (amount >= 1) return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
  }

  return "Just now";
};

const statusClassName = (status) =>
  `status-${String(status || "").toLowerCase().replaceAll(" ", "-")}`;

function DashboardPage() {
  const navigate = useNavigate();
  const [projectFilter, setProjectFilter] = useState("All");
  const [period, setPeriod] = useState("This Month");

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard summary from backend
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await dashboardApi.summary();
      setSummary(response || {});
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const summaryStats = summary?.stats || {};
  const budget = summary?.budget || {};
  const schedules = summary?.upcomingSchedules || [];
  const pendingActions = summary?.pendingActions || {};
  const activities = summary?.recentActivities || [];

  const percentUsed = Math.min(100, Math.max(0, Number(budget.percentUsed) || 0));

  const filteredProjects = useMemo(() => {
    const list = summary?.projects || [];
    if (projectFilter === "All") return list;
    return list.filter((project) => project.status === projectFilter);
  }, [summary, projectFilter]);

  const statValue = (value) => (loading && !summary ? "--" : padCount(value));

  const stats = [
    {
      label: "Production Houses",
      value: statValue(summaryStats.productionHouses),
      note: "Registered companies",
      icon: Building2,
      path: "/production-houses",
    },
    {
      label: "Active Projects",
      value: statValue(summaryStats.activeProjects),
      note: `${Number(summaryStats.shootingProjects) || 0} currently shooting`,
      icon: Clapperboard,
      path: "/ott-projects",
    },
    {
      label: "Cast & Crew",
      value: statValue(summaryStats.castCrew),
      note: "Across all projects",
      icon: Users,
      path: "/cast-crew",
    },
    {
      label: "Shooting Locations",
      value: statValue(summaryStats.shootingLocations),
      note: "Approved & pending",
      icon: MapPin,
      path: "/locations",
    },
  ];

  const quickActions = [
    {
      label: "Add Production House",
      icon: Building2,
      path: "/production-houses",
    },
    {
      label: "Create OTT Project",
      icon: Clapperboard,
      path: "/ott-projects",
    },
    {
      label: "Add Cast & Crew",
      icon: Users,
      path: "/cast-crew",
    },
    {
      label: "View Schedules",
      icon: CalendarDays,
      path: "/schedules",
    },
  ];

  return (
    <div className="crm-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">PRODUCTION OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>
            Monitor your production operations, projects and team activities.
          </p>
        </div>

        <div className="dashboard-date-control">
          <CalendarDays size={17} />
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="dashboard-api-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={fetchSummary} disabled={loading}>
            <RefreshCw size={14} className={loading ? "dashboard-spin" : ""} />
            Retry
          </button>
        </div>
      )}

      <section className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              className="dashboard-stat-card"
              key={stat.label}
              onClick={() => navigate(stat.path)}
            >
              <div className="dashboard-stat-top">
                <div className="dashboard-stat-icon">
                  <Icon size={21} />
                </div>
                <ArrowUpRight size={17} className="stat-arrow" />
              </div>

              <h2>{stat.value}</h2>
              <h3>{stat.label}</h3>
              <p>{stat.note}</p>
            </button>
          );
        })}
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel projects-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>OTT Project Overview</h2>
              <p>Track the progress of your productions</p>
            </div>

            <button
              className="dashboard-text-link"
              onClick={() => navigate("/ott-projects")}
            >
              View All <ArrowRight size={15} />
            </button>
          </div>

          <div className="project-filter-tabs">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={projectFilter === status ? "active" : ""}
                onClick={() => setProjectFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="dashboard-project-list">
            {loading && !summary ? (
              <div className="dashboard-no-results">Loading projects...</div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div className="dashboard-project-item" key={project.id}>
                  <div className="project-main-info">
                    <div className="project-cover-icon">
                      <Clapperboard size={20} />
                    </div>

                    <div className="project-name-info">
                      <h3>{project.name}</h3>
                      <p>
                        {project.platform} <span>•</span> {project.type}
                      </p>
                    </div>
                  </div>

                  <div className="project-progress-info">
                    <div className="project-progress-heading">
                      <span>Progress</span>
                      <strong>{project.progress}%</strong>
                    </div>

                    <div className="project-progress-track">
                      <div
                        className="project-progress-fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`project-status ${statusClassName(project.status)}`}
                  >
                    {project.status || "-"}
                  </span>

                  <button
                    className="project-more-button"
                    title={`Open ${project.name}`}
                    onClick={() => navigate("/ott-projects")}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>
              ))
            ) : (
              <div className="dashboard-no-results">
                {(summary?.projects || []).length === 0
                  ? "No OTT projects yet. Create one to see it here."
                  : "No projects found for this status."}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel budget-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Budget Snapshot</h2>
              <p>Production financial overview</p>
            </div>
            <Wallet size={20} className="panel-gold-icon" />
          </div>

          <div className="budget-total">
            <span>Total Allocated Budget</span>
            <h2>{formatCurrency(budget.totalBudget)}</h2>
          </div>

          <div className="budget-progress-track">
            <div
              className="budget-progress-fill"
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="budget-legend">
            <span><i className="legend-gold" /> Spent</span>
            <strong>{formatCurrency(budget.spent)}</strong>
          </div>

          <div className="budget-legend">
            <span><i className="legend-silver" /> Remaining</span>
            <strong>{formatCurrency(budget.remaining)}</strong>
          </div>

          <div className="budget-percentage">
            <TrendingUp size={16} />
            {Number.isInteger(percentUsed) ? percentUsed : percentUsed.toFixed(1)}% of
            allocated budget used
          </div>

          <button
            className="dashboard-outline-button"
            onClick={() => navigate("/budgets")}
          >
            View Budget Details <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <div className="dashboard-panel schedule-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Upcoming Production Schedules</h2>
              <p>Important activities and shooting plans</p>
            </div>

            <button
              className="dashboard-text-link"
              onClick={() => navigate("/schedules")}
            >
              View All <ArrowRight size={15} />
            </button>
          </div>

          <div className="schedule-list">
            {loading && !summary && (
              <div className="dashboard-no-results">Loading schedules...</div>
            )}

            {!loading && schedules.length === 0 && (
              <div className="dashboard-no-results">
                No upcoming shooting schedules.
              </div>
            )}

            {schedules.map((item) => (
              <div className="schedule-item" key={item.id}>
                <div className="schedule-date-box">
                  <CalendarDays size={19} />
                </div>

                <div className="schedule-details">
                  <h3>{item.activity}</h3>
                  <p>{item.project}</p>
                  <span>
                    <MapPin size={12} /> {item.location}
                  </span>
                </div>

                <div className="schedule-time">
                  <strong>{formatDate(item.date)}</strong>
                  <span><Clock3 size={12} /> {formatTime(item.time)}</span>
                  <small className={item.status === "Confirmed" ? "confirmed" : "pending"}>
                    {item.status}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel attention-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Pending Actions</h2>
              <p>Items that need your attention</p>
            </div>
            <CircleAlert size={20} className="panel-gold-icon" />
          </div>

          <button
            className="attention-item"
            onClick={() => navigate("/contracts")}
          >
            <div className="attention-icon"><FileText size={18} /></div>
            <div>
              <strong>Contracts Pending</strong>
              <span>
                {Number(pendingActions.draftContracts) || 0} draft contracts need
                approval
              </span>
            </div>
            <ArrowRight size={16} />
          </button>

          <button
            className="attention-item"
            onClick={() => navigate("/payments")}
          >
            <div className="attention-icon"><CreditCard size={18} /></div>
            <div>
              <strong>Pending Payments</strong>
              <span>
                {formatCurrency(pendingActions.pendingPaymentsAmount)} awaiting
                payment
              </span>
            </div>
            <ArrowRight size={16} />
          </button>

          <button
            className="attention-item"
            onClick={() => navigate("/schedules")}
          >
            <div className="attention-icon"><CalendarDays size={18} /></div>
            <div>
              <strong>Schedule Confirmation</strong>
              <span>
                {Number(pendingActions.plannedSchedules) || 0} shooting schedules
                pending
              </span>
            </div>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        {/* <div className="dashboard-panel quick-actions-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used production tools</p>
            </div>
          </div>

          <div className="quick-action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  className="quick-action-card"
                  key={action.label}
                  onClick={() => navigate(action.path)}
                >
                  <Icon size={21} />
                  <span>{action.label}</span>
                  <Plus size={16} className="quick-action-plus" />
                </button>
              );
            })}
          </div>
        </div> */}

        <div className="dashboard-panel activity-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent Activities</h2>
              <p>Latest updates across your workspace</p>
            </div>
          </div>

          <div className="activity-list">
            {loading && !summary && (
              <div className="dashboard-no-results">Loading activities...</div>
            )}

            {!loading && activities.length === 0 && (
              <div className="dashboard-no-results">
                No recent activity yet.
              </div>
            )}

            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || Clapperboard;

              return (
                <div
                  className="activity-item"
                  key={`${activity.type}-${activity.time}-${index}`}
                >
                  <div className="activity-icon">
                    <Icon size={17} />
                  </div>
                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.detail}</p>
                    <span>{formatRelativeTime(activity.time)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="dashboard-footer-note">
        <span>STUDIOFLOW</span>
        Production House Management Workspace
      </div>
    </div>
  );
}

export default DashboardPage;
