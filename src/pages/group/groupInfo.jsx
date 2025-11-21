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
  ExpandableSection,
  TouchableOpacity,
  Avatar,
} from 'react-native-ui-lib';
import {useToast} from '@utils/hooks/useToast';
import {getGroupDetail, editGroup, deleteGroup} from '@api/group';
import {editGroupMember, exitGroup} from '@api/group_member';
import {uploadFile} from '@utils/system/file_utils';
import {formatMsg, setLocalMsg} from '@utils/system/chat_utils';
import {getSessionDetail} from '@api/session';
import {useConfigStore} from '@/stores/configStore';
import {useTranslation} from 'react-i18next';
import {GroupRoleEnum, MemberStatusEnum} from '@const/database_enum';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';
import BaseDialog from '@components/common/BaseDialog';
import ListItem from '@components/common/ListItem';
import AvatarPicker from '@components/form/AvatarPicker';

const GroupInfo = ({navigation, route}) => {
  const {groupId, sessionId} = route.params || {};
  const {t} = useTranslation();
  const {envConfig} = useConfigStore();

  const {showToast} = useToast();
  const [groupInfo, setGroupInfo] = useState({});

  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [avatarUri, setAvatarUri] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const [isVisible, setIsVisible] = useState(false);
  const [nickname, setNickname] = useState('');
  const [groupRole, setGroupRole] = useState(GroupRoleEnum.member);
  const [oneselfMemberId, setOneselfMemberId] = useState(null);
  const [allMemberIds, setAllMemberIds] = useState([]);

  const [showAvatarSave, setShowAvatarSave] = useState(false);
  const [showNameSave, setShowNameSave] = useState(false);
  const [showIntroduceSave, setShowIntroduceSave] = useState(false);

  const [clearVisible, setClearVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);



  // 初始化数据
  const dataInit = async id => {
    try {
      setRefreshing(true);
      const res = await getGroupDetail({id, current: 1, pageSize: 12});
      if (res.code === 0) {
        const {group_avatar} = res.data;
        setGroupInfo({...res.data});
        setAvatarUri(envConfig.STATIC_URL + group_avatar);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  // 处理数据
  const [isCleanCache, setIsCleanCache] = useState(false);
  const handleData = async () => {
    const keys = Object.keys(groupInfo);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const element = groupInfo[key];
      if (element === null || element === '') {
        showToast(t('empty.input'), 'error');
        return false;
      }
    }

    if (avatarFile) {
      try {
        const res = await uploadFile(avatarFile, () => {}, {
          file_type: 'image',
          use_type: 'group',
        });
        const uploadRes = JSON.parse(res.text());
        if (uploadRes.code === 0) {
          const avatar = uploadRes.data.file_key;
          setGroupInfo({...groupInfo, group_avatar: avatar});
          return true;
        }
        showToast(uploadRes.message, 'error');
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setIsCleanCache(true);
      }
    }
    return true;
  };

  // 提交修改
  const [uploading, setUploading] = useState(false);
  const submitData = async () => {
    try {
      setUploading(true);
      // 处理数据
      const valid = await handleData();
      if (!valid) {
        return;
      }
      const res = await editGroup(groupId, groupInfo);
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

  /* 清空聊天记录 */
  const clearChatHistory = sessionId => {
    // function deleteMsg(SID) {
    //   const toDelete = realm
    //     .objects('ChatMsg')
    //     .filtered('session_id == $0', SID);
    //   realm.write(() => {
    //     realm.delete(toDelete);
    //   });
    // }
    // deleteMsg(sessionId);
    // showToast('清除成功', 'success');
    // navigation.navigate('Msg');
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
      const res = await editGroupMember({
        id: oneselfMemberId,
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
  const getCouldChatHistory = async () => {
    try {
      setRefreshing(true);
      const res = await getSessionDetail(sessionId);
      if (res.code === 0) {
        const newList = [];
        res.data.msgs.forEach(item => {
          newList.push(formatMsg(item));
        });
        setLocalMsg(newList);
        navigation.navigate('Msg');
        showToast(t('group.async_success'), 'success');
        return;
      }
      showToast(res.message, 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      dataInit(groupId);
    }
  }, [groupId]);

  const [isExpand, setIsExpand] = useState(false);

  const renderMembers = () => {
    return groupInfo?.members?.map(item => (
      <View key={item.id}>
        <TouchableOpacity
          key={item.id}
          flexS
          center
          onPress={() => {
            navigation.navigate('MateInfo', {
              userId: item.member_uid,
            });
          }}>
          <Avatar
            source={{
              uri: envConfig.STATIC_URL + item.member_avatar,
            }}
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
          <Text text90L numberOfLines={1} style={styles.maxWidth60}>
            {item.member_remark}
          </Text>
        </TouchableOpacity>
      </View>
    ));
  };
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
              if (groupRole !== GroupRoleEnum.member) {
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
                onPress={() => submitData()}
              />
            </View>
            <Image source={{uri: avatarUri}} style={styles.image} />
            <FontAwesome name="angle-right" color={Colors.grey50} size={26} />
          </Card>
          <Card enableShadow={false} flexS marginT-16 padding-16>
            <View flexG row spread centerV style={styles.inputLine}>
              <TextField
                label={t('group.name')}
                text70
                readonly={groupRole === GroupRoleEnum.member}
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
                  onPress={() => submitData()}
                />
              </View>
            </View>
            <View flexG row spread centerV marginT-16>
              <TextField
                label={t('group.introduce')}
                text80
                grey30
                multiline
                numberOfLines={3}
                readonly={groupRole === GroupRoleEnum.member}
                helperText={t('group.max_introduce_length')}
                enableErrors={showIntroduceSave}
                style={styles.input}
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
                marginB-20
                style={
                  showIntroduceSave ? styles.displayFlex : styles.displayNone
                }>
                <Button
                  label={t('common.save')}
                  size={Button.sizes.xSmall}
                  borderRadius={8}
                  backgroundColor={Colors.primary}
                  onPress={() => submitData()}
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
                  sessionId: sessionId,
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
                  sessionId: sessionId,
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
          </Card>

          <Card enableShadow={false} marginT-16>
            <ExpandableSection
              expanded={isExpand}
              backgroundColor={Colors.white}
              sectionHeader={
                <View>
                  <ListItem
                    itemName={t('group.invite_member')}
                    iconName={'plus-circle'}
                    iconColor={Colors.blue40}
                    onConfirm={() => {
                      navigation.navigate('CreateGroup', {
                        groupId: groupId,
                        existMemberIds: allMemberIds,
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
                      setIsExpand(prev => !prev);
                    }}
                  />
                </View>
              }
              children={
                <>
                  {groupRole !== GroupRoleEnum.member ? (
                    <View flexS>
                      <Text text90L grey30 center>
                        <FontAwesome
                          name="info-circle"
                          color={Colors.success}
                          size={14}
                        />
                        &nbsp;{t('group.long_press_operation')}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.membersGrid}>{renderMembers()}</View>
                </>
              }
              onPress={() => {}}
            />
          </Card>
          <Card marginT-16 enableShadow={false}>
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
          {groupRole === GroupRoleEnum.owner ? (
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
      <AvatarPicker
        visible={showPicker}
        setVisible={setShowPicker}
        isCleanCache={isCleanCache}
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
          clearChatHistory();
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
  avatarOpacity: {
    opacity: 0.2,
  },
  avatarNormal: {
    opacity: 1,
  },
  maxWidth60: {
    maxWidth: 60,
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
