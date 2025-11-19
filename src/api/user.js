import instance from '@utils/request';

// 用户注册
export const userReg = data => instance.post('app/user/reg', data);

// 获取用户详情
export const getUserInfo = () => instance.get('app/user/info');

// 修改用户信息
export const editUserInfo = data => instance.put('app/user/info', data);

// 修改用户密码
export const editUserPassword = data => instance.put('app/user/password', data);

// 修改用户账号
export const editUserAccount = data => instance.put('app/user/account', data);

// 用户注销
export const userLogout = () => instance.delete('app/user/logout');
