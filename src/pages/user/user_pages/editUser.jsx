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
  TouchableOpacity,
  RadioButton,
} from 'react-native-ui-lib';
import {keepChangedFields} from '@utils/common/object_utils';
import {useToast} from '@utils/hooks/useToast';
import {useTranslation} from 'react-i18next';
import {getUserInfo, editUserInfo} from '@api/user';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {uploadFile} from '@utils/system/file_utils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';
import ImgPicker from '@components/form/ImgPicker';

const EditUser = () => {
  const {t} = useTranslation();

  const {envConfig} = useConfigStore();
  const {setUserInfo: reSetUserInfo} = useUserStore();
  const {showToast} = useToast();
  const [userInfo, setUserInfo] = useState({});
  const [originalUserInfo, setOriginalUserInfo] = useState({});

  // 刷新页面
  const [refreshing, setRefreshing] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [showBgPicker, setShowBgPicker] = useState(false);
  const [bgImgUri, setBgImgUri] = useState(null);
  const [bgImgFile, setBgImgFile] = useState(null);

  const genderEnum = [
    {
      label: t('user.man'),
      value: 'man',
      color: Colors.geekBlue,
    },
    {
      label: t('user.woman'),
      value: 'woman',
      color: Colors.magenta,
    },
    {
      label: t('user.unknown'),
      value: 'unknown',
      color: Colors.grey30,
    },
  ];

  // 初始化数据
  const dataInit = async () => {
    setRefreshing(true);
    try {
      const res = await getUserInfo();
      if (res.code === 0) {
        const {
          user_avatar,
          user_bg_img,
          user_name,
          sex,
          self_account,
          birthday,
        } = res.data;
        setUserInfo({
          user_avatar,
          user_name,
          sex,
          self_account,
          birthday,
        });
        setOriginalUserInfo(res.data);
        setAvatarUri(envConfig.STATIC_URL + user_avatar);
        setBgImgUri(envConfig.STATIC_URL + user_bg_img);
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
  const [isCleanCache, setIsCleanCache] = useState(false);
  const handleData = async () => {
    const keys = Object.keys(userInfo);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const element = userInfo[key];
      if (element === null || element === '') {
        showToast(t('empty.input'), 'error');
        return false;
      }
      if (key === 'self_account' && element.length < 6) {
        showToast(t('user.account_min_length'), 'error');
        return false;
      }
    }

    if (avatarFile) {
      try {
        const res = await uploadFile(avatarFile, () => {}, {
          file_type: 'image',
          use_type: 'user',
        });
        const upRes = JSON.parse(res.text());
        if (upRes.code === 0) {
          const useAvatar = upRes.data.file_name;
          setUserInfo({...userInfo, user_avatar: useAvatar});
          return true;
        } else {
          showToast(t('user.avatar_upload_failed'), 'error');
          return false;
        }
      } catch (error) {
        console.error(error);
        showToast(t('user.avatar_upload_failed'), 'error');
        return false;
      } finally {
        setIsCleanCache(true);
      }
    }
    return true;
  };

  // 提交修改
  const [submitting, setSubmitting] = useState(false);
  const submitData = async () => {
    try {
      setSubmitting(true);
      const valid = await handleData();
      if (!valid) {
        return;
      }
      const changedFields = keepChangedFields(originalUserInfo, userInfo);
      if (!changedFields) {
        showToast(t('user.no_modified_content'), 'warning');
        return;
      }
      const res = await editUserInfo(changedFields);
      if (res.code === 0) {
        dataInit();
        reSetUserInfo();
      }
      showToast(res.message, res.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

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
          <Card flexS enableShadow={false} padding-16>
            <View flexS spread row>
              <Text grey40 text80>
                {t('user.avatar')}
              </Text>
              <View flexS row centerV>
                <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Image
                    source={{uri: avatarUri}}
                    style={styles.image}
                    errorSource={require('@assets/images/empty.jpg')}
                  />
                </TouchableOpacity>
                <FontAwesome
                  name="angle-right"
                  color={Colors.grey50}
                  size={26}
                />
              </View>
            </View>
            <View flexG spread row marginT-16>
              <Text grey40 text80>
                {t('user.user_bg')}
              </Text>
              <View width={100} flexS left row centerV>
                {/* <TouchableOpacity onPress={() => setShowBgPicker(true)}>
                  <Image
                    style={styles.userBg}
                    resizeMode="contain"
                    source={{uri: bgImgUri}}
                    errorSource={require('@assets/images/user_bg.jpg')}
                  />
                </TouchableOpacity> */}
                <FontAwesome
                  name="angle-right"
                  color={Colors.grey50}
                  size={26}
                />
              </View>
            </View>
            <View flexG row spread centerV style={styles.inputLine}>
              <TextField
                label={t('user.user_name')}
                labelColor={Colors.grey40}
                text70
                enableErrors={shouldShowError(userInfo.user_name)}
                style={styles.input}
                placeholder={t('user.user_name_placeholder')}
                placeholderTextColor={Colors.grey50}
                validate={[value => value.length !== 0]}
                validationMessage={[t('user.user_name_empty')]}
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
                label={t('user.account')}
                labelColor={Colors.grey40}
                text70
                enableErrors={shouldShowError(userInfo.self_account)}
                style={styles.input}
                placeholder={t('user.account_placeholder')}
                placeholderTextColor={Colors.grey50}
                validate={[value => value.length > 5]}
                validationMessage={[t('user.account_min_length')]}
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
                label={t('user.birthday')}
                labelColor={Colors.grey40}
                title={t('user.birthday_title')}
                placeholder={t('user.birthday_placeholder')}
                mode={'date'}
                value={new Date(userInfo.birthday)}
                onChange={value => {
                  updateNeedSave();
                  setUserInfo({...userInfo, birthday: value});
                }}
              />
            </View>
            <View flexG row spread centerV marginT-16>
              <Text grey40>{t('user.gender')}</Text>
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
              label={t('common.save')}
              borderRadius={12}
              onPress={submitData}
            />
          )}
        </View>
      </ScrollView>
      <ImgPicker
        isAvatar={true}
        visible={showPicker}
        setVisible={setShowPicker}
        isCleanCache={isCleanCache}
        onSelected={fileInfo => {
          setAvatarUri(fileInfo.uri);
          setAvatarFile(fileInfo);
          updateNeedSave();
        }}
      />
      <ImgPicker
        visible={showBgPicker}
        setVisible={setShowBgPicker}
        isCleanCache={isCleanCache}
        onSelected={fileInfo => {
          setBgImgUri(fileInfo.uri);
          setBgImgFile(fileInfo);
          updateNeedSave();
        }}
      />
      {submitting ? (
        <FullScreenLoading Message={t('common.modifying')} />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  image: {width: 64, height: 64, borderRadius: 4, marginRight: 12},
  userBg: {
    height: 64,
    borderRadius: 4,
    marginRight: 12,
  },
  input: {
    width: 200,
  },
  inputLine: {
    borderBottomColor: Colors.grey80,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
});
export default EditUser;
