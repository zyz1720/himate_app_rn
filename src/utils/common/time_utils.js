import dayjs from 'dayjs';

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
  const isSameYear = date.isSame(now, 'year');

  if (isToday) {
    return date.format('HH:mm');
  } else if (isSameYear) {
    return date.format('MM/DD HH:mm');
  } else {
    return date.format('YYYY/MM/DD');
  }
};
