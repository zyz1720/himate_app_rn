import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {getUserInfo} from '@api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  userInfo: {}, // 用户信息
  access_token: null, // 用户token
  refresh_token: null, // 刷新token
  token_type: null, // token类型
  isLogin: false, // 是否登录
};

export const useUserStore = create()(
  persist(
    set => ({
      ...defaultState,
      login: data => {
        const {access_token, refresh_token, token_type} = data || {};
        if (access_token && refresh_token && token_type) {
          set({
            access_token,
            refresh_token,
            token_type,
            isLogin: true,
          });
        }
      },
      logout: () => {
        set({
          userInfo: {},
          access_token: null,
          refresh_token: null,
          token_type: null,
          isLogin: false,
        });
      },
      setUserInfo: () => {
        getUserInfo().then(res => {
          res.code === 0 && set({userInfo: res.data || {}});
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
