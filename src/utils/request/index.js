import axios from 'axios';
import {useUserStore} from '@store/userStore.js';
import {useConfigStore} from '@store/configStore.js';
import {useErrorMsgStore} from '@store/errorMsgStore.js';
import {API_PREFIX} from '@env';
import i18n from 'i18next';

const {envConfig, access_token, token_type} = useConfigStore.getState();
const {setErrorMsg} = useErrorMsgStore.getState();
const {logout} = useUserStore.getState();

// 创建axios实例
console.log('BASE_URL ', envConfig?.BASE_URL);

const instance = axios.create({
  baseURL: envConfig?.BASE_URL + API_PREFIX,
  timeout: 30000,
});

// 添加请求拦截器
instance.interceptors.request.use(
  function (requestConfig) {
    if (access_token && token_type) {
      requestConfig.headers.Authorization = token_type + ' ' + access_token;
    }
    return requestConfig;
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

    let {message} = error?.response?.data || {};
    const status = error?.response?.status || 0;
    if (!message) {
      if (message === 'Network Error') {
        message = i18n.t('httpError.network');
      } else if (message.includes('timeout')) {
        message = i18n.t('httpError.timeout');
      } else if (message.includes('Request failed with status code')) {
        const errCode = message.substr(message.length - 3);
        message = i18n.t('httpError.status', {code: errCode});
      }
    }
    if (status === 401) {
      logout();
    }
    setErrorMsg(message);
    return Promise.reject(error);
  },
);

export default instance;
