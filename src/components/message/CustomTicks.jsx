import React from 'react';
import {ActivityIndicator} from 'react-native';
import {Colors, Text, View} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/* 自定义时间 */
const CustomTicks = ({message, uploadIds, nowUploadId, uploadProgress}) => {
  const {client_msg_id, status, msg_type} = message;
  const {t} = useTranslation();
  if (status === 'failed') {
    return (
      <View flexS>
        <Text text100L red40 center>
          <FontAwesome
            name="exclamation-circle"
            color={Colors.error}
            size={11}
          />
          &nbsp;{t('chat.msg_failed')}
        </Text>
      </View>
    );
  }
  if (msg_type !== 'text') {
    if (uploadIds.includes(client_msg_id) && nowUploadId === client_msg_id) {
      return (
        <View flexG row center marginT-4>
          <ActivityIndicator color={Colors.primary} size={14} />
          <Text marginL-4 grey30 text100L>
            {t('chat.msg_sending')}{uploadProgress.toFixed(0)}%
          </Text>
        </View>
      );
    }
    if (uploadIds.includes(client_msg_id) && nowUploadId !== client_msg_id) {
      return (
        <View flexG row center marginT-4>
          <Text marginL-4 grey30 text100L>
            {t('chat.msg_waiting')}
          </Text>
        </View>
      );
    }
  }
};

export default CustomTicks;
