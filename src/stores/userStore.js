import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {getUserInfo, userLogout} from '@api/user';
import {userRefreshToken} from '@api/login';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  userInfo: {}, // 用户信息
  access_token: null, // 用户token
  refresh_token: null, // 刷新token
  token_type: null, // token类型
  isLogin: false, // 是否登录
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      ...defaultState,
      login: data => {
        const {access_token, refresh_token, token_type} = data || {};
        if (access_token && refresh_token && token_type) {
          set({
            access_token: access_token.trim(),
            refresh_token: refresh_token.trim(),
            token_type: token_type.trim(),
            isLogin: true,
          });
        }
      },
      logout: () => {
        set(defaultState);
      },
      logoff: () => {
        userLogout().then(res => {
          res.code === 0 && set(defaultState);
        });
      },
      setUserInfo: () => {
        getUserInfo().then(res => {
          res.code === 0 && set({userInfo: res.data || {}});
        });
      },
      setRefreshToken: () => {
        userRefreshToken({refresh_token: get().refresh_token})
          .then(res => {
            if (res.code === 0) {
              get().login(res.data);
              return;
            }
            get().logout();
          })
          .catch(() => {
            get().logout();
          });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
