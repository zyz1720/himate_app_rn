import {realm} from './index';
import {useSettingStore} from '@store/settingStore';

/* 写入本地消息 */
export const setLocalMessages = messages => {
  const {notSaveMsg} = useSettingStore.getState();
  if (notSaveMsg) {
    return;
  }
  if (messages?.length === 0) {
    return;
  }

  try {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const existMeg = realm.objectForPrimaryKey(
        'chat_msg',
        message.client_msg_id,
      );
      if (existMeg) {
        continue;
      } else {
        realm.write(() => {
          realm.create('chat_msg', message);
        });
      }
    }
  } catch (error) {
    console.error('写入本地消息失败', error);
  }
};

/* 查询本地消息 */
export const getLocalMessages = session_id => {
  try {
    const localMsgs = realm.objects('chat_msg');
    const list = localMsgs
      .filtered('session_id == $0', session_id)
      .sorted('create_time', true)
      .toJSON();
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
