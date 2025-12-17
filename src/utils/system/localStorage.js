import AsyncStorage from '@react-native-async-storage/async-storage';
import Storage from 'react-native-storage';

export const storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

/**
 * 增加
 * @param {string} newKey 键
 * @param {string} newId 子键
 * @param {*} newValue 值
 * @param {number} time 过期时间
 */
export const addStorage = (newKey, newId = null, newValue, time = null) => {
  storage.save({
    key: newKey,
    id: newId,
    data: newValue,
    expires: time, // 设为null,则不过期,这里会覆盖初始化的时效
  });
};

/**
 * 查询
 * @param {string} oldKey 键
 * @param {string} oldId 子键
 * @returns {*} 值
 */
export const getStorage = async (oldKey, oldId = null) => {
  let value = null;
  try {
    value = await storage.load({
      key: oldKey,
      id: oldId,
    });
  } catch (error) {
    console.error('key-id查询失败', error);
  }
  return value;
};

/**
 * 查询key下所有数据
 * @param {string} oldKey 键
 * @returns {object} 值
 */
export const getKeyStorage = async oldKey => {
  let value = {};
  try {
    const [keys, values] = await Promise.all([
      storage.getIdsForKey(oldKey),
      storage.getAllDataForKey(oldKey),
    ]);
    keys.forEach((key, index) => {
      value[key] = values[index];
    });
  } catch (error) {
    console.error('key查询失败', error);
  }
  return value;
};

/**
 * 删除单个key-id数据
 * @param {string} oldKey 键
 * @param {string} oldId 子键
 */
export const delStorage = (oldKey, oldId = null) => {
  storage
    .remove({
      key: oldKey,
      id: oldId,
    })
    .then(() => {
      console.log('清除单个key-id成功');
    })
    .catch(error => {
      console.error('清除单个key-id失败', error);
    });
};

/**
 * 删除key下所有数据
 * @param {string} oldKey 键
 */
export const delKeyStorage = oldKey => {
  storage
    .clearMapForKey(oldKey)
    .then(() => {
      console.log('清除key-storage成功');
    })
    .catch(error => {
      console.error('清除key-storage失败', error);
    });
};

/**
 * 清空所有数据
 */
export const clearStorage = () => {
  storage
    .clearMap()
    .then(() => {
      console.log('清除storage成功');
    })
    .catch(error => {
      console.error('清除storage失败', error);
    });
};
