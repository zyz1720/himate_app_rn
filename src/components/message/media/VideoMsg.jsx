import React, {useState} from 'react';
import {StyleSheet, ActivityIndicator} from 'react-native';
import {View, Colors, Text, TouchableOpacity, Image} from 'react-native-ui-lib';
import {formatSeconds} from '@utils/common/time_utils';
import {useTranslation} from 'react-i18next';
import {useToast} from '@components/common/useToast';
import VideoModal from '@components/common/VideoModal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedScanner from '@components/common/AnimatedScanner';

const styles = StyleSheet.create({
  video: {
    width: 150,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  videoControl: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    borderRadius: 12,
  },
  videoTime: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    color: Colors.white,
    fontSize: 12,
  },
});

const VideoMsg = React.memo(props => {
  const {
    currentMessage = {},
    uploadIds = [],
    nowUploadId = null,
    uploadProgress = 0,
    onLongPress = () => {},
  } = props;
  const {t} = useTranslation();
  const {showToast} = useToast();

  const {thumbnail, duration: videoDuration} = currentMessage?.videoInfo || {};

  const [videoLoading, setVideoLoading] = useState(true);
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState(thumbnail);

  return (
    <>
      <View>
        <Image
          style={styles.video}
          source={{uri: videoThumbnail}}
          errorSource={require('@assets/images/video_empty.jpg')}
          onLoadEnd={() => setVideoLoading(false)}
          onError={() => setVideoThumbnail(null)}
          resizeMode="cover"
        />
        {videoLoading ? (
          <View style={styles.videoControl}>
            <ActivityIndicator color={Colors.white} />
            <Text text90L white marginT-4>
              {t('common.video_loading')}
            </Text>
          </View>
        ) : videoThumbnail ? (
          <TouchableOpacity
            style={styles.videoControl}
            onLongPress={() => {
              onLongPress({
                type: 'media',
                url: currentMessage?.video,
              });
            }}
            onPress={() => setVideoVisible(true)}>
            <AntDesign name="playcircleo" color={Colors.white} size={32} />
            <Text style={styles.videoTime}>{formatSeconds(videoDuration)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.videoControl}>
            <FontAwesome
              name="exclamation-circle"
              color={Colors.white}
              size={20}
            />
            <Text text90L white marginT-4>
              {t('common.video_loading_failed')}
            </Text>
          </View>
        )}
        {uploadIds.includes(currentMessage._id) ? (
          <AnimatedScanner
            progress={currentMessage?._id === nowUploadId ? uploadProgress : 0}
            borderRadius={12}
          />
        ) : null}
      </View>
      {/* 视频播放器 */}
      <VideoModal
        uri={currentMessage?.video}
        visible={videoVisible}
        onPressClose={() => {
          setVideoVisible(false);
          console.log(currentMessage?.video);
        }}
        onClose={() => setVideoVisible(false)}
        onError={e => {
          showToast(t('common.video_load_failed'), 'error');
          console.log(e);
        }}
      />
    </>
  );
});

export default VideoMsg;
