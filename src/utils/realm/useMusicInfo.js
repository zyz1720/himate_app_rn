import {realm} from './index';

/**
 * 获取播放历史
 * @returns {Array} 播放历史列表
 */
export const getPlayHistory = () => {
  return realm.objects('music_info').sorted('updated_at', true).toJSON();
};
