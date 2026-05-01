import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock } from "lucide-react";
import Alert from "@mui/material/Alert";
import { API_BASE_URL } from "../../../api/config";
import "./CoachSchedule.scss";

interface BackendSession {
  id: string;
  name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  schedule_id: string;
  exercises: BackendExercise[];
}

interface BackendExercise {
  id: string;
  name: string;
  description: string | null;
  session_id: string;
}

interface BackendSchedule {
  id: string;
  name: string;
  month: string;
  coach_id: string;
}

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  scheduleId: string;
  exercises?: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  description: string;
}

interface DaySession {
  date: Date;
  sessions: Session[];
  isCurrentMonth: boolean;
}

interface MeResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    role: string;
  };
}

export default function CoachSchedule() {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<"monthly" | "daily">("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<BackendSchedule[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);
  
  const initialLoadDone = useRef(false);
  
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [selectedDateForm, setSelectedDateForm] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [currentExercise, setCurrentExercise] = useState({ name: "", description: "" });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const fetchMe = async (): Promise<MeResponse | null> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  };

  const fetchSchedules = useCallback(async (): Promise<BackendSchedule[]> => {
    if (!coachId) return [];
    
    const res = await fetch(`${API_BASE_URL}/api/schedules/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      setSchedules(data.data);
      return data.data;
    }
    return [];
  }, [coachId, token]);

  const getOrCreateScheduleForMonth = async (date: Date, currentSchedules?: BackendSchedule[]): Promise<string> => {
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    let schedulesToCheck = currentSchedules;
    if (!schedulesToCheck) {
      schedulesToCheck = await fetchSchedules();
    }
    
    const existingSchedule = schedulesToCheck.find(s => s.month === monthStr);
    
    if (existingSchedule) {
      return existingSchedule.id;
    }
    
    const res = await fetch(`${API_BASE_URL}/api/schedules/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `Schedule ${monthStr}`,
        month: monthStr,
      }),
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      const newSchedule = data.data;
      setSchedules(prev => [...prev, newSchedule]);
      return newSchedule.id;
    } else {
      throw new Error(data.message || "Failed to create schedule");
    }
  };

  const fetchSessionsForMonth = useCallback(async (date: Date) => {
    if (!coachId) return;
    
    setLoading(true);
    const freshSchedules = await fetchSchedules();
    const scheduleId = await getOrCreateScheduleForMonth(date, freshSchedules);
    
    const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      const backendSessions: BackendSession[] = data.data;
      
      const transformedSessions: Session[] = backendSessions.map(bs => ({
        id: bs.id,
        title: bs.name,
        startTime: bs.start_time.substring(0, 5),
        endTime: bs.end_time.substring(0, 5),
        date: bs.session_date,
        scheduleId: bs.schedule_id,
        exercises: bs.exercises?.map(e => ({
          id: e.id,
          name: e.name,
          description: e.description || "",
        })) || [],
      }));
      
      setSessions(transformedSessions);
    } else {
      setSessions([]);
    }
    setLoading(false);
  }, [coachId, token, fetchSchedules]);

  useEffect(() => {
    const init = async () => {
      const me = await fetchMe();
      if (me?.data?.id) {
        setCoachId(me.data.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (coachId && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchSessionsForMonth(currentDate);
    }
  }, [coachId, fetchSessionsForMonth, currentDate]);

  useEffect(() => {
    if (coachId && initialLoadDone.current) {
      fetchSessionsForMonth(currentDate);
    }
  }, [currentDate, coachId, fetchSessionsForMonth]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    if (prevDay.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(prevDay));
    }
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    if (nextDay.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(nextDay));
    }
  };

  const handleAddSession = () => {
    setIsSidebarOpen(true);
    if (viewType === "monthly") {
      setSelectedDateForm(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    } else {
      setSelectedDateForm(new Date(selectedDate));
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSessionName("");
    setSelectedDateForm(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setExercises([]);
    setIsAddingExercise(false);
    setCurrentExercise({ name: "", description: "" });
    setEditingExerciseId(null);
    setShowDatePicker(false);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewType("daily");
  };

  const handleMoreSessionsClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(date);
    setViewType("daily");
  };

  const handleAddExercise = () => {
    if (currentExercise.name.trim() && currentExercise.description.trim()) {
      const newExercise: Exercise = {
        id: `temp-${Date.now()}`,
        name: currentExercise.name,
        description: currentExercise.description,
      };
      setExercises([...exercises, newExercise]);
      setCurrentExercise({ name: "", description: "" });
      setIsAddingExercise(false);
    }
  };

  const handleCancelExercise = () => {
    setCurrentExercise({ name: "", description: "" });
    setIsAddingExercise(false);
    setEditingExerciseId(null);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setCurrentExercise({ name: exercise.name, description: exercise.description });
    setEditingExerciseId(exercise.id);
    setIsAddingExercise(true);
  };

  const handleUpdateExercise = () => {
    if (currentExercise.name.trim() && currentExercise.description.trim() && editingExerciseId) {
      setExercises(exercises.map(ex => 
        ex.id === editingExerciseId 
          ? { ...ex, name: currentExercise.name, description: currentExercise.description }
          : ex
      ));
      setCurrentExercise({ name: "", description: "" });
      setIsAddingExercise(false);
      setEditingExerciseId(null);
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      const freshSchedules = await fetchSchedules();
      const scheduleId = await getOrCreateScheduleForMonth(selectedDateForm, freshSchedules);
      const formattedDate = selectedDateForm.toISOString().split('T')[0];
      
      const sessionRes = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sessionName,
          session_date: formattedDate,
          start_time: startTime,
          end_time: endTime,
        }),
      });
      
      const sessionData = await sessionRes.json();
      
      if (!sessionRes.ok || !sessionData.success) {
        throw new Error(sessionData.message || "Failed to create session");
      }
      
      const newBackendSession = sessionData.data;
      const sessionId = newBackendSession.id;
      
      if (exercises.length > 0) {
        await Promise.all(
          exercises.map(exercise =>
            fetch(`${API_BASE_URL}/api/sessions/${sessionId}/exercises`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                name: exercise.name,
                description: exercise.description,
              }),
            })
          )
        );
      }
      
      setAlert({ type: "success", message: t("schedule.session_created") });
      await fetchSessionsForMonth(currentDate);
      handleCloseSidebar();
    } catch (err) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date): DaySession[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: DaySession[] = [];
    const currentDateCopy = new Date(startDate);
    
    while (currentDateCopy <= endDate) {
      const dateStr = currentDateCopy.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dateStr);
      
      days.push({
        date: new Date(currentDateCopy),
        sessions: daySessions,
        isCurrentMonth: currentDateCopy.getMonth() === month,
      });
      
      currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }
    
    return days;
  };

  const weekDays = t("schedule.week_days", { returnObjects: true }) as string[];
  const monthNames = t("schedule.months", { returnObjects: true }) as string[];

  const days = getDaysInMonth(currentDate);

  const isFirstRow = (index: number) => index < 7;

  const getSessionsForSelectedDate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr);
  };

  const calculateSessionPosition = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startPosition = startHour + (startMinute / 60);
    const endPosition = endHour + (endMinute / 60);
    const duration = endPosition - startPosition;
    
    return {
      top: `${(startPosition / 24) * 100}%`,
      height: `${(duration / 24) * 100}%`,
    };
  };

  const formatSessionTime = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hour, minute] = time.split(':');
      const h = parseInt(hour);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:${minute} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const formatDate = (date: Date) => {
    return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const generateDateOptions = () => {
    const dates = [];
    const year = selectedDateForm.getFullYear();
    const month = selectedDateForm.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="coach-home loading">
        <div className="loading-spinner">{t("schedule.loading")}</div>
      </div>
    );
  }

  const selectedDateSessions = getSessionsForSelectedDate();

  return (
    <>
      {alert && (
        <div className="fixed-alert">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      <div className={`coach-home ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {isSidebarOpen && <div className="overlay" onClick={handleCloseSidebar} />}
        
        <div className="dashboard-header">
          <div className="header-left">
            {viewType === "monthly" ? (
              <>
                <button className="month-nav-btn" onClick={handlePreviousMonth}>
                  <ChevronLeft size={20} />
                </button>
                <button className="month-nav-btn" onClick={handleNextMonth}>
                  <ChevronRight size={20} />
                </button>
                <h2 className="current-month">
                  {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
                </h2>
              </>
            ) : (
              <>
                <button className="month-nav-btn" onClick={handlePreviousDay}>
                  <ChevronLeft size={20} />
                </button>
                <button className="month-nav-btn" onClick={handleNextDay}>
                  <ChevronRight size={20} />
                </button>
                <h2 className="current-month">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </h2>
              </>
            )}
          </div>
          
          <div className="header-right">
            <button className="add-session-btn" onClick={handleAddSession}>
              <Plus size={18} />
              <span>{t("schedule.add_session")}</span>
            </button>
            
            <div className="toggle-switch">
              <button
                className={`toggle-btn ${viewType === "monthly" ? "active" : ""}`}
                onClick={() => setViewType("monthly")}
              >
                {t("schedule.monthly")}
              </button>
              <button
                className={`toggle-btn ${viewType === "daily" ? "active" : ""}`}
                onClick={() => setViewType("daily")}
              >
                {t("schedule.daily")}
              </button>
            </div>
          </div>
        </div>

        <div className="header-divider" />

        {viewType === "monthly" && (
          <div className="calendar-wrapper">
            <div className="calendar-grid">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="calendar-day"
                  onClick={() => handleDayClick(day.date)}
                >
                  {isFirstRow(index) && (
                    <div className="day-header">
                      <span className="week-day-name">{weekDays[index % 7]}</span>
                      <span className="day-number">{day.date.getDate()}</span>
                    </div>
                  )}
                  
                  {!isFirstRow(index) && (
                    <div className="day-number-only">{day.date.getDate()}</div>
                  )}
                  
                  <div className={`day-content ${!day.isCurrentMonth ? "other-month" : ""}`}>
                    {day.sessions.length > 0 && (
                      <div className="sessions-container">
                        {day.sessions.slice(0, 2).map((session) => (
                          <div key={session.id} className="session-item">
                            <div className="session-title">{session.title}</div>
                            <div className="session-time">
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>
                        ))}
                        
                        {day.sessions.length > 2 && (
                          <button
                            className="more-sessions-btn"
                            onClick={(e) => handleMoreSessionsClick(day.date, e)}
                          >
                            {day.sessions.length - 2 === 1
                              ? t("schedule.more_sessions", { count: day.sessions.length - 2 })
                              : t("schedule.more_sessions_plural", { count: day.sessions.length - 2 })}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewType === "daily" && (
          <div className="daily-view-wrapper">
            <div className="daily-timeline">
              <div className="hour-labels">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 || 12;
                  return (
                    <div key={i} className="hour-label">
                      {displayHour}:00 {ampm}
                    </div>
                  );
                })}
              </div>

              <div className="timeline-grid">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="hour-line"></div>
                ))}

                {selectedDateSessions.map((session) => {
                  const position = calculateSessionPosition(session.startTime, session.endTime);
                  return (
                    <div
                      key={session.id}
                      className="daily-session-item"
                      style={{
                        top: position.top,
                        height: position.height,
                      }}
                    >
                      <div className="session-header">
                        <span className="session-name">{session.title}</span>
                        <span className="session-duration">
                          {formatSessionTime(session.startTime, session.endTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {selectedDateSessions.length === 0 && (
                  <div className="no-sessions-message">
                    {t("schedule.no_sessions")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`session-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-btn" onClick={handleCloseSidebar}>
            <X size={20} />
          </button>
          <h2 className="sidebar-title">{t("schedule.new_session")}</h2>
        </div>

        <div className="sidebar-content">
          <div className="form-group">
            <label className="form-label">{t("schedule.session_name")}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t("schedule.enter_session_name")}
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>

          <div className="datetime-row">
            <div className="date-picker-wrapper">
              <button 
                className="datetime-box"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar size={18} />
                <span>{formatDate(selectedDateForm)}</span>
              </button>
              {showDatePicker && (
                <div className="date-picker-dropdown">
                  {generateDateOptions().map((date) => (
                    <button
                      key={date.toISOString()}
                      className="date-option"
                      onClick={() => {
                        setSelectedDateForm(date);
                        setShowDatePicker(false);
                      }}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="divider-vertical" />
            
            <div className="time-box">
              <Clock size={18} />
              <input
                type="time"
                className="time-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="time-box">
              <Clock size={18} />
              <input
                type="time"
                className="time-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="exercises-section">
            <h3 className="section-title">{t("schedule.exercises")}</h3>
            
            {exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-card">
                <div className="exercise-card-header">
                  <h4 className="exercise-name">{exercise.name}</h4>
                  <div className="exercise-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditExercise(exercise)}
                    >
                      {t("schedule.edit")}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteExercise(exercise.id)}
                    >
                      {t("schedule.delete")}
                    </button>
                  </div>
                </div>
                <p className="exercise-description">{exercise.description}</p>
              </div>
            ))}

            {isAddingExercise ? (
              <div className="add-exercise-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("schedule.exercise_name")}
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                />
                <textarea
                  className="form-textarea"
                  placeholder={t("schedule.exercise_description")}
                  value={currentExercise.description}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                  rows={3}
                />
                <div className="exercise-form-actions">
                  <button className="cancel-exercise-btn" onClick={handleCancelExercise}>
                    {t("schedule.cancel")}
                  </button>
                  <button 
                    className="add-exercise-btn"
                    onClick={editingExerciseId ? handleUpdateExercise : handleAddExercise}
                  >
                    {editingExerciseId ? t("schedule.update_exercise") : t("schedule.add_exercise_btn")}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="add-exercise-dashed-btn"
                onClick={() => setIsAddingExercise(true)}
              >
                <Plus size={18} />
                <span>{t("schedule.add_exercise")}</span>
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="cancel-btn" onClick={handleCloseSidebar}>
            {t("schedule.cancel")}
          </button>
          <button 
            className="create-btn"
            onClick={handleCreateSession}
            disabled={!sessionName.trim() || isSubmitting}
          >
            {isSubmitting ? t("schedule.creating") : t("schedule.create_session")}
          </button>
        </div>
      </div>
    </>
  );
}

