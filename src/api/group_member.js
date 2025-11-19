import instance from '@utils/request';

// 邀请群成员
export const addGroupMember = data =>
  instance.post('app/group-member/invite', data);

// 修改群备注
export const editGroupMember = data =>
  instance.put('app/group-member/update', data);

// 修改群成员权限
export const editGroupMemberAuth = data =>
  instance.put('app/group-member/auth', data);

// 踢出群成员
export const deleteGroupMember = data =>
  instance.delete('app/group-member/remove', data);

// 退出群聊
export const exitGroup = groupId =>
  instance.delete(`app/group-member/${groupId}`);
