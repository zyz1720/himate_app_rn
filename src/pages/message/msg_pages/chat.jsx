import React, {useEffect, useCallback, useState, useRef} from 'react';
import {ActivityIndicator, StyleSheet, Vibration, Modal} from 'react-native';
import {
  View,
  Button,
  Text,
  Colors,
  TouchableOpacity,
  Card,
  Avatar,
} from 'react-native-ui-lib';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
  LoadEarlier,
  Composer,
  Day,
  MessageText,
  Message,
} from 'react-native-gifted-chat';
import Clipboard from '@react-native-clipboard/clipboard';
import ImagePicker from 'react-native-image-crop-picker';
import {useSocket} from '@utils/hooks/useSocket';
import {getSessionDetail} from '@api/session';
import {useToast} from '@utils/hooks/useToast';
import {
  formatMsg,
  formatJoinUser,
  setLocalMsg,
  getLocalMsg,
  getLocalUser,
  delLocalMsg,
  addOrUpdateLocalUser,
} from '@utils/system/chat_utils';
import {deepClone, isEmptyObject} from '@utils/common/object_utils';
import {createRandomNumber} from '@utils/common/number_utils';
import {
  getFileFromAudioRecorderPlayer,
  getFileFromDocumentPicker,
  getFileFromImageCropPicker,
  uploadFile,
  downloadFile,
  getFileName,
  getFileExt,
  getFileColor,
} from '@utils/system/file_utils';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {
  FlatList,
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
  Easing,
} from 'react-native-reanimated';
import {fullWidth, fullHeight} from '@style/index';
import {cancelNotification} from '@utils/system/notification';
import {createRandomSecretKey, encryptAES} from '@utils/system/crypto_utils';
import {useConfigStore} from '@store/configStore';
import {usePermissionStore} from '@store/permissionStore';
import {useSettingStore} from '@store/settingStore';
import VideoModal from '@components/common/VideoModal';
import ImgModal from '@components/common/ImgModal';
import VideoMsg from '@components/message/VideoMsg';
import ImageMsg from '@components/message/ImageMsg';
import AudioMsg from '@components/message/AudioMsg';
import BaseSheet from '@components/common/BaseSheet';
import 'dayjs/locale/zh-cn';

const audioRecorderPlayer = new AudioRecorderPlayer();
let recordTimer = null;

const Chat = React.memo(({navigation, route}) => {
  const {session_id, primaryId, searchMsg_cid} = route.params;

  return <View>{session_id}</View>;
});

export default Chat;
