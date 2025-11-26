import React, {useState} from 'react';
import {
  View,
  Text,
  Card,
  Colors,
  Image,
  TouchableOpacity,
  Dialog,
  Button,
  ProgressBar,
} from 'react-native-ui-lib';
import {
  StyleSheet,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from 'react-native';
import {useToast} from '@utils/hooks/useToast';
import {downloadFile} from '@utils/system/file_utils';
import {getAppVersion} from '@api/app_package';
import {name as appName, displayName} from '@root/app.json';
import {isEmptyObject} from '@utils/common/object_utils';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {compareVersions} from '@utils/common/string_utils';
import {useTranslation} from 'react-i18next';
import DeviceInfo from 'react-native-device-info';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';
import ImgModal from '@components/common/ImgModal';
import ListItem from '@components/common/ListItem';

const styles = StyleSheet.create({
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: Colors.white,
    borderWidth: 0.2,
  },
  userBgImage: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.white,
  },
});

const User = ({navigation}) => {
  const {t} = useTranslation();
  const {showToast} = useToast();
  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();

  const [avatarShow, setAvatarShow] = useState(false);

  const versionName = DeviceInfo.getVersion();

  const [showAppUpdate, setShowAppUpdate] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newAppInfo, setNewAppInfo] = useState({});
  const [isNewVersion, setIsNewVersion] = useState(false);

  const checkUpdate = async () => {
    try {
      setUpdateLoading(true);
      const res = await getAppVersion();
      if (res.code === 0) {
        setNewAppInfo(res.data);
        setIsNewVersion(
          compareVersions(versionName, res.data.app_version) === -1,
        );
        return;
      }
      setShowAppUpdate(false);
      showToast(res.message, 'error');
    } catch (error) {
      console.error(error);
      setShowAppUpdate(false);
    } finally {
      setUpdateLoading(false);
    }
  };

  // 下载app
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const downloadApp = async () => {
    setShowProgress(true);
    const android = ReactNativeBlobUtil.android;
    const downloadRes = await downloadFile(
      envConfig.STATIC_URL + newAppInfo.file.file_key,
      {
        fileName: appName + '_' + newAppInfo.app_version + '.apk',
        onProgress: progress => setDownloadProgress(progress),
      },
    );
    setDownloadProgress(0);
    setShowProgress(false);
    if (downloadRes) {
      showToast(t('common.download_apk_success'), 'success');
      android.actionViewIntent(
        downloadRes,
        'application/vnd.android.package-archive',
      );
    } else {
      showToast(t('common.download_apk_failed'), 'error');
    }
    setShowAppUpdate(false);
  };

  const [bgSource, setBgSource] = useState({
    uri: envConfig.STATIC_URL + userInfo?.user_bg_img,
  });

  return (
    <>
      {isEmptyObject(userInfo) ? (
        <FullScreenLoading Message={displayName + ' ' + t('common.loading')} />
      ) : (
        <View flexG top paddingH-16 paddingT-16>
          <ImageBackground
            style={styles.userBgImage}
            source={bgSource}
            onError={() => setBgSource(require('@assets/images/user_bg.jpg'))}
            resizeMode="cover">
            <View backgroundColor={Colors.black2}>
              <View
                flexS
                left
                row
                centerV
                enableShadow={false}
                padding-16
                marginT-80>
                <TouchableOpacity
                  onPress={() => {
                    setAvatarShow(true);
                  }}>
                  <Image
                    source={{uri: envConfig.STATIC_URL + userInfo?.user_avatar}}
                    style={styles.image}
                    errorSource={require('@assets/images/empty.jpg')}
                  />
                </TouchableOpacity>
                <View marginL-16 flexG>
                  <Text white text70BO numberOfLines={1}>
                    {userInfo?.user_name}
                  </Text>
                  <View width={166}>
                    <Text white text80 numberOfLines={1}>
                      {t('user.account')}
                      {userInfo?.self_account}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  paddingV-16
                  paddingL-16
                  onPress={() => {
                    navigation.navigate('QrCode');
                  }}>
                  <FontAwesome name="qrcode" color={Colors.white} size={32} />
                </TouchableOpacity>
                <TouchableOpacity
                  padding-18
                  onPress={() => {
                    navigation.navigate('EditUser');
                  }}>
                  <FontAwesome
                    name="angle-right"
                    color={Colors.grey50}
                    size={26}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
          <Card flexS centerV enableShadow={false} marginT-16>
            <ListItem
              itemName={t('user.account_safe')}
              iconName={'shield'}
              iconColor={Colors.green30}
              isBottomLine={true}
              onConfirm={() => {
                navigation.navigate('UserSafe');
              }}
            />
          </Card>
          <Card flexS centerV enableShadow={false} marginT-16>
            <ListItem
              itemName={t('common.setting')}
              iconName={'cog'}
              iconColor={Colors.grey30}
              onConfirm={() => {
                navigation.navigate('Setting');
              }}
            />
            <ListItem
              itemName={t('user.chat_msg')}
              iconName={'file-text'}
              iconSize={20}
              iconColor={Colors.blue40}
              onConfirm={() => {
                navigation.navigate('ChatMsg');
              }}
            />
            <ListItem
              itemName={t('user.cloud_data')}
              iconName={'database'}
              iconSize={20}
              iconColor={Colors.orange40}
              onConfirm={() => {
                navigation.navigate('DataManager');
              }}
            />
            <ListItem
              itemName={t('common.version_update')}
              iconName={'cloud-download'}
              iconSize={20}
              iconColor={Colors.violet40}
              rightText={versionName}
              onConfirm={() => {
                if (Platform.OS === 'ios') {
                  showToast(t('common.ios_not_support'), 'warning');
                  return;
                }
                setShowAppUpdate(true);
                checkUpdate();
              }}
            />
            <ListItem
              itemName={t('common.about') + displayName}
              iconName={'cube'}
              iconSize={20}
              iconColor={Colors.cyan30}
              onConfirm={() => {
                navigation.navigate('WebView', {
                  title: t('common.about') + displayName,
                  url: envConfig.STATIC_URL + 'default_assets/index.html',
                });
              }}
            />
          </Card>
          <Dialog
            visible={showAppUpdate}
            onDismiss={() => setShowAppUpdate(false)}>
            <Card flexS padding-16>
              {updateLoading ? (
                <View flexS paddingH-16>
                  <ActivityIndicator color={Colors.primary} size={'large'} />
                  <Text marginT-16 text70BO center>
                    {t('common.checking_update')}
                  </Text>
                </View>
              ) : (
                <View flexS>
                  <Text text70BO>
                    {isNewVersion
                      ? t('common.new_version')
                      : t('common.latest_version')}
                    <Text text80BO green30>
                      {newAppInfo?.app_version}
                    </Text>
                  </Text>
                  <Text marginT-2 grey30>
                    {t('common.version_description')}：
                    {newAppInfo?.app_description}
                  </Text>
                  {showProgress ? null : (
                    <View flexS marginT-12>
                      <Button
                        label={
                          isNewVersion
                            ? t('common.immediate_update')
                            : t('common.download_install_pkg')
                        }
                        backgroundColor={Colors.primary}
                        onPress={downloadApp}
                      />
                    </View>
                  )}
                </View>
              )}
              {showProgress ? (
                <View marginT-16>
                  <Text marginB-16>
                    {t('common.download_pkg_progress')}：{downloadProgress}%
                  </Text>
                  <ProgressBar
                    progress={downloadProgress}
                    progressColor={Colors.primary}
                  />
                </View>
              ) : null}
            </Card>
          </Dialog>

          <ImgModal
            uris={[envConfig.STATIC_URL + userInfo?.user_avatar]}
            visible={avatarShow}
            onClose={() => {
              setAvatarShow(false);
            }}
          />
        </View>
      )}
    </>
  );
};

export default User;
