import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {fullWidth} from '@style/index';
import {useSettingStore} from '@store/settingStore';
import {displayName} from '@root/app.json';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import StackScreen from './stackScreen';
import MusicScreen from './musicScreen';
import AddMate from '@pages/mate/mate_pages/addMate';
import SearchMsg from '@pages/message/msg_pages/searchMsg';
import BaseWebView from '@pages/common/baseWebView';
import CodeScanner from '@pages/common/codeScanner';
import Setting from '@pages/setting/index';

const Drawer = createDrawerNavigator();

const DrawerScreen = () => {
  const {themeColor, isFullScreen, isMusicApp} = useSettingStore();
  const {t} = useTranslation();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: themeColor,
        swipeEdgeWidth: fullWidth * 0.16,
      }}
      initialRouteName={isMusicApp ? 'Music' : 'Stack'}>
      <Drawer.Screen
        name="Stack"
        options={{
          title: t('screen.Stack'),
          headerShown: false,
        }}
        component={StackScreen}
      />
      <Drawer.Screen
        name="Music"
        options={{
          title: t('screen.Music'),
          headerShown: false,
        }}
        component={MusicScreen}
      />
      <Drawer.Group
        screenOptions={({navigation}) => ({
          headerShown: !isFullScreen,
          headerStyle: {backgroundColor: themeColor, height: 46},
          headerTitleAlign: 'center',
          headerTitleStyle: {fontSize: 16, color: Colors.white},
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity paddingH-26 onPress={() => navigation.goBack()}>
              <FontAwesome name="angle-left" color={Colors.white} size={26} />
            </TouchableOpacity>
          ),
        })}>
        {isFullScreen ? (
          <>
            <Drawer.Screen
              name="CodeScanner"
              options={{
                title: t('screen.CodeScanner'),
              }}
              component={CodeScanner}
            />
            <Drawer.Screen
              name="AddMate"
              options={{
                title: t('screen.AddMate'),
              }}
              component={AddMate}
            />
            <Drawer.Screen
              name="SearchMsg"
              options={{
                title: t('screen.SearchMsg'),
              }}
              component={SearchMsg}
            />
          </>
        ) : null}
        <Drawer.Screen
          name="Setting"
          options={{
            title: t('screen.Setting'),
          }}
          component={Setting}
        />
        <Drawer.Screen
          name="WebView"
          component={BaseWebView}
          options={{
            title: t('common.about') + displayName,
          }}
        />
      </Drawer.Group>
    </Drawer.Navigator>
  );
};
export default DrawerScreen;
