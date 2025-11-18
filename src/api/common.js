import instance from '../utils/request/request';

// 获取会话房间名称
export const getBaseConst = () => instance.get('api/BaseConst');
