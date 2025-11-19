import instance from '@utils/request';

// 添加好友
export const addMate = data => instance.post('app/mate', data);

// 删除好友
export const deleteMate = id => instance.delete(`app/mate/${id}`);

// 好友列表
export const getMateList = () => instance.get('app/mate/friend');

// 申请好友列表
export const getApplyList = () => instance.get('app/mate/waiting');

// 已拒绝好友列表
export const getRejectedList = () => instance.get('app/mate/rejected');

// 修改好友备注
export const editMateRemarks = id => instance.put(`app/mate/remarks/${id}`);

// 同意好友申请
export const agreeMateApply = id => instance.put(`app/mate/agree/${id}`);

// 拒绝好友申请
export const refuseMateApply = id => instance.put(`app/mate/refuse/${id}`);
