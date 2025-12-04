import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {Colors} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {displayName} from '@root/app.json';
import {install} from 'react-native-quick-crypto';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {useSettingStore} from '@store/settingStore';
import {useErrorMsgStore} from '@store/errorMsgStore';
import {useTranslation} from 'react-i18next';
import {useSocket} from '@utils/hooks/useSocket';
import FullScreenLoading from '@components/common/FullScreenLoading';
import RootScreen from './rootScreen';
import i18n from 'i18next';
import 'react-native-get-random-values';

const RootView = () => {
  install();
  const {t} = useTranslation();
  const {showToast} = useToast();
  const {isLogin, setUserInfo} = useUserStore();
  const {envConfig, configLoading, updateEnvConfig} = useConfigStore();
  const {isFastStatic, themeColor, language, isFullScreen} = useSettingStore();
  const {errorMsg, clearMsgStore} = useErrorMsgStore();
  const {socketInit} = useSocket();

  // 在应用启动时
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeApp = async () => {
    await useSettingStore.persist.rehydrate();
    await useUserStore.persist.rehydrate();
    const {initThemeColors, initLanguage} = useSettingStore.getState();
    initThemeColors();
    initLanguage();
    setIsInitialized(true);
  };

  /**
   * 监听isLogin变化，当用户登录状态变化时，更新用户信息
   * @effect
   * @dependencies isLogin
   */
  useEffect(() => {
    if (isLogin) {
      setUserInfo();
      socketInit();
    }
  }, [isLogin]);

  // 是否启用高速静态资源
  useEffect(() => {
    if (isFastStatic && envConfig?.FAST_STATIC_URL) {
      const config = {...envConfig, STATIC_URL: envConfig.FAST_STATIC_URL};
      updateEnvConfig(config);
    }
  }, [isFastStatic, envConfig?.FAST_STATIC_URL]);

  // 全局错误提示
  useEffect(() => {
    if (errorMsg) {
      showToast(errorMsg, 'error');
    }
    return () => clearMsgStore();
  }, [errorMsg]);

  // 语言切换
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  // 初始化应用
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor={
          isLogin
            ? isFullScreen
              ? Colors.background
              : themeColor
            : Colors.white
        }
        barStyle={
          isLogin
            ? isFullScreen
              ? 'dark-content'
              : 'light-content'
            : 'dark-content'
        }
        translucent={false} // 将状态栏填充的高度隐藏
        hidden={false}
      />
      {configLoading || !isInitialized ? (
        <FullScreenLoading Message={displayName + t('common.init_loading')} />
      ) : (
        <RootScreen />
      )}
    </>
  );
};

export default RootView;
