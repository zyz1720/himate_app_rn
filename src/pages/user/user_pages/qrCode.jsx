import React from 'react';
import {View, Text, Card, Colors, Button, Avatar} from 'react-native-ui-lib';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import QRCode from 'react-native-qrcode-svg';

const BaseQRCode = ({navigation}) => {
  const {t} = useTranslation();
  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();

  return (
    <View flexG top paddingH-16 paddingT-16>
      <Card flexS centerV enableShadow={false} marginT-32 paddingV-32 center>
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
        <View marginT-16 center>
          <QRCode
            size={200}
            logo={{uri: envConfig.STATIC_URL + userInfo?.user_avatar}}
            logoBorderRadius={20}
            logoBackgroundColor="white"
            value={userInfo?.self_account}
          />
        </View>
        <Text grey30 marginT-16>
          {t('user.qr_code_tip')}
        </Text>

        <View marginT-16 row center>
          <Button
            label={t('user.add_friend')}
            link
            color={Colors.primary}
            size="small"
            onPress={() => {
              navigation.navigate('AddMate');
            }}
          />
          <View marginL-4>
            <FontAwesome name="angle-right" size={20} color={Colors.primary} />
          </View>
        </View>
      </Card>
    </View>
  );
};

export default BaseQRCode;
