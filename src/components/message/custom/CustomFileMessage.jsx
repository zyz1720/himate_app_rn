import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {MessageText} from 'react-native-gifted-chat';
import {getFileColor} from '@utils/system/file_utils';
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
const CustomFileMessage = props => {
  const {currentMessage, onPress = () => {}, onLongPress = () => {}} = props;

  if (currentMessage.msg_type === 'file') {
    return (
      <TouchableOpacity
        bg-white
        padding-8
        margin-4
        style={styles.fileContainer}
        onPress={onPress}
        onLongPress={onLongPress}>
        <FontAwesome
          name="file"
          color={getFileColor(currentMessage.text)}
          size={80}
        />
        <Text white text50BL style={styles.fileExt}>
          {currentMessage.text}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <View>
      <MessageText {...props} />
    </View>
  );
};

export default CustomFileMessage;
