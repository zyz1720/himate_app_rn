import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {
  View,
  Text,
  Card,
  Image,
  Colors,
  TextField,
  Button,
} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {getGroupDetail, editGroup, deleteGroup} from '@api/group';
import {
  editGroupMember,
  getSelfGroupMember,
  exitGroup,
} from '@api/group_member';
import {uploadFile} from '@utils/system/file_utils';
import {formatCloudMsgToLocal} from '@utils/system/chat_utils';
import {getSessionsMessages} from '@api/session';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {GroupRoleEnum, FileUseTypeEnum} from '@const/database_enum';
import {deleteLocalMessages, setLocalMessages} from '@utils/realm/useChatMsg';
import {delay} from '@utils/common/time_utils';
import {useIsFocused} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';
import BaseDialog from '@components/common/BaseDialog';
import ListItem from '@components/common/ListItem';
import ImgPicker from '@components/form/ImgPicker';

const GroupInfo = ({navigation, route}) => {
  const {groupId, session_id} = route.params || {};
  const {t} = useTranslation();
  const isFocused = useIsFocused();

  const {envConfig} = useConfigStore();

  const {showToast} = useToast();
  const [groupInfo, setGroupInfo] = useState({});

  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [isVisible, setIsVisible] = useState(false);
  const [nickname, setNickname] = useState('');
  const [memberRole, setMemberRole] = useState(GroupRoleEnum.member);
  const [allMemberUserIds, setAllMemberUserIds] = useState([]);

  const [showAvatarSave, setShowAvatarSave] = useState(false);
  const [showNameSave, setShowNameSave] = useState(false);
  const [showIntroduceSave, setShowIntroduceSave] = useState(false);

  const [clearVisible, setClearVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  // 初始化数据
  const dataInit = async id => {
    try {
      setRefreshing(true);
      const res = await getGroupDetail(id);
      console.log('getGroupDetail', id, res.data);
      if (res.code === 0) {
        const {group_avatar, members} = res.data;
        const userIds = members.map(item => item.user_id);
        setAllMemberUserIds(userIds);
        setGroupInfo({...res.data});
        setAvatarUri(envConfig.STATIC_URL + group_avatar);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  // 获取自己在群中的信息
  const getSelfGroupMemberInfo = async _session_id => {
    try {
      const res = await getSelfGroupMember(_session_id);
      if (res.code === 0) {
        const {member_role, member_remarks} = res.data;
        setMemberRole(member_role);
        setNickname(member_remarks);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 处理数据
  const [isCleanCache, setIsCleanCache] = useState(false);
  const uploadImg = async fileInfo => {
    try {
      const res = await uploadFile(fileInfo.file, {
        form: {
          file_type: fileInfo.type,
          use_type: FileUseTypeEnum.group,
        },
      });
      const upRes = JSON.parse(res.text());
      if (upRes.code === 0) {
        return upRes.data.file_key;
      } else {
        showToast(upRes.message, 'error');
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsCleanCache(true);
    }
  };

  const handleData = async () => {
    let updateGroupInfo = {...groupInfo};

    if (avatarFile) {
      const avatarKey = await uploadImg(avatarFile);
      if (!avatarKey) {
        return false;
      }
      updateGroupInfo = {...updateGroupInfo, group_avatar: avatarKey};
    }
    return updateGroupInfo;
  };

  // 提交修改
  const [uploading, setUploading] = useState(false);
  const submitData = async () => {
    try {
      setUploading(true);
      // 处理数据
      const updateGroupInfo = await handleData();
      if (!updateGroupInfo) {
        return;
      }
      const res = await editGroup(groupId, updateGroupInfo);
      if (res.code === 0) {
        dataInit(groupId);
      }
      showToast(res.message, res.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  /* 清空历史消息 */
  const clearChatHistory = _session_id => {
    deleteLocalMessages(_session_id);
    showToast(t('mate.clear_success'), 'success');
    navigation.navigate('Msg');
  };

  // 解散群组
  const deleteTheGroup = async () => {
    try {
      const res = await deleteGroup(groupId);
      if (res.code === 0) {
        setDeleteVisible(false);
        navigation.navigate('Mate');
        showToast(t('group.delete_success'), 'success');
        return;
      }
      showToast(res.message, 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /* 退出群聊 */
  const [existVisible, setExistVisible] = useState(false);
  const exitTheGroup = async () => {
    try {
      const res = await exitGroup(groupId);
      if (res.code === 0) {
        showToast(t('group.exit_success'), 'success');
        navigation.navigate('Msg');
        return;
      }
      showToast(res.message, 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /* 修改群成员信息 */
  const editGroupMemberInfo = async () => {
    try {
      setUploading(true);
      const res = await editGroupMember(groupId, {
        member_remarks: nickname,
      });
      if (res.code === 0) {
        dataInit(groupId);
      }
      showToast(res.message, res.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // 同步聊天记录
  const [loadingAll, setLoadingAll] = useState(false);

  const getCouldChatHistory = async current => {
    try {
      setLoadingAll(true);
      const res = await getSessionsMessages(session_id, {
        current: current,
        pageSize: 100,
      });
      if (res.code === 0) {
        const newList = [];
        const list = res.data.list || [];
        list.forEach(item => {
          newList.push(formatCloudMsgToLocal(item, session_id));
        });
        setLocalMessages(newList);
        if (list.length < 100) {
          showToast(t('mate.sync_success'), 'success');
          navigation.navigate('Msg');
          return;
        }
        await delay();
        getCouldChatHistory(current + 1);
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (groupId && isFocused) {
      dataInit(groupId);
    }
    if (session_id && isFocused) {
      getSelfGroupMemberInfo(session_id);
    }
  }, [isFocused, groupId, session_id]);

  return (
    <>
      <ScrollView
        style={styles.flex1}
        refreshControl={
          <RefreshControl
            colors={[Colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              dataInit(groupId);
            }}
          />
        }>
        <View flexG paddingH-16 paddingT-16 paddingB-16>
          <Card
            enableShadow={false}
            flexS
            left
            row
            center
            padding-16
            onPress={() => {
              if (memberRole !== GroupRoleEnum.member) {
                setShowPicker(true);
              }
            }}>
            <View flex>
              <Text grey20 text65>
                {t('group.avatar')}
              </Text>
            </View>
            <View
              marginH-20
              style={[
                showAvatarSave ? styles.displayFlex : styles.displayNone,
              ]}>
              <Button
                label={t('common.save')}
                outline={true}
                outlineColor={Colors.primary}
                size={Button.sizes.small}
                borderRadius={8}
                backgroundColor={Colors.primary}
                onPress={async () => {
                  await submitData();
                  setShowAvatarSave(false);
                }}
              />
            </View>
            <Image
              source={{uri: avatarUri}}
              errorSource={require('@assets/images/empty.jpg')}
              style={styles.image}
            />
            <FontAwesome name="angle-right" color={Colors.grey50} size={26} />
          </Card>
          <Card enableShadow={false} flexS marginT-16 padding-16>
            <View flexG row spread centerV style={styles.inputLine}>
              <TextField
                label={t('group.name')}
                text70
                readonly={memberRole === GroupRoleEnum.member}
                enableErrors={showNameSave}
                style={styles.input}
                placeholder={t('group.input_name')}
                placeholderTextColor={Colors.grey50}
                validate={[value => value.length !== 0]}
                validationMessage={[t('group.input_name_error')]}
                maxLength={16}
                value={groupInfo?.group_name}
                validateOnChange={true}
                onChangeText={value => {
                  setGroupInfo(prev => ({...prev, group_name: value}));
                  setShowNameSave(true);
                }}
              />
              <View
                marginB-20
                style={showNameSave ? styles.displayFlex : styles.displayNone}>
                <Button
                  label={t('common.save')}
                  size={Button.sizes.xSmall}
                  borderRadius={8}
                  backgroundColor={Colors.primary}
                  onPress={async () => {
                    await submitData();
                    setShowNameSave(false);
                  }}
                />
              </View>
            </View>
            <View flexG centerV marginT-16>
              <TextField
                label={t('group.introduce')}
                text80
                grey30
                multiline
                numberOfLines={3}
                readonly={memberRole === GroupRoleEnum.member}
                helperText={t('group.max_introduce_length')}
                enableErrors={showIntroduceSave}
                placeholder={t('group.input_introduce')}
                placeholderTextColor={Colors.grey50}
                validate={[value => value.length !== 0]}
                validationMessage={[t('group.input_introduce_error')]}
                maxLength={100}
                validateOnChange={true}
                value={groupInfo?.group_introduce}
                onChangeText={value => {
                  setGroupInfo(prev => ({...prev, group_introduce: value}));
                  setShowIntroduceSave(true);
                }}
              />
              <View
                right
                style={
                  showIntroduceSave ? styles.displayFlex : styles.displayNone
                }>
                <Button
                  label={t('common.save')}
                  size={Button.sizes.xSmall}
                  borderRadius={8}
                  backgroundColor={Colors.primary}
                  onPress={async () => {
                    await submitData();
                    setShowIntroduceSave(false);
                  }}
                />
              </View>
            </View>
          </Card>

          <Card enableShadow={false} marginT-16>
            <ListItem
              itemName={t('group.nickname')}
              iconName={'user-secret'}
              iconSize={20}
              iconColor={Colors.violet40}
              rightText={nickname}
              onConfirm={() => {
                setIsVisible(true);
              }}
            />
            <ListItem
              itemName={t('group.search_msg')}
              iconName={'search'}
              iconSize={20}
              iconColor={Colors.grey40}
              onConfirm={() => {
                navigation.navigate('SearchMsg', {
                  session_id: session_id,
                });
              }}
            />
            <ListItem
              itemName={t('group.export_msg')}
              iconName={'download'}
              iconColor={Colors.cyan30}
              iconSize={20}
              onConfirm={() => {
                navigation.navigate('ChatMsg', {
                  session_id: session_id,
                });
              }}
            />
            <ListItem
              itemName={t('group.clear_msg')}
              iconName={'remove'}
              iconColor={Colors.error}
              onConfirm={() => {
                setClearVisible(true);
              }}
            />
            <ListItem
              itemName={t('group.sync_msg')}
              iconName={'cloud-download'}
              iconSize={20}
              iconColor={Colors.blue30}
              onConfirm={() => {
                getCouldChatHistory();
              }}
            />
          </Card>

          <Card enableShadow={false} marginT-16>
            <ListItem
              itemName={t('group.invite_member')}
              iconName={'plus-circle'}
              iconColor={Colors.blue40}
              onConfirm={() => {
                navigation.navigate('CreateGroup', {
                  groupId: groupId,
                  excludeIds: allMemberUserIds,
                });
              }}
            />
            <ListItem
              itemName={t('group.member_count', {
                count: groupInfo?.members?.length,
              })}
              iconName={'group'}
              iconSize={20}
              iconColor={Colors.primary}
              isBottomLine={true}
              onConfirm={() => {
                navigation.navigate('GroupMembers', {
                  groupId: groupId,
                  memberRole: memberRole,
                  excludeIds: allMemberUserIds,
                });
              }}
            />
          </Card>
          {memberRole === GroupRoleEnum.owner ? (
            <Button
              bg-white
              marginT-16
              text70
              color={Colors.error}
              borderRadius={12}
              label={t('group.dismiss_group')}
              onPress={() => {
                setDeleteVisible(true);
              }}
            />
          ) : (
            <Button
              bg-white
              marginT-16
              text70
              color={Colors.error}
              borderRadius={12}
              label={t('group.exit_group')}
              onPress={() => {
                setExistVisible(true);
              }}
            />
          )}
        </View>
      </ScrollView>
      <ImgPicker
        visible={showPicker}
        setVisible={setShowPicker}
        isCleanCache={isCleanCache}
        isAvatar={true}
        onSelected={fileInfo => {
          setAvatarUri(fileInfo.uri);
          setAvatarFile(fileInfo);
          setShowAvatarSave(true);
        }}
      />
      <BaseDialog
        title={true}
        onConfirm={deleteTheGroup}
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        description={t('group.delete_group_confirm')}
      />
      <BaseDialog
        title={true}
        onConfirm={exitTheGroup}
        visible={existVisible}
        setVisible={setExistVisible}
        description={t('group.exit_group_confirm')}
      />
      <BaseDialog
        title={true}
        onConfirm={() => {
          clearChatHistory(session_id);
        }}
        visible={clearVisible}
        setVisible={setClearVisible}
        description={t('group.clear_msg_confirm')}
      />
      <BaseDialog
        onConfirm={editGroupMemberInfo}
        visible={isVisible}
        setVisible={setIsVisible}
        description={t('group.nickname')}
        renderBody={
          <TextField
            marginT-8
            placeholder={t('group.input_nickname')}
            floatingPlaceholder
            text70L
            onChangeText={value => {
              setNickname(value);
            }}
            maxLength={10}
            showCharCounter={true}
          />
        }
      />
      {uploading ? <FullScreenLoading Message={t('common.modifying')} /> : null}
      {loadingAll ? <FullScreenLoading message={t('common.syncing')} /> : null}
    </>
  );
};
const styles = StyleSheet.create({
  image: {width: 60, height: 60, borderRadius: 8, marginRight: 12},
  input: {
    maxWidth: 260,
  },
  inputLine: {
    borderBottomColor: Colors.grey60,
    borderBottomWidth: 1,
  },
  membersGrid: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    columnGap: 38,
    rowGap: 12,
    padding: 16,
  },
  flex1: {
    flex: 1,
  },
  displayNone: {
    display: 'none',
  },
  displayFlex: {
    display: 'flex',
  },
});
export default GroupInfo;
