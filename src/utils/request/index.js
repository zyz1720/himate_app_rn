import axios from 'axios';
import {useUserStore} from '@store/userStore.js';
import {useConfigStore} from '@store/configStore.js';
import {useErrorMsgStore} from '@store/errorMsgStore.js';
import {API_PREFIX} from '@env';
import i18n from 'i18next';

// 创建axios实例
const instance = axios.create();

// 添加请求拦截器
instance.interceptors.request.use(
  function (requestConfig) {
    const {envConfig} = useConfigStore.getState();
    const {access_token, token_type} = useUserStore.getState();

    console.log('BASE_URL ', envConfig?.BASE_URL);

    if (envConfig?.BASE_URL) {
      requestConfig.baseURL = envConfig.BASE_URL + API_PREFIX;
      requestConfig.timeout = 30000;
    }

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

    const {setRefreshToken} = useUserStore.getState();
    const {setErrorMsg} = useErrorMsgStore.getState();

    const resMessage = error.response?.data?.message;
    let {message, status} = error;

    if (message === 'Network Error') {
      message = i18n.t('httpError.network');
    } else if (message.includes('timeout')) {
      message = i18n.t('httpError.timeout');
    } else if (message.includes('Request failed with status code')) {
      const errCode = message.substr(message.length - 3);
      message = i18n.t('httpError.status', {code: errCode});
    }

    if (status === 401) {
      setRefreshToken();
    }
    if (resMessage) {
      message = resMessage;
    }

    setErrorMsg(message);
    return Promise.reject(error);
  },
);

export default instance;
