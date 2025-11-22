import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  View,
  Card,
  Text,
  Colors,
  TextField,
  Avatar,
  Button,
  TouchableOpacity,
} from 'react-native-ui-lib';
import {useToast} from '@utils/hooks/useToast';
import {getUserDetail} from '@api/user';
import {addMate, editMate, deleteMate, getIsMate} from '@api/mate';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BaseDialog from '@components/common/BaseDialog';
import ImgModal from '@components/common/ImgModal';
import ListItem from '@components/common/ListItem';

const MateInfo = ({navigation, route}) => {
  const {userId} = route.params || {};
  const {showToast} = useToast();
  const {t} = useTranslation();
  const {envConfig} = useConfigStore();

  const [isMate, setIsMate] = useState(false);
  /* 获取用户信息 */
  const [otherUserInfo, setOtherUserInfo] = useState({});
  const getOtherUserInfo = async () => {
    try {
      const res = await getUserDetail(userId);
      if (res.code === 0) {
        setOtherUserInfo(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*  判断是否为好友 */
  const [mateInfo, setMateInfo] = useState({});
  const [mateRemarks, setMateRemarks] = useState('');
  const getMateStatusFnc = async () => {
    try {
      const mateRes = await getIsMate(userId);
      if (mateRes.code === 0) {
        const mate = mateRes.data;
        setIsMate(true);
        setMateInfo(mateRes.data);
        setMateRemarks(
          mate.user_id === userId ? mate.user_remarks : mate.friend_remarks,
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*  添加好友 */
  const [addVisible, setAddVisible] = useState(false);
  const [addRemark, setAddRemark] = useState('');
  const [valMessage, setValMessage] = useState('');
  const addFriend = async () => {
    try {
      const addRes = await addMate({
        friend_id: userId,
        friend_remarks: addRemark,
        validate_msg: valMessage,
      });
      if (addRes.code === 0) {
        showToast(t('mate.add_success'), 'success');
        reset();
        return;
      }
      showToast(addRes.message, 'error');
    } catch (error) {
      console.error(error);
      reset();
    }
  };

  const reset = () => {
    setAddRemark('');
    setValMessage('');
  };

  /*  修改备注 */
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const editFriendRemark = async () => {
    try {
      const editRes = await editMate(mateInfo.id, {
        remarks: newRemark,
      });
      showToast(editRes.message, editRes.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /* 删除好友 */
  const [deleteVisible, setDeleteVisible] = useState(false);
  const deleteFriend = async () => {
    try {
      const delRes = await deleteMate(mateInfo.id);
      if (delRes.code === 0) {
        setDeleteVisible(false);
        navigation.navigate('Mate');
      }
      showToast(delRes.message, delRes.success ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /*   保存头像 */
  const [avatarUri, setAvatarUri] = useState('');
  const [avatarVisible, setAvatarVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      getOtherUserInfo();
      getMateStatusFnc();
    }
  }, [userId]);

  return (
    <View padding-16>
      <Card padding-16 enableShadow={false} flexS>
        <View flexS row>
          <TouchableOpacity
            onPress={() => {
              setAvatarUri(envConfig.STATIC_URL + otherUserInfo.user_avatar);
              setAvatarVisible(true);
            }}>
            <Avatar
              size={80}
              source={{
                uri: envConfig.STATIC_URL + otherUserInfo.user_avatar,
              }}
            />
          </TouchableOpacity>
          <View paddingH-16>
            {isMate ? (
              <Text text60 marginB-4>
                {mateRemarks}
              </Text>
            ) : null}
            <Text text80 marginB-4 grey30>
              {t('user.user_name') + otherUserInfo.user_name}
            </Text>
            <Text text80 marginB-4 grey30>
              {t('user.account') + otherUserInfo.self_account}
            </Text>
            <Text text80 marginB-4 grey30>
              {t('user.email') + otherUserInfo.account}
            </Text>
            <View flexS row>
              <View />
              <View flexS row centerV padding-4 style={styles.tag}>
                {otherUserInfo?.sex === 'woman' ? (
                  <FontAwesome name="venus" color={Colors.magenta} size={12} />
                ) : otherUserInfo?.sex === 'man' ? (
                  <FontAwesome name="mars" color={Colors.geekBlue} size={12} />
                ) : null}
                <Text marginL-4 grey30 text90>
                  {otherUserInfo?.age + t('user.age_num')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
      {isMate ? (
        <>
          <Card enableShadow={false} marginT-16>
            <ListItem
              itemName={t('mate.edit_remarks')}
              iconName={'edit'}
              iconColor={Colors.primary}
              onConfirm={() => {
                setRemarkVisible(true);
              }}
            />
          </Card>
          <Button
            bg-white
            marginT-16
            text70
            color={Colors.primary}
            borderRadius={12}
            label={t('mate.send_message')}
            onPress={() => {
              navigation.navigate('Chat', {
                session_id: mateInfo.mate_id,
                session_name: mateRemarks,
              });
            }}
          />
          <Button
            bg-white
            marginT-16
            text70
            color={Colors.error}
            borderRadius={12}
            label={t('mate.delete_mate')}
            onPress={() => {
              setDeleteVisible(true);
            }}
          />
        </>
      ) : (
        <Card enableShadow={false} marginT-16>
          <ListItem
            itemName={t('mate.add_mate')}
            iconName={'user-plus'}
            iconColor={Colors.primary}
            onConfirm={() => {
              setAddVisible(true);
            }}
          />
        </Card>
      )}

      <BaseDialog
        onConfirm={addFriend}
        onCancel={reset}
        visible={addVisible}
        setVisible={setAddVisible}
        description={t('mate.add_mate')}
        renderBody={
          <>
            <TextField
              marginT-8
              placeholder={t('mate.remark_placeholder')}
              floatingPlaceholder
              text70L
              onChangeText={value => {
                setAddRemark(value);
              }}
              maxLength={10}
              showCharCounter={true}
            />
            <TextField
              marginT-8
              placeholder={t('mate.message_placeholder')}
              text70L
              floatingPlaceholder
              onChangeText={value => {
                setValMessage(value);
              }}
              maxLength={50}
              showCharCounter={true}
              multiline={true}
            />
          </>
        }
      />

      <BaseDialog
        onConfirm={editFriendRemark}
        visible={remarkVisible}
        setVisible={setRemarkVisible}
        description={t('mate.edit_remarks')}
        renderBody={
          <TextField
            marginT-8
            placeholder={t('mate.remark_placeholder')}
            text70L
            floatingPlaceholder
            onChangeText={value => {
              setNewRemark(value);
            }}
            maxLength={10}
            showCharCounter={true}
          />
        }
      />

      <BaseDialog
        title={true}
        onConfirm={deleteFriend}
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        description={t('mate.delete_mate_confirm')}
      />

      {/* 图片预览弹窗 */}
      <ImgModal
        uris={[avatarUri]}
        visible={avatarVisible}
        onClose={() => {
          setAvatarVisible(false);
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.grey70,
    borderRadius: 6,
  },
});
export default MateInfo;
