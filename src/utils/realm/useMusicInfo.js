import {realm} from './index';

/**
 * 获取播放历史
 * @returns {Array} 播放历史列表
 */
export const getPlayHistory = () => {
  return realm.objects('music_info').sorted('updated_at', true).toJSON();
};

/**
 * 清除播放历史
 */
export const clearPlayHistory = () => {
  const toDelete = realm.objects('music_info');
  realm.write(() => {
    realm.delete(toDelete);
  });
};
