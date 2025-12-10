import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources: {
      es: {
        translation: esTranslations
      },
      en: {
        translation: enTranslations
      },
      pt: {
        translation: ptTranslations
      }
    },
    fallbackLng: 'es', // Idioma por defecto
    lng: localStorage.getItem('i18nextLng') || 'es', // Idioma inicial
    interpolation: {
      escapeValue: false // React ya escapa valores
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

