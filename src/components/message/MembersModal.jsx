import React, {useEffect} from 'react';
import {FlatList, Modal, StyleSheet} from 'react-native';
import {
  Colors,
  TouchableOpacity,
  Avatar,
  Text,
  View,
  Button,
} from 'react-native-ui-lib';
import {useConfigStore} from '@store/configStore';
import {useScreenDimensionsContext} from '@components/contexts/ScreenDimensionsContext';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {getGroupMembers} from '@api/group_member';
import {GroupRoleEnum} from '@const/database_enum';

const styles = StyleSheet.create({
  memberDialog: {
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

const MembersModal = props => {
  const {
    onPress = () => {},
    visible = false,
    setVisible = () => {},
    groupId,
    oneselfUserId,
  } = props;
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();
  const {fullHeight, fullWidth} = useScreenDimensionsContext();

  const getGroupMembersList = async () => {
    return getGroupMembers(groupId);
  };

  const {list, onEndReached, refreshData} =
    useInfiniteScroll(getGroupMembersList);

  /* 渲染成员列表 */
  const renderMemberList = ({item}) => {
    return (
      <TouchableOpacity
        flexS
        row
        centerV
        backgroundColor={Colors.white}
        paddingH-12
        paddingV-6
        onPress={() => {
          onPress({
            remark: item.member_remarks,
            id: item.user_id,
          });
        }}>
        <Avatar
          size={46}
          source={{
            uri: envConfig.STATIC_URL + item?.user?.user_avatar,
          }}
          imageProps={{errorSource: require('@assets/images/empty.jpg')}}
          backgroundColor={Colors.transparent}
          ribbonLabel={
            item.member_role === GroupRoleEnum.owner
              ? t('group.owner')
              : item.member_role === GroupRoleEnum.admin
              ? t('group.admin')
              : null
          }
          ribbonStyle={{
            backgroundColor:
              item.member_role === GroupRoleEnum.owner
                ? Colors.primary
                : item.member_role === GroupRoleEnum.admin
                ? Colors.yellow30
                : null,
          }}
        />
        <Text marginL-28 text80 grey10>
          {item?.member_remarks}
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setVisible(false);
      }}>
      <View
        height={fullHeight * 0.6}
        width={fullWidth}
        style={styles.memberDialog}>
        <View flexS row centerV spread paddingH-16 height={60}>
          <Text grey30>{t('chat.msg_mention')}</Text>
          <Button
            label={t('common.cancel')}
            size={'small'}
            color={Colors.blue30}
            link
            onPress={() => setVisible(false)}
          />
        </View>
        <FlatList
          data={list.filter(item => item.user.id !== oneselfUserId)}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.8}
          renderItem={renderMemberList}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <View marginT-16 center>
              <Text text90L grey40>
                {t('empty.group_member')}
              </Text>
            </View>
          }
          ListFooterComponent={<View marginB-100 />}
        />
      </View>
    </Modal>
  );
};

export default MembersModal;
