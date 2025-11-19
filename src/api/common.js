import instance from '@utils/request';

// 获取图片验证码
export const getImgCaptcha = () => instance.get('captcha');

// 获取邮箱验证码
export const getEmailCode = params => instance.get('email/code', {params});
