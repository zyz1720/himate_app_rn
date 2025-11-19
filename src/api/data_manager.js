import instance from '@utils/request';

// 获取用户的文件列表
export const getFiles = params => instance.get('app/file', {params});

// 删除用户的文件
export const delFile = id => instance.delete(`app/file/${id}`);

// 删除用户的多个文件
export const delFiles = data => instance.delete('app/file/batch', {data});

// 获取用户的消息列表
export const getUserMsgs = params => instance.get('app/message', {params});

// 删除用户的多个消息
export const delUserMsgs = data => instance.delete('app/message', data);
