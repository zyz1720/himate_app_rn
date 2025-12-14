import instance from '@utils/request';

// 添加好友
export const addMate = data => instance.post('app/mate', data);

// 删除好友
export const deleteMate = id => instance.delete(`app/mate/${id}`);

// 好友列表
export const getMateList = params => instance.get('app/mate', {params});

// 是否是好友
export const getIsMate = userId => instance.get(`app/mate/${userId}/relation`);

// 申请我为好友待通过的好友
export const getApplyList = () => instance.get('app/mate/waiting');

// 已拒绝好友申请列表
export const getRejectedList = () => instance.get('app/mate/rejected');

// 修改好友备注
export const editMateRemarks = (id, data) =>
  instance.put(`app/mate/${id}/remarks`, data);

// 同意好友申请
export const agreeMateApply = (id, data) =>
  instance.put(`app/mate/${id}/agree`, data);

// 拒绝好友申请
export const refuseMateApply = id => instance.put(`app/mate/${id}/refuse`);
