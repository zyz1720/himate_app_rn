import React from 'react';
import {StyleSheet, Modal} from 'react-native';
import {View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useSettingStore} from '@store/settingStore';
import {useConfigStore} from '@store/configStore';
import AntDesign from 'react-native-vector-icons/AntDesign';
import VideoPlayer from 'react-native-video-player';

const VideoModal = React.memo(props => {
  const {
    visible = false,
    onClose = () => {},
    onPressClose = () => {},
    onError = () => {},
    uri = '',
  } = props;

  const {envConfig} = useConfigStore();
  const {isFullScreen} = useSettingStore();

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}>
      {isFullScreen ? null : (
        <View padding-12 row center backgroundColor={Colors.primary}>
          <TouchableOpacity style={styles.BackBut} onPress={onPressClose}>
            <AntDesign name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View paddingT-4>
            <Text white text70>
              视频播放器
            </Text>
          </View>
        </View>
      )}
      <View height={'100%'} centerV bg-black>
        <VideoPlayer
          endWithThumbnail
          thumbnail={{
            uri: envConfig.STATIC_URL + 'default_video_thumbnail.jpg',
          }}
          source={{
            uri: uri,
          }}
          autoplay={true}
          onError={onError}
          showDuration={true}
        />
      </View>
    </Modal>
  );
});
const styles = StyleSheet.create({
  BackBut: {
    position: 'absolute',
    left: 16,
    top: 12,
  },
});

export default VideoModal;
