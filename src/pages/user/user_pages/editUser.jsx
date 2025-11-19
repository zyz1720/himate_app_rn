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
  RadioGroup,
  DateTimePicker,
  RadioButton,
} from 'react-native-ui-lib';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useToast} from '../../../utils/hooks/useToast';
import {getUserdetail, EditUserInfo} from '../../../api/user';
import {UploadFile} from '../../../utils/handle/fileHandle';
import ImagePicker from 'react-native-image-crop-picker';
import BaseSheet from '../../../components/common/BaseSheet';
import {getfileFormdata, keepChangedFields} from '../../../utils/common/base';
import FullScreenLoading from '../../../components/common/FullScreenLoading';

const Edituser = ({route}) => {
  const {userId} = route.params || {};

  const {showToast} = useToast();
  const [userInfo, setUserInfo] = useState({});
  const [originalUserInfo, setOriginalUserInfo] = useState({});

  const accessCamera = useSelector(state => state.permissionStore.accessCamera);
  const accessFolder = useSelector(state => state.permissionStore.accessFolder);

  // baseConfig
  const {STATIC_URL} = useSelector(state => state.baseConfigStore.baseConfig);

  const dispatch = useDispatch();

  const genderEnum = [
    {
      label: '男',
      value: 'man',
      color: Colors.geekBlue,
    },
    {
      label: '女',
      value: 'woman',
      color: Colors.magenta,
    },
    {
      label: '保密',
      value: 'unknown',
      color: Colors.grey30,
    },
  ];

  // 初始化数据
  const dataInit = async () => {
    setRefreshing(true);
    try {
      const res = await getUserdetail({id: userId});
      if (res.success) {
        const {user_avatar, user_name, sex, self_account, birthday} = res.data;
        dispatch(setUserData(userId));
        setUserInfo({
          user_avatar,
          user_name,
          sex,
          self_account,
          birthday,
        });
        setOriginalUserInfo(res.data);
        setAvatarUri(STATIC_URL + user_avatar);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  // 是否需要保存
  const [isNeedSave, setIsNeedSave] = useState(false);

  // 检查是否需要保存的纯函数（不更新状态）
  const shouldShowError = value => {
    return !Object.values(userInfo).includes(value);
  };

  // 更新保存状态的函数
  const updateNeedSave = () => {
    setIsNeedSave(true);
  };

  // 处理数据
  const handleData = async () => {
    const keys = Object.keys(userInfo);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const element = userInfo[key];
      if (element === null || element === '') {
        showToast('请输入要修改的内容！', 'error');
        return false;
      }
      if (key === 'self_account' && element.length < 6) {
        showToast('请至少输入6位账号', 'error');
        return false;
      }
    }

    if (avatarfile) {
      try {
        const res = await UploadFile(avatarfile, () => {}, {
          uid: userId,
          fileType: 'image',
          useType: 'user',
        });
        const upRes = JSON.parse(res.text());
        if (upRes.success) {
          const useAvatar = upRes.data.file_name;
          setUserInfo({...userInfo, user_avatar: useAvatar});
          return true;
        } else {
          showToast('上传头像失败', 'error');
          return false;
        }
      } catch (error) {
        console.error(error);
        showToast('上传头像失败', 'error');
        return false;
      } finally {
        ImagePicker.clean()
          .then(() => {
            console.log('清除缓存的头像tmp');
          })
          .catch(error => {
            console.error(error);
          });
      }
    }
    return true;
  };

  // 提交修改
  const [submitting, setSubmitting] = useState(false);
  const submitData = async () => {
    try {
      setSubmitting(true);
      // 修改头像
      const isToSubmit = await handleData();
      if (!isToSubmit) {
        return;
      }
      // 检查是否有修改
      const changedFields = keepChangedFields(originalUserInfo, userInfo);
      if (!changedFields) {
        showToast('没有修改任何内容', 'warning');
        return;
      }
      changedFields.id = userId;
      const res = await EditUserInfo(changedFields);
      if (res.success) {
        dataInit();
      }
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // 刷新页面
  const [refreshing, setRefreshing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // 提交头像 setAvatarfile
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarfile, setAvatarfile] = useState(null);

  useEffect(() => {
    if (avatarfile) {
      const fileRes = getfileFormdata('user', avatarfile);
      setAvatarUri(fileRes.uri);
    }
  }, [avatarfile]);

  useEffect(() => {
    dataInit();
  }, []);

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={[Colors.primary]}
            refreshing={refreshing}
            onRefresh={dataInit}
          />
        }>
        <View flexG paddingH-16 paddingT-16>
          <Card
            flexS
            left
            row
            center
            enableShadow={false}
            padding-16
            onPress={() => setShowDialog(true)}>
            <View flex>
              <Text grey40 text65>
                头像
              </Text>
            </View>
            <Image source={{uri: avatarUri}} style={styles.image} />
            <FontAwesome name="angle-right" color={Colors.grey50} size={26} />
          </Card>
          <Card flexS enableShadow={false} marginT-16 padding-16>
            <View flexG row spread centerV style={styles.inputLine}>
              <TextField
                label={'昵称'}
                labelColor={Colors.grey40}
                text70
                enableErrors={shouldShowError(userInfo.user_name)}
                style={styles.input}
                placeholder={'请输入昵称'}
                placeholderTextColor={Colors.grey50}
                validate={[value => value.length !== 0]}
                validationMessage={['昵称不能为空！']}
                maxLength={10}
                value={userInfo.user_name}
                validateOnChange={true}
                onChangeText={value => {
                  updateNeedSave();
                  setUserInfo({...userInfo, user_name: value});
                }}
              />
            </View>
            <View flexG row spread centerV marginT-16 style={styles.inputLine}>
              <TextField
                label={'账号'}
                labelColor={Colors.grey40}
                text70
                enableErrors={shouldShowError(userInfo.self_account)}
                style={styles.input}
                placeholder={'请输入账号'}
                placeholderTextColor={Colors.grey50}
                validate={[value => value.length > 5]}
                validationMessage={['请至少输入六位账号！']}
                maxLength={16}
                validateOnChange={true}
                value={userInfo.self_account}
                onChangeText={value => {
                  updateNeedSave();
                  setUserInfo({...userInfo, self_account: value});
                }}
              />
            </View>
            <View flexG row spread centerV marginT-16 style={styles.inputLine}>
              <DateTimePicker
                label="生日"
                labelColor={Colors.grey40}
                title={'选择出生日期'}
                placeholder={'请选择出生日期'}
                mode={'date'}
                value={new Date(userInfo.birthday)}
                onChange={value => {
                  updateNeedSave();
                  setUserInfo({...userInfo, birthday: value});
                }}
              />
            </View>
            <View flexG row spread centerV marginT-16>
              <Text grey40>性别</Text>
              <RadioGroup
                gap={16}
                row
                initialValue={userInfo.sex}
                onValueChange={value => {
                  updateNeedSave();
                  setUserInfo({...userInfo, sex: value});
                }}>
                {genderEnum.map(item => (
                  <RadioButton
                    key={item.value}
                    value={item.value}
                    size={18}
                    label={item.label}
                    color={item.color}
                    labelStyle={{color: item.color}}
                  />
                ))}
              </RadioGroup>
            </View>
          </Card>
          {isNeedSave && (
            <Button
              marginT-16
              bg-primary
              text70
              white
              label="保存更改"
              borderRadius={12}
              onPress={submitData}
            />
          )}
        </View>
      </ScrollView>
      <BaseSheet
        Title={'选择头像'}
        Visible={showDialog}
        SetVisible={setShowDialog}
        Actions={[
          {
            label: '相机',
            color: Colors.primary,
            onPress: () => {
              if (!accessCamera) {
                showToast('请授予应用相机使用权限', 'warning');
                dispatch(requestCameraPermission());
                return;
              }
              ImagePicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                mediaType: 'photo',
                cropperCircleOverlay: true,
                cropperActiveWidgetColor: Colors.primary,
              })
                .then(image => {
                  setAvatarfile(image);
                  updateNeedSave();
                })
                .finally(() => {
                  setShowDialog(false);
                });
            },
          },
          {
            label: '图库',
            color: Colors.primary,
            onPress: () => {
              if (!accessFolder) {
                showToast('请授予应用文件和媒体使用权限', 'warning');
                dispatch(requestFolderPermission());
                return;
              }
              ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                mediaType: 'photo',
                cropperCircleOverlay: true,
                cropperActiveWidgetColor: Colors.primary,
              })
                .then(image => {
                  setAvatarfile(image);
                  updateNeedSave();
                })
                .finally(() => {
                  setShowDialog(false);
                });
            },
          },
        ]}
      />
      {submitting ? <FullScreenLoading Message={'修改中...'} /> : null}
    </>
  );
};
const styles = StyleSheet.create({
  image: {width: 64, height: 64, borderRadius: 8, marginRight: 12},
  input: {
    width: 200,
  },
  inputLine: {
    borderBottomColor: Colors.grey80,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
});
export default Edituser;
