import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "../../../styles/global.scss";
import "../../../styles/typography.scss";
import "./index.css";

export default function NotFound() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Set RTL direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      bgRef.current.style.setProperty("--x", `${e.clientX}px`);
      bgRef.current.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isRTL = i18n.language === 'ar';

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden animate-fadeIn ${isRTL ? 'rtl' : ''}`}
      style={{
        backgroundColor: "var(--color-black)",
        color: "var(--color-white)",
      }}
    >
      {/* Animated grid background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            maskImage:
              "radial-gradient(circle at var(--x) var(--y), white 150px, transparent 300px)",
            WebkitMaskImage:
              "radial-gradient(circle at var(--x) var(--y), white 150px, transparent 300px)",
          }}
        />
      </div>

      {/* Glow effect behind 404 */}
      <div className="absolute inset-0 z-1 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(229,34,52,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 text-center">
        {/* 404 Large Number */}
        <div className="notfound-number-animate">
          <h1 
            className="text-[120px] md:text-[150px] font-bold leading-none mb-4"
            style={{
              background: "linear-gradient(135deg, var(--color-red) 0%, #ff4d5a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 60px rgba(229,34,52,0.3)",
            }}
          >
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="title-animate mb-2">
          <h2 className="text-title">
            {t("notfound.title") || "Page Not Found"}
          </h2>
        </div>

        <div className="subtitle-animate mb-8">
          <p className="text-subtitle">
            {t("notfound.message") || "Oops! The page you're looking for doesn't exist or has been moved."}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="home-btn px-8 py-3 rounded-md font-medium home-btn-animate"
          >
            {t("notfound.go_home") || "Go Back Home"}
          </button>
        </div>
      </div>
    </div>
  );
}

