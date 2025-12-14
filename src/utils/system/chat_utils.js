import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {
  getTrueSecretKey,
  createRandomSecretKey,
  encryptAES,
  decryptAES,
  createHashSha256,
} from './crypto_utils';
import {v4 as uuid} from 'uuid';
import {isEmptyObject} from '@utils/common/object_utils';
import {createRandomNumber} from '@utils/common/number_utils';
import {
  getFileExt,
  uploadFile,
  createVideoThumbnailImg,
  getVideoMetaDataInfo,
  getFileFromVideoThumbnail,
} from './file_utils';
import {FileUseTypeEnum, MsgTypeEnum} from '@const/database_enum';
import DeviceInfo from 'react-native-device-info';
import i18n from 'i18next';

// 消息ID生成器
const deviceId = DeviceInfo.getUniqueIdSync();
export const messageIdGenerator = () => {
  return createHashSha256(`${deviceId}_${uuid()}_${Date.now().toString()}`);
};

/**
 * 解析视频信息
 * @param {string} str
 * @returns {string} 格式化后的视频时长（格式为 MM:SS）
 */
export const parseVideoInfo = str => {
  const {envConfig} = useConfigStore.getState();
  const videoInfo = str.split(',');
  if (videoInfo.length !== 3) {
    return {};
  }
  return {
    video: videoInfo[0],
    thumbnail: envConfig.THUMBNAIL_URL + videoInfo[1],
    duration: Number(videoInfo[2]),
  };
};

/* 创建临时消息 */
export const createTmpMessage = (options = {}) => {
  const {
    text,
    isOneself,
    isSystem = false,
    userId,
    userName,
    userAvatar,
    fileInfo = {},
    videoInfo = {},
  } = options;

  const message = {
    _id: messageIdGenerator(),
    text: text,
    createdAt: new Date(),
    user: {
      _id: isOneself ? 1 : 2,
      id: userId,
      name: userName,
      avatar: userAvatar,
    },
    msg_type: MsgTypeEnum.text,
    fileInfo,
    videoInfo,
    system: isSystem,
  };
  if (!isEmptyObject(fileInfo)) {
    const {type, uri, ext} = fileInfo;
    const mediaTypes = [
      MsgTypeEnum.image,
      MsgTypeEnum.video,
      MsgTypeEnum.audio,
    ];
    if (mediaTypes.includes(type)) {
      message[type] = uri;
      message.msg_type = type;
    } else {
      message.text = ext;
      message.msg_type = MsgTypeEnum.file;
      message.file = uri;
    }
  }

  return message;
};

/* 加密消息 */
export const encryptMsg = _content => {
  try {
    const {msgSecretKey} = useConfigStore.getState();
    const {secret, trueSecret} = createRandomSecretKey(msgSecretKey);
    const content = JSON.stringify(encryptAES(_content, trueSecret));
    return {
      content,
      secret,
    };
  } catch (error) {
    console.error(error);
    return {
      content: _content,
      secret: null,
    };
  }
};

/* 解密消息 */
export const decryptMsg = (content, secret) => {
  const {msgSecretKey} = useConfigStore.getState();
  try {
    if (secret && content) {
      const {iv, encryptedData} = JSON.parse(content);
      const trueSecret = getTrueSecretKey(secret, msgSecretKey);
      return decryptAES(encryptedData, iv, trueSecret);
    } else {
      return content || '';
    }
  } catch (error) {
    console.error(error);
    return '';
  }
};

/* 格式化消息类型 */
export const showMessageText = message => {
  const {content, msg_type, msg_secret} = message || {};
  if (!content) {
    return `[${i18n.t('chat.empty_chat')}]`;
  }
  const msgTypeMap = {
    [MsgTypeEnum.text]:
      msg_secret && content ? decryptMsg(content, msg_secret) : content,
    [MsgTypeEnum.image]: `[${i18n.t('chat.msg_type_image')}]`,
    [MsgTypeEnum.video]: `[${i18n.t('chat.msg_type_video')}]`,
    [MsgTypeEnum.audio]: `[${i18n.t('chat.msg_type_audio')}]`,
    [MsgTypeEnum.file]: `[${i18n.t('chat.msg_type_file')}]`,
    [MsgTypeEnum.other]: `[${i18n.t('chat.msg_type_other')}]`,
  };
  return msgTypeMap[msg_type] || '';
};

/* 显示提醒文本 */
export const showReminderText = (reminders = []) => {
  const {userInfo} = useUserStore.getState();
  if (reminders.includes(userInfo?.id)) {
    return i18n.t('chat.reminder');
  }
  return '';
};

/* 格式化云端消息为本地消息 */
export const formatCloudMsgToLocal = (list = [], session_id) => {
  return list.map(item => {
    const {message, senderInfo} = item || {};
    return {
      session_id: session_id,
      sender_avatar: senderInfo?.avatar,
      sender_remarks: senderInfo?.remarks,
      chat_type: senderInfo?.chat_type,
      status: 'ok',
      system: message?.is_system,
      ...message,
    };
  });
};

/* 格式化临时消息为本地消息 */
export const formatTmpMsgToLocal = (message, options = {}) => {
  const {_id, createdAt, text, user, msg_type, system} = message || {};
  const {
    session_id,
    chat_type,
    sender_id,
    sender_avatar,
    sender_remarks,
    status,
    reminders,
  } = options || {};
  return {
    id: -createRandomNumber(11),
    session_id: session_id,
    session_primary_id: -1,
    client_msg_id: _id,
    sender_id: sender_id,
    sender_avatar: sender_avatar,
    sender_remarks: user?.name || sender_remarks,
    sender_ip: 'localhost',
    content: text,
    msg_type: msg_type || MsgTypeEnum.text,
    chat_type: chat_type,
    create_time: createdAt?.toISOString(),
    status: status,
    system: system,
    reminders: reminders || [],
  };
};

/* 格式化本地消息为临时消息 */
export const formatLocalMsgToTmp = (messages = []) => {
  const {userInfo} = useUserStore.getState();
  const {envConfig} = useConfigStore.getState();

  return messages.map(msg => {
    const {
      client_msg_id,
      msg_type,
      content,
      decrypted_content,
      msg_secret,
      create_time,
      sender_id,
      sender_remarks,
      sender_avatar,
      status,
      system,
      reminders = [],
    } = msg;
    const text =
      decrypted_content ||
      (msg_secret ? decryptMsg(content, msg_secret) : content);
    const message = {
      _id: client_msg_id,
      text: text,
      createdAt: new Date(create_time),
      user: {
        _id: sender_id === userInfo.id ? 1 : 2,
        id: sender_id,
        name: sender_remarks,
        avatar: envConfig.STATIC_URL + sender_avatar,
      },
      msg_type: msg_type,
      status: status,
    };
    if (msg_type !== MsgTypeEnum.text) {
      message.text = null;
      const mediaTypes = [
        MsgTypeEnum.image,
        MsgTypeEnum.video,
        MsgTypeEnum.audio,
      ];
      if (mediaTypes.includes(msg_type)) {
        if (msg_type === MsgTypeEnum.image) {
          message[msg_type] = envConfig.THUMBNAIL_URL + text;
        } else if (msg_type === MsgTypeEnum.video) {
          const videoInfo = parseVideoInfo(text);
          message.videoInfo = videoInfo;
          message[msg_type] = envConfig.STATIC_URL + videoInfo.video;
        } else {
          message[msg_type] = envConfig.STATIC_URL + text;
        }
      } else {
        message.file = envConfig.STATIC_URL + text;
        message.text = getFileExt(text);
      }
    }
    if (reminders && reminders.length > 0 && status === 'failed') {
      message.reminders = reminders;
    }
    if (system) {
      message.system = system;
    }
    return message;
  });
};

/* 处理视频消息 */
export const processVideoThumbnail = async thumbnail => {
  try {
    const fileInfo = getFileFromVideoThumbnail(thumbnail);
    const result = await uploadFile(fileInfo.file, {
      form: {
        file_type: fileInfo.type,
        use_type: FileUseTypeEnum.chat,
      },
    });
    const upRes = JSON.parse(result.text());
    if (upRes.code === 0) {
      return upRes.data.file_key;
    } else {
      console.error(upRes.message);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 获取视频消息信息
export const getVideoMsgInfo = async videoPath => {
  try {
    const thumbnailInfo = await createVideoThumbnailImg(videoPath);
    const metaData = await getVideoMetaDataInfo(videoPath);
    if (!thumbnailInfo || !metaData) {
      return null;
    }
    return {
      thumbnail: thumbnailInfo.path,
      duration: metaData.duration,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

/* 处理消息 */
export const processMessage = async (
  message,
  {
    reminders = [],
    onProgress = () => {},
    setUploadId = () => {},
    onComplete = () => {},
  },
) => {
  const {
    _id,
    msg_type = MsgTypeEnum.text,
    text,
    fileInfo = {},
    videoInfo = {},
  } = message || {};

  const baseMsg = {msg_type, content: text, client_msg_id: _id};

  if (msg_type === MsgTypeEnum.text) {
    if (reminders && reminders.length > 0) {
      baseMsg.reminders = reminders;
    }
    return baseMsg;
  } else {
    if (
      isEmptyObject(fileInfo) ||
      (msg_type === MsgTypeEnum.video && isEmptyObject(videoInfo))
    ) {
      return false;
    }
    try {
      setUploadId(_id);
      let thumbnailKey = null;
      if (msg_type === MsgTypeEnum.video) {
        thumbnailKey = await processVideoThumbnail(videoInfo.thumbnail);
        if (!thumbnailKey) {
          return false;
        }
      }
      const result = await uploadFile(fileInfo.file, {
        form: {
          file_type: fileInfo.type,
          use_type: FileUseTypeEnum.chat,
        },
        onProgress: onProgress,
      });
      const upRes = JSON.parse(result.text());
      if (upRes.code === 0) {
        baseMsg.content =
          msg_type === MsgTypeEnum.video
            ? `${upRes.data.file_key},${thumbnailKey},${videoInfo.duration}`
            : upRes.data.file_key;
        return baseMsg;
      } else {
        console.error(upRes.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      onComplete();
    }
  }
};

/* 格式化本地会话为临时会话 */
export const formatLocalSessionToTmp = (sessions = []) => {
  return sessions.map(session => {
    const {
      id,
      session_id,
      session_name,
      session_avatar,
      chat_type,
      groupId,
      userId,
      unread_count,
      lastMsgContent,
      lastSenderRemarks,
      update_time,
      created_at,
      updated_at,
    } = session || {};
    return {
      session: {
        id,
        session_id,
        chat_type,
        unread_count,
        update_time,
        created_at,
        updated_at,
        lastMsgContent,
      },
      sessionExtra: {
        session_name,
        session_avatar,
        groupId,
        userId,
        lastSenderRemarks,
      },
    };
  });
};

/* 格式化会话为通知 */
export const formatSessionToNotification = (sessions = []) => {
  return sessions.map(item => {
    const {id, session_id, unread_count, lastMsg} = item?.session || {};
    const {session_avatar, session_name, lastSenderRemarks} =
      item?.sessionExtra || {};
    return {
      id: id,
      session_name: session_name || '',
      session_avatar: session_avatar || '',
      session_id: session_id,
      unread_count: unread_count || 0,
      text: showMessageText(lastMsg),
      lastSenderRemarks: lastSenderRemarks,
    };
  });
};
