import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Colors,
  TouchableOpacity,
} from 'react-native-ui-lib';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {GroupRoleEnum} from '@const/database_enum';
import {getGroupList} from '@api/group';
import {useTranslation} from 'react-i18next';
import {useConfigStore} from '@store/configStore';
import FullScreenLoading from '@components/common/FullScreenLoading';
import BaseTopBar from '@components/common/BaseTopBar';
import dayjs from 'dayjs';

const GroupList = ({navigation}) => {
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  // 群聊列表
  const [focusedIndex, setFocusedIndex] = useState(0);

  /* 顶部导航栏 */
  const routes = [
    {
      key: GroupRoleEnum.owner,
      title: t('group.group_owner'),
      screen: listScreen,
    },
    {
      key: GroupRoleEnum.admin,
      title: t('group.group_admin'),
      screen: listScreen,
    },
    {
      key: GroupRoleEnum.member,
      title: t('group.group_member'),
      screen: listScreen,
    },
  ];

  const {list, loading, onEndReached, refreshData} =
    useInfiniteScroll(getGroupList);

  const renderGroupItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      padding-10
      flexS
      backgroundColor={Colors.white}
      spread
      row
      centerV
      onPress={() => {
        navigation.navigate('Chat', {
          session_id: item.group_id,
          session_name: item.group_name,
          chat_type: 'group',
        });
      }}>
      <View flexS row centerV>
        <Avatar source={{uri: envConfig.STATIC_URL + item.group_avatar}} />
        <View marginL-10>
          <Text text70>{item.group_name}</Text>
        </View>
      </View>
      <View>
        <Text grey40 text90L>
          {dayjs(item.create_time).format('YYYY/MM/DD')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const listScreen = (
    <FlatList
      data={list}
      renderItem={renderGroupItem}
      keyExtractor={(item, index) => item?.id + index}
      onEndReached={onEndReached}
      ListEmptyComponent={
        <View marginT-16 center>
          <Text text90L grey40>
            {t('empty.group')}
          </Text>
        </View>
      }
    />
  );

  return (
    <>
      {loading ? (
        <FullScreenLoading />
      ) : (
        <BaseTopBar
          routes={routes}
          focusIndex={focusedIndex}
          onChange={index => {
            setFocusedIndex(index);
            refreshData({
              member_role: routes[index].key,
            });
          }}
        />
      )}
    </>
  );
};

export default GroupList;
