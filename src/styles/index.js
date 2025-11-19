import {Colors} from 'react-native-ui-lib';
import {Dimensions, StatusBar} from 'react-native';

export const fullWidth = Dimensions.get('window').width;
export const fullHeight = Dimensions.get('window').height;
export const statusBarHeight = StatusBar.currentHeight;

export const themeColors = {
  primary: '#2f54eb',
  geekBlue: '#2f54eb',
  magenta: '#eb2f96',
  success: Colors.green40,
  warning: Colors.yellow40,
  error: Colors.red40,
  white9: 'rgba(255,255,255,0.9)',
  black8: 'rgba(0,0,0,0.8)',
  white4: 'rgba(255,255,255,0.4)',
  black4: 'rgba(0,0,0,0.4)',
  black3: 'rgba(0,0,0,0.3)',
  background: '#f0f0f2',
  lyricColor: Colors.white,
};
