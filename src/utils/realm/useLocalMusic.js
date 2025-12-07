import {realm} from './index';

/**
 * 获取本地音乐
 * @returns {Array} 本地音乐列表
 */
export const getLocalMusic = () => {
  try {
    return realm.objects('local_music').toJSON();
  } catch (error) {
    console.error('查询本地音乐失败', error);
    return [];
  }
};

/**
 * 保存本地音乐
 * @param {Array} newFiles 新文件数组
 */
export const saveLocalMusic = newFiles => {
  try {
    realm.write(() => {
      newFiles.forEach(file => {
        file.created_at = new Date();
        realm.create('local_music', file);
      });
    });
  } catch (error) {
    console.error('保存本地音乐失败', error);
  }
};

/**
 * 清空本地音乐
 */
export const clearLocalMusic = () => {
  try {
    const toDelete = realm.objects('local_music');
    realm.write(() => {
      realm.delete(toDelete);
    });
  } catch (error) {
    console.error('清空本地音乐失败', error);
  }
};
