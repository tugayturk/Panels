import { ConfigProvider, theme as antTheme } from "antd";
import App from "./App";
import { useTheme } from "../context/ThemeContext";

export function AppProviders() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <App />
    </ConfigProvider>
  );
}
