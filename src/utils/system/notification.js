import notifee, {AndroidImportance} from '@notifee/react-native';
import {name as appName} from '@root/app.json';
import {useSettingStore} from '@store/settingStore';
import {useConfigStore} from '@store/configStore';
import {useChatMsgStore} from '@store/chatMsgStore';
import {formatSessionToNotification} from './chat_utils';
import i18n from 'i18next';
import Sound from 'react-native-sound';

/* 系统消息通知 */
export const onDisplayRealMsg = async message => {
  const {envConfig} = useConfigStore.getState();

  const {
    session_name,
    session_avatar,
    session_id,
    unread_count,
    text,
    lastSenderRemarks,
  } = message;

  await notifee.deleteChannel(session_id);

  const channelId = await notifee.createChannel({
    id: session_id,
    name: '实时消息',
    lights: true,
    vibration: false,
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  const unReadText =
    unread_count > 0
      ? `(${i18n.t('chat.unread_count', {count: unread_count})})`
      : '';

  await notifee.displayNotification({
    title: session_name + unReadText,
    body: (lastSenderRemarks || '') + text,
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      timestamp: Date.now(), // 8 minutes ago
      showTimestamp: true,
      largeIcon: envConfig?.STATIC_URL + session_avatar,
      pressAction: {
        id: session_id,
        mainComponent: appName,
      },
    },
  });
};

// 批量处理通知
export const batchDisplayMsgNotifications = async messages => {
  const {notRemindSessionIds} = useChatMsgStore.getState();
  const toBeDisplayedMsgs = formatSessionToNotification(messages);
  for (const msg of toBeDisplayedMsgs) {
    if (notRemindSessionIds.includes(msg.session_id)) {
      continue;
    }
    await onDisplayRealMsg(msg);
    await playSystemSound();
  }
};

/* 删除系统通知渠道 */
export const deleteChannel = async channelId => {
  await notifee.deleteChannel(channelId);
};

/* 取消通知 */
export const cancelNotification = async notificationId => {
  await notifee.cancelNotification(notificationId);
};

/* 播放系统声音 */
export const playSystemSound = async sound_name => {
  const {ringtone} = useSettingStore.getState();
  const sound = new Sound(sound_name || ringtone, Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('加载声音文件失败', error);
      return;
    }
    sound.setVolume(1.0);
    sound.play(success => {
      if (success) {
        sound.release();
      } else {
        console.log('播放声音时出错');
      }
    });
  });
};
