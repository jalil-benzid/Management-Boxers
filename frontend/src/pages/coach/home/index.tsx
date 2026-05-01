import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Users, Calendar, TrendingUp, UserCheck, ArrowRight, Clock, Dumbbell } from "lucide-react";
import { API_BASE_URL } from "../../../api/config";
import "./CoachDashboard.scss";
import { useNavigate } from "react-router-dom";

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

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const formatRemainingTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
  };

  const getAttendanceProgress = (present: number, absent: number) => {
    const total = present + absent;
    if (total === 0) return 0;
    return (present / total) * 100;
  };

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
      setError(t("coachDashboard.error"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t("coachDashboard.status_completed");
      case "ongoing":
        return t("coachDashboard.status_ongoing");
      case "upcoming":
        return t("coachDashboard.status_upcoming");
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page animate-fadeIn">
        <div className="loading-state">{t("coachDashboard.loading")}</div>
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
      <div className="dashboard-header">
        <h1>{t("coachDashboard.dashboard")}</h1>
        <button
          className="add-athletes-btn"
          onClick={() => navigate("/coach/dashboard/athletes")}
        >
          <span>+</span> {t("coachDashboard.add_athletes")}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card animate-slideUp">
          <div className="stat-header">
            <span className="stat-label">{t("coachDashboard.total_athletes")}</span>
            <div className="stat-icon athletes-icon">
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.total_boxers ?? 0}</div>
          <div className="stat-subtitle">{t("coachDashboard.registered_active")}</div>
        </div>

        <div className="stat-card animate-slideUp" style={{ animationDelay: "0.1s" }}>
          <div className="stat-header">
            <span className="stat-label">{t("coachDashboard.sessions_this_week")}</span>
            <div className="stat-icon sessions-icon">
              <Calendar size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.sessions_this_week ?? 0}</div>
          <div className="stat-subtitle">{t("coachDashboard.to_do_this_week")}</div>
        </div>

        <div className="stat-card animate-slideUp" style={{ animationDelay: "0.2s" }}>
          <div className="stat-header">
            <span className="stat-label">{t("coachDashboard.attendance_rate")}</span>
            <div className="stat-icon rate-icon">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.attendance_rate ?? 0}%</div>
          <div className="stat-subtitle positive">{t("coachDashboard.vs_last_month")}</div>
        </div>

        <div className="stat-card animate-slideUp" style={{ animationDelay: "0.3s" }}>
          <div className="stat-header">
            <span className="stat-label">{t("coachDashboard.avg_attendance")}</span>
            <div className="stat-icon avg-icon">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.avg_attendance ?? 0}</div>
          <div className="stat-subtitle">{t("coachDashboard.athletes_per_session")}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sessions-card animate-slideUp" style={{ animationDelay: "0.4s" }}>
          <div className="card-header">
            <div className="header-left">
              <h2>{t("coachDashboard.todays_sessions")}</h2>
              <span className="date-badge">{today}</span>
            </div>
            <button className="schedule-link">
              {t("coachDashboard.go_to_schedule")} <ArrowRight size={16} />
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
              <div className="empty-state">{t("coachDashboard.no_sessions_today")}</div>
            )}
          </div>
        </div>

        <div className="ongoing-card animate-slideUp" style={{ animationDelay: "0.5s" }}>
          {ongoingSession ? (
            <>
              <div className="card-header">
                <h2>{t("coachDashboard.ongoing_session")}</h2>
                <span className="ongoing-badge">{t("coachDashboard.status_ongoing")}</span>
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
                  {ongoingSession.exercises_count} {t("coachDashboard.exercises")}
                </div>
              </div>

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
                    <div className="timer-label">{t("coachDashboard.left")}</div>
                  </div>
                </div>
              </div>

              <div className="attendance-stats">
                <div className="attendance-item present">
                  <span className="attendance-number">{ongoingSession.present}</span>
                  <span className="attendance-label">{t("coachDashboard.present")}</span>
                </div>
                <div className="attendance-item absent">
                  <span className="attendance-number">{ongoingSession.absent}</span>
                  <span className="attendance-label">{t("coachDashboard.absent")}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-ongoing">
              <div className="card-header">
                <h2>{t("coachDashboard.ongoing_session")}</h2>
              </div>
              <div className="empty-state">{t("coachDashboard.no_ongoing_session")}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-section animate-slideUp" style={{ animationDelay: "0.6s" }}>
      </div>
    </div>
  );
}