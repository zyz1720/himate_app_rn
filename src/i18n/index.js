import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en/common.json';
import zh from './locales/zh/common.json';

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
  debug: __DEV__,
});

export default i18n;
