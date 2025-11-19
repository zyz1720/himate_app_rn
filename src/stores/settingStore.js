import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Colors} from 'react-native-ui-lib';
import {themeColors} from '@style/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  themeColor: themeColors.primary, // 主题色
  toastType: 'System', // 通知类型
  isPlaySound: true, // 是否播放铃声
  isFullScreen: false, // 是否全屏
  notSaveMsg: false, // 是否保存消息
  isEncryptMsg: true, // 是否加密消息
  isFastStatic: false, // 是否快速静态
  isMusicApp: false, // 是否为音乐应用
};

export const useSettingStore = create()(
  persist(
    (set, get) => ({
      ...defaultState,
      setThemeColor: color => {
        Colors.loadColors({
          ...themeColors,
          primary: color || themeColors.primary,
        });
        set({themeColor: color || themeColors.primary});
      },
      setToastType: type => {
        set({toastType: type || 'System'});
      },
      setIsPlaySound: flag => {
        set({isPlaySound: flag ?? true});
      },
      setIsFullScreen: flag => {
        set({isFullScreen: flag ?? false});
      },
      setNotSaveMsg: flag => {
        set({notSaveMsg: flag ?? false});
      },
      setIsEncryptMsg: flag => {
        set({isEncryptMsg: flag ?? true});
      },
      setIsFastStatic: flag => {
        set({isFastStatic: flag ?? false});
      },
      initThemeColors: () => {
        Colors.loadColors({...themeColors, primary: get().themeColor});
      },
    }),
    {
      name: 'setting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
