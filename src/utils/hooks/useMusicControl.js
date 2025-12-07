import MusicControl, {Command} from 'react-native-music-control';
import {useCallback, useState} from 'react';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {cancelNotification, deleteChannel} from '@utils/system/notification';

export const useMusicControl = () => {
  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();
  const [isInit, setIsInit] = useState(false);

  const initMusicControl = () => {
    MusicControl.setNotificationId(6666, 'music_controller_channel');
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', false);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableControl('seek', true);
    MusicControl.enableControl('closeNotification', true, {when: 'paused'});
    MusicControl.enableBackgroundMode(true);
    MusicControl.handleAudioInterruptions(true);
    setIsInit(true);
  };

  // 设置正在播放的音乐信息
  const setNowPlayingCtrl = useCallback(
    musicInfo => {
      if (!isInit) {
        initMusicControl();
      }
      const {title, artist, album, duration, musicExtra = {}} = musicInfo;
      MusicControl.setNowPlaying({
        title: title,
        artwork:
          envConfig.STATIC_URL +
          (musicExtra?.music_cover || userInfo?.user_avatar),
        artist: artist || '',
        album: album || '',
        duration: duration || 0,
        color: 0x0000ff,
        date: Date.now().toString(),
        isLiveStream: true,
      });
    },
    [envConfig.STATIC_URL, userInfo?.user_avatar],
  );

  // 恢复播放
  const resumePlayerCtrl = useCallback(() => {
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PLAYING,
    });
  }, []);

  // 暂停播放
  const pausePlayerCtrl = useCallback(() => {
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PAUSED,
    });
  }, []);

  // 跳转到指定位置播放
  const seekToPlayerCtrl = useCallback((time = 0) => {
    MusicControl.updatePlayback({
      elapsedTime: time,
    });
  }, []);

  // 停止播放
  const stopPlayerCtrl = useCallback(() => {
    MusicControl.stopControl();
    cancelNotification('6666');
    deleteChannel('music_controller_channel');
  }, []);

  /* 控件操作 */
  const onPauseCtrl = useCallback(callBack => {
    MusicControl.on(Command.pause, () => {
      callBack();
    });
  }, []);

  // 播放/暂停
  const onPlayCtrl = useCallback(callBack => {
    MusicControl.on(Command.play, () => {
      callBack();
    });
  }, []);

  // 下一首
  const onNextTrackCtrl = useCallback(callBack => {
    MusicControl.on(Command.nextTrack, () => {
      callBack();
    });
  }, []);

  // 上一首
  const onPreviousTrackCtrl = useCallback(callBack => {
    MusicControl.on(Command.previousTrack, () => {
      callBack();
    });
  }, []);

  // 拖动进度条
  const onSeekCtrl = useCallback(callBack => {
    MusicControl.on(Command.seek, pos => {
      callBack(pos * 1000);
    });
  }, []);

  return {
    initMusicControl,
    setNowPlayingCtrl,
    resumePlayerCtrl,
    pausePlayerCtrl,
    seekToPlayerCtrl,
    stopPlayerCtrl,
    onPauseCtrl,
    onPlayCtrl,
    onNextTrackCtrl,
    onPreviousTrackCtrl,
    onSeekCtrl,
  };
};
