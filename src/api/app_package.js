import instance from '@utils/request';
import {displayName} from '@root/app.json';

// 获取app版本
export const getAppVersion = () =>
  instance.get(`app/app-package/${displayName}`);
