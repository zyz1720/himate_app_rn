import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useSettingStore} from '@store/settingStore';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreen from './tabScreen';
import EditUser from '@pages/user/user_pages/editUser';
import AccountSafe from '@pages/user/user_pages/accountSafe';
import BaseQRCode from '@pages/user/user_pages/qrCode';
import AddMate from '@pages/mate/mate_pages/addMate';
import MateInfo from '@pages/mate/mate_pages/mateInfo';
import NewMate from '@pages/mate/mate_pages/newMate';
import Chat from '@pages/message/msg_pages/chat';
import ChatHistory from '@pages/message/msg_pages/chatHistory';
import CreateGroup from '@pages/group/createGroup';
import GroupInfo from '@pages/group/groupInfo';
import GroupList from '@pages/group/groupList';
import SearchMsg from '@pages/message/msg_pages/searchMsg';
import ChatMsg from '@pages/user/user_pages/chatMsg';
import DataManager from '@pages/user/user_pages/dataManager';
import BasePdfView from '@pages/common/basePdfView';

const Stack = createStackNavigator();

function StackScreen() {
  const {themeColor, isFullScreen} = useSettingStore();
  const {t} = useTranslation();

  return (
    <Stack.Navigator initialRouteName="TabBar">
      <Stack.Screen
        name="TabBar"
        component={TabScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Group
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
        {/* 用户 */}
        <Stack.Group>
          <Stack.Screen
            name="EditUser"
            component={EditUser}
            options={{
              title: t('screen.EditUser'),
            }}
          />
          <Stack.Screen
            name="UserSafe"
            component={AccountSafe}
            options={{
              title: t('screen.UserSafe'),
            }}
          />
          <Stack.Screen
            name="QrCode"
            component={BaseQRCode}
            options={{
              title: t('screen.QrCode'),
            }}
          />
          <Stack.Screen
            name="ChatMsg"
            component={ChatMsg}
            options={{
              title: t('screen.ChatMsg'),
            }}
          />
          <Stack.Screen
            name="DataManager"
            component={DataManager}
            options={{
              title: t('screen.DataManager'),
            }}
          />
        </Stack.Group>

        {/* 好友 */}
        <Stack.Group>
          <Stack.Screen
            name="AddMate"
            component={AddMate}
            options={{
              title: t('screen.AddMate'),
            }}
          />
          <Stack.Screen
            name="MateInfo"
            component={MateInfo}
            options={{
              title: t('screen.MateInfo'),
            }}
          />
          <Stack.Screen
            name="NewMate"
            component={NewMate}
            options={{
              title: t('screen.NewMate'),
            }}
          />
        </Stack.Group>

        {/* 消息 */}
        <Stack.Group>
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={({route, navigation}) => ({
              title: route.params.session_name,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerRight: () => (
                <TouchableOpacity
                  paddingR-16
                  onPress={() => {
                    if (route.params.chat_type === 'private') {
                      navigation.navigate('ChatHistory', route.params);
                    }
                    if (route.params.chat_type === 'group') {
                      navigation.navigate('GroupInfo', route.params);
                    }
                  }}>
                  <FontAwesome name="reorder" color={Colors.white} size={20} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ChatHistory"
            component={ChatHistory}
            options={{
              title: t('screen.ChatHistory'),
            }}
          />
          <Stack.Screen
            name="SearchMsg"
            component={SearchMsg}
            options={{
              title: t('screen.SearchMsg'),
            }}
          />
        </Stack.Group>

        {/* 群组 */}
        <Stack.Group>
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroup}
            options={({route}) => ({
              title: route.params.isCreate
                ? t('screen.CreateGroup')
                : t('screen.InviteNewMember'),
            })}
          />
          <Stack.Screen
            name="GroupInfo"
            component={GroupInfo}
            options={{
              title: t('screen.GroupInfo'),
            }}
          />
          <Stack.Screen
            name="GroupList"
            component={GroupList}
            options={{
              title: t('screen.GroupList'),
            }}
          />
        </Stack.Group>

        <Stack.Screen
          name="PdfView"
          component={BasePdfView}
          options={{
            title: t('screen.PdfView'),
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default StackScreen;
