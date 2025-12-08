import {deepClone} from '@utils/common/object_utils';
import {useConfigStore} from '@store/configStore';
import {useSettingStore} from '@store/settingStore';
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
export const showMediaType = (content, type, secret) => {
  if (!content) {
    return `[${i18n.t('chat.empty_chat')}]`;
  }
  const msgTypeMap = {
    text: decryptMsg(content, secret),
    image: `[${i18n.t('chat.msg_type_image')}]`,
    video: `[${i18n.t('chat.msg_type_video')}]`,
    audio: `[${i18n.t('chat.msg_type_audio')}]`,
    file: `[${i18n.t('chat.msg_type_file')}]`,
    other: `[${i18n.t('chat.msg_type_other')}]`,
  };
  return msgTypeMap[type] || '';
};

/* 格式化云端消息为本地消息 */
export const formatCloudMsgToLocal = (data, session_id) => {
  const {message, senderInfo} = data || {};
  return {
    session_id: session_id,
    sender_avatar: senderInfo?.avatar,
    sender_remarks: senderInfo?.remarks,
    chat_type: senderInfo?.chat_type,
    status: 'ok',
    ...message,
  };
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
export const formatLocalMsgToTmp = messages => {
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

/* 格式化加入会话的用户信息 */
export const formatJoinUser = (
  userId,
  remark,
  avatar,
  session_id,
  session_name = '',
) => {
  return {
    _id: userId + session_id,
    userId,
    remark,
    avatar,
    session_id,
    session_name,
  };
};

/* 写入本地消息 */
const {notSaveMsg} = useSettingStore.getState();
export const setLocalMsg = async (realm, msgs) => {
  if (notSaveMsg) {
    return;
  }
  if (msgs?.length === 0) {
    return;
  }
  try {
    const msglist = deepClone(msgs);
    for (let i = 0; i < msglist.length; i++) {
      const element = msglist[i];
      const msg = realm.objectForPrimaryKey('ChatMsg', element.clientMsg_id);
      if (msg) {
        continue;
      } else {
        realm.write(() => {
          realm.create('ChatMsg', element);
        });
      }
    }
  } catch (error) {
    console.error('写入本地消息失败', error);
  }
};

/* 查询本地消息 */
export const getLocalMsg = (realm, session_id) => {
  const localMsgs = realm.objects('ChatMsg');
  const list = localMsgs
    .filtered('session_id == $0', session_id)
    .sorted('createdAt', true)
    .toJSON();
  return {
    list,
    count: list.length,
  };
};

/* 写入本地用户信息 */
export const addOrUpdateLocalUser = (realm, users) => {
  if (users.length === 0) {
    return;
  }
  const userList = deepClone(users);
  for (let i = 0; i < userList.length; i++) {
    const element = userList[i];
    const user = realm
      .objects('users_info')
      .filtered(
        'userId == $0 && session_id == $1',
        element.userId,
        element.session_id,
      );
    if (user.length > 0) {
      realm.write(() => {
        for (const ele of user) {
          ele.avatar = element.avatar;
          ele.remark = element.remark;
        }
      });
    } else {
      realm.write(() => {
        realm.create('users_info', element);
      });
    }
  }
};

/* 处理文件类消息 */
export const handleMessage = async (
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
