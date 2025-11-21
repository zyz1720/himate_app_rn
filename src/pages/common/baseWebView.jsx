import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native-ui-lib';
import {WebView} from 'react-native-webview';
import {useConfigStore} from '@store/configStore';
import {useToast} from '@utils/hooks/useToast';
import {useTranslation} from 'react-i18next';

const BaseWebView = ({route}) => {
  const {url} = route.params || {};
  const {envConfig} = useConfigStore();
  const {showToast} = useToast();
  const {t} = useTranslation();

  return (
    <View style={styles.webView}>
      <WebView
        source={{
          uri: url || envConfig.STATIC_URL + 'default_assets/index.html',
        }}
        onError={error => {
          showToast('web' + t('common.load_error'), 'error');
          console.error(error);
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});

export default BaseWebView;
