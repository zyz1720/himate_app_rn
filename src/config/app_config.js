import axios from 'axios';
import {
  COULD_URL,
  COULD_SECRET,
  MSG_SECRET,
  BASE_URL,
  SOCKET_URL,
  STATIC_URL,
  FAST_STATIC_URL,
  THUMBNAIL_URL,
} from '@env';

// 默认配置对象
export const defaultConfig = {
  MSG_SECRET,
  BASE_URL,
  SOCKET_URL,
  STATIC_URL,
  FAST_STATIC_URL,
  THUMBNAIL_URL,
};

/**
 * 获取app配置
 * @returns {Promise<Object>} 配置对象
 */
export const getAppConfig = async () => {
  if (!COULD_URL) {
    return defaultConfig;
  }
  try {
    const response = await axios(COULD_URL, {
      method: 'GET',
      headers: {Authorization: COULD_SECRET},
    });
    const cloudConfig = response.data;
    return cloudConfig;
  } catch (error) {
    console.error('获取云端配置失败:', error);
    return defaultConfig;
  }
};
