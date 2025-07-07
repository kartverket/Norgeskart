import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import nb from './locales/nb/translation.json';
import nn from './locales/nn/translation.json';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    supportedLngs: ['nb', 'nn', 'en'],
    fallbackLng: 'nb',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    load: 'languageOnly', // <-- viktig!
    resources: {
      nb: { translation: nb },
      nn: { translation: nn },
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
  });



export default i18n;