import React, {useEffect, useState, useRef} from 'react';
import {Vibration} from 'react-native';
import {View, Colors} from 'react-native-ui-lib';
import {GiftedChat, Message} from 'react-native-gifted-chat';
import {useSocketStore} from '@store/socketStore';
import {useToast} from '@components/common/useToast';
import {isEmptyObject} from '@utils/common/object_utils';
import {
  encryptMsg,
  formatCloudMsgToLocal,
  formatLocalMsgToTmp,
  formatTmpMsgToLocal,
  createTmpMessage,
  processMessage,
  messageIdGenerator,
} from '@utils/system/chat_utils';
import {
  setLocalMessages,
  getLocalMessages,
  removeLocalMessage,
} from '@utils/realm/useChatMsg';
import {
  resetUnreadCount,
  updateSessionLastMsg,
} from '@utils/realm/useSessionInfo';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {useSettingStore} from '@store/settingStore';
import {useChatMsgStore} from '@store/chatMsgStore';
import {getSelfGroupMember} from '@api/group_member';
import {
  MemberStatusEnum,
  ChatTypeEnum,
  MsgTypeEnum,
} from '@const/database_enum';
import {useTranslation} from 'react-i18next';
import {downloadFile} from '@utils/system/file_utils';
import BaseSheet from '@components/common/BaseSheet';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomDay from '@components/message/custom/CustomDay';
import CustomLoadEarlier from '@components/message/custom/CustomLoadEarlier';
import CustomBubble from '@components/message/custom/CustomBubble';
import CustomSend from '@components/message/custom/CustomSend';
import CustomComposer from '@components/message/custom/CustomComposer';
import CustomSystemMessage from '@components/message/custom/CustomSystemMessage';
import CustomTicks from '@components/message/custom/CustomTicks';
import CustomActions from '@components/message/custom/CustomActions';
import CustomInputToolbar from '@components/message/custom/CustomInputToolbar';
import CustomAccessory from '@components/message/custom/CustomAccessory';
import CustomFileMessage from '@components/message/custom/CustomFileMessage';
import VideoMsg from '@components/message/media/VideoMsg';
import ImageMsg from '@components/message/media/ImageMsg';
import AudioMsg from '@components/message/media/AudioMsg';
import 'dayjs/locale/zh';
import 'dayjs/locale/en';

const Chat = React.memo(({navigation, route}) => {
  const {session_id, primaryId, search_msg_cid} = route.params;

  const {t} = useTranslation();
  const {showToast} = useToast();

  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();
  const {isEncryptMsg, language} = useSettingStore();
  const {socket, isConnected} = useSocketStore();
  const {setNowJoinSession, removeNowJoinSession, setUpdateKey} =
    useChatMsgStore();

  const [chatMessages, setChatMessages] = useState([]);
  const [content, setContent] = useState('');
  const [userInGroupInfo, setUserInGroupInfo] = useState({});
  const [localMsgCount, setLocalMsgCount] = useState(0);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [uploadIds, setUploadIds] = useState([]);
  const [nowUploadId, setNowUploadId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [nowPlayAudioId, setNowPlayAudioId] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [toBeSavedInfo, setToBeSavedInfo] = useState({type: '', url: ''});
  const [msgActions, setMsgActions] = useState([]);
  const [showMsgActionSheet, setShowMsgActionSheet] = useState(false);
  const curMessageRef = useRef({});

  // 获取自己在群中的信息
  const getSelfGroupMemberInfo = async _session_id => {
    try {
      const res = await getSelfGroupMember(_session_id);
      if (res.code === 0) {
        setUserInGroupInfo(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* 点击头像 */
  const onAvatarPress = user => {
    navigation.navigate('MateInfo', {
      userId: user.id,
    });
  };

  // 长按头像@用户
  const onLongPressAvatar = User => {
    if (!isEmptyObject(userInGroupInfo)) {
      Vibration.vibrate(50);
      setContent(prev => prev + `@${User.name} `);
    }
  };

  // 加入房间
  const joinRoom = _session_id => {
    try {
      socket.emit('join-room', _session_id, res => {
        console.log('join-room', res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 离开房间
  const leaveRoom = _session_id => {
    try {
      socket.emit('leave-room', _session_id, res => {
        console.log('leave-room', res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 已读消息
  const readMessage = data => {
    try {
      socket.emit('read-message', data, res => {
        if (res.code === 0) {
          console.log('readMessage', res);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 接受消息
  const acceptMessage = _session_id => {
    try {
      socket.on('message', data => {
        console.log('acceptMessage', data);

        const msgs = formatCloudMsgToLocal(data, _session_id);
        const tmpMsgs = formatLocalMsgToTmp(msgs);
        setLocalMessages(msgs);
        appendTmpMessage(tmpMsgs);
        const msgIds = msgs.map(msg => msg.id);
        readMessage({ids: msgIds, session_id: _session_id});
      });
    } catch (error) {
      console.error(error);
    }
  };

  /* 发送消息 */
  const sendMessage = async (_content, msgType = MsgTypeEnum.text) => {
    if (!_content) {
      showToast(t('chat.empty_msg'), 'error');
      return new Promise(resolve => {
        resolve(false);
      });
    }
    const baseMsg = {
      session_id,
      content: _content,
      msg_type: msgType,
    };
    primaryId && (baseMsg.session_primary_id = primaryId);
    // 加密消息
    if (isEncryptMsg) {
      const {content: encryptedContent, secret} = encryptMsg(_content);
      baseMsg.msg_secret = secret;
      baseMsg.content = encryptedContent;
    }

    if (!isConnected) {
      showToast(t('chat.socket_error'), 'error');
      return new Promise(resolve => {
        resolve(false);
      });
    }

    return new Promise(resolve => {
      try {
        const emitTimer = setTimeout(() => {
          clearTimeout(emitTimer);
          resolve(false);
        }, 10000);

        socket.emit('send-message', baseMsg, res => {
          clearTimeout(emitTimer);
          if (res.code === 0) {
            console.log('sendMessage', res.data);
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

  /* 更新临时消息 */
  const updateTmpMessage = (message = {}, status) => {
    const localMsg = formatTmpMsgToLocal(message, {
      session_id,
      chat_type: isEmptyObject(userInGroupInfo)
        ? ChatTypeEnum.private
        : ChatTypeEnum.group,
      sender_id: userInfo?.id,
      sender_avatar: userInfo?.user_avatar,
      sender_remarks: isEmptyObject(userInGroupInfo)
        ? userInfo?.user_name
        : userInGroupInfo?.member_remarks,
      status: status,
    });
    setLocalMessages([localMsg]);
    setChatMessages(prevMsgs => {
      const messageId = message._id;
      if (!messageId) {
        return prevMsgs;
      }
      const updatedMsgs = prevMsgs.map(msg => {
        if (msg._id === messageId) {
          return {
            ...msg,
            ...message,
            status: status,
          };
        }
        return msg;
      });
      return updatedMsgs;
    });
  };

  // 移除临时消息
  const removeTmpMessage = message => {
    setChatMessages(prevMsgs => {
      const messageId = message?._id;
      if (!messageId) {
        return prevMsgs;
      }
      return prevMsgs.filter(msg => msg._id !== messageId);
    });
  };

  /* 追加临时消息 */
  const appendTmpMessage = (messages = []) => {
    setChatMessages(prev => {
      const existingIds = new Set(prev.map(msg => msg._id));
      const newMessages = messages.filter(item => !existingIds.has(item._id));
      return GiftedChat.append(prev, newMessages);
    });
  };

  /* 本地发送 */
  const onSend = async (messages = []) => {
    appendTmpMessage(messages);
    console.log('onSend', messages);
    for (const message of messages) {
      try {
        const handleMsg = await processMessage(message, {
          onProgress: setUploadProgress,
          setUploadId: setNowUploadId,
          setUploadIds: setUploadIds,
        });

        if (!handleMsg) {
          updateTmpMessage(message, 'failed');
          continue;
        }
        const data = await sendMessage(handleMsg.text, handleMsg.msg_type);
        if (data) {
          const msgs = formatCloudMsgToLocal([data], session_id);
          updateSessionLastMsg(session_id, msgs[0]);
          setLocalMessages(msgs);
        } else {
          updateTmpMessage(message, 'failed');
        }
      } catch (error) {
        console.error(error);
        updateTmpMessage(message, 'failed');
      }
    }
  };

  /* 媒体和文件消息 */
  const sendFileMessages = files => {
    const mediaMsgs = files.map(file =>
      createTmpMessage({
        isOneself: true,
        userId: userInfo?.id,
        userName: isEmptyObject(userInGroupInfo)
          ? userInfo?.user_name
          : userInGroupInfo?.member_remarks,
        userAvatar: envConfig.STATIC_URL + userInfo?.user_avatar,
        fileInfo: file,
      }),
    );
    onSend(mediaMsgs);
  };

  /* 获取本地消息 */
  const getLocalMsgList = _session_id => {
    const localMsgList = getLocalMessages(_session_id);
    const tmpMsgList = formatLocalMsgToTmp(localMsgList);
    appendTmpMessage(tmpMsgList);
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

  // 保存文件
  const onSave = async info => {
    showToast(t('common.saving'), 'success');
    const pathRes = await downloadFile(info.url, {
      isInCameraRoll: info.type === 'media',
    });
    if (pathRes) {
      showToast(t('component.save_to') + pathRes, 'success');
    } else {
      showToast(t('component.save_failed'), 'error');
    }
  };

  const messageOptions = [
    {
      label: t('chat.retry_send'),
      color: Colors.primary,
      onPress: () => {
        delete curMessageRef.current?.status;
        removeTmpMessage(curMessageRef.current);
        removeLocalMessage(curMessageRef.current._id);
        onSend([curMessageRef.current]);
        setShowMsgActionSheet(false);
      },
    },
    {
      label: t('chat.cancel_send'),
      color: Colors.error,
      onPress: () => {
        removeTmpMessage(curMessageRef.current);
        removeLocalMessage(curMessageRef.current._id);
        setShowMsgActionSheet(false);
      },
    },
    {
      label: t('chat.copy_content'),
      color: Colors.success,
      onPress: () => {
        Clipboard.setString(curMessageRef.current.text);
        setShowMsgActionSheet(false);
        showToast(t('common.copy_text_success'), 'success');
      },
    },
  ];

  /* 自定义长按消息 */
  const onLongPressMsg = (_, currentMessage) => {
    if (
      currentMessage?.msg_type === MsgTypeEnum.text ||
      !currentMessage?.msg_type
    ) {
      const showProgress = currentMessage.status === 'failed';
      curMessageRef.current = currentMessage;
      Vibration.vibrate(50);
      if (showProgress) {
        setMsgActions(messageOptions);
      } else {
        setMsgActions([messageOptions.at(-1)]);
      }
      setShowMsgActionSheet(true);
    }
  };

  /* 自定义消息（用于计算高度） */
  const renderMessage = props => (
    <View onLayout={e => onMessageLayout(e)}>
      <Message {...props} />
    </View>
  );

  /* 滚动到底部按钮 */
  const scrollToBottomComponent = () => {
    return (
      <View>
        <Ionicons name="chevron-down" color={Colors.primary} size={24} />
      </View>
    );
  };

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
    if (session_id) {
      getLocalMsgList(session_id);
      getSelfGroupMemberInfo(session_id);
      resetUnreadCount(session_id);
      setNowJoinSession(session_id);

      return () => {
        resetUnreadCount(session_id).then(() => setUpdateKey());
        removeNowJoinSession(session_id);
      };
    }
  }, [session_id]);

  useEffect(() => {
    if (isConnected && session_id) {
      joinRoom(session_id);
      acceptMessage(session_id);
      return () => leaveRoom(session_id);
    }
  }, [session_id, isConnected]);

  return (
    <>
      <GiftedChat
        messageContainerRef={chatListRef}
        messageIdGenerator={messageIdGenerator}
        placeholder={
          userInGroupInfo.member_status === MemberStatusEnum.forbidden
            ? t('chat.msg_mute_placeholder')
            : t('chat.msg_placeholder')
        }
        locale={language}
        dateFormat={'MM/DD HH:mm'}
        timeFormat={'HH:mm'}
        renderDay={props => <CustomDay {...props} />}
        messages={chatMessages}
        text={content}
        onInputTextChanged={text => setContent(text)}
        minInputToolbarHeight={60}
        alignTop={true}
        showUserAvatar={!isEmptyObject(userInGroupInfo)}
        showAvatarForEveryMessage={!isEmptyObject(userInGroupInfo)}
        renderUsernameOnMessage={!isEmptyObject(userInGroupInfo)}
        loadEarlier={chatMessages.length < localMsgCount}
        renderLoadEarlier={props => <CustomLoadEarlier {...props} />}
        infiniteScroll={true}
        isLoadingEarlier={msgsLoading}
        onLoadEarlier={() => {
          setMsgsLoading(true);
        }}
        onLongPress={onLongPressMsg}
        onPressAvatar={onAvatarPress}
        onLongPressAvatar={onLongPressAvatar}
        renderBubble={props => <CustomBubble {...props} />}
        renderTicks={message => (
          <CustomTicks
            message={message}
            uploadIds={uploadIds}
            nowUploadId={nowUploadId}
            uploadProgress={uploadProgress}
          />
        )}
        renderSend={props => <CustomSend {...props} label={t('chat.send')} />}
        renderTime={() => {}}
        renderActions={() => (
          <CustomActions
            userInGroupInfo={userInGroupInfo}
            uploadIds={uploadIds}
            isExpand={showActions}
            setExpand={value => {
              setShowActions(value);
            }}
          />
        )}
        renderInputToolbar={props => (
          <CustomInputToolbar {...props} showActions={showActions} />
        )}
        renderComposer={props => <CustomComposer {...props} />}
        renderAccessory={() => (
          <CustomAccessory
            onAudioRecordSuccess={sendFileMessages}
            onShootSuccess={sendFileMessages}
            onVideoRecordSuccess={sendFileMessages}
            onImgPickSuccess={sendFileMessages}
            onFilePickSuccess={sendFileMessages}
            onClose={() => {
              setShowActions(false);
            }}
          />
        )}
        renderMessage={renderMessage}
        renderSystemMessage={props => <CustomSystemMessage {...props} />}
        renderMessageImage={props => (
          <ImageMsg
            {...props}
            uploadIds={uploadIds}
            nowUploadId={nowUploadId}
            uploadProgress={uploadProgress}
            onLongPress={info => {
              setToBeSavedInfo(info);
              setShowActionSheet(true);
            }}
          />
        )}
        renderMessageVideo={props => (
          <VideoMsg
            {...props}
            uploadIds={uploadIds}
            nowUploadId={nowUploadId}
            uploadProgress={uploadProgress}
            onLongPress={info => {
              setToBeSavedInfo(info);
              setShowActionSheet(true);
            }}
          />
        )}
        renderMessageAudio={props => (
          <AudioMsg
            {...props}
            nowPlayAudioId={nowPlayAudioId}
            setNowPlayAudioId={setNowPlayAudioId}
            onLongPress={info => {
              setToBeSavedInfo(info);
              setShowActionSheet(true);
            }}
          />
        )}
        renderMessageText={props => (
          <CustomFileMessage
            {...props}
            onPress={() => {
              showToast(t('common.file_not_supported'), 'warning');
            }}
            onLongPress={info => {
              setToBeSavedInfo(info);
              setShowActionSheet(true);
            }}
          />
        )}
        scrollToBottom={true}
        scrollToBottomComponent={scrollToBottomComponent}
        shouldUpdateMessage={(prevMsg, newMsg) => {
          return prevMsg._id === newMsg._id;
        }}
        onSend={onSend}
        textInputProps={{
          readOnly:
            userInGroupInfo.member_status === MemberStatusEnum.forbidden,
        }}
        user={{
          _id: 1,
          avatar: envConfig.STATIC_URL + userInfo?.user_avatar,
          name: !isEmptyObject(userInGroupInfo)
            ? userInGroupInfo?.member_remark
            : userInfo?.user_name,
        }}
      />
      {/* 保存文件弹窗 */}
      <BaseSheet
        title={t('component.save_file')}
        visible={showActionSheet}
        setVisible={setShowActionSheet}
        actions={[
          {
            label:
              toBeSavedInfo.type === 'media'
                ? t('component.save_to_album')
                : t('component.save_to_download'),
            color: Colors.primary,
            onPress: () => onSave(toBeSavedInfo),
          },
          {
            label: t('common.copy_link'),
            color: Colors.success,
            onPress: () => {
              Clipboard.setString(toBeSavedInfo.url);
              setShowActionSheet(false);
              showToast(t('common.copy_link_success'), 'success');
            },
          },
        ]}
      />
      {/* 消息操作弹窗 */}
      <BaseSheet
        title={t('chat.message_options')}
        visible={showMsgActionSheet}
        setVisible={setShowMsgActionSheet}
        actions={msgActions}
      />
    </>
  );
});

export default Chat;
