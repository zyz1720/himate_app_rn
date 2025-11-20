import * as React from 'react';
import {Platform} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {createStackNavigator} from '@react-navigation/stack';
import {useUserStore} from '@store/userStore';
import {useSettingStore} from '@store/settingStore';
import {useMusicStore} from '@store/musicStore';
import {useTranslation} from 'react-i18next';
import {displayName} from '@root/app.json';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BootSplash from 'react-native-bootsplash';
import Login from '@pages/login/login';
import DrawerScreen from './screens/DrawerScreen';
import BaseWebView from '@pages/common/baseWebView';

const Stack = createStackNavigator();

const RootScreen = () => {
  const {t} = useTranslation();
  const {isLogin} = useUserStore();
  const {themeColor, isFullScreen} = useSettingStore();
  const {setShowMusicCtrl} = useMusicStore();
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        BootSplash.hide();
        const curRouteName = navigationRef.current.getCurrentRoute().name;
        setShowMusicCtrl(curRouteName);
      }}
      onStateChange={async () => {
        const curRouteName = navigationRef.current.getCurrentRoute().name;
        setShowMusicCtrl(curRouteName);
      }}>
      <Stack.Navigator>
        {isLogin ? (
          <Stack.Screen
            name="Root"
            component={DrawerScreen}
            options={{
              headerShown: Platform.OS === 'ios' ? true : false,
              headerStatusBarHeight: 0,
              headerStyle: {
                backgroundColor: isLogin
                  ? isFullScreen
                    ? Colors.background
                    : themeColor
                  : Colors.white,
              },
              title: displayName,
            }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
              title: t('screen.Login'),
            }}
          />
        )}
        {/*  公共屏幕 */}
        <Stack.Group
          screenOptions={({navigation}) => ({
            headerLeft: (
              <TouchableOpacity paddingH-26 onPress={() => navigation.goBack()}>
                <FontAwesome
                  name="angle-left"
                  color={isLogin ? Colors.white : Colors.black}
                  size={26}
                />
              </TouchableOpacity>
            ),
          })}>
          <Stack.Screen
            name="WebView"
            component={BaseWebView}
            options={({route}) => ({
              title: route.params?.title || displayName,
            })}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootScreen;
