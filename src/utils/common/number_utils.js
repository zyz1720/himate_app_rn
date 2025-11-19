/**
 * 生成随机位数字
 * @param {number} num 随机位数字长度
 * @returns {number} 随机位数字
 */
export const createRandomNumber = (num = 6) => {
  const code = (parseInt(String(Math.random() * 1000000), 10) + 1000000)
    .toString()
    .slice(0, num);
  return Number(code);
};

/**
 * 生成随机整数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 随机整数
 */
export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
