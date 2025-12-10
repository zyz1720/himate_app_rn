import {realm} from './index';
import {deepClone} from '@utils/common/object_utils';
import {showMessageText} from '@utils/system/chat_utils';
/* 写入本地会话 */
export const setLocalSession = sessions => {
  if (!sessions || sessions.length === 0) {
    return;
  }

  try {
    for (let i = 0; i < sessions.length; i++) {
      const {session, sessionExtra} = sessions[i];
      const sessionInfo = deepClone({...session, ...sessionExtra});
      sessionInfo.last_msg_content = showMessageText(
        sessionInfo.lastMsg?.content,
        sessionInfo.lastMsg?.msg_type,
        sessionInfo.lastMsg?.msg_secret,
      );
      const existSession = realm.objectForPrimaryKey(
        'session_info',
        sessionInfo.id,
      );
      if (existSession) {
        delete sessionInfo.id;
        realm.write(() => {
          Object.assign(existSession, sessionInfo);
          existSession.updated_at = new Date();
        });
      } else {
        realm.write(() => {
          sessionInfo.created_at = new Date();
          sessionInfo.updated_at = new Date();
          realm.create('session_info', sessionInfo);
        });
      }
    }
  } catch (error) {
    console.error('写入本地会话失败', error);
  }
};

/* 查询本地会话 */
export const getLocalSession = session_id => {
  try {
    const sessionExtras = realm
      .objects('session_info')
      .filtered('session_id == $0', session_id)
      .toJSON();
    return sessionExtras;
  } catch (error) {
    console.error('查询本地会话失败', error);
    return [{}];
  }
};

/* 查询本地会话 */
export const getLocalSessionById = id => {
  try {
    const sessionExtras = realm
      .objects('session_info')
      .filtered('id == $0', id)
      .toJSON();
    return sessionExtras;
  } catch (error) {
    console.error('查询本地会话失败', error);
    return [{}];
  }
};
