import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  showMusicCtrl: false, // 是否显示音乐控制器
  closeTime: 0, // 关闭时间
  isClosed: false, // 是否关闭
  randomNum: {min: 0, max: 1}, // 随机数范围
  switchCount: 0, // 切换次数
  isRandomPlay: false, // 是否随机播放
  musicPlayMode: 'order', // 列表播放类型 single order random
  isMusicResumePlay: false, // 是否恢复播放
  isMusicBreak: false, // 是否暂停
};

export const useMusicStore = create(
  persist(
    (set, get) => ({
      ...defaultState,
      setShowMusicCtrl: router => {
        if (router.includes('Music') || router.includes('Favorites')) {
          set({showMusicCtrl: true});
        } else {
          set({showMusicCtrl: false});
        }
      },
      setCloseTime: time => set({closeTime: time || 0}),
      setIsClosed: flag => set({isClosed: flag ?? false}),
      setRandomNum: (min = 0, max = 1) => set({randomNum: {min, max}}),
      setIsRandomPlay: flag => set({isRandomPlay: flag ?? false}),
      setSwitchCount: count => set({switchCount: count || 0}),
      setIsMusicResumePlay: flag => set({isMusicResumePlay: flag ?? false}),
      setIsMusicBreak: flag => set({isMusicBreak: flag ?? false}),
      setMusicPlayMode: mode => set({musicPlayMode: mode || 'order'}),
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        switchCount: state.switchCount,
        musicPlayMode: state.musicPlayMode,
      }),
    },
  ),
);
