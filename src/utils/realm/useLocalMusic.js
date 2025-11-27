import {realm} from './index';

/**
 * 获取本地音乐
 * @returns {Array} 本地音乐列表
 */
export const getLocalMusic = () => {
  return realm.objects('local_music').toJSON();
};

/**
 * 保存本地音乐
 * @param {Array} newFiles 新文件数组
 */
export const saveLocalMusic = newFiles => {
  realm.write(() => {
    newFiles.forEach(file => {
      realm.create('local_music', file);
    });
  });
};

/**
 * 清空本地音乐
 */
export const clearLocalMusic = () => {
  const toDelete = realm.objects('local_music');
  realm.write(() => {
    realm.delete(toDelete);
  });
};
