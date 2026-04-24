import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Users, Calendar, TrendingUp, UserCheck, ArrowRight, Clock, Dumbbell } from "lucide-react";
import { API_BASE_URL } from "../../../api/config";
import "./CoachDashboard.scss";
import { useNavigate } from "react-router-dom";

// Types matching your backend schemas
interface DashboardStats {
  total_boxers: number;
  sessions_this_week: number;
  attendance_rate: number;
  avg_attendance: number;
}

interface TodaySession {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: "completed" | "ongoing" | "upcoming";
}

interface OngoingSession {
  session_id: string;
  name: string;
  start_time: string;
  end_time: string;
  exercises_count: number;
  remaining_minutes: number;
  present: number;
  absent: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function CoachHome() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [ongoingSession, setOngoingSession] = useState<OngoingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Format time from "10:00:00" to "10:00"
  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  // Format remaining time as HH:MM:SS
  const formatRemainingTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
  };

  // Calculate circular progress for attendance ring
  const getAttendanceProgress = (present: number, absent: number) => {
    const total = present + absent;
    if (total === 0) return 0;
    return (present / total) * 100;
  };

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsRes, sessionsRes, ongoingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics/coach/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/analytics/coach/today-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/analytics/coach/ongoing-session`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData: ApiResponse<DashboardStats> = await statsRes.json();
      const sessionsData: ApiResponse<TodaySession[]> = await sessionsRes.json();
      const ongoingData: ApiResponse<OngoingSession | null> = await ongoingRes.json();

      if (statsData.success) setStats(statsData.data);
      if (sessionsData.success) setTodaySessions(sessionsData.data);
      if (ongoingData.success) setOngoingSession(ongoingData.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "ongoing":
        return "status-ongoing";
      case "upcoming":
        return "status-upcoming";
      default:
        return "";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "ongoing":
        return "On going";
      case "upcoming":
        return "Upcoming";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page animate-fadeIn">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page animate-fadeIn">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="dashboard-page animate-fadeIn">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      <button 
        className="add-athletes-btn"
        onClick={() => navigate("/coach/dashboard/athletes")}
      >
        <span>+</span> Add athletes
      </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card animate-slideUp">
          <div className="stat-header">
            <span className="stat-label">Total athletes</span>
            <div className="stat-icon athletes-icon">
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.total_boxers ?? 0}</div>
          <div className="stat-subtitle">Registered & active</div>
        </div>

        <div className="stat-card animate-slideUp" style={{ animationDelay: "0.1s" }}>
          <div className="stat-header">
            <span className="stat-label">Sessions this week</span>
            <div className="stat-icon sessions-icon">
              <Calendar size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.sessions_this_week ?? 0}</div>
          <div className="stat-subtitle">to do this week</div>
        </div>

        <div className="stat-card animate-slideUp" style={{ animationDelay: "0.2s" }}>
          <div className="stat-header">
            <span className="stat-label">Attendance rate</span>
            <div className="stat-icon rate-icon">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.attendance_rate ?? 0}%</div>
          <div className="stat-subtitle positive">+3% vs last month</div>
        </div>

        <div className="stat-card animate-slideUp" style={{ animationDelay: "0.3s" }}>
          <div className="stat-header">
            <span className="stat-label">Avg Attendance</span>
            <div className="stat-icon avg-icon">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.avg_attendance ?? 0}</div>
          <div className="stat-subtitle">Athletes / session</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Today's Sessions */}
        <div className="sessions-card animate-slideUp" style={{ animationDelay: "0.4s" }}>
          <div className="card-header">
            <div className="header-left">
              <h2>Today's sessions</h2>
              <span className="date-badge">{today}</span>
            </div>
            <button className="schedule-link">
              Go to Schedule <ArrowRight size={16} />
            </button>
          </div>

          <div className="sessions-list">
            {todaySessions.map((session) => (
              <div key={session.id} className="session-row">
                <div className="session-info">
                  <div className="session-name">{session.name}</div>
                  <div className="session-time">
                    {formatTime(session.start_time)}-{formatTime(session.end_time)}
                  </div>
                </div>
                <span className={`status-badge ${getStatusClass(session.status)}`}>
                  {getStatusLabel(session.status)}
                </span>
              </div>
            ))}

            {todaySessions.length === 0 && (
              <div className="empty-state">No sessions scheduled for today</div>
            )}
          </div>
        </div>

        {/* Ongoing Session */}
        <div className="ongoing-card animate-slideUp" style={{ animationDelay: "0.5s" }}>
          {ongoingSession ? (
            <>
              <div className="card-header">
                <h2>Ongoing Session</h2>
                <span className="ongoing-badge">On going</span>
              </div>

              <div className="ongoing-details">
                <div className="ongoing-info">
                  <div className="ongoing-name">{ongoingSession.name}</div>
                  <div className="ongoing-time">
                    {formatTime(ongoingSession.start_time)}-{formatTime(ongoingSession.end_time)}
                  </div>
                </div>
                <div className="exercises-badge">
                  <Dumbbell size={14} />
                  {ongoingSession.exercises_count} Exercises
                </div>
              </div>

              {/* Circular Timer */}
              <div className="timer-container">
                <div className="circular-progress">
                  <svg viewBox="0 0 120 120" className="progress-ring">
                    <circle
                      className="progress-ring-bg"
                      cx="60"
                      cy="60"
                      r="54"
                    />
                    <circle
                      className="progress-ring-fill"
                      cx="60"
                      cy="60"
                      r="54"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={
                        2 * Math.PI * 54 * (1 - ongoingSession.remaining_minutes / 120)
                      }
                    />
                  </svg>
                  <div className="timer-content">
                    <Clock size={20} className="timer-icon" />
                    <div className="timer-value">
                      {formatRemainingTime(ongoingSession.remaining_minutes)}
                    </div>
                    <div className="timer-label">left</div>
                  </div>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="attendance-stats">
                <div className="attendance-item present">
                  <span className="attendance-number">{ongoingSession.present}</span>
                  <span className="attendance-label">present</span>
                </div>
                <div className="attendance-item absent">
                  <span className="attendance-number">{ongoingSession.absent}</span>
                  <span className="attendance-label">Absente</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-ongoing">
              <div className="card-header">
                <h2>Ongoing Session</h2>
              </div>
              <div className="empty-state">No ongoing session</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section Placeholder */}
      <div className="bottom-section animate-slideUp" style={{ animationDelay: "0.6s" }}>
        {/* Add charts or additional analytics here */}
      </div>
    </div>
  );
}