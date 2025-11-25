import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {importLocales} from '@utils/system/i18n_utils';
import {useSettingStore} from '@store/settingStore';

// 导入并合并语言文件
const en = importLocales('en');
const zh = importLocales('zh');

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
  lng: useSettingStore.getState().language,
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
  debug: __DEV__,
});

export default i18n;
