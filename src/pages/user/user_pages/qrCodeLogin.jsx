import React from 'react';
import {View, Text, Card, Colors, Button, Avatar} from 'react-native-ui-lib';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {qrCodeLogin} from '@api/login';
import {useToast} from '@components/common/useToast';

const QrCodeLogin = ({navigation, route}) => {
  const {qrcode_id} = route?.params || {};
  const {showToast} = useToast();

  const {t} = useTranslation();
  const {userInfo, refresh_token, login} = useUserStore();
  const {envConfig} = useConfigStore();

  const loginFunc = async () => {
    try {
      const loginRes = await qrCodeLogin({
        qrcode_id: qrcode_id,
        refresh_token: refresh_token,
      });
      if (loginRes.code === 0) {
        login(loginRes.data);
        showToast(t('login.auth_success'), 'success');
        return;
      }
      showToast(t('login.auth_failed'), 'error');
    } catch (error) {
      console.error(error);
    } finally {
      navigation.navigate('User');
    }
  };

  return (
    <View flexS top padding-16>
      <Card flexS centerV enableShadow={false} paddingV-32 center>
        <Avatar
          source={{
            uri: envConfig.STATIC_URL + userInfo?.user_avatar,
          }}
          imageProps={{errorSource: require('@assets/images/empty.jpg')}}
          backgroundColor={Colors.transparent}
          size={80}
        />
        <Text text60 marginT-12>
          {userInfo?.user_name}
        </Text>
        {userInfo?.self_account ? (
          <Text text80 grey30>
            {t('user.account')}: {userInfo.self_account}
          </Text>
        ) : null}
        <Text grey30 marginT-16>
          {t('user.qr_code_login_tips')}
        </Text>
      </Card>

      <Button
        marginT-16
        backgroundColor={Colors.primary}
        label={t('user.qr_code_login')}
        onPress={() => loginFunc()}
      />
    </View>
  );
};

export default QrCodeLogin;
