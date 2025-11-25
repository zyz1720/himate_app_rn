import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Colors} from 'react-native-ui-lib';
import {themeColors} from '@style/index';
import {getLocales} from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

const locales = getLocales();
const systemLanguage = locales[0].languageCode;

const defaultState = {
  themeColor: themeColors.primary, // 主题色
  language: 'zh', // 语言
  isFollowSystemLanguage: true, // 是否跟随系统语言
  toastType: 'system', // 通知类型
  isPlaySound: true, // 是否播放铃声
  isFullScreen: false, // 是否全屏
  notSaveMsg: false, // 是否保存消息
  isEncryptMsg: true, // 是否加密消息
  isFastStatic: false, // 是否快速静态
  isMusicApp: false, // 是否为音乐应用
  ringtone: 'default_1.mp3', // 铃声
};

export const useSettingStore = create(
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
        set({toastType: type || 'system'});
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
      setIsMusicApp: flag => {
        set({isMusicApp: flag ?? false});
      },
      setRingtone: ringtone => {
        set({ringtone: ringtone || get().ringtone});
      },
      setLanguage: lang => {
        set({language: lang || 'zh'});
      },
      setIsFollowSystemLanguage: flag => {
        set({isFollowSystemLanguage: flag ?? true});
        if (flag) {
          set({language: systemLanguage === 'zh' ? 'zh' : 'en'});
        }
      },
      initThemeColors: () => {
        Colors.loadColors({...themeColors, primary: get().themeColor});
      },
      initLanguage: async () => {
        if (get().isFollowSystemLanguage) {
          set({language: systemLanguage === 'zh' ? 'zh' : 'en'});
        }
      },
    }),
    {
      name: 'setting-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: async state => {
        if (state) {
          console.log(state);
        }
      },
    },
  ),
);

const {initThemeColors, initLanguage} = useSettingStore.getState();

initThemeColors();
initLanguage();
