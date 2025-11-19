import instance from '@utils/request';

// 获取用户会话列表uid
export const getUserSessions = params => instance.get('app/session', {params});

// 获取用户会话详情session_id
export const getSessionDetail = id => instance.get(`app/session/${id}`);

// 删除用户会话
export const dleUserSession = id => instance.delete(`app/session/${id}`);
