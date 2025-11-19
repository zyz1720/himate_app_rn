/**
 * 判断是否为空对象
 * @param {object} obj 对象
 * @returns {boolean} 是否为空对象
 */
export const isEmptyObject = obj => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * 深拷贝对象
 * @param {object} obj 对象
 * @returns {object} 深拷贝对象
 */
export const deepClone = (obj, hash = new WeakMap()) => {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // RegExp 对象
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item, hash));
  }

  // 对象
  if (obj.constructor === Object) {
    // 检查循环引用
    if (hash.has(obj)) {
      return hash.get(obj);
    }

    let cloneObj = {};
    hash.set(obj, cloneObj);

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloneObj[key] = deepClone(obj[key], hash);
      }
    }

    return cloneObj;
  }

  // 对于其他对象，如函数、Map、Set等，这里简单处理为null或抛出错误
  // 实际应用中可以根据需求进行扩展
  throw new Error('Unable to copy obj! Its type is not supported.');
};

/**
 * 保留更改过的字段
 * @param {object} original 原始对象
 * @param {object} current 当前对象
 * @returns {object|null} 更改过的字段对象
 */
export const keepChangedFields = (original, current) => {
  const changedFields = {};
  for (const key in current) {
    if (current[key] !== original[key]) {
      changedFields[key] = current[key];
    }
  }
  if (Object.keys(changedFields).length === 0) {
    return null;
  }
  return changedFields;
};
