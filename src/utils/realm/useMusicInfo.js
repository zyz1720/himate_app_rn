import {realm} from './index';
import {deepClone} from '@utils/common/object_utils';

/**
 * 获取播放历史
 * @returns {Array} 播放历史列表
 */
export const getPlayHistory = () => {
  try {
    return realm.objects('music_info').sorted('updated_at', true).toJSON();
  } catch (error) {
    console.error('查询播放历史失败', error);
    return [];
  }
};

/**
 * 清除播放历史
 */
export const clearPlayHistory = () => {
  try {
    const toDelete = realm.objects('music_info');
    realm.write(() => {
      realm.delete(toDelete);
    });
  } catch (error) {
    console.error('清除播放历史失败', error);
  }
};

/**
 * 记录播放历史
 * @param {Object} musicInfo 音乐信息
 */
export const recordPlayHistory = musicInfo => {
  if (typeof musicInfo?.id === 'string') {
    return;
  }
  try {
    const needMusicInfo = deepClone(musicInfo);
    const musicList = realm
      .objects('music_info')
      .filtered('id == $0', needMusicInfo.id);
    if (musicList.length > 0) {
      realm.write(() => {
        for (const ele of musicList) {
          ele.updated_at = new Date();
        }
      });
    } else {
      needMusicInfo.created_at = new Date();
      needMusicInfo.updated_at = new Date();
      realm.write(() => {
        realm.create('music_info', needMusicInfo);
      });
    }
  } catch (error) {
    console.error('记录播放历史失败', error);
  }
};
