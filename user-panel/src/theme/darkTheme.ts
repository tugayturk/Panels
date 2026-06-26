import { ThemeConfig } from "antd";

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: "#4f8cff",
    colorBgBase: "#111827",
    colorBgContainer: "#1f2937",
    colorBgElevated: "#1f2937",
    colorText: "#f3f4f6",
    colorTextSecondary: "#9ca3af",
    colorTextPlaceholder: "#9ca3af",
    colorBorder: "#374151",
    colorBorderSecondary: "#4b5563",
    borderRadius: 8,
  },
  components: {
    Card: {
      colorBgContainer: "#1f2937",
      colorTextHeading: "#f3f4f6",
      colorBorderSecondary: "#374151",
    },
    Form: {
      labelColor: "#f3f4f6",
    },
    Input: {
      colorBgContainer: "#111827",
      colorText: "#f3f4f6",
      colorTextPlaceholder: "#9ca3af",
      colorBorder: "#374151",
      hoverBorderColor: "#4b5563",
      activeBorderColor: "#4f8cff",
    },
    Select: {
      colorBgContainer: "#111827",
      colorText: "#f3f4f6",
      colorTextPlaceholder: "#9ca3af",
      colorBorder: "#374151",
      optionSelectedBg: "#374151",
      selectorBg: "#111827",
    },
    Radio: {
      colorBgContainer: "#111827",
      buttonSolidCheckedBg: "#4f8cff",
    },
  },
};
