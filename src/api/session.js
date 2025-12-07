import instance from '@utils/request';

// 获取用户会话列表uid
export const getUserSessions = params => instance.get('app/session', {params});

// 获取用户会话列表uid
export const getSessionsMessages = (session_id, params) =>
  instance.get(`app/session/${session_id}`, {params});
