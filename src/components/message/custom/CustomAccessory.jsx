import React, {useState} from 'react';
import {StyleSheet, Vibration, ActivityIndicator, Modal} from 'react-native';
import {Colors, TouchableOpacity, Text, View, Card} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {fullWidth, fullHeight} from '@style/index';
import {usePermissionStore} from '@store/permissionStore';
import {useTranslation} from 'react-i18next';
import {
  getFileFromAudioRecorderPlayer,
  getFileFromImageCropPicker,
  getFileFromDocumentPicker,
} from '@utils/system/file_utils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';

const styles = StyleSheet.create({
  sureBut: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 60,
    bottom: 140,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 100,
  },
  cancelBut: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 140,
    bottom: 60,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 100,
  },
  radioTips: {
    position: 'absolute',
    width: fullWidth,
    height: fullHeight,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black3,
  },
});

let recordTimer = null;
const audioRecorderPlayer = new AudioRecorderPlayer();

/* 自定义加载更多 */
const CustomAccessory = props => {
  const {
    onAudioRecordSuccess = () => {},
    onAudioRecordComplete = () => {},
    onShootSuccess = () => {},
    onShootComplete = () => {},
    onVideoRecordSuccess = () => {},
    onVideoRecordComplete = () => {},
    onImgPickSuccess = () => {},
    onImgPickComplete = () => {},
    onFilePickSuccess = () => {},
    onFilePickComplete = () => {},
    onClose = () => {},
  } = props;
  const {showToast} = useToast();
  const {t} = useTranslation();
  const {
    accessCamera,
    setAccessCamera,
    accessFolder,
    setAccessFolder,
    accessMicrophone,
    setAccessMicrophone,
  } = usePermissionStore();

  const [recordTime, setRecordTime] = useState(0);
  const [recordFlag, setRecordFlag] = useState('');

  const [visible, setVisible] = useState(false);

  const recorderVisible = useSharedValue(false);
  const isSureSend = useSharedValue(false);
  const isCancelSend = useSharedValue(false);

  const setRecordTimeValue = () => {
    recordTimer = setInterval(() => {
      setRecordTime(prev => prev + 1);
    }, 1000);
  };

  /* 开始录制语音 */
  const startRecord = () => {
    if (!accessMicrophone) {
      showToast(t('permissions.microphone_please'), 'warning');
      setAccessMicrophone();
      return;
    }
    Vibration.vibrate(50);
    audioRecorderPlayer
      .startRecorder()
      .then(() => {
        setRecordTimeValue();
      })
      .catch(error => {
        console.error(error);
        recorderVisible.value = false;
        showToast(t('chat.msg_record_error'), 'error');
      });
  };

  /* 停止录制语音 */
  const stopRecord = () => {
    clearInterval(recordTimer);
    setRecordTime(0);
    audioRecorderPlayer
      .stopRecorder()
      .then(res => {
        if (recordFlag === 'sure') {
          const fileInfo = getFileFromAudioRecorderPlayer(res);
          onAudioRecordSuccess([fileInfo]);
        }
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        isCancelSend.value = false;
        isSureSend.value = false;
        setRecordFlag('');
        onAudioRecordComplete();
        onClose();
      });
  };

  // 手势动画
  const gesture = Gesture.Pan()
    .activateAfterLongPress(1000)
    .minDistance(10)
    .onStart(() => {
      recorderVisible.value = true;
      runOnJS(startRecord)();
      runOnJS(setVisible)(true);
    })
    .onUpdate(({translationX, translationY}) => {
      if (
        translationX > 0 &&
        translationX < 70 &&
        translationY > -150 &&
        translationY < -90
      ) {
        isCancelSend.value = true;
        runOnJS(setRecordFlag)('cancel');
        return;
      }
      if (
        translationX > 90 &&
        translationX < 150 &&
        translationY > -70 &&
        translationY < 0
      ) {
        isSureSend.value = true;
        runOnJS(setRecordFlag)('sure');
        return;
      }
      isCancelSend.value = false;
      isSureSend.value = false;
      runOnJS(setRecordFlag)('');
    })
    .onEnd(() => {
      recorderVisible.value = false;
      runOnJS(stopRecord)();
      runOnJS(setVisible)(false);
    });

  /* 显示确认/取消发送按钮 */
  const butAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(recorderVisible.value ? 1 : 0),
      width: withSpring(recorderVisible.value ? 60 : 0),
      height: withSpring(recorderVisible.value ? 60 : 0),
    };
  });
  /* 滑动到确认/取消按钮样式 */
  const sureButAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: isSureSend.value ? '#52c41a' : '#bfbfbf',
    };
  });
  const cancelButAnimated = useAnimatedStyle(() => {
    return {
      backgroundColor: isCancelSend.value ? '#f5222d' : '#bfbfbf',
    };
  });

  return (
    <>
      <View flexS row paddingT-8 paddingH-8 spread>
        <TouchableOpacity
          flexS
          centerH
          onPress={() => {
            showToast(t('chat.record_placeholder'), 'warning');
          }}>
          <GestureHandlerRootView>
            <GestureDetector gesture={gesture}>
              <View
                flexS
                center
                backgroundColor={Colors.primary}
                width={36}
                height={36}
                br60>
                <FontAwesome name="microphone" color={Colors.white} size={24} />
              </View>
            </GestureDetector>
          </GestureHandlerRootView>
          <Text marginT-4 text90L grey30>
            {t('chat.record')}
          </Text>
        </TouchableOpacity>
        <View flexS row>
          <TouchableOpacity
            flexS
            centerH
            onPress={() => {
              if (!accessCamera) {
                showToast(t('permissions.camera_please'), 'warning');
                setAccessCamera();
                return;
              }
              ImagePicker.openCamera({
                cropping: true,
                mediaType: 'photo',
                cropperActiveWidgetColor: Colors.primary,
              })
                .then(image => {
                  const fileInfo = getFileFromImageCropPicker(image);
                  onShootSuccess([fileInfo]);
                })
                .finally(() => {
                  onShootComplete();
                  onClose();
                });
            }}>
            <View
              flexS
              center
              backgroundColor={Colors.grey40}
              width={36}
              height={36}
              br30>
              <FontAwesome name="camera" color={Colors.white} size={20} />
            </View>
            <Text marginT-4 text90L grey30>
              {t('chat.shoot')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            flexS
            centerH
            marginL-16
            onPress={() => {
              if (!accessCamera) {
                showToast(t('permissions.camera_please'), 'warning');
                setAccessCamera();
                return;
              }
              ImagePicker.openCamera({
                mediaType: 'video',
              })
                .then(video => {
                  const fileInfo = getFileFromImageCropPicker(video);
                  onVideoRecordSuccess([fileInfo]);
                })
                .finally(() => {
                  onVideoRecordComplete();
                  onClose();
                });
            }}>
            <View
              flexS
              center
              backgroundColor={Colors.blue40}
              width={36}
              height={36}
              br30>
              <FontAwesome name="video-camera" color={Colors.white} size={24} />
            </View>
            <Text marginT-4 text90L grey30>
              {t('chat.video_record')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            flexS
            centerH
            marginL-16
            onPress={() => {
              if (!accessFolder) {
                showToast(t('permissions.folder_please'), 'warning');
                setAccessFolder();
                return;
              }
              ImagePicker.openPicker({
                cropping: true,
                mediaType: 'photo',
                cropperActiveWidgetColor: Colors.primary,
              })
                .then(image => {
                  const fileInfo = getFileFromImageCropPicker(image);
                  onImgPickSuccess([fileInfo]);
                })
                .finally(() => {
                  onImgPickComplete();
                  onClose();
                });
            }}>
            <View
              flexS
              center
              backgroundColor={Colors.cyan40}
              width={36}
              height={36}
              br30>
              <FontAwesome name="image" color={Colors.white} size={24} />
            </View>
            <Text marginT-4 text90L grey30>
              {t('chat.photo_library')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            flexS
            centerH
            marginL-16
            onPress={() => {
              if (!accessFolder) {
                showToast(t('permissions.folder_please'), 'warning');
                setAccessFolder();
                return;
              }
              DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: true,
              })
                .then(medias => {
                  const files = medias.map(media => {
                    const fileInfo = getFileFromDocumentPicker(media);
                    return fileInfo;
                  });
                  onFilePickSuccess(files);
                })
                .finally(() => {
                  onFilePickComplete();
                  onClose();
                });
            }}>
            <View
              flexS
              center
              backgroundColor={Colors.yellow40}
              width={36}
              height={36}
              br30>
              <FontAwesome name="folder-open" color={Colors.white} size={24} />
            </View>
            <Text marginT-4 text90L grey30>
              {t('chat.file')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        statusBarTranslucent
        visible={visible}>
        <View flexG center backgroundColor={Colors.black2}>
          <Card flexS padding-16 center width={160}>
            <ActivityIndicator color={Colors.primary} size={24} />
            <Text grey30 marginT-4>
              {t('chat.record_tips', {recordTime})}
            </Text>
            {recordFlag === 'sure' ? (
              <Text green40 marginT-4>
                {t('chat.send_tips')}
              </Text>
            ) : null}
            {recordFlag === 'cancel' ? (
              <Text red40 marginT-4>
                {t('chat.cancel_tips')}
              </Text>
            ) : null}
          </Card>
        </View>
      </Modal>
      <Animated.View
        style={[styles.cancelBut, sureButAnimatedStyles, butAnimatedStyles]}>
        <FontAwesome name="check" color={Colors.white} size={28} />
      </Animated.View>
      <Animated.View
        style={[styles.sureBut, cancelButAnimated, butAnimatedStyles]}>
        <FontAwesome name="remove" color={Colors.white} size={28} />
      </Animated.View>
    </>
  );
};

export default CustomAccessory;
