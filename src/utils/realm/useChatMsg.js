import {realm} from './index';
import {decryptMsg} from '@utils/system/chat_utils';
import {deepClone} from '@utils/common/object_utils';
import {useSettingStore} from '@store/settingStore';
import {MsgTypeEnum} from '@const/database_enum';

/* 写入本地消息 */
export const setLocalMessages = (messages = []) => {
  const {notSaveMsg} = useSettingStore.getState();
  if (notSaveMsg) {
    return;
  }
  try {
    messages.forEach(message => {
      const existMeg = realm.objectForPrimaryKey(
        'chat_msg',
        message.client_msg_id,
      );
      const cloneMsg = deepClone(message);
      cloneMsg.reminders = cloneMsg.reminders || [];
      if (existMeg) {
        delete cloneMsg.client_msg_id;
        realm.write(() => {
          Object.assign(existMeg, cloneMsg);
        });
      } else {
        cloneMsg.decrypted_content = decryptMsg(
          cloneMsg.content,
          cloneMsg?.msg_secret,
        );
        realm.write(() => {
          realm.create('chat_msg', cloneMsg);
        });
      }
    });
  } catch (error) {
    console.error('写入本地消息失败', error);
  }
};

/* 查询本地消息 */
export const getLocalMessages = session_id => {
  try {
    const list = realm
      .objects('chat_msg')
      .filtered('session_id == $0', session_id)
      .sorted('create_time', true)
      .toJSON();
    return list;
  } catch (error) {
    console.error('查询本地消息失败', error);
    return [];
  }
};

/* 获取所有本地消息 */
export const getAllLocalMessages = () => {
  try {
    const list = realm.objects('chat_msg').toJSON();
    return list;
  } catch (error) {
    console.error('查询本地消息失败', error);
    return [];
  }
};

/* 删除本地消息 */
export const deleteLocalMessages = session_id => {
  try {
    realm.write(() => {
      const msgs = realm
        .objects('chat_msg')
        .filtered('session_id == $0', session_id);
      realm.delete(msgs);
    });
  } catch (error) {
    console.error('删除本地消息失败', error);
  }
};

/* 清空本地消息 */
export const clearLocalMessages = () => {
  try {
    const msgs = realm.objects('chat_msg');
    realm.write(() => {
      realm.delete(msgs);
    });
  } catch (error) {
    console.error('清空本地消息失败', error);
  }
};

/* 关键字查询本地消息 */
export const searchLocalMessagesById = (keyword, session_id) => {
  try {
    const localMsgs = realm.objects('chat_msg');
    const list = localMsgs
      .filtered(
        'session_id == $0 && (decrypted_content CONTAINS $1 || sender_remarks CONTAINS $1) && msg_type == $2',
        session_id,
        keyword.trim(),
        MsgTypeEnum.text,
      )
      .sorted('create_time', true)
      .toJSON();
    return list;
  } catch (error) {
    console.error('查询本地消息失败', error);
    return [];
  }
};

/* 关键字查询本地消息 */
export const searchLocalMessages = keyword => {
  try {
    const list = realm
      .objects('chat_msg')
      .filtered(
        '(decrypted_content CONTAINS $0 || sender_remarks CONTAINS $0) && msg_type == $1',
        keyword.trim(),
        MsgTypeEnum.text,
      )
      .sorted('create_time', true)
      .toJSON();
    return list;
  } catch (error) {
    console.error('查询本地消息失败', error);
    return [];
  }
};

/* 移除指定本地消息 */
export const removeLocalMessage = clientMsgId => {
  try {
    realm.write(() => {
      const msg = realm.objectForPrimaryKey('chat_msg', clientMsgId);
      if (msg) {
        realm.delete(msg);
      }
    });
  } catch (error) {
    console.error('删除本地消息失败', error);
  }
};
