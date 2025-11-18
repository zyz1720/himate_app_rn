import instance from '../utils/request/request';

// 账号登录
export const userLoginAccount = data =>
  instance.post('app/login/password', data);

// 验证码登录
export const userLoginCode = data => instance.post('app/login/code', data);
