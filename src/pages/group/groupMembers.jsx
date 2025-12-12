import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, RefreshControl} from 'react-native';
import {
  View,
  Checkbox,
  Button,
  TouchableOpacity,
  Colors,
  Text,
  Avatar,
  Drawer,
  Badge,
} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {GroupRoleEnum, MemberStatusEnum} from '@const/database_enum';
import {
  getGroupMembers,
  deleteGroupMembers,
  editGroupMemberAuth,
} from '@api/group_member';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BaseDialog from '@components/common/BaseDialog';
import dayjs from 'dayjs';

const GroupMembers = ({navigation, route}) => {
  const {
    groupId,
    excludeIds = [],
    memberRole = GroupRoleEnum.member,
  } = route.params || {};

  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  const {showToast} = useToast();

  const [delVisible, setDelVisible] = useState(false);

  // 多选
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAllSelect, setIsAllSelect] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  /* 删除文件 */
  const removeMembers = async () => {
    if (selectedIds.length === 0) {
      showToast(t('empty.select'), 'warning');
      return;
    }
    const delRes = await deleteGroupMembers(groupId, {
      ids: selectedIds,
    });
    if (delRes.code === 0) {
      showToast(
        t('group.delete_member_success', {num: selectedIds.length}),
        'success',
      );
      refreshData();
    } else {
      showToast(delRes.message, 'error');
    }
    setIsAllSelect(false);
    setSelectedIds([]);
    setIsMultiSelect(false);
  };

  /* 修改成员权限 */
  const editMemberAuth = async form => {
    try {
      const editRes = await editGroupMemberAuth(groupId, form);
      if (editRes.code === 0) {
        refreshData();
      }
      showToast(editRes.message, editRes.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.log(error);
    }
  };

  /* 右边选项 */
  const rightOptions = item => {
    let options = [
      {
        text:
          item.member_status === MemberStatusEnum.normal
            ? t('group.mute')
            : t('group.unmute'),
        background:
          item.member_status === MemberStatusEnum.normal
            ? Colors.warning
            : Colors.success,
        onPress: () => {
          editMemberAuth({
            id: item.id,
            member_status:
              item.member_status === MemberStatusEnum.normal
                ? MemberStatusEnum.forbidden
                : MemberStatusEnum.normal,
          });
        },
      },
      {
        text: t('group.remove'),
        background: Colors.error,
        onPress: () => {
          setSelectedIds([item.id]);
          setDelVisible(true);
        },
      },
    ];
    if (
      memberRole === GroupRoleEnum.member ||
      item.member_role === GroupRoleEnum.owner
    ) {
      return [];
    }
    if (
      memberRole === GroupRoleEnum.admin &&
      item.member_role === GroupRoleEnum.admin
    ) {
      return [];
    }

    return options;
  };

  /* 左边选项 */
  const leftOption = item => {
    let option = {
      background: Colors.white,
    };
    if (item.member_role === GroupRoleEnum.owner) {
      return option;
    }
    if (memberRole === GroupRoleEnum.owner) {
      option = {
        text:
          item.member_role === GroupRoleEnum.member
            ? t('group.set_admin')
            : t('group.unset_admin'),
        background:
          item.member_role === GroupRoleEnum.member
            ? Colors.primary
            : Colors.grey40,
        onPress: () => {
          editMemberAuth({
            id: item.id,
            member_role:
              item.member_role === GroupRoleEnum.member
                ? GroupRoleEnum.admin
                : GroupRoleEnum.member,
          });
        },
      };
    }
    return option;
  };

  /* 渲染成员 */
  const renderMembers = ({item}) => {
    return (
      <Drawer
        disableHaptic={true}
        itemsMinWidth={80}
        onDragStart={() => setIsMultiSelect(false)}
        rightItems={rightOptions(item)}
        leftItem={leftOption(item)}>
        <View flexS row centerV bg-white padding-12>
          {isMultiSelect ? (
            <Checkbox
              marginR-12
              color={Colors.primary}
              size={20}
              borderRadius={10}
              disabled={
                memberRole === GroupRoleEnum.owner
                  ? ownerIds.includes(item.id)
                  : memberRole === GroupRoleEnum.admin
                  ? adminIds.includes(item.id) || ownerIds.includes(item.id)
                  : false
              }
              value={selectedIds.includes(item.id)}
              onValueChange={value => {
                if (value) {
                  setSelectedIds(prevItem => {
                    const newItem = [...new Set([...prevItem, item.id])];
                    return newItem;
                  });
                } else {
                  setSelectedIds(prevItem => {
                    const newItem = prevItem.filter(id => id !== item.id);
                    return newItem;
                  });
                }
              }}
            />
          ) : null}
          <View row flexS centerV spread>
            <View row flexS centerV>
              <Avatar
                size={46}
                onPress={() => {
                  navigation.navigate('MateInfo', {
                    userId: item?.user?.id,
                  });
                }}
                source={{
                  uri: envConfig.STATIC_URL + item?.user?.user_avatar,
                }}
                imageProps={{errorSource: require('@assets/images/empty.jpg')}}
                backgroundColor={Colors.transparent}
                imageStyle={
                  item.member_status === MemberStatusEnum.forbidden
                    ? styles.avatarOpacity
                    : styles.avatarNormal
                }
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
              <View marginL-24 width={'100%'}>
                <Text
                  text70L
                  grey10
                  numberOfLines={1}
                  style={styles.maxWidth80}>
                  {item.member_remarks}
                </Text>
                {item.member_status === MemberStatusEnum.forbidden ? (
                  <Badge
                    backgroundColor={Colors.error}
                    label={t('group.forbidden')}
                    size={18}
                  />
                ) : null}
              </View>
            </View>
            <Text text90L grey40>
              {dayjs(item.create_time).format('YYYY/MM/DD')}
              {t('group.join')}
            </Text>
          </View>
        </View>
      </Drawer>
    );
  };

  // 全选/取消全选
  const selectAll = () => {
    setIsAllSelect(prev => {
      if (!prev) {
        if (memberRole === GroupRoleEnum.owner) {
          setSelectedIds(
            list
              .filter(item => !ownerIds.includes(item.id))
              .map(item => item.id),
          );
        }
        if (memberRole === GroupRoleEnum.admin) {
          setSelectedIds(
            list
              .filter(
                item =>
                  !adminIds.includes(item.id) && !ownerIds.includes(item.id),
              )
              .map(item => item.id),
          );
        }
      } else {
        setSelectedIds([]);
      }
      return !prev;
    });
  };

  const getGroupMembersList = async () => {
    return getGroupMembers(groupId);
  };

  const [ownerIds, setOwnerIds] = useState([]);
  const [adminIds, setAdminIds] = useState([]);

  const {list, onEndReached, loading, onRefresh, refreshData} =
    useInfiniteScroll(getGroupMembersList);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (list.length) {
      setOwnerIds(
        list
          .filter(item => item.member_role === GroupRoleEnum.owner)
          .map(item => item.id),
      );
      setAdminIds(
        list
          .filter(item => item.member_role === GroupRoleEnum.admin)
          .map(item => item.id),
      );
    }
  }, [list]);

  return (
    <>
      <View row spread padding-8>
        <Button
          size={'small'}
          borderRadius={8}
          label={t('group.invite_member')}
          backgroundColor={Colors.primary}
          onPress={() => {
            navigation.navigate('CreateGroup', {
              groupId: groupId,
              excludeIds: excludeIds,
            });
          }}
        />
        <View row right spread>
          {isMultiSelect ? (
            <View row spread gap-12>
              <Button
                size={'xSmall'}
                label={
                  isAllSelect
                    ? t('common.unselect_all')
                    : t('common.select_all')
                }
                link
                color={Colors.cyan30}
                onPress={() => selectAll()}
              />
              <Button
                size={'xSmall'}
                label={t('group.remove')}
                link
                color={Colors.error}
                onPress={() => {
                  setDelVisible(true);
                }}
              />
              <Button
                size={'xSmall'}
                label={t('common.cancel')}
                link
                color={Colors.primary}
                onPress={() => {
                  setIsMultiSelect(false);
                }}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={
                memberRole === GroupRoleEnum.member
                  ? styles.displayNone
                  : styles.displayFlex
              }
              center
              onPress={() => setIsMultiSelect(true)}>
              <AntDesign name="bars" color={Colors.grey40} size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={loading}
            colors={[Colors.primary]}
            onRefresh={onRefresh}
          />
        }
        data={list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={<View height={0.4} />}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListEmptyComponent={
          <View marginT-16 center>
            <Text text90L grey40>
              {t('empty.file')}
            </Text>
          </View>
        }
        renderItem={renderMembers}
        ListFooterComponent={<View marginB-200 />}
      />

      <BaseDialog
        title={true}
        onConfirm={() => {
          setDelVisible(false);
          removeMembers();
        }}
        onCancel={() => {
          setSelectedIds([]);
        }}
        visible={delVisible}
        setVisible={setDelVisible}
        description={t('common.delete_tips')}
      />
    </>
  );
};

const styles = StyleSheet.create({
  avatarOpacity: {
    backgroundColor: Colors.black,
    opacity: 0.4,
  },
  avatarNormal: {
    opacity: 1,
  },
  maxWidth80: {
    maxWidth: '80%',
  },
  displayNone: {
    display: 'none',
  },
  displayFlex: {
    display: 'flex',
  },
});

export default GroupMembers;
