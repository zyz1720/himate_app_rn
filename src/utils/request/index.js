import axios from 'axios';
import {httpErrorMsg} from '../../constants/error_msg.js';
import {store} from '../../stores/index.js';
import {clearUserStore} from '../../stores/store_slice/userStore.js';
import {requestBaseConfig} from '../../stores/store_slice/baseConfigStore.js';
import {setErrorMsg} from '../../stores/store_slice/errorMsgStore.js';
import {API_PREFIX} from '@env';

const {BASE_URL} = store.getState().baseConfigStore.baseConfig;

// 创建axios实例
console.log('BASE_URL ', BASE_URL);

const instance = axios.create({
  baseURL: BASE_URL + API_PREFIX,
  timeout: 30000,
});

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    const {access_token, token_type} = store.getState().userStore;

    if (access_token && token_type) {
      config.headers.Authorization = token_type + ' ' + access_token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

//添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    if (response.data.code === 0) {
      return response.data;
    } else {
      return Promise.resolve(response.data);
    }
  },
  function (error) {
    console.error(error);

    let {message} = error;
    if (message === 'Network Error') {
      message = '网络连接异常';
    } else if (message.includes('timeout')) {
      message = '网络请求超时';
    } else if (message.includes('Request failed with status code')) {
      const errCode = message.substr(message.length - 3);

      if (errCode === '401') {
        message = httpErrorMsg[errCode];
        store.dispatch(clearUserStore());
      } else if (errCode === '404') {
        message = httpErrorMsg[errCode];
        store.dispatch(requestBaseConfig());
      } else {
        message = error.response.data.message || httpErrorMsg[errCode];
      }
    }
    error.message = message;
    store.dispatch(setErrorMsg(message));
    return Promise.reject(error);
  },
);

export default instance;
