import instance from '@utils/request';

// 获取用户会话列表uid
export const getUserSessions = params => instance.get('app/session', {params});

// 获取用户会话列表uid
export const getSessionMessages = (session_id, params) =>
  instance.get(`app/session/${session_id}`, {params});

// 获取用户会话未读消息
export const getSessionUnreadMsgs = (session_id, params) =>
  instance.get(`app/session/${session_id}/unread`, {params});

// 读取用户会话未读消息
export const readSessionUnreadMsgs = data =>
  instance.post('app/session/read', data);
