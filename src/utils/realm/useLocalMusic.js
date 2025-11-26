import {realm} from './index';

/**
 * 获取本地音乐
 * @returns {Array} 本地音乐列表
 */
export const getLocalMusic = () => {
  return realm.objects('local_music').toJSON();
};
