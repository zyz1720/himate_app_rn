import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSettingStore} from '@store/settingStore';
import {useTranslation} from 'react-i18next';
import Msg from '@pages/message/index';
import Mate from '@pages/mate/index';
import User from '@pages/user/index';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {Colors, TouchableOpacity} from 'react-native-ui-lib';

const Tab = createBottomTabNavigator();

const TabScreen = () => {
  const {themeColor, isFullScreen} = useSettingStore();
  const {t} = useTranslation();

  const renderTabInfo = (name, type, focused = false) => {
    let IconName = '';
    let tablabel = '';
    if (name === 'Msg') {
      IconName = 'comments-o';
      tablabel = t('screen.Msg');
      if (focused) {
        IconName = 'comments';
      }
    }
    if (name === 'Mate') {
      IconName = 'address-book-o';
      tablabel = t('screen.Mate');
      if (focused) {
        IconName = 'address-book';
      }
    }
    if (name === 'User') {
      IconName = 'user-o';
      tablabel = t('screen.User');
      if (focused) {
        IconName = 'user';
      }
    }
    if (type === 'icon') {
      return IconName;
    }
    if (type === 'label') {
      return tablabel;
    }
  };

  const renderTabBarIcon = (route, focused) => (
    <FontAwesome
      name={renderTabInfo(route.name, 'icon', focused)}
      color={focused ? themeColor : Colors.grey10}
      size={20}
    />
  );

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarLabel: renderTabInfo(route.name, 'label'),
        headerShown: !isFullScreen,
        headerStyle: {backgroundColor: themeColor, height: 46},
        headerTitleAlign: 'center',
        headerTitleStyle: {fontSize: 16, color: Colors.white},
        tabBarActiveTintColor: themeColor,
        tabBarIcon: ({focused}) => renderTabBarIcon(route, focused),
      })}>
      <Tab.Screen
        name="Msg"
        options={({navigation}) => ({
          title: t('screen.Msg'),
          headerRight: (
            <TouchableOpacity
              paddingR-16
              onPress={() => navigation.navigate('SearchMsg')}>
              <AntDesign name="search1" color={Colors.white} size={20} />
            </TouchableOpacity>
          ),
        })}
        component={Msg}
      />
      <Tab.Screen
        name="Mate"
        options={({navigation}) => ({
          title: 'Mate',
          headerTitleAlign: 'left',
          headerRight: (
            <TouchableOpacity
              paddingR-12
              onPress={() => navigation.navigate('AddMate')}>
              <FontAwesome name="user-plus" color={Colors.white} size={20} />
            </TouchableOpacity>
          ),
        })}
        component={Mate}
      />
      <Tab.Screen
        name="User"
        options={{
          title: t('screen.UserCenter'),
        }}
        component={User}
      />
    </Tab.Navigator>
  );
};
export default TabScreen;
