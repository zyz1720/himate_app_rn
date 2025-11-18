import instance from '../utils/request/request';

// app详情
export const getAppPackageDetail = data =>
  instance.get('api/appPackage/detail', {params: data});
