import {NativeModules, NativeEventEmitter} from 'react-native';
import {useSettingStore} from '@store/settingStore';

const {FloatingLyric} = NativeModules;
const floatingLyricEmitter = new NativeEventEmitter(FloatingLyric);

export const useFloatingLyric = () => {
  const {
    desktopLyricColor,
    desktopTransColor,
    desktopLyricFontSize,
    desktopTransFontSize,
  } = useSettingStore();

  // 显示悬浮歌词窗口
  const showWidget = () => {
    FloatingLyric.showWidget();
    FloatingLyric.setLyricColor(desktopLyricColor);
    FloatingLyric.setLyricFontSize(desktopLyricFontSize);
    FloatingLyric.setTranslationColor(desktopTransColor);
    FloatingLyric.setTranslationFontSize(desktopTransFontSize);
  };

  // 隐藏悬浮歌词窗口
  const hideWidget = () => {
    FloatingLyric.hideWidget();
  };

  // 更新歌词内容
  const updateLyric = (lyric, translation = '') => {
    FloatingLyric.updateLyric(lyric, translation);
  };

  // 检查悬浮窗权限
  const checkOverlayPermission = () => {
    return new Promise(resolve => {
      FloatingLyric.checkOverlayPermission(hasPermission => {
        resolve(hasPermission);
      });
    });
  };

  // 请求悬浮窗权限
  const requestOverlayPermission = () => {
    FloatingLyric.requestOverlayPermission();
  };

  // 添加点击事件监听器
  const addOnClickListener = callback => {
    return floatingLyricEmitter.addListener('onFloatingLyricClick', callback);
  };

  // 设置歌词颜色
  const setLyricColor = color => {
    FloatingLyric.setLyricColor(color);
  };

  // 设置歌词字体大小
  const setLyricFontSize = size => {
    FloatingLyric.setLyricFontSize(size);
  };

  // 设置翻译歌词颜色
  const setTranslationColor = color => {
    FloatingLyric.setTranslationColor(color);
  };

  // 设置翻译歌词字体大小
  const setTranslationFontSize = size => {
    FloatingLyric.setTranslationFontSize(size);
  };

  return {
    showWidget,
    hideWidget,
    updateLyric,
    checkOverlayPermission,
    requestOverlayPermission,
    addOnClickListener,
    setLyricColor,
    setLyricFontSize,
    setTranslationColor,
    setTranslationFontSize,
  };
};
