import instance from '@utils/request';

// 账号登录
export const userLoginAccount = data => instance.post('login/password', data);

// 验证码登录
export const userLoginCode = data => instance.post('login/code', data);

// 验证码登录
export const userRefreshToken = data => instance.post('login/refresh', data);