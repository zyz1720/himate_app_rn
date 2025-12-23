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
  isShowStatusBarLyric: true, // 是否显示状态栏歌词
  isShowDesktopLyric: false, // 是否显示桌面歌词
  desktopLyricColor: '#ffffff', // 桌面歌词颜色
  desktopLyricFontSize: 16, // 桌面歌词字体大小
  desktopTransColor: '#80ffffff', // 桌面歌词翻译颜色
  desktopTransFontSize: 12, // 桌面歌词翻译字体大小
  statusBarLyricType: 'lrc', // 状态栏歌词类型lrc/trans/roma
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
      setIsShowStatusBarLyric: flag => {
        set({isShowStatusBarLyric: flag ?? true});
      },
      setIsShowDesktopLyric: flag => {
        set({isShowDesktopLyric: flag ?? false});
      },
      setStatusBarLyricType: type => {
        set({statusBarLyricType: type || 'lrc'});
      },
      setDesktopLyricColor: color => {
        set({desktopLyricColor: color || defaultState.desktopLyricColor});
      },
      setDesktopTransColor: color => {
        set({desktopTransColor: color || defaultState.desktopTransColor});
      },
      setDesktopLyricFontSize: size => {
        set({desktopLyricFontSize: size || 24});
      },
      setDesktopTransFontSize: size => {
        set({desktopTransFontSize: size || 18});
      },
      resetDesktopLyric: () => {
        set({
          desktopLyricColor: defaultState.desktopLyricColor,
          desktopLyricFontSize: defaultState.desktopLyricFontSize,
          desktopTransColor: defaultState.desktopTransColor,
          desktopTransFontSize: defaultState.desktopTransFontSize,
        });
      },
    }),
    {
      name: 'setting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
