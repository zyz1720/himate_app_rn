import {create} from 'zustand';
import {getBaseConfig} from '@api/app_config';
import {generateSecretKey} from '@utils/system/crypto_utils';
import {isEmptyObject} from '@utils/common/object_utils';

const defaultState = {
  envConfig: {}, // 环境配置
  msgSecretKey: null, // 消息加密密钥
  configLoading: false, // 加载状态
};

export const useConfigStore = create(set => ({
  ...defaultState,
  setEnvConfig: async () => {
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
  updateEnvConfig: config => {
    set(state => ({
      ...state,
      envConfig: isEmptyObject(config) ? state.envConfig : config,
    }));
  },
}));

// 在应用初始化时获取环境配置
const {setEnvConfig} = useConfigStore.getState();

setEnvConfig();
