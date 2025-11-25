import instance from '@utils/request';

// 获取文件列表
export const getFiles = params => instance.get('app/file', {params});

// 批量删除文件
export const delFiles = data => instance.delete('app/file/batch', {data});

// 获取消息列表
export const getUserMsgs = params => instance.get('app/message', {params});

// 删除多条消息
export const delUserMsgs = data => instance.delete('app/message', {data});
