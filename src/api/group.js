import instance from '@utils/request';

// 创建群组
export const addGroup = data => instance.post('app/group', data);

// 群组列表
export const getGroupList = params => instance.get('app/group', {params});

// 修改群组信息
export const editGroup = (id, data) => instance.put(`app/group/${id}`, data);

// 群组详情
export const getGroupDetail = id => instance.get(`app/group/${id}/detail`);

// 解散群组
export const deleteGroup = id => instance.delete(`app/group/${id}`);
