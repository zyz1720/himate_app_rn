import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {MessageText} from 'react-native-gifted-chat';
import {getFileColor} from '@utils/system/file_utils';
import {MsgTypeEnum} from '@const/database_enum';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
  fileContainer: {
    borderRadius: 8,
  },
  fileExt: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
});

/* 自定义文件消息 */
const CustomFileMessage = React.memo(props => {
  const {currentMessage, onLongPress = () => {}, onPress = () => {}} = props;
  return (
    <>
      {currentMessage.msg_type === MsgTypeEnum.file ? (
        <TouchableOpacity
          bg-white
          padding-8
          margin-4
          style={styles.fileContainer}
          onPress={onPress}
          onLongPress={() => {
            onLongPress({
              type: 'file',
              url: currentMessage?.file,
            });
          }}>
          <FontAwesome
            name="file"
            color={getFileColor(currentMessage.text)}
            size={80}
          />
          <Text white text50BL style={styles.fileExt}>
            {currentMessage.text}
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          <MessageText {...props} />
        </View>
      )}
    </>
  );
});

export default CustomFileMessage;
