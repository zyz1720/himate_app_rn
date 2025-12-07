import notifee, {AndroidImportance} from '@notifee/react-native';
import {showMediaType} from './chat_utils';
import {name as appName} from '@root/app.json';
import {useSettingStore} from '@store/settingStore';
import {useConfigStore} from '@store/configStore';
import Sound from 'react-native-sound';

/* 系统消息通知 */
export async function onDisplayRealMsg(data) {
  const {envConfig} = useConfigStore.getState();

  const {
    session_name,
    session_avatar,
    session_id,
    msg_type,
    session,
    msgdata,
    msg_secret,
  } = data;

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
    session.unread_count > 0 ? `(${session.unread_count + 1}条未读)` : '';

  await notifee.displayNotification({
    title: session_name + unReadText,
    body: showMediaType(msgdata, msg_type, msg_secret),
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
}

/* 删除系统通知渠道 */
export const deleteChannel = async channelId => {
  await notifee.deleteChannel(channelId);
};

/* 取消通知 */
export const cancelNotification = async notificationId => {
  await notifee.cancelNotification(notificationId);
};

/* 播放系统声音 */
export async function playSystemSound(sound_name) {
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
}
