import {realm} from './index';
import {deepClone} from '@utils/common/object_utils';
import {showMessageText} from '@utils/system/chat_utils';
import {isEmptyString} from '@utils/common/string_utils';

/* 写入本地会话 */
export const setLocalSession = (sessions = []) => {
  try {
    sessions.forEach(sessionWithExtra => {
      const {session, sessionExtra, isLatest} = sessionWithExtra;
      const sessionInfo = deepClone({...session, ...sessionExtra});
      sessionInfo.last_msg_content = showMessageText(sessionInfo.lastMsg);
      const existSession = realm.objectForPrimaryKey(
        'session_info',
        sessionInfo.id,
      );

      if (existSession) {
        delete sessionInfo.id;
        realm.write(() => {
          Object.assign(existSession, sessionInfo);
          if (isLatest) {
            existSession.unread_count = (existSession?.unread_count || 0) + 1;
          }
          existSession.updated_at = new Date();
        });
      } else {
        realm.write(() => {
          sessionInfo.created_at = new Date();
          sessionInfo.updated_at = new Date();
          if (isLatest) {
            sessionInfo.unread_count = 1;
          }
          realm.create('session_info', sessionInfo);
        });
      }
    });
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
      .sort('updated_at', true)
      .toJSON();
    return sessionExtras;
  } catch (error) {
    console.error('查询本地会话失败', error);
    return [{}];
  }
};

/* 查询所有本地会话 */
export const getLocalSessions = () => {
  try {
    const sessionExtras = realm.objects('session_info').toJSON();
    return sessionExtras;
  } catch (error) {
    console.error('查询所有本地会话失败', error);
    return [];
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

/* 删除本地会话 */
export const deleteLocalSession = session_id => {
  try {
    const sessionExtras = realm
      .objects('session_info')
      .filtered('session_id == $0', session_id);
    realm.write(() => {
      realm.delete(sessionExtras);
    });
  } catch (error) {
    console.error('删除本地会话失败', error);
  }
};

/* 重置会话的已读消息数 */
export const resetUnreadCount = session_id => {
  return new Promise((resolve, reject) => {
    try {
      const existSession = realm
        .objects('session_info')
        .find(sessionObj => sessionObj.session_id === session_id);
      if (!existSession) {
        resolve(true);
        return;
      }
      realm.write(() => {
        existSession.unread_count = 0;
        resolve(true);
      });
    } catch (error) {
      console.error('重置会话的已读消息数失败', error);
      reject(error);
    }
  });
};

/* 更新会话的最后一条消息 */
export const updateSessionLastMsg = (session_id, lastMsg = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const lastMsgContent = showMessageText(lastMsg);
      if (isEmptyString(lastMsgContent)) {
        resolve(true);
      }
      const existSession = realm
        .objects('session_info')
        .find(sessionObj => sessionObj.session_id === session_id);
      if (!existSession) {
        resolve(true);
        return;
      }
      realm.write(() => {
        existSession.last_msg_content = lastMsgContent;
        existSession.updated_at = new Date();
        resolve(true);
      });
    } catch (error) {
      console.error('更新会话的最后一条消息失败', error);
      reject(error);
    }
  });
};
