import React, {useState, useEffect} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {
  View,
  Card,
  Text,
  Colors,
  Dialog,
  ColorPicker,
  Switch,
} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {playSystemSound} from '@utils/system/notification';
import {displayName} from '@root/app.json';
import {getAppConfig} from '@api/app_config';
import {deepClone} from '@utils/common/object_utils';
import {useSettingStore} from '@store/settingStore';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {UserRoleEnum} from '@const/database_enum';
import {useTranslation} from 'react-i18next';
import ListItem from '@components/common/ListItem';
import BaseColorPicker from '@components/setting/BaseColorPicker';
import BaseSheet from '@components/common/BaseSheet';

const superRole = [UserRoleEnum.admin, UserRoleEnum.vip];

const Setting = ({navigation}) => {
  const {showToast} = useToast();
  const {
    themeColor,
    toastType,
    isMusicApp,
    isFullScreen,
    isPlaySound,
    notSaveMsg,
    isFastStatic,
    isEncryptMsg,
    ringtone,
    language,
    isFollowSystemLanguage,
    setThemeColor,
    setToastType,
    setIsPlaySound,
    setIsFullScreen,
    setNotSaveMsg,
    setIsEncryptMsg,
    setIsFastStatic,
    setIsMusicApp,
    setRingtone,
    setLanguage,
    setIsFollowSystemLanguage,
  } = useSettingStore();
  const {userInfo} = useUserStore();
  const {envConfig, updateEnvConfig} = useConfigStore();
  const {t} = useTranslation();

  const soundNames = [
    {id: 1, name: t('setting.default'), value: 'default_1.mp3'},
    {id: 2, name: t('setting.ring2'), value: 'default_2.mp3'},
    {id: 3, name: t('setting.ring3'), value: 'default_3.mp3'},
    {id: 4, name: t('setting.ring4'), value: 'default_4.mp3'},
  ];

  // 获取颜色
  const [showDialog, setShowDialog] = useState(false);

  // 消息提示类型
  const [showToastType, setShowToastType] = useState(false);

  // 首选语言
  const [showLanguage, setShowLanguage] = useState(false);

  // 音效选择
  const [showAudio, setShowAudio] = useState(false);

  // 查看文件位置
  const [showFileLocation, setShowFileLocation] = useState(false);

  // 默认应用
  const [showDefaultApp, setShowDefaultApp] = useState(false);

  // 设置静态资源地址
  const settingStaticUrl = async value => {
    const newUrlInfo = deepClone(envConfig);
    const staticUrl = await getAppConfig();
    if (value) {
      newUrlInfo.STATIC_URL = staticUrl.FAST_STATIC_URL;
    } else {
      newUrlInfo.STATIC_URL = staticUrl.STATIC_URL;
    }
    updateEnvConfig(newUrlInfo);
  };

  return (
    <>
      <View flexG paddingH-16 paddingT-16>
        <Card enableShadow={false}>
          <ListItem
            itemName={t('setting.themeColor')}
            iconName={'dropbox'}
            iconColor={themeColor}
            onConfirm={() => {
              setShowDialog(true);
            }}
          />
          <ListItem
            itemName={t('setting.toastType')}
            iconName={'question-circle'}
            iconColor={Colors.blue30}
            onConfirm={() => {
              setShowToastType(true);
            }}
          />
          <ListItem
            itemName={t('setting.language')}
            iconName={'language'}
            iconColor={Colors.blue30}
            onConfirm={() => {
              setShowLanguage(true);
            }}
          />
          <ListItem
            itemName={t('setting.fullScreenMode')}
            iconName={'square-o'}
            iconColor={Colors.grey30}
            renderRight={
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={isFullScreen}
                onValueChange={value => setIsFullScreen(value)}
              />
            }
          />
          <ListItem
            itemName={t('setting.defaultApp')}
            iconName={'tablet'}
            iconColor={Colors.blue50}
            onConfirm={() => {
              setShowDefaultApp(true);
            }}
          />
        </Card>
        <Card marginT-16 enableShadow={false}>
          <ListItem
            itemName={t('setting.messageSound')}
            iconName={'volume-up'}
            iconColor={Colors.cyan30}
            onConfirm={() => {
              setShowAudio(true);
            }}
          />
          <ListItem
            itemName={t('setting.messageAlert')}
            iconName={'bell'}
            iconColor={Colors.yellow30}
            renderRight={
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={isPlaySound}
                onValueChange={value => setIsPlaySound(value)}
              />
            }
          />
          <ListItem
            itemName={t('setting.messageEncrypt')}
            iconName={'lock'}
            iconColor={Colors.grey30}
            renderRight={
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={isEncryptMsg}
                onValueChange={value => setIsEncryptMsg(value)}
              />
            }
          />
          <ListItem
            itemName={t('setting.notSaveMsg')}
            iconName={'times-circle'}
            iconColor={Colors.red30}
            renderRight={
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={notSaveMsg}
                onValueChange={value => setNotSaveMsg(value)}
              />
            }
          />
        </Card>

        <Card marginT-16 enableShadow={false}>
          <ListItem
            itemName={t('setting.permissionManage')}
            iconName={'lock'}
            iconColor={Colors.red40}
            onConfirm={() => {
              navigation.navigate('Permissions');
            }}
          />
          <ListItem
            itemName={t('setting.fileLocation')}
            iconName={'folder'}
            iconColor={Colors.blue40}
            onConfirm={() => {
              setShowFileLocation(true);
            }}
          />
          {superRole.includes(userInfo?.user_role) ? (
            <ListItem
              itemName={t('setting.fastStatic')}
              iconName={'rocket'}
              iconColor={Colors.red20}
              renderRight={
                <Switch
                  onColor={Colors.primary}
                  offColor={Colors.grey50}
                  value={isFastStatic}
                  onValueChange={value => {
                    setIsFastStatic(value);
                    settingStaticUrl(value);
                  }}
                />
              }
            />
          ) : null}
        </Card>
      </View>

      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Card padding-16 row left style={styles.flexWrap}>
          <BaseColorPicker
            selectedColor={themeColor}
            onConfirm={item => {
              setThemeColor(item.color);
              showToast(t('setting.setSuccess'), 'success');
              setShowDialog(false);
            }}
          />
          <View flexS row centerV paddingH-24>
            <Text>{t('setting.customThemeColor')}</Text>
            <ColorPicker
              colors={[Colors.primary]}
              initialColor={Colors.primary}
              value={Colors.primary}
              onSubmit={color => {
                setThemeColor(color);
                showToast(t('setting.setSuccess'), 'success');
                setShowDialog(false);
              }}
            />
          </View>
        </Card>
      </Dialog>
      <BaseSheet
        title={t('setting.toastType_select')}
        visible={showToastType}
        setVisible={setShowToastType}
        actions={[
          {
            label: t('setting.default'),
            color: toastType === 'system' ? Colors.primary : Colors.grey30,
            onPress: () => {
              setToastType('system');
              showToast(t('setting.setSuccess'), 'success', true);
              setShowToastType(false);
            },
          },
          {
            label: t('setting.toast_top'),
            color: toastType === 'top' ? Colors.primary : Colors.grey30,
            onPress: () => {
              setToastType('top');
              showToast(t('setting.setSuccess'), 'success', true);
              setShowToastType(false);
            },
          },
          {
            label: t('setting.toast_bottom'),
            color: toastType === 'bottom' ? Colors.primary : Colors.grey30,
            onPress: () => {
              setToastType('bottom');
              showToast(t('setting.setSuccess'), 'success', true);
              setShowToastType(false);
            },
          },
        ]}
      />
      <BaseSheet
        title={t('setting.defaultApp_select')}
        visible={showDefaultApp}
        setVisible={setShowDefaultApp}
        actions={[
          {
            label: t('setting.chatApp'),
            color: isMusicApp ? Colors.grey30 : Colors.primary,
            onPress: () => {
              setIsMusicApp(false);
              showToast(t('setting.on_chatApp'), 'success', true);
              setShowDefaultApp(false);
            },
          },
          {
            label: t('setting.musicApp'),
            color: isMusicApp ? Colors.primary : Colors.grey30,
            onPress: () => {
              setIsMusicApp(true);
              showToast(t('setting.on_musicApp'), 'success', true);
              setShowDefaultApp(false);
            },
          },
        ]}
      />
      <BaseSheet
        title={t('setting.messageSound')}
        visible={showAudio}
        setVisible={setShowAudio}
        actions={soundNames.map(item => {
          return {
            label: item.name,
            color: ringtone === item.value ? Colors.primary : Colors.grey30,
            onPress: () => {
              playSystemSound(item.value);
              setRingtone(item.value);
              showToast(t('setting.setSuccess'), 'success', true);
              setShowAudio(false);
            },
          };
        })}
      />
      <BaseSheet
        title={t('setting.language')}
        visible={showLanguage}
        setVisible={setShowLanguage}
        actions={[
          {
            label: t('setting.follow_system'),
            color: isFollowSystemLanguage ? Colors.primary : Colors.grey30,
            onPress: () => {
              setIsFollowSystemLanguage(true);
              showToast(t('setting.setSuccess'), 'success', true);
              setShowLanguage(false);
            },
          },
          {
            label: t('setting.zh'),
            color:
              !isFollowSystemLanguage && language === 'zh'
                ? Colors.primary
                : Colors.grey30,
            onPress: () => {
              setLanguage('zh');
              setIsFollowSystemLanguage(false);
              showToast(t('setting.setSuccess'), 'success', true);
              setShowLanguage(false);
            },
          },
          {
            label: t('setting.en'),
            color:
              !isFollowSystemLanguage && language === 'en'
                ? Colors.primary
                : Colors.grey30,
            onPress: () => {
              setLanguage('en');
              setIsFollowSystemLanguage(false);
              showToast(t('setting.setSuccess'), 'success', true);
              setShowLanguage(false);
            },
          },
        ]}
      />
      <Dialog
        visible={showFileLocation}
        onDismiss={() => setShowFileLocation(false)}>
        <Card flexS padding-16>
          <View flexS paddingH-16>
            <Text text70BO>{t('setting.imageVideoLocation')}</Text>
            {Platform.OS === 'ios' ? (
              <Text color={Colors.primary}>
                {t('setting.imageVideoLocation_ios', {name: displayName})}
              </Text>
            ) : (
              <Text color={Colors.primary}>
                {t('setting.imageVideoLocation_android', {name: displayName})}
              </Text>
            )}
          </View>
          <View marginT-16 flexS paddingH-16>
            <Text text70BO>{t('setting.other_fileLocation')}</Text>
            {Platform.OS === 'ios' ? (
              <Text color={Colors.primary}>
                {t('setting.other_fileLocation_ios', {name: displayName})}
              </Text>
            ) : (
              <Text color={Colors.primary}>
                {t('setting.other_fileLocation_android', {name: displayName})}
              </Text>
            )}
          </View>
        </Card>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  flexWrap: {
    flexWrap: 'wrap',
  },
});

export default Setting;
