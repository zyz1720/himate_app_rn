import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useSettingStore} from '@store/settingStore';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Music from '@pages/music';
import FindFavorites from '@pages/music/music_pages/findFavorites';
import LatelyMusic from '@pages/music/music_pages/latelyMusic';
import LocalMusic from '@pages/music/music_pages/localMusic';
import MyFavorites from '@pages/music/music_pages/myFavorites';
import SearchMusic from '@pages/music/music_pages/searchMusic';
import FavoritesDetail from '@pages/music/music_pages/favoritesDetail';
import EditFavorites from '@pages/music/music_pages/editFavorites';

const Stack = createStackNavigator();

function MusicScreen() {
  const {themeColor, isFullScreen} = useSettingStore();
  const {t} = useTranslation();

  return (
    <Stack.Navigator initialRouteName="MusicHome">
      <Stack.Group
        screenOptions={{
          headerShown: !isFullScreen,
          headerStyle: {backgroundColor: themeColor, height: 46},
          headerTitleAlign: 'center',
          headerTitleStyle: {fontSize: 16, color: Colors.white},
        }}>
        <Stack.Screen
          name="MusicHome"
          component={Music}
          options={{
            title: t('screen.Music'),
          }}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={({navigation}) => ({
          headerShown: !isFullScreen,
          headerStyle: {backgroundColor: themeColor, height: 46},
          headerTitleAlign: 'center',
          headerTitleStyle: {fontSize: 16, color: Colors.white},
          headerLeft: (
            <TouchableOpacity paddingH-26 onPress={() => navigation.goBack()}>
              <FontAwesome name="angle-left" color={Colors.white} size={26} />
            </TouchableOpacity>
          ),
        })}>
        <Stack.Screen
          name="FindFavorites"
          component={FindFavorites}
          options={{
            title: t('screen.FindFavorites'),
          }}
        />
        <Stack.Screen
          name="LatelyMusic"
          component={LatelyMusic}
          options={{
            title: t('screen.LatelyMusic'),
          }}
        />
        <Stack.Screen
          name="LocalMusic"
          component={LocalMusic}
          options={{
            title: t('screen.LocalMusic'),
          }}
        />
        <Stack.Screen
          name="MyFavorites"
          component={MyFavorites}
          options={{
            title: t('screen.MyFavorites'),
          }}
        />
        <Stack.Screen
          name="SearchMusic"
          component={SearchMusic}
          options={{
            title: t('screen.SearchMusic'),
          }}
        />
        <Stack.Screen
          name="FavoritesDetail"
          component={FavoritesDetail}
          options={{
            title: t('screen.FavoritesDetail'),
          }}
        />
        <Stack.Screen
          name="EditFavorites"
          component={EditFavorites}
          options={{
            title: t('screen.EditFavorites'),
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default MusicScreen;
