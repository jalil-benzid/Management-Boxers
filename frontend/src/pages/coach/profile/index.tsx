import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import { Pencil, Save, X } from "lucide-react";
import { API_BASE_URL } from "../../../api/config";
import "./CoachProfile.scss";

interface MeResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    role: string;
  };
}

interface Coach {
  id: string;
  full_name: string;
  email: string;
}

interface UpdateResponse {
  success: boolean;
  message: string;
  data: Coach;
}

export default function CoachProfile() {
  const { t } = useTranslation();

  const [coach, setCoach] = useState<Coach | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  useEffect(() => {
    if (coach) {
      const nameChanged = fullName !== coach.full_name;
      const emailChanged = email !== coach.email;
      const passwordChanged = password.length > 0;
      setHasChanges(nameChanged || emailChanged || passwordChanged);
    }
  }, [fullName, email, password, coach]);

  const fetchMe = async (): Promise<MeResponse | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchCoach = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coaches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const c = data.data;
        setCoach(c);
        setFullName(c.full_name);
        setEmail(c.email);
      } else {
        setAlert({ type: "error", message: data.detail || t("coachProfile.error_loading") });
      }
    } catch (err) {
      setAlert({ type: "error", message: t("coachProfile.network_error") });
    }
  }, [t]);

  useEffect(() => {
    const init = async () => {
      const me = await fetchMe();
      if (me?.data?.id) {
        fetchCoach(me.data.id);
      }
    };
    init();
  }, [fetchCoach]);

  const handleNameEdit = () => setIsEditingName(true);
  const handleNameSave = () => setIsEditingName(false);
  const handleNameCancel = () => {
    if (coach) setFullName(coach.full_name);
    setIsEditingName(false);
  };

  const handleEmailEdit = () => setIsEditingEmail(true);
  const handleEmailSave = () => setIsEditingEmail(false);
  const handleEmailCancel = () => {
    if (coach) setEmail(coach.email);
    setIsEditingEmail(false);
  };

  const handlePasswordEdit = () => {
    setIsEditingPassword(true);
    setTempPassword("");
  };
  const handlePasswordSave = () => {
    setPassword(tempPassword);
    setIsEditingPassword(false);
  };
  const handlePasswordCancel = () => {
    setTempPassword("");
    setIsEditingPassword(false);
  };

  const handleCancel = () => {
    if (coach) {
      setFullName(coach.full_name);
      setEmail(coach.email);
      setPassword("");
      setTempPassword("");
      setIsEditingName(false);
      setIsEditingEmail(false);
      setIsEditingPassword(false);
      setHasChanges(false);
      setAlert(null);
    }
  };

  const handleSave = async () => {
    if (!coach || !hasChanges) return;

    setIsSaving(true);
    setAlert(null);

    try {
      const body: any = {};

      if (fullName !== coach.full_name) body.full_name = fullName;
      if (email !== coach.email) body.email = email;
      if (password.trim() !== "") body.password = password;

      const res = await fetch(`${API_BASE_URL}/api/coaches/${coach.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data: UpdateResponse = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.message || t("coachProfile.update_failed") });
        return;
      }

      setCoach(data.data);
      setFullName(data.data.full_name);
      setEmail(data.data.email);
      setPassword("");
      setTempPassword("");

      setAlert({ type: "success", message: t("coachProfile.profile_updated") });

      setIsEditingName(false);
      setIsEditingEmail(false);
      setIsEditingPassword(false);
      setHasChanges(false);
    } catch (err) {
      setAlert({ type: "error", message: t("coachProfile.network_error") });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitial = () => {
    if (fullName && fullName.length > 0) {
      return fullName.charAt(0).toUpperCase();
    }
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    return "C";
  };

  return (
    <div className="coach-profile">
      {alert && (
        <div className="fixed-alert">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-letter">{getInitial()}</div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>{t("coachProfile.account_info")}</h3>
            <div className="section-line"></div>
          </div>

          <div className="profile-field">
            <label>{t("coachProfile.full_name")}</label>
            <div className="field-with-icon">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                  />
                  <button className="icon-button save-icon" onClick={handleNameSave}>
                    <Save size={16} />
                  </button>
                  <button className="icon-button cancel-icon" onClick={handleNameCancel}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input type="text" value={fullName} disabled />
                  <button className="icon-button edit-icon" onClick={handleNameEdit}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-field">
            <label>{t("coachProfile.email")}</label>
            <div className="field-with-icon">
              {isEditingEmail ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                  <button className="icon-button save-icon" onClick={handleEmailSave}>
                    <Save size={16} />
                  </button>
                  <button className="icon-button cancel-icon" onClick={handleEmailCancel}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input type="text" value={email} disabled />
                  <button className="icon-button edit-icon" onClick={handleEmailEdit}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>{t("coachProfile.security")}</h3>
            <div className="section-line"></div>
          </div>

          <div className="profile-field">
            <label>{t("coachProfile.password")}</label>
            <div className="field-with-icon">
              {isEditingPassword ? (
                <>
                  <input
                    type="password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder={t("coachProfile.enter_new_password")}
                    autoFocus
                  />
                  <button className="icon-button save-icon" onClick={handlePasswordSave}>
                    <Save size={16} />
                  </button>
                  <button className="icon-button cancel-icon" onClick={handlePasswordCancel}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="password"
                    value={password || t("coachProfile.password_placeholder")}
                    disabled
                  />
                  <button className="icon-button edit-icon" onClick={handlePasswordEdit}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className={`btn-cancel ${!hasChanges ? "disabled" : ""}`}
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
          >
            {t("coachProfile.cancel")}
          </button>

          <button
            className={`btn-save ${!hasChanges ? "inactive" : ""}`}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? t("coachProfile.saving") : t("coachProfile.save_changes")}
          </button>
        </div>
      </div>
    </div>
  );
}


