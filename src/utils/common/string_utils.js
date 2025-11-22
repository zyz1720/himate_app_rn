import {pinyin} from 'pinyin-pro';

/**
 * 判断是否为空字符串
 * @param {string} str 字符串
 * @returns {boolean} 是否为空字符串
 */
export const isEmptyString = str => {
  return str === null || str === undefined || str === '' || str.trim() === '';
};

/**
 * 验证邮箱
 * @param {string} mail 邮箱
 * @returns {boolean} 是否为邮箱
 */
export const validateEmail = mail => {
  const pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  return pattern.test(mail);
};

/**
 * 获取首字母
 * @param {string} word 单词
 * @returns {string} 首字母
 */
export const getFirstLetter = word => {
  if (word.length === 0) {
    return false;
  }
  const aWord = word[0];

  // 为中文字符返回拼音首字母
  const pattern_Ch = new RegExp('[\u4E00-\u9FA5]');
  if (pattern_Ch.test(aWord)) {
    const firstLetter = pinyin(aWord, {
      pattern: 'first',
      toneType: 'none',
    });
    return firstLetter.toUpperCase();
  }

  // 为英文字符返回大写字母
  const pattern_En = new RegExp('[A-Za-z]');
  if (pattern_En.test(aWord)) {
    return aWord.toUpperCase();
  }

  // 其他字符返回#
  return '#';
};

/**
 * 反转字符串
 * @param {string} str 字符串
 * @returns {string} 反转字符串
 */
export const reverseString = str => {
  return [...str].reverse().join('');
};

/**
 * 生成随机字符
 * @param {number} count 随机字符长度
 * @returns {string} 随机字符
 */
export const createRandomLetters = count => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < count; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * 比较两个版本号的大小
 * @param {string} v1 版本号1，格式为 x.y.z
 * @param {string} v2 版本号2，格式为 x.y.z
 * @returns {number} 返回比较结果：
 *   -1: v1 < v2
 *    0: v1 == v2
 *    1: v1 > v2
 */
export const compareVersions = (v1, v2) => {
  // 将版本号拆分为数字数组
  const parts1 = v1?.split('.').map(Number);
  const parts2 = v2?.split('.').map(Number);

  // 确保两个版本号都有相同数量的部分
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    // 如果某一部分不存在，则视为0
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) {
      return 1;
    }
    if (num1 < num2) {
      return -1;
    }
  }

  // 所有部分都相等
  return 0;
};
