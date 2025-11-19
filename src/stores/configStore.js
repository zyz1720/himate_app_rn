import {create} from 'zustand';
import {getBaseConfig} from '@api/app_config';
import {generateSecretKey} from '@utils/handle/cryptoHandle';

const defaultState = {
  envConfig: {}, // 环境配置
  msgSecretKey: null, // 消息加密密钥
  configLoading: false, // 加载状态
};

export const useConfigStore = create(set => ({
  ...defaultState,
  setConfig: async () => {
    try {
      set({configLoading: true});
      const config = await getBaseConfig();
      set(state => {
        const {MSG_SECRET} = config;
        state.envConfig = config;
        state.msgSecretKey = generateSecretKey(MSG_SECRET);
        return state;
      });
    } catch (error) {
      console.error(error);
    } finally {
      set({configLoading: false});
    }
  },
}));
