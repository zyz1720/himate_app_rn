import axios from 'axios';
import {useUserStore} from '@store/userStore.js';
import {useConfigStore} from '@store/configStore.js';
import {useErrorMsgStore} from '@store/errorMsgStore.js';
import {useAppStateStore} from '@store/appStateStore.js';
import {useSettingStore} from '@store/settingStore.js';
import {API_PREFIX} from '@env';
import i18n from 'i18next';

// 创建axios实例
const instance = axios.create();

// 添加请求拦截器
instance.interceptors.request.use(
  function (requestConfig) {
    const {networkIsConnected} = useAppStateStore.getState();
    if (!networkIsConnected) {
      return Promise.reject({
        message: 'The network is not connected',
        status: 500,
      });
    }

    const {envConfig} = useConfigStore.getState();
    const {language} = useSettingStore.getState();
    const {access_token, token_type} = useUserStore.getState();

    console.log('BASE_URL ', envConfig?.BASE_URL);

    if (envConfig?.BASE_URL) {
      requestConfig.baseURL = envConfig.BASE_URL + API_PREFIX;
      requestConfig.timeout = 16000;
    }

    if (access_token && token_type) {
      requestConfig.headers.Authorization = token_type + ' ' + access_token;
    }
    requestConfig.headers['x-custom-lang'] = language;
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
    console.error('httpError ', error);

    const {setRefreshToken} = useUserStore.getState();
    const {setErrorMsg} = useErrorMsgStore.getState();

    const resMessage = error.response?.data?.message;
    let {message, status} = error;

    if (message === 'The network is not connected') {
      message = i18n.t('httpError.unConnected');
    } else if (message === 'Network Error') {
      message = i18n.t('httpError.network');
    } else if (message.includes('timeout')) {
      message = i18n.t('httpError.timeout');
    } else if (message.includes('Request failed with status code')) {
      const errCode = message.substr(message.length - 3);
      message = i18n.t('httpError.status', {code: errCode});
    }

    if (status === 401) {
      setRefreshToken();
      return Promise.reject(error);
    }

    if (resMessage) {
      message = resMessage;
    }

    setErrorMsg(message);
    return Promise.reject(error);
  },
);

export default instance;
