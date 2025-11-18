import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  addStorage,
  delStorage,
  getKeyStorage,
} from '../../utils/common/localStorage';
import {getUserInfo} from '../../api/user';

const defaultState = {
  userInfo: {}, // 用户信息
  access_token: null, // 用户token
  refresh_token: null, // 刷新token
  token_type: null, // token类型
  isLogin: false, // 是否登录
  userLoading: false, // 用户信息加载状态
};

export const userSlice = createSlice({
  name: 'userStore',
  initialState: defaultState,
  extraReducers: builder => {
    builder
      .addCase(initUserStore.pending, state => {
        state.userLoading = true;
      })
      .addCase(initUserStore.fulfilled, (state, action) => {
        const {access_token, refresh_token, token_type} = action.payload || {};
        state.access_token = access_token || null;
        state.refresh_token = refresh_token || null;
        state.token_type = token_type || null;
        state.isLogin = state.access_token && state.refresh_token;
        state.userLoading = false;
      })
      .addCase(initUserStore.rejected, () => defaultState);

    builder
      .addCase(setUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload || {};
      })
      .addCase(setUserInfo.rejected, () => defaultState);
  },
  reducers: {
    setIsLogin: (state, action) => {
      const {access_token, refresh_token, token_type} = action.payload || {};
      state.access_token = access_token || null;
      state.refresh_token = refresh_token || null;
      state.token_type = token_type || null;
      state.isLogin = state.access_token && state.refresh_token;
      addStorage('user', 'access_token', state.access_token);
      addStorage('user', 'refresh_token', state.refresh_token);
      addStorage('user', 'token_type', state.token_type);
    },
    clearUserStore: () => {
      delStorage('user', 'access_token');
      delStorage('user', 'refresh_token');
      delStorage('user', 'token_type');
      return defaultState;
    },
  },
});

export const initUserStore = createAsyncThunk(
  'user/initUserStore',
  async (_, {rejectWithValue}) => {
    try {
      return await getKeyStorage('user');
    } catch (error) {
      console.error(error);
      return rejectWithValue(null); // 错误处理
    }
  },
);

export const setUserInfo = createAsyncThunk(
  'user/setUserInfo',
  async (_, {rejectWithValue}) => {
    try {
      const userRes = await getUserInfo();
      if (userRes.code === 0) {
        return userRes.data;
      } else {
        return rejectWithValue(null);
      }
    } catch (error) {
      console.error(error);
      return rejectWithValue(null);
    }
  },
);

export const {setIsLogin, clearUserStore} = userSlice.actions;

export default userSlice.reducer;
