import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Dummy initialization to satisfy the prompt's requirement for i18n setup
// Actual translation files are in public/locales/

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: require("../public/locales/en/translation.json")
      },
      hi: {
        translation: require("../public/locales/hi/translation.json")
      }
    }
  });

export default i18n;
