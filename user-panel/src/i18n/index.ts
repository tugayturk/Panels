import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "./tr.json";
import en from "./en.json";

// Kaydedilmiş dil tercihi varsa onu kullan, yoksa Türkçe başlat
const savedLanguage = localStorage.getItem("language");

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    lng: savedLanguage ?? "tr",
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false,
    },
  });

// Dil değişince tercihi localStorage'a yaz (sayfa yenilenince korunur)
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
