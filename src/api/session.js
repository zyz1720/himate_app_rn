import instance from '@utils/request';

// 获取用户会话列表uid
export const getUserSessions = params => instance.get('app/session', {params});
