import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DarkVeil from "../../../components/backgrounds/DarkVeil";
import logo from "../../../assets/logo.png";
import styles from "./LandingPage.module.css";

/* ---------------- HERO CONTENT ---------------- */
const HeroContent: FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`${styles.heroContainer} ${isRTL ? styles.rtl : ''}`}>
      <div>
        <h1 className={styles.heroTitle}>
          {t("landing.hero.title_line1")}<br />{t("landing.hero.title_line2")}
        </h1>
        <p className={styles.heroSubtitle}>
          {t("landing.hero.subtitle")}
        </p>
        <button
          onClick={() =>
            document.getElementById("features")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          {t("landing.hero.cta")}
          <span className={`${styles.btnIcon} ${isRTL ? styles.rtlIcon : ''}`}>
            {isRTL ? '←' : '→'}
          </span>
        </button>
      </div>
    </div>
  );
};

/* ---------------- NAVBAR ---------------- */
/* ---------------- NAVBAR ---------------- */
const Navbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${isRTL ? styles.rtl : ''}`}>
      <div className={styles.navLeft}>
        <img src={logo} alt="Zephyr logo" className={styles.logo} />
        <span className={styles.brand}>ZEPHYR</span>
      </div>
      <div className={styles.navCenter}>
        <a href="#features" className={styles.navLink}>{t("landing.nav.features")}</a>
        <a href="#pricing" className={styles.navLink}>{t("landing.nav.pricing")}</a>
        <a href="#contact" className={styles.navLink}>{t("landing.nav.contact")}</a>
      </div>
      <div className={styles.navRight}>
        <button 
          onClick={() => navigate("/login")}
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          {t("landing.nav.signin")}
        </button>
      </div>
    </nav>
  );
};

/* ---------------- FOOTER ---------------- */
const Footer: FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <footer className={`${styles.footer} ${isRTL ? styles.rtl : ''}`}>
      <p>{t("landing.footer.copyright", { year: 2026 })}</p>
      <div className={styles.footerLinks}>
        <a href="#privacy">{t("landing.footer.privacy")}</a>
        <a href="#terms">{t("landing.footer.terms")}</a>
        <a href="#twitter">{t("landing.footer.twitter")}</a>
      </div>
    </footer>
  );
};

/* ---------------- MAIN PAGE COMPONENT ---------------- */
const LandingPage: FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  return (
    <div className={`${styles.page} ${isRTL ? styles.rtl : ''}`}>
      {/* DARK VEIL BACKGROUND COVERS ENTIRE PAGE */}
      <div className={styles.pageBackground}>
        <DarkVeil
          hueShift={-110}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>

      {/* ALL CONTENT ON TOP OF CONSISTENT BACKGROUND */}
      <section className={styles.heroSection}>
        <Navbar />
        <HeroContent />
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

