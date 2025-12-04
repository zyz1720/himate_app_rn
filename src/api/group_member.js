import instance from '@utils/request';

// 获取自己在群中的信息
export const getSelfGroupMember = group_id =>
  instance.get(`app/group-member/oneself/${group_id}`);

// 获取所有群成员
export const getGroupMembers = (groupId, params) =>
  instance.get(`app/group-member/${groupId}`, {params});

// 邀请群成员
export const addGroupMember = (groupId, data) =>
  instance.put(`app/group-member/invite/${groupId}`, data);

// 修改成员信息
export const editGroupMember = (groupId, data) =>
  instance.put(`app/group-member/update/${groupId}`, data);

// 修改群成员权限
export const editGroupMemberAuth = (groupId, data) =>
  instance.put(`app/group-member/auth/${groupId}`, data);

// 踢出群成员
export const deleteGroupMember = (groupId, data) =>
  instance.delete(`app/group-member/remove/${groupId}`, data);

// 退出群聊
export const exitGroup = groupId =>
  instance.delete(`app/group-member/${groupId}`);
