import {getMusicDetail} from '@api/music';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  playingMusic: {}, // 当前播放音乐
  playList: [], // 播放列表
  showMusicCtrl: false, // 是否显示音乐控制器
  alwaysShowMusicCtrl: false, // 是否一直显示音乐控制器
  closeTime: 0, // 关闭时间
  isClosed: false, // 是否关闭
  randomNum: {min: 0, max: 1}, // 随机数范围
  isRandomPlay: false, // 是否随机播放
  switchCount: 0, // 切换次数
};

export const useMusicStore = create(
  persist(
    set => ({
      ...defaultState,
      setPlayingMusic: music => {
        if (typeof music?.id === 'string') {
          return set({playingMusic: music || {}});
        }
        getMusicDetail(music?.id).then(res => {
          res.code === 0 && set({playingMusic: res.data || {}});
        });
      },
      setPlayList: (list = []) => set({playList: list}),
      addPlayList: (list = []) =>
        set(state => {
          list.forEach(item => {
            if (!state.playList.some(e => e?.id === item?.id)) {
              state.playList.push(item);
            }
          });
          return state;
        }),
      unshiftPlayList: (list = []) =>
        set(state => {
          list.forEach(item => {
            if (!state.playList.some(e => e?.id === item?.id)) {
              state.playList.unshift(item);
            }
          });
          return state;
        }),
      removePlayList: (list = []) =>
        set(state => {
          list.forEach(item => {
            const index = state.playList.findIndex(e => e?.id === item?.id);
            if (index > -1) {
              state.playList.splice(index, 1);
            }
          });
          return state;
        }),
      setShowMusicCtrl: router => {
        set(state => {
          if (!state.alwaysShowMusicCtrl) {
            if (router.includes('Music') || router.includes('Favorites')) {
              state.showMusicCtrl = true;
            } else {
              state.showMusicCtrl = false;
            }
          }
          return state;
        });
      },
      setCloseTime: time => set({closeTime: time || 0}),
      setIsClosed: flag => set({isClosed: flag ?? false}),
      setRandomNum: (min = 0, max = 1) => set({randomNum: {min, max}}),
      setIsRandomPlay: flag => set({isRandomPlay: flag ?? false}),
      setSwitchCount: count => set({switchCount: count || 0}),
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
