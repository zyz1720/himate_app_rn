import React, {useEffect, useState} from 'react';
import {StyleSheet, ActivityIndicator} from 'react-native';
import {
  View,
  Colors,
  Text,
  TouchableOpacity,
  AnimatedScanner,
  Image,
} from 'react-native-ui-lib';
import {formatSeconds} from '@utils/common/time_utils';
import {createVideoThumbnail} from 'react-native-compressor';
import {useTranslation} from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Video from 'react-native-video';

const VideoMsg = React.memo(props => {
  const {
    message = '',
    onPress = () => {},
    onLongPress = () => {},
    uploadingIds = [],
    nowSendId = null,
    uploadProgress = 0,
  } = props;

  const {t} = useTranslation();

  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    if (message?.video) {
      createVideoThumbnail(message?.video)
        .then(res => {
          setVideoLoading(false);
          setVideoThumbnail(res.path);
        })
        .catch(error => {
          setVideoLoading(false);
          console.error(error);
        });
    }
  }, [message]);

  return (
    <View>
      <Video
        source={{uri: message?.video}}
        paused={true}
        onLoad={e => {
          setVideoDuration(e.duration);
        }}
      />
      <Image
        key={videoThumbnail}
        style={styles.video}
        source={{uri: videoThumbnail}}
        resizeMode="cover"
      />
      {videoLoading ? (
        <View style={styles.videoControl}>
          <ActivityIndicator color={Colors.white} />
          <Text text90L white marginT-4>
            {t('video.loading')}
          </Text>
        </View>
      ) : videoThumbnail ? (
        <TouchableOpacity
          style={styles.videoControl}
          onLongPress={onLongPress}
          onPress={onPress}>
          <AntDesign name="playcircleo" color={Colors.white} size={32} />
          <Text style={styles.videoTime}>{formatSeconds(videoDuration)}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.videoControl}>
          <Text text90L white>
            {t('video.loading_failed')}
          </Text>
        </View>
      )}
      {uploadingIds.includes(message._id) ? (
        <AnimatedScanner
          progress={nowSendId === message._id ? uploadProgress : 0}
          duration={1200}
          backgroundColor={Colors.black}
          opacity={0.5}
        />
      ) : null}
    </View>
  );
});

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
    backgroundColor: 'rgba(0,0,0,0.4)',
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

export default VideoMsg;
