import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Activity, TrendingUp, TrendingDown, Minus, 
  Plus, Loader2,
  ChevronDown, ChevronUp, BarChart3, Zap, Moon, 
  Battery, Heart, Brain
} from "lucide-react";
import Alert from "@mui/material/Alert";
import "./RPEDashboard.css";
import { API_BASE_URL } from "../../../api/config";

interface Boxer {
  id: string;
  firstName: string;
  lastName: string;
  picture: string | null;
}

interface RPEEntry {
  id: string;
  session_rpe: number;
  fatigue: number | null;
  sleep_quality: number | null;
  soreness: number | null;
  stress: number | null;
  notes: string | null;
  entry_date: string;
  boxer_id: string;
  created_at: string;
}

interface BoxerStats {
  boxer_id: string;
  boxer_name: string;
  avg_session_rpe: number;
  avg_fatigue: number | null;
  avg_sleep: number | null;
  avg_soreness: number | null;
  avg_stress: number | null;
  total_entries: number;
  trend: "improving" | "stable" | "declining";
}

export default function RPEDashboard() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [boxers, setBoxers] = useState<Boxer[]>([]);
  const [selectedBoxer, setSelectedBoxer] = useState<string | null>(null);
  const [entries, setEntries] = useState<RPEEntry[]>([]);
  const [stats, setStats] = useState<BoxerStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{type: "success" | "error"; message: string} | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [sessionRPE, setSessionRPE] = useState<number>(5);
  const [fatigue, setFatigue] = useState<number | "">("");
  const [sleepQuality, setSleepQuality] = useState<number | "">("");
  const [soreness, setSoreness] = useState<number | "">("");
  const [stress, setStress] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const fetchBoxers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/boxers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setBoxers(json.data.map((b: any) => ({
          id: b.id,
          firstName: b.first_name,
          lastName: b.last_name,
          picture: b.picture,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch boxers", err);
    }
  };

  const fetchEntries = async (boxerId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rpe/boxer/${boxerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setEntries(json.data);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (boxerId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rpe/stats/${boxerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setStats(json.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchBoxers();
  }, []);

  useEffect(() => {
    if (selectedBoxer) {
      fetchEntries(selectedBoxer);
      fetchStats(selectedBoxer);
    }
  }, [selectedBoxer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoxer) return;

    setIsSubmitting(true);
    try {
      const payload = {
        boxer_id: selectedBoxer,
        session_rpe: sessionRPE,
        entry_date: entryDate,
        fatigue: fatigue || null,
        sleep_quality: sleepQuality || null,
        soreness: soreness || null,
        stress: stress || null,
        notes: notes || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/rpe/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.detail || t("rpeDashboard.create_failed") });
        return;
      }

      setAlert({ type: "success", message: t("rpeDashboard.entry_added") });
      setShowForm(false);
      resetForm();
      fetchEntries(selectedBoxer);
      fetchStats(selectedBoxer);
    } catch (err) {
      setAlert({ type: "error", message: t("rpeDashboard.network_error") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSessionRPE(5);
    setFatigue("");
    setSleepQuality("");
    setSoreness("");
    setStress("");
    setNotes("");
    setEntryDate(new Date().toISOString().split('T')[0]);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingDown size={16} className="text-green" />;
    if (trend === "declining") return <TrendingUp size={16} className="text-red" />;
    return <Minus size={16} className="text-yellow" />;
  };

  const getTrendLabel = (trend: string) => {
    if (trend === "improving") return t("rpeDashboard.trend_improving");
    if (trend === "declining") return t("rpeDashboard.trend_declining");
    return t("rpeDashboard.trend_stable");
  };

  const getRPEColor = (value: number) => {
    if (value <= 3) return "#22c55e";
    if (value <= 6) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="rpe-dashboard-page animate-fadeIn">
      {alert && (
        <div className="fixed-toast">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      <div className="rpe-dashboard-header">
        <h1>
          <Activity size={20} />
          {t("rpeDashboard.title")}
        </h1>
        <span className="header-subtitle">{t("rpeDashboard.subtitle")}</span>
      </div>

      <div className="boxer-selector-container animate-slideUp">
        <label className="selector-label">{t("rpeDashboard.select_boxer")}</label>
        <select 
          value={selectedBoxer || ""} 
          onChange={(e) => setSelectedBoxer(e.target.value || null)}
          className="boxer-select"
        >
          <option value="">{t("rpeDashboard.choose_boxer")}</option>
          {boxers.map(b => (
            <option key={b.id} value={b.id}>
              {b.firstName} {b.lastName}
            </option>
          ))}
        </select>
      </div>

      {selectedBoxer && (
        <>
          {stats && (
            <div className="rpe-stats-grid">
              <div className="stat-card rpe-main-card animate-slideUp">
                <div className="stat-card-header">
                  <span className="stat-card-label">{t("rpeDashboard.avg_session_rpe")}</span>
                  <span className="trend-badge">
                    {getTrendIcon(stats.trend)}
                    <span>{getTrendLabel(stats.trend)}</span>
                  </span>
                </div>
                <div 
                  className="stat-card-value-large"
                  style={{ color: getRPEColor(stats.avg_session_rpe) }}
                >
                  {stats.avg_session_rpe}
                </div>
                <div className="stat-card-subtitle">{t("rpeDashboard.total_entries")}: {stats.total_entries}</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.1s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">{t("rpeDashboard.fatigue")}</span>
                  <div className="stat-card-icon">
                    <Battery size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_fatigue ?? "-"}</div>
                <div className="stat-card-subtitle">{t("rpeDashboard.avg_level")}</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.15s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">{t("rpeDashboard.sleep_quality")}</span>
                  <div className="stat-card-icon">
                    <Moon size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_sleep ?? "-"}</div>
                <div className="stat-card-subtitle">{t("rpeDashboard.avg_rating")}</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.2s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">{t("rpeDashboard.soreness")}</span>
                  <div className="stat-card-icon">
                    <Zap size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_soreness ?? "-"}</div>
                <div className="stat-card-subtitle">{t("rpeDashboard.avg_level")}</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.25s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">{t("rpeDashboard.stress")}</span>
                  <div className="stat-card-icon">
                    <Brain size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_stress ?? "-"}</div>
                <div className="stat-card-subtitle">{t("rpeDashboard.avg_level")}</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.3s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">{t("rpeDashboard.total_entries_label")}</span>
                  <div className="stat-card-icon">
                    <BarChart3 size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.total_entries}</div>
                <div className="stat-card-subtitle">{t("rpeDashboard.recorded_sessions")}</div>
              </div>
            </div>
          )}

          <button 
            className="add-entry-btn animate-slideUp"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={18} />
            {showForm ? t("rpeDashboard.cancel") : t("rpeDashboard.add_rpe_entry")}
          </button>

          {showForm && (
            <form className="rpe-form-container animate-slideUp" onSubmit={handleSubmit}>
              <div className="form-top-row">
                <div className="form-group slider-group">
                  <label>{t("rpeDashboard.session_rpe")}</label>
                  <div className="slider-wrapper">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={sessionRPE} 
                      onChange={(e) => setSessionRPE(Number(e.target.value))}
                      className="rpe-slider"
                    />
                    <span 
                      className="slider-value" 
                      style={{ color: getRPEColor(sessionRPE) }}
                    >
                      {sessionRPE}/10
                    </span>
                  </div>
                </div>

                <div className="form-group date-group">
                  <label>{t("rpeDashboard.date")}</label>
                  <input 
                    type="date" 
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="date-input"
                  />
                </div>
              </div>

              <div className="form-metrics-row">
                <div className="form-group">
                  <label>{t("rpeDashboard.fatigue_label")}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={fatigue}
                    onChange={(e) => setFatigue(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>

                <div className="form-group">
                  <label>{t("rpeDashboard.sleep_quality_label")}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>

                <div className="form-group">
                  <label>{t("rpeDashboard.soreness_label")}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={soreness}
                    onChange={(e) => setSoreness(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>

                <div className="form-group">
                  <label>{t("rpeDashboard.stress_label")}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={stress}
                    onChange={(e) => setStress(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>
              </div>

              <div className="form-group notes-group">
                <label>{t("rpeDashboard.notes")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={t("rpeDashboard.notes_placeholder")}
                  className="notes-input"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner-icon" size={16} />
                    {t("rpeDashboard.saving")}
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {t("rpeDashboard.save_entry")}
                  </>
                )}
              </button>
            </form>
          )}

          <div className="history-section animate-slideUp" style={{ animationDelay: "0.35s" }}>
            <div className="history-header">
              <h3>
                <BarChart3 size={18} />
                {t("rpeDashboard.rpe_history")}
              </h3>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <Loader2 className="spinner-loading" size={24} />
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-table-state">{t("rpeDashboard.no_entries")}</div>
            ) : (
              <div className="table-wrapper">
                <table className="rpe-table">
                  <thead>
                    <tr>
                      <th>{t("rpeDashboard.table_date")}</th>
                      <th>{t("rpeDashboard.table_rpe")}</th>
                      <th>{t("rpeDashboard.table_fatigue")}</th>
                      <th>{t("rpeDashboard.table_sleep")}</th>
                      <th>{t("rpeDashboard.table_soreness")}</th>
                      <th>{t("rpeDashboard.table_stress")}</th>
                      <th>{t("rpeDashboard.table_notes")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => (
                      <tr key={entry.id}>
                        <td className="date-cell">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </td>
                        <td>
                          <span 
                            className="rpe-badge"
                            style={{ 
                              color: getRPEColor(entry.session_rpe),
                              background: `${getRPEColor(entry.session_rpe)}20`
                            }}
                          >
                            {entry.session_rpe}
                          </span>
                        </td>
                        <td>{entry.fatigue ?? "-"}</td>
                        <td>{entry.sleep_quality ?? "-"}</td>
                        <td>{entry.soreness ?? "-"}</td>
                        <td>{entry.stress ?? "-"}</td>
                        <td className="notes-cell">{entry.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


