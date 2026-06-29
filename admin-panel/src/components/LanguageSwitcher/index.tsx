import { Select } from "antd";
import { useTranslation } from "react-i18next";

const langOptions = [
  { value: "tr", label: "🇹🇷 TR" },
  { value: "en", label: "🇬🇧 EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select
      size="small"
      value={i18n.language}
      onChange={(lang) => i18n.changeLanguage(lang)}
      options={langOptions}
      style={{ width: 80 }}
      variant="borderless"
    />
  );
}
