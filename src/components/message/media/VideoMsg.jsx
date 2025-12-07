import React, {useEffect, useState} from 'react';
import {StyleSheet, ActivityIndicator, Vibration} from 'react-native';
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
import {useToast} from '@components/common/useToast';
import {downloadFile} from '@utils/system/file_utils';
import VideoModal from '@components/common/VideoModal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Video from 'react-native-video';
import BaseSheet from '@components/common/BaseSheet';
import Clipboard from '@react-native-clipboard/clipboard';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const VideoMsg = React.memo(props => {
  const {
    currentMessage = {},
    uploadIds = [],
    nowUploadId = null,
    uploadProgress = 0,
  } = props;

  const {t} = useTranslation();
  const {showToast} = useToast();

  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);

  const [videoVisible, setVideoVisible] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const onSave = async url => {
    showToast(t('component.image_saving'), 'success');
    const pathRes = await downloadFile(url, {isInCameraRoll: true});
    if (pathRes) {
      showToast(t('component.save_to') + pathRes, 'success');
    } else {
      showToast(t('component.save_failed'), 'error');
    }
  };

  useEffect(() => {
    if (currentMessage?.video) {
      createVideoThumbnail(currentMessage?.video)
        .then(res => {
          setVideoLoading(false);
          setVideoThumbnail(res.path);
        })
        .catch(error => {
          setVideoLoading(false);
          console.error(error);
        });
    }
  }, [currentMessage]);

  return (
    <>
      <View>
        <Video
          source={{uri: currentMessage?.video}}
          paused={true}
          onLoad={e => {
            setVideoDuration(e.duration);
          }}
        />
        <Image
          style={styles.video}
          source={{uri: videoThumbnail}}
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
              Vibration.vibrate(50);
              setShowActionSheet(true);
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
            progress={nowUploadId === currentMessage._id ? uploadProgress : 0}
            duration={1200}
            backgroundColor={Colors.black}
            opacity={0.5}
          />
        ) : null}
      </View>
      {/* 视频播放器 */}
      <VideoModal
        uri={currentMessage?.video}
        visible={videoVisible}
        onPressClose={() => {
          setVideoVisible(false);
        }}
        onClose={() => setVideoVisible(false)}
        onError={e => {
          showToast(t('common.video_load_failed'), 'error');
          console.log(e);
        }}
      />
      {/* 保存文件弹窗 */}
      <BaseSheet
        title={t('component.save_file')}
        visible={showActionSheet}
        setVisible={setShowActionSheet}
        actions={[
          {
            label: t('component.save_to_album'),
            color: Colors.primary,
            onPress: () => onSave(currentMessage.video),
          },
          {
            label: t('common.copy_link'),
            color: Colors.success,
            onPress: () => {
              Clipboard.setString(currentMessage.video);
              setShowActionSheet(false);
              showToast(t('common.copy_link_success'), 'success');
            },
          },
        ]}
      />
    </>
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
