import {deepClone} from '@utils/common/object_utils';
import {useConfigStore} from '@store/configStore';
import {useSettingStore} from '@store/settingStore';
import {getTrueSecretKey, decryptAES} from './crypto_utils';

/* 解密消息 */
const {msgSecretKey} = useConfigStore.getState();
export const decryptMsg = (msg, secret) => {
  if (secret) {
    const {iv, encryptedData} = JSON.parse(msg);
    const trueSecret = getTrueSecretKey(secret, msgSecretKey);
    return decryptAES(encryptedData, iv, trueSecret);
  } else {
    return msg;
  }
};

/* 显示媒体类型 */
export const showMediaType = (msg, type, secret = false) => {
  switch (type) {
    case 'text':
      return decryptMsg(msg, secret);
    case 'image':
      return '[图片]';
    case 'video':
      return '[视频]';
    case 'audio':
      return '[语音]';
    case 'other':
      return '[文件]';
    default:
      return '';
  }
};

/* 格式化消息 */
export const formatMsg = data => {
  const {id, content, msg_secret, update_time} = data || {}; // 需要格式化的聊天数据
  return {
    _id: id,
    text: decryptMsg(content, msg_secret),
    createdAt: new Date(update_time),
    status: 'ok',
    ...data,
  };
};

/* 格式化加入会话的用户信息 */
export const formatJoinUser = (
  userId,
  remark,
  avatar,
  session_id,
  session_name = '',
) => {
  return {
    _id: userId + session_id,
    userId,
    remark,
    avatar,
    session_id,
    session_name,
  };
};

/* 写入本地消息 */
const {notSaveMsg} = useSettingStore.getState();
export const setLocalMsg = async (realm, msgs) => {
  if (notSaveMsg) {
    return;
  }
  if (msgs?.length === 0) {
    return;
  }
  try {
    const msglist = deepClone(msgs);
    for (let i = 0; i < msglist.length; i++) {
      const element = msglist[i];
      const msg = realm.objectForPrimaryKey('ChatMsg', element.clientMsg_id);
      if (msg) {
        continue;
      } else {
        realm.write(() => {
          realm.create('ChatMsg', element);
        });
      }
    }
  } catch (error) {
    console.error('写入本地消息失败', error);
  }
};

/* 查询本地消息 */
export const getLocalMsg = (realm, session_id) => {
  const localMsgs = realm.objects('ChatMsg');
  const list = localMsgs
    .filtered('session_id == $0', session_id)
    .sorted('createdAt', true)
    .toJSON();
  return {
    list,
    count: list.length,
  };
};

/* 删除指定本地消息 */
export const delLocalMsg = (realm, cmsg_id) => {
  const toDelete = realm
    .objects('ChatMsg')
    .filtered('clientMsg_id == $0', cmsg_id);
  realm.write(() => {
    realm.delete(toDelete);
  });
};

/* 写入本地用户信息 */
export const addOrUpdateLocalUser = (realm, users) => {
  if (users.length === 0) {
    return;
  }
  const userList = deepClone(users);
  for (let i = 0; i < userList.length; i++) {
    const element = userList[i];
    const user = realm
      .objects('UsersInfo')
      .filtered(
        'userId == $0 && session_id == $1',
        element.userId,
        element.session_id,
      );
    if (user.length > 0) {
      realm.write(() => {
        for (const ele of user) {
          ele.avatar = element.avatar;
          ele.remark = element.remark;
        }
      });
    } else {
      realm.write(() => {
        realm.create('UsersInfo', element);
      });
    }
  }
};

/* 查询本地用户信息 */
export const getLocalUser = realm => {
  const localUsers = realm.objects('UsersInfo').toJSON();
  // console.log('本地用户信息', localUsers);
  return localUsers;
};
