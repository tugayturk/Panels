import { ConfigProvider, theme as antdTheme } from "antd";
import App from "./App";
import { useTheme } from "../context/ThemeContext";
import { lightTheme } from "../theme/lightTheme";
import { darkTheme } from "../theme/darkTheme";
export function AppProviders() {
  const { theme } = useTheme();
  const isDark = theme === "dark" ? true : false;

  return (
    <ConfigProvider
    theme={isDark ? darkTheme : lightTheme}
    >
      <App />
    </ConfigProvider>
  );
}
