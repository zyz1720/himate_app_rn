import React, {useEffect, useState} from 'react';
import {StatusBar, AppState} from 'react-native';
import {Colors} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {displayName} from '@root/app.json';
import {install} from 'react-native-quick-crypto';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {useSettingStore} from '@store/settingStore';
import {useErrorMsgStore} from '@store/errorMsgStore';
import {useTranslation} from 'react-i18next';
import {useSocketStore} from '@store/socketStore';
import {useAppStateStore} from '@store/appStateStore';
import {UNREAD} from '@const/sse_path';
import {useSse} from '@utils/hooks/useSse';
import {addEventListener} from '@react-native-community/netinfo';
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
  const {setNetworkIsConnected, setIsAppActive} = useAppStateStore();

  const {socketInit} = useSocketStore();
  const {sseInit} = useSse(UNREAD);

  // 监听网络状态变化
  const unsubscribeNetInfo = addEventListener(state => {
    const {isConnected, isInternetReachable} = state;
    setNetworkIsConnected(isConnected && isInternetReachable);
  });

  // 监听应用状态
  const unsubscribeAppState = AppState.addEventListener(
    'change',
    nextAppState => {
      setIsAppActive(nextAppState === 'active');
    },
  );

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
    if (isLogin && !configLoading) {
      setUserInfo();
      socketInit();
      sseInit();
    }
  }, [isLogin, configLoading]);

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

  // 监听网络状态变化
  useEffect(() => {
    initializeApp();
    return () => {
      unsubscribeNetInfo();
      unsubscribeAppState?.remove();
    };
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
        <FullScreenLoading message={displayName + t('common.init_loading')} />
      ) : (
        <RootScreen />
      )}
    </>
  );
};

export default RootView;
