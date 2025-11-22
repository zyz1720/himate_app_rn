/**
 * 自动导入指定语言目录下的所有JSON文件
 * @param {string} locale 语言代码，如'en'或'zh'
 * @returns {object} 合并后的翻译对象，使用文件名作为键名
 */
export const importLocales = locale => {
  try {
    const localeFiles = {};
    if (locale === 'en') {
      localeFiles.common = require('@/i18n/locales/en/common.json');
      localeFiles.empty = require('@/i18n/locales/en/empty.json');
      localeFiles.httpError = require('@/i18n/locales/en/httpError.json');
      localeFiles.login = require('@/i18n/locales/en/login.json');
      localeFiles.music = require('@/i18n/locales/en/music.json');
      localeFiles.screen = require('@/i18n/locales/en/screen.json');
      localeFiles.chat = require('@/i18n/locales/en/chat.json');
      localeFiles.component = require('@/i18n/locales/en/component.json');
      localeFiles.group = require('@/i18n/locales/en/group.json');
      localeFiles.mate = require('@/i18n/locales/en/mate.json');
      localeFiles.permissions = require('@/i18n/locales/en/permissions.json');
      localeFiles.setting = require('@/i18n/locales/en/setting.json');
      localeFiles.user = require('@/i18n/locales/en/user.json');
    }
    if (locale === 'zh') {
      // 基础文件
      localeFiles.common = require('@/i18n/locales/zh/common.json');
      localeFiles.empty = require('@/i18n/locales/zh/empty.json');
      localeFiles.httpError = require('@/i18n/locales/zh/httpError.json');
      localeFiles.login = require('@/i18n/locales/zh/login.json');
      localeFiles.music = require('@/i18n/locales/zh/music.json');
      localeFiles.screen = require('@/i18n/locales/zh/screen.json');
      localeFiles.chat = require('@/i18n/locales/zh/chat.json');
      localeFiles.component = require('@/i18n/locales/zh/component.json');
      localeFiles.group = require('@/i18n/locales/zh/group.json');
      localeFiles.mate = require('@/i18n/locales/zh/mate.json');
      localeFiles.permissions = require('@/i18n/locales/zh/permissions.json');
      localeFiles.setting = require('@/i18n/locales/zh/setting.json');
      localeFiles.user = require('@/i18n/locales/zh/user.json');
    }
    return localeFiles;
  } catch (error) {
    console.error('Failed to import zh locale files:', error);
    return {};
  }
};
