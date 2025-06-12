import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import nb from './locales/nb/translation.json';
import nn from './locales/nn/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    nb: { translation: nb },
    en: { translation: en },
    nn: { translation: nn },
  },
  lng: 'nb', // standard språk
  fallbackLng: 'nb',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
