import {getMusicDetail} from '@api/music';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {isEmptyObject} from '@utils/common/object_utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  playingMusic: {}, // 当前播放音乐
  playList: [], // 播放列表
  showMusicCtrl: false, // 是否显示音乐控制器
  closeTime: 0, // 关闭时间
  isClosed: false, // 是否关闭
  randomNum: {min: 0, max: 1}, // 随机数范围
  isRandomPlay: false, // 是否随机播放
  switchCount: 0, // 切换次数
};

export const useMusicStore = create()(
  persist(
    set => ({
      ...defaultState,
      setPlayList: playList => set({playList}),
      addPlayList: (playList = []) =>
        set(state => {
          playList.forEach(item => {
            if (!state.playList.some(e => e?.id === item?.id)) {
              state.playList.push(item);
            }
          });
          return state;
        }),
      unshiftPlayList: (playList = []) =>
        set(state => {
          playList.forEach(item => {
            if (!state.playList.some(e => e?.id === item?.id)) {
              state.playList.unshift(item);
            }
          });
          return state;
        }),
      removePlayList: (playList = []) =>
        set(state => {
          playList.forEach(item => {
            const index = state.playList.findIndex(e => e?.id === item?.id);
            if (index > -1) {
              state.playList.splice(index, 1);
            }
          });
          return state;
        }),
      setShowMusicCtrl: showMusicCtrl => set({showMusicCtrl}),
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        switchCount: state.switchCount,
      }),
    },
  ),
);

export const musicSlice = createSlice({
  name: 'musicStore',
  initialState: defaultState,
  extraReducers: builder => {
    builder
      .addCase(initMusicStore.fulfilled, (_, action) => {
        const {switchCount} = action.payload || {};
        return {...defaultState, switchCount: switchCount || 0};
      })
      .addCase(initMusicStore.rejected, () => defaultState);

    builder.addCase(setPlayingMusic.fulfilled, (state, action) => {
      state.playingMusic = action.payload || {};
      if (isEmptyObject(state.playingMusic)) {
        return state;
      }
      state.playingMusic.playtime = Date.now();
    });
  },
  reducers: {
    setPlayList: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.playList = action.payload;
      }
    },
    setSwitchCount: (state, action) => {
      state.switchCount = action.payload || 0;
      addStorage('music', 'switchCount', state.switchCount);
    },
    addPlayList: (state, action) => {
      if (action.payload?.length > 0) {
        action.payload.forEach(item => {
          if (!state.playList.some(e => e?.id === item?.id)) {
            state.playList.push(item);
          }
        });
      }
    },
    unshiftPlayList: (state, action) => {
      if (action.payload?.length > 0) {
        action.payload.forEach(item => {
          if (!state.playList.some(e => e?.id === item?.id)) {
            state.playList.unshift(item);
          }
        });
      }
    },
    removePlayList: (state, action) => {
      if (action.payload?.length > 0) {
        action.payload.forEach(item => {
          const index = state.playList.findIndex(e => e?.id === item?.id);
          if (index > -1) {
            state.playList.splice(index, 1);
          }
        });
      }
    },
    setShowMusicCtrl: (state, action) => {
      if (
        action.payload.includes('Music') ||
        action.payload.includes('Favorites')
      ) {
        state.showMusicCtrl = true;
      } else {
        state.showMusicCtrl = false;
      }
    },
    setCloseTime: (state, action) => {
      state.closeTime = action.payload || 0;
    },
    setIsClosed: (state, action) => {
      state.isClosed = action.payload ?? false;
    },
    setIsRandomPlay: (state, action) => {
      state.isRandomPlay = action.payload ?? false;
    },
    setRandomNum: (state, action) => {
      state.randomNum = action.payload || {min: 0, max: 1};
    },
  },
});

export const initMusicStore = createAsyncThunk(
  'music/initMusicStore',
  async (_, {rejectWithValue}) => {
    try {
      return await getKeyStorage('music');
    } catch (error) {
      console.error(error);
      return rejectWithValue(null); // 错误处理
    }
  },
);

export const setPlayingMusic = createAsyncThunk(
  'music/fetchMusicDetail',
  async music => {
    try {
      const {id} = music || {};
      if (!id || typeof id !== 'number') {
        return music;
      }
      const response = await getMusicDetail({id});
      if (response.success) {
        return response.data;
      } else {
        return music;
      }
    } catch (error) {
      console.error(error);
      return music; // 错误处理
    }
  },
);

export const {
  setSwitchCount,
  setPlayList,
  addPlayList,
  unshiftPlayList,
  removePlayList,
  setShowMusicCtrl,
  setCloseTime,
  setIsClosed,
  setIsRandomPlay,
  setRandomNum,
} = musicSlice.actions;

export default musicSlice.reducer;
