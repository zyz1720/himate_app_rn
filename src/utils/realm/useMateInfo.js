import {realm} from './index';
import {deepClone} from '@utils/common/object_utils';

/* 写入本地好友信息 */
export const setLocalMateInfo = (mates = []) => {
  try {
    mates.forEach(mate => {
      const {theOther, ...mateInfo} = deepClone(mate);
      const existMate = realm.objectForPrimaryKey('mate_info', mateInfo.id);
      mateInfo.user_id = theOther.id;
      mateInfo.user_avatar = theOther.user_avatar;
      if (existMate) {
        delete mateInfo.id;
        realm.write(() => {
          Object.assign(existMate, mateInfo);
          existMate.updated_at = new Date();
        });
      } else {
        realm.write(() => {
          mateInfo.created_at = new Date();
          mateInfo.updated_at = new Date();
          realm.create('mate_info', mateInfo);
        });
      }
    });
  } catch (error) {
    console.error('写入本地会话失败', error);
  }
};

/* 查询并格式化本地好友信息 */
export const getLocalMates = () => {
  try {
    const mateExtras = realm.objects('mate_info').toJSON();
    const mates = mateExtras.map(mate => ({
      ...mate,
      theOther: {
        id: mate.user_id,
        user_avatar: mate.user_avatar || '',
      },
    }));
    return mates;
  } catch (error) {
    console.error('查询本地好友失败', error);
    return [];
  }
};

/* 删除本地好友信息 */
export const deleteLocalMateInfo = () => {
  try {
    const existMate = realm.objects('mate_info');
    if (existMate) {
      realm.write(() => {
        realm.delete(existMate);
      });
    }
  } catch (error) {
    console.error('删除本地好友失败', error);
  }
};
