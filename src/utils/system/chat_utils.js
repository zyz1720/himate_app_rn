import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {
  getTrueSecretKey,
  createRandomSecretKey,
  encryptAES,
  decryptAES,
} from './crypto_utils';
import {v4 as uuid} from 'uuid';
import {isEmptyObject} from '@utils/common/object_utils';
import {createRandomNumber} from '@utils/common/number_utils';
import {getFileExt, uploadFile} from './file_utils';
import {FileUseTypeEnum} from '@const/database_enum';
import i18n from 'i18next';

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
  } = options;

  const message = {
    _id: uuid(),
    text: text,
    createdAt: new Date(),
    user: {
      _id: isOneself ? 1 : 2,
      id: userId,
      name: userName,
      avatar: userAvatar,
    },
    msg_type: 'text',
    fileInfo,
  };
  if (isSystem) {
    message.system = true;
  }
  if (!isEmptyObject(fileInfo)) {
    const {type, uri, ext} = fileInfo;
    const mediaTypes = ['image', 'video', 'audio'];
    if (mediaTypes.includes(type)) {
      message[type] = uri;
      message.msg_type = type;
    } else {
      message.text = ext;
      message.msg_type = 'file';
      message.file_url = uri;
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
    text: msg_secret && content ? decryptMsg(content, msg_secret) : content,
    image: `[${i18n.t('chat.msg_type_image')}]`,
    video: `[${i18n.t('chat.msg_type_video')}]`,
    audio: `[${i18n.t('chat.msg_type_audio')}]`,
    file: `[${i18n.t('chat.msg_type_file')}]`,
    other: `[${i18n.t('chat.msg_type_other')}]`,
  };
  return msgTypeMap[msg_type] || '';
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
      ...message,
    };
  });
};

/* 格式化临时消息为本地消息 */
export const formatTmpMsgToLocal = (message, options = {}) => {
  const {_id, createdAt, text, user, msg_type} = message || {};
  const {
    session_id,
    chat_type,
    sender_id,
    sender_avatar,
    sender_remarks,
    status,
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
    msg_type: msg_type || 'text',
    chat_type: chat_type,
    create_time: createdAt?.toISOString(),
    status: status,
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
    if (msg_type !== 'text') {
      message.text = null;
      const mediaTypes = ['image', 'video', 'audio'];
      if (mediaTypes.includes(msg_type)) {
        if (msg_type === 'image') {
          message[msg_type] = envConfig.THUMBNAIL_URL + text;
        } else {
          message[msg_type] = envConfig.STATIC_URL + text;
        }
      } else {
        message.file_url = envConfig.STATIC_URL + text;
        message.text = getFileExt(text);
      }
    }
    return message;
  });
};

/* 处理消息 */
export const processMessage = async (
  message,
  {onProgress = () => {}, setUploadId = () => {}, setUploadIds = () => {}},
) => {
  const {msg_type = 'text', text, fileInfo} = message || {};
  if (msg_type === 'text') {
    return {msg_type, text};
  } else {
    if (!fileInfo || isEmptyObject(fileInfo)) {
      return false;
    }
    try {
      setUploadId(message._id);
      setUploadIds(prevIds => [...new Set([...prevIds, message._id])]);
      const res = await uploadFile(fileInfo.file, {
        form: {
          file_type: fileInfo.type,
          use_type: FileUseTypeEnum.chat,
        },
        onProgress: onProgress,
      });
      const upRes = JSON.parse(res.text());
      if (upRes.code === 0) {
        return {
          msg_type,
          text: upRes.data.file_key,
        };
      } else {
        console.error(upRes.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      onProgress(0);
      setUploadId(null);
      setUploadIds(prevIds => prevIds.filter(id => id !== message._id));
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
      last_msg_content,
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
        last_msg_content,
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
