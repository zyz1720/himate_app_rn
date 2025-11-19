/**
 * 合并数组函数
 * @param {Array} array1 数组1
 * @param {Array} array2 数组2
 * @param {Array} array3 数组3
 * @returns {Array} 合并后的数组
 */
export const mergeArraysByIndex = (array1 = [], array2 = [], array3 = []) => {
  const maxLength = array1.length;
  if (maxLength === 0) {
    return [];
  }

  const merge = (arr1, arr2) => {
    return Array.from({length: maxLength}, (_, index) => ({
      ...arr1[index],
      ...arr2[index],
    }));
  };

  if (array2.length > 0 && array3.length > 0) {
    return merge(merge(array1, array2), array3);
  }

  if (array2.length > 0) {
    return merge(array1, array2);
  }

  return array1;
};
