import {Colors} from 'react-native-ui-lib';
import {Dimensions, StatusBar} from 'react-native';

export const fullWidth = Dimensions.get('window').width;
export const fullHeight = Dimensions.get('window').height;
export const statusBarHeight = StatusBar.currentHeight;

export const themeColors = {
  primary: '#5A48F4',
  geekblue: '#2f54eb',
  magenta: '#eb2f96',
  success: Colors.green40,
  warning: Colors.yellow40,
  error: Colors.red40,
  loadingWhite: 'rgba(255,255,255,0.9)',
  loadingGrey: 'rgba(0,0,0,0.8)',
  hyalineWhite: 'rgba(255,255,255,0.4)',
  hyalineGrey: 'rgba(0,0,0,0.4)',
  background: '#f0f0f2',
  lyricColor: Colors.white,
};

/* 设置系统主题色 */
export const SystemThemeInit = color => {
  Colors.loadColors({...themeColors, primary: color || themeColors.primary});
};
