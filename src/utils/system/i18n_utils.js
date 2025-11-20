/**
 * 自动导入指定语言目录下的所有JSON文件
 * @param {string} locale 语言代码，如'en'或'zh'
 * @returns {object} 合并后的翻译对象，使用文件名作为键名
 */
export const importLocales = locale => {
  try {
    const localeFiles = {};
    localeFiles.common = require(`@/i18n/locales/${locale}/common.json`);
    localeFiles.empty = require(`@/i18n/locales/${locale}/empty.json`);
    localeFiles.httpError = require(`@/i18n/locales/${locale}/httpError.json`);
    localeFiles.imgModal = require(`@/i18n/locales/${locale}/imgModal.json`);
    localeFiles.login = require(`@/i18n/locales/${locale}/login.json`);
    localeFiles.music = require(`@/i18n/locales/${locale}/music.json`);
    localeFiles.screen = require(`@/i18n/locales/${locale}/screen.json`);
    localeFiles.video = require(`@/i18n/locales/${locale}/video.json`);
    return localeFiles;
  } catch (error) {
    console.error(`Failed to import ${locale} locale files:`, error);
    return {};
  }
};
