import {realm} from './index';
import {deepClone} from '@utils/common/object_utils';

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

/**
 * 记录播放历史
 * @param {Object} musicInfo 音乐信息
 */
export const recordPlayHistory = musicInfo => {
  if (typeof musicInfo?.id !== 'string') {
    return;
  }
  const needMusicInfo = deepClone(musicInfo);
  for (const key in needMusicInfo) {
    if (needMusicInfo[key] === null) {
      delete needMusicInfo[key];
    }
  }
  const musicList = realm
    .objects('music_info')
    .filtered('id == $0', needMusicInfo.id);
  if (musicList.length > 0) {
    realm.write(() => {
      for (const ele of musicList) {
        ele.updated_at = Date.now().toString();
      }
    });
  } else {
    needMusicInfo.created_at = Date.now().toString();
    needMusicInfo.updated_at = Date.now().toString();
    realm.write(() => {
      realm.create('music_info', needMusicInfo);
    });
  }
};
