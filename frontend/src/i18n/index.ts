import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en";
import ru from "./locales/ru";

export const SUPPORTED_LANGUAGES = {
    en: "English",
    ru: "Русский",
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {translation: en},
            ru: {translation: ru},
        },
        fallbackLng: "en",
        supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
        interpolation: {
            // React already escapes values
            escapeValue: false,
        },
        detection: {
            // Persist the user's choice in localStorage under this key
            order: ["localStorage", "navigator"],
            lookupLocalStorage: "valetudo-language",
            caches: ["localStorage"],
        },
    });

export default i18n;
