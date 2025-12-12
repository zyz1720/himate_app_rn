import dayjs from 'dayjs';
import i18n from 'i18next';

/**
 * 格式化秒数
 * @param {number} num 秒数
 * @returns {string} 格式化后的时间字符串
 */
export const formatSeconds = num => {
  const seconds = Math.floor(num);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 格式化毫秒数
 * @param {number} ms 毫秒数
 * @returns {string} 格式化后的时间字符串 mm:ss
 */
export const formatMilliSeconds = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * 格式化时间
 * @param {string} inputDate 时间字符串
 * @returns {string} 格式化后的时间字符串
 */
export const formatDateTime = inputDate => {
  const date = dayjs(inputDate);
  const now = dayjs();
  const isToday = date.isSame(now, 'day');
  const isYesterday = date.isSame(now.subtract(1, 'day'), 'day');
  const isThisWeek = date.isSame(now, 'week');
  const isSameYear = date.isSame(now, 'year');

  if (isToday) {
    return date.format('HH:mm');
  } else if (isYesterday) {
    return i18n.t('common.yesterday');
  } else if (isThisWeek) {
    // 显示星期几
    const weekday = date.day();
    const weekdayNames = {
      0: i18n.t('common.sunday'),
      1: i18n.t('common.monday'),
      2: i18n.t('common.tuesday'),
      3: i18n.t('common.wednesday'),
      4: i18n.t('common.thursday'),
      5: i18n.t('common.friday'),
      6: i18n.t('common.saturday'),
    };
    return weekdayNames[weekday];
  } else if (isSameYear) {
    return date.format('MM/DD HH:mm');
  } else {
    return date.format('YYYY/MM/DD');
  }
};

/**
 * 延迟执行
 * @param {number} ms 延迟时间，单位毫秒
 * @returns {Promise} 延迟执行完成的 Promise
 */
export const delay = (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));
