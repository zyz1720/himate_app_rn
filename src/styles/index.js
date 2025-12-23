import {Colors} from 'react-native-ui-lib';
import {Dimensions, StatusBar} from 'react-native';

export const fullWidth = Dimensions.get('window').width;
export const fullHeight = Dimensions.get('window').height;
export const statusBarHeight = StatusBar.currentHeight;

export const lyricColors = ['#f5222d', '#52c41a', '#1677ff'];

export const colorList = [
  {id: 1, color: '#f5222d'},
  {id: 2, color: '#fa541c'},
  {id: 3, color: '#ffa940'},
  {id: 4, color: '#faad14'},
  {id: 5, color: '#fadb14'},
  {id: 6, color: '#a0d911'},
  {id: 7, color: '#52c41a'},
  {id: 8, color: '#13c2c2'},
  {id: 9, color: '#1677ff'},
  {id: 10, color: '#2f54eb'},
  {id: 11, color: '#722ed1'},
  {id: 12, color: '#eb2f96'},
];

export const themeColors = {
  primary: colorList[9].color,
  geekBlue: colorList[8].color,
  magenta: colorList[11].color,
  success: Colors.green40,
  warning: Colors.yellow40,
  error: Colors.red40,
  white9: 'rgba(255,255,255,0.9)',
  white6: 'rgba(255,255,255,0.6)',
  white5: 'rgba(255,255,255,0.5)',
  white4: 'rgba(255,255,255,0.4)',
  white3: 'rgba(255,255,255,0.3)',
  white2: 'rgba(255,255,255,0.2)',
  white1: 'rgba(255,255,255,0.1)',
  black8: 'rgba(0,0,0,0.8)',
  black4: 'rgba(0,0,0,0.4)',
  black3: 'rgba(0,0,0,0.3)',
  black2: 'rgba(0,0,0,0.2)',
  black1: 'rgba(0,0,0,0.1)',
  background: '#f0f0f2',
  lyricColor: Colors.white,
};
