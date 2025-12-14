import React from 'react';
import {ActivityIndicator} from 'react-native';
import {Colors, Text, View} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import {MsgTypeEnum} from '@const/database_enum';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/* 自定义消息状态 */
const CustomTicks = React.memo(
  ({message, uploadIds, nowUploadId, uploadProgress, searchMsgCid}) => {
    const {_id, status, msg_type} = message;
    const {t} = useTranslation();
    const isSearchMsg = searchMsgCid === _id;
    const isFailedMsg = status === 'failed';

    if (isFailedMsg || isSearchMsg) {
      return (
        <View flexS>
          {isFailedMsg ? (
            <Text text100L red40 center>
              <FontAwesome
                name="exclamation-circle"
                color={Colors.error}
                size={11}
              />
              &nbsp;{t('chat.msg_failed')}
            </Text>
          ) : null}
          {isSearchMsg ? (
            <Text text100L white center>
              <FontAwesome
                name="check-circle-o"
                color={Colors.white}
                size={11}
              />
              &nbsp;{t('chat.msg_searched')}
            </Text>
          ) : null}
        </View>
      );
    }
    if (msg_type && msg_type !== MsgTypeEnum.text) {
      if (uploadIds.includes(_id) && nowUploadId === _id) {
        return (
          <View flexG row center marginT-4>
            <ActivityIndicator color={Colors.primary} size={14} />
            <Text marginL-4 grey30 text100L>
              {t('chat.msg_sending')}
              {uploadProgress.toFixed(0)}%
            </Text>
          </View>
        );
      }
      if (uploadIds.includes(_id) && nowUploadId !== _id) {
        return (
          <View flexG row center marginT-4>
            <Text marginL-4 grey30 text100L>
              {t('chat.msg_waiting')}
            </Text>
          </View>
        );
      }
    }
  },
);

export default CustomTicks;
