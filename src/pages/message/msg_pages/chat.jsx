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
import {useToast} from '@components/common/useToast';
import {
  formatMsg,
  formatJoinUser,
  setLocalMsg,
  getLocalMsg,
  getLocalUsers,
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
import {getSelfGroupMember} from '@api/group_member';
import {MemberStatusEnum} from '@const/database_enum';
import {useTranslation} from 'react-i18next';
import {CustomDay} from '@components/message/CustomDay';
import {CustomLoadEarlier} from '@components/message/CustomLoadEarlier';
import {CustomBubble} from '@components/message/CustomBubble';
import {CustomSend} from '@components/message/CustomSend';
import {CustomComposer} from '@components/message/CustomComposer';
import CustomTicks from '@components/message/CustomTicks';
import CustomActions from '@components/message/CustomActions';
import CustomInputToolbar from '@components/message/CustomInputToolbar';
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
  const {t} = useTranslation();

  const chatListRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [content, setContent] = useState('');

  const [userInGroupInfo, setUserInGroupInfo] = useState({});

  const [localMsgCount, setLocalMsgCount] = useState(0);
  const [msgsLoading, setMsgsLoading] = useState(false);

  const [uploadIds, setUploadIds] = useState([]);
  const [nowUploadId, setNowUploadId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showActions, setShowActions] = useState(false);
  // 获取自己在群中的信息
  const getSelfGroupMemberInfo = useCallback(async () => {
    try {
      const res = await getSelfGroupMember(session_id);
      if (res.code === 0) {
        setUserInGroupInfo(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [session_id]);

  /* 自定义长按消息 */
  const onLongPress = (context, currentMessage) => {
    // if (currentMessage.msg_type === 'text') {
    //   Vibration.vibrate(50);
    //   const options = ['复制消息', '取消'];
    //   const cancelButtonIndex = options.length - 1;
    //   if (currentMessage.status === 'failed') {
    //     options.unshift('取消发送');
    //     options.unshift('重新发送');
    //   }
    //   context.actionSheet().showActionSheetWithOptions(
    //     {
    //       options,
    //       cancelButtonIndex,
    //     },
    //     buttonIndex => {
    //       const showMsghandle = currentMessage.status === 'failed';
    //       if (showMsghandle && buttonIndex === 0) {
    //         sendMessage(currentMessage?.text, 'text', true)
    //           .then(() => {
    //             removeMessage(currentMessage.clientMsg_id);
    //             handleSystemMsg(null, false);
    //           })
    //           .catch(error => {
    //             handleSystemMsg('发送失败！');
    //             console.error(error);
    //           });
    //       }
    //       if (showMsghandle && buttonIndex === 1) {
    //         removeMessage(currentMessage.clientMsg_id);
    //       }
    //       if (
    //         (showMsghandle && buttonIndex === 2) ||
    //         (!showMsghandle && buttonIndex === 0)
    //       ) {
    //         Clipboard.setString(currentMessage.text);
    //         showToast('已复制到剪贴板', 'success');
    //         return;
    //       }
    //     },
    //   );
    // }
  };

  /* 点击头像 */
  const onAvatarPress = User => {
    navigation.navigate('MateInfo', {
      userId: User._id === 1 ? 1 : User?.user_id,
    });
  };

  // 长按头像@用户
  const onLongPressAvatar = User => {
    if (!isEmptyObject(userInGroupInfo)) {
      Vibration.vibrate(50);
      setContent(prev => prev + `@${User.user_name} `);
    }
  };

  useEffect(() => {
    getSelfGroupMemberInfo();
  }, []);

  return (
    <View>
      <GiftedChat
        messageContainerRef={chatListRef}
        placeholder={
          userInGroupInfo.member_status === MemberStatusEnum.forbidden
            ? t('chat.msg_mute_placeholder')
            : t('chat.msg_placeholder')
        }
        dateFormatCalendar={{
          sameDay: `[${t('chat.toDay')}] HH:mm`,
          lastDay: `[${t('chat.yesterday')}] HH:mm`,
          lastWeek: `[${t('chat.lastWeek')}] DDDD HH:mm`,
          sameElse: 'YYYY-MM-DD HH:mm',
        }}
        locale={'zh-cn'}
        dateFormat={'MM/DD HH:mm'}
        timeFormat={'HH:mm'}
        renderDay={CustomDay}
        messages={chatMessages}
        text={content}
        onInputTextChanged={text => setContent(text)}
        minInputToolbarHeight={60}
        alignTop={true}
        showUserAvatar={!isEmptyObject(userInGroupInfo)}
        showAvatarForEveryMessage={!isEmptyObject(userInGroupInfo)}
        renderUsernameOnMessage={!isEmptyObject(userInGroupInfo)}
        loadEarlier={chatMessages.length < localMsgCount}
        renderLoadEarlier={CustomLoadEarlier}
        infiniteScroll={true}
        isLoadingEarlier={msgsLoading}
        onLoadEarlier={() => {
          setMsgsLoading(true);
        }}
        onLongPress={onLongPress}
        onPressAvatar={onAvatarPress}
        onLongPressAvatar={onLongPressAvatar}
        renderBubble={CustomBubble}
        renderTicks={message => (
          <CustomTicks
            message={message}
            uploadIds={uploadIds}
            nowUploadId={nowUploadId}
            uploadProgress={uploadProgress}
          />
        )}
        renderSend={CustomSend}
        renderTime={() => {}}
        renderActions={() => (
          <CustomActions
            userInGroupInfo={userInGroupInfo}
            uploadIds={uploadIds}
            onExpand={value => {
              setShowActions(value);
            }}
          />
        )}
        renderInputToolbar={props => (
          <CustomInputToolbar props={props} showActions={showActions} />
        )}
        renderComposer={CustomComposer}
        renderAccessory={renderAccessory}
        renderMessageImage={renderMessageImage}
        renderMessageVideo={renderMessageVideo}
        renderMessageAudio={renderMessageAudio}
        renderSystemMessage={renderSystemMessage}
        renderMessageText={renderFileMessage}
        onSend={msgs => onSend(msgs)}
        textInputProps={{
          readOnly: userInGroupInfo.member_status === 'forbidden',
        }}
        user={{
          _id: 1,
          avatar: STATIC_URL + userInfo.user_avatar,
          name:
            chat_type === 'group'
              ? userInGroupInfo.member_remark
              : userInfo.user_name,
        }}
      />
    </View>
  );
});

export default Chat;
