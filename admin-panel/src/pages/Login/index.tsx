import { useState } from "react";
import styles from "./Login.module.scss";
import { loginFail, loginSuccess } from "../../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginService } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
export function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginService(email, password);
      dispatch(loginSuccess(data));
      navigate("/dashboard");
    } catch (err) {
      dispatch(loginFail(err instanceof Error ? err.message : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sol: Form — soldan kayarak açılır */}
      <motion.div
        className={styles.left}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className={styles.welcome}>{t("login.welcome")}</h1>
        <p className={styles.subtitle}>{t("login.subtitle")}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">{t("login.email")}</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>✉</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">{t("login.password")}</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                required
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              t("login.loading")
            ) : (
              <>
                <span>⟳</span> {t("login.submit")}
              </>
            )}
          </button>
        </form>

        <p className={styles.footer}>{t("login.footer")}</p>
      </motion.div>

      {/* Sağ: Marka — sağdan kayarak açılır */}
      <motion.div
        className={styles.right}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.p
          className={styles.brandName}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("login.brandName")}
        </motion.p>
        <motion.p
          className={styles.brandTagline}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          {t("login.brandTagline")}
        </motion.p>
        <motion.p
          className={styles.brandDesc}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {t("login.brandDesc")}
        </motion.p>
        <motion.div
          className={styles.badges}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          <span className={styles.badge}>{t("login.badge1")}</span>
          <span className={styles.badge}>{t("login.badge2")}</span>
          <span className={styles.badge}>{t("login.badge3")}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
