import instance from '@utils/request';

// 账号登录
export const userLoginAccount = data => instance.post('login/password', data);

// 验证码登录
export const userLoginCode = data => instance.post('login/code', data);

// 刷新token
export const userRefreshToken = data => instance.post('login/refresh', data);

// 二维码登录
export const qrCodeLogin = data => instance.post('qrcode/login', data);
