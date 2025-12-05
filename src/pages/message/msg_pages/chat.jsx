import React, {useEffect, useCallback, useState, useRef} from 'react';
import {Vibration} from 'react-native';
import {View} from 'react-native-ui-lib';
import {GiftedChat, Message} from 'react-native-gifted-chat';
import {useSocketStore} from '@store/socketStore';
import {useToast} from '@components/common/useToast';
import {deepClone, isEmptyObject} from '@utils/common/object_utils';
import {createRandomNumber} from '@utils/common/number_utils';
import {createRandomSecretKey, encryptAES} from '@utils/system/crypto_utils';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {useSettingStore} from '@store/settingStore';
import {getSelfGroupMember} from '@api/group_member';
import {MemberStatusEnum} from '@const/database_enum';
import {useTranslation} from 'react-i18next';
import {CustomDay} from '@components/message/custom/CustomDay';
import {CustomLoadEarlier} from '@components/message/custom/CustomLoadEarlier';
import {CustomBubble} from '@components/message/custom/CustomBubble';
import {CustomSend} from '@components/message/custom/CustomSend';
import {CustomComposer} from '@components/message/custom/CustomComposer';
import {CustomSystemMessage} from '@components/message/custom/CustomSystemMessage';
import CustomTicks from '@components/message/custom/CustomTicks';
import CustomActions from '@components/message/custom/CustomActions';
import CustomInputToolbar from '@components/message/custom/CustomInputToolbar';
import CustomAccessory from '@components/message/custom/CustomAccessory';
import CustomFileMessage from '@components/message/custom/CustomFileMessage';
import VideoModal from '@components/common/VideoModal';
import ImgModal from '@components/common/ImgModal';
import VideoMsg from '@components/message/media/VideoMsg';
import ImageMsg from '@components/message/media/ImageMsg';
import AudioMsg from '@components/message/media/AudioMsg';
import BaseSheet from '@components/common/BaseSheet';
import 'dayjs/locale/zh-cn';

const Chat = React.memo(({navigation, route}) => {
  const {session_id, primaryId, searchMsg_cid} = route.params;
  console.log('session_id', session_id, primaryId);

  const {t} = useTranslation();
  const {userInfo} = useUserStore();
  const {envConfig, msgSecretKey} = useConfigStore();
  const {isEncryptMsg} = useSettingStore();
  const {showToast} = useToast();
  const {socket, isConnected} = useSocketStore();

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

  /* 发送消息 */
  const sendMessage = async (_content, msgType = 'text') => {
    const baseMsg = {
      session_id,
      content: _content,
      msg_type: msgType,
    };
    primaryId && (baseMsg.session_primary_id = primaryId);
    // 加密消息
    if (isEncryptMsg) {
      const {secret, trueSecret} = createRandomSecretKey(msgSecretKey);
      baseMsg.msg_secret = secret;
      baseMsg.content = JSON.stringify(encryptAES(_content, trueSecret));
    }
    console.log('baseMsg', isConnected, socket);

    if (!isConnected) {
      showToast(t('chat.socket_error'), 'error');
      return new Promise(resolve => {
        resolve(false);
      });
    }
    return new Promise(resolve => {
      try {
        socket.emit('send-message', baseMsg, res => {
          if (res.code === 0) {
            resolve(res.data);
          } else {
            showToast(res.message, 'error');
            resolve(false);
          }
        });
      } catch (error) {
        resolve(false);
      }
    });
  };

  /* 本地发送 */
  const onSend = async (messages = []) => {
    setChatMessages(prev => GiftedChat.append(prev, messages));

    for (const message of messages) {
      try {
        const res = await sendMessage(message.text, message.msg_type);
        console.log('sendMessage', res);
      } catch (error) {
        console.error(error);
      }
    }
  };

  /* 媒体消息 */
  const sendFileMsg = files => {
    const mediaMsgs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const media_type = file.type;
      const mediaMsg = {
        text: null,
        _id: createRandomNumber(),
        createdAt: new Date(),
        msg_type: media_type,
        file: file.file,
        user: {
          _id: 1,
          name: isEmptyObject(userInGroupInfo)
            ? userInfo?.user_name
            : userInGroupInfo?.member_remarks,
          avatar: envConfig?.STATIC_URL + userInfo?.user_avatar,
        },
      };
      if (media_type === 'image') {
        mediaMsg.image = file.uri;
        mediaMsg.originalImage = file.uri;
      }
      if (media_type === 'video') {
        mediaMsg.video = file.uri;
      }
      if (media_type === 'audio') {
        mediaMsg.audio = file.uri;
      }
      if (media_type === 'other') {
        mediaMsg.text = file.ext;
      }
      mediaMsgs.push(mediaMsg);
    }
    onSend(mediaMsgs);
  };

  const [searchIndex, setSearchIndex] = useState(-1);
  const [offsetHeight, setOffsetHeight] = useState(0);
  const chatListRef = useRef(null);

  const offsetCount = useRef(0);
  const heightSum = useRef(0);
  /* 获取需要滚动的高度 */
  const onMessageLayout = event => {
    if (searchIndex !== -1) {
      const {height} = event.nativeEvent.layout;
      if (offsetCount.current === searchIndex) {
        setOffsetHeight(heightSum.current);
        return;
      }
      heightSum.current += height;
      offsetCount.current++;
      // 每10次测量更新一次高度
      if (offsetCount.current % 10 === 0) {
        setOffsetHeight(heightSum.current);
      }
    }
  };

  /* 自定义消息（用于计算高度） */
  const renderMessage = props => (
    <View onLayout={e => onMessageLayout(e)}>
      <Message {...props} />
    </View>
  );

  /* 滚动到指定消息 */
  useEffect(() => {
    chatListRef.current?.scrollToOffset({
      offset: offsetHeight - 4,
      animated: true,
    });
  }, [offsetHeight]);

  useEffect(() => {
    if (searchIndex !== -1) {
      showToast(t('chat.to_search_result'), 'success');
    }
  }, [searchIndex]);

  useEffect(() => {
    getSelfGroupMemberInfo();
  }, []);

  return (
    <>
      <GiftedChat
        messageContainerRef={chatListRef}
        placeholder={
          userInGroupInfo.member_status === MemberStatusEnum.forbidden
            ? t('chat.msg_mute_placeholder')
            : t('chat.msg_placeholder')
        }
        dateFormatCalendar={{
          sameDay: `[${t('common.toDay')}] HH:mm`,
          lastDay: `[${t('common.yesterday')}] HH:mm`,
          lastWeek: `[${t('common.lastWeek')}] DDDD HH:mm`,
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
        renderAccessory={props => (
          <CustomAccessory
            props={props}
            onAudioRecordSuccess={sendFileMsg}
            onShootSuccess={sendFileMsg}
            onVideoRecordSuccess={sendFileMsg}
            onImgPickSuccess={sendFileMsg}
            onFilePickSuccess={sendFileMsg}
          />
        )}
        renderMessage={renderMessage}
        renderSystemMessage={CustomSystemMessage}
        renderMessageImage={() => <ImageMsg />}
        renderMessageVideo={() => <VideoMsg />}
        renderMessageAudio={() => <AudioMsg />}
        renderMessageText={props => (
          <CustomFileMessage
            props={props}
            onPress={() => {}}
            onLongPress={() => {}}
          />
        )}
        onSend={onSend}
        textInputProps={{
          readOnly: userInGroupInfo.member_status === 'forbidden',
        }}
        user={{
          _id: 1,
          avatar: envConfig.STATIC_URL + userInfo.user_avatar,
          name: isEmptyObject(userInGroupInfo)
            ? userInGroupInfo.member_remark
            : userInfo.user_name,
        }}
      />
    </>
  );
});

export default Chat;
