import {realm} from './index';

const usersInfo = realm.objects('users_info');

/**
 * 查询本地用户信息
 */
export const getLocalUsers = () => {
  const localUsers = usersInfo.toJSON();
  console.log('本地用户信息', localUsers);
  return localUsers;
};
