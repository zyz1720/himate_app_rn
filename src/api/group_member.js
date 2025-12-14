import instance from '@utils/request';

// 获取自己在群中的信息
export const getSelfGroupMember = groupId =>
  instance.get(`app/group-member/${groupId}/oneself`);

// 获取所有群成员
export const getGroupMembers = (groupId, params) =>
  instance.get(`app/group-member/${groupId}`, {params});

// 邀请群成员
export const addGroupMember = (groupId, data) =>
  instance.put(`app/group-member/${groupId}/invite`, data);

// 修改成员信息
export const editGroupMember = (groupId, data) =>
  instance.put(`app/group-member/${groupId}/update`, data);

// 修改群成员权限
export const editGroupMemberAuth = (groupId, data) =>
  instance.put(`app/group-member/${groupId}/auth`, data);

// 踢出群成员
export const deleteGroupMembers = (groupId, data) =>
  instance.delete(`app/group-member/${groupId}/remove`, {data});

// 退出群聊
export const exitGroup = groupId =>
  instance.delete(`app/group-member/${groupId}`);
