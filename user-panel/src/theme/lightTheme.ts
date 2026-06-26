import { ThemeConfig } from "antd";

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1677ff",
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorText: "#1f2937",
    colorTextSecondary: "#6b7280",
    colorTextPlaceholder: "#9ca3af",
    colorBorder: "#d9d9d9",
    borderRadius: 8,
  },
  components: {
    Card: {
      colorBgContainer: "#ffffff",
      colorTextHeading: "#1f2937",
    },
    Form: {
      labelColor: "#1f2937",
    },
    Input: {
      colorBgContainer: "#ffffff",
      colorText: "#1f2937",
      colorTextPlaceholder: "#9ca3af",
    },
    Select: {
      colorBgContainer: "#ffffff",
      colorText: "#1f2937",
      selectorBg: "#ffffff",
    },
  },
};
