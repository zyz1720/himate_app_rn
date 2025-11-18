import instance from '../utils/request/request';

// 获取会话房间名称
export const getBaseConst = () => instance.get('api/BaseConst');

// 获取图片验证码
export const getImgCaptcha = () => instance.get('captcha');

// 获取邮箱验证码
export const getEmailCode = params => instance.get('email/code', {params});
