import MusicControl, {Command} from 'react-native-music-control';
import {useState, useCallback} from 'react';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';

export const useMusicControl = () => {
  const [playerCtrlState, setPlayerCtrlState] = useState(null);
  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();

  MusicControl.setNotificationId(5173, 'music_control_notification');
  MusicControl.enableControl('play', true);
  MusicControl.enableControl('pause', true);
  MusicControl.enableControl('stop', false);
  MusicControl.enableControl('nextTrack', true);
  MusicControl.enableControl('previousTrack', true);
  MusicControl.enableControl('seek', true);
  MusicControl.enableControl('closeNotification', true, {when: 'paused'});
  MusicControl.enableBackgroundMode(true);
  MusicControl.handleAudioInterruptions(true);

  // 设置正在播放的音乐信息
  const setNowPlayingCtrl = useCallback(
    musicInfo => {
      const {title, artist, album, duration, musicExtra} = musicInfo;
      MusicControl.setNowPlaying({
        title: title,
        artwork:
          envConfig.STATIC_URL +
          (musicExtra?.music_cover || userInfo?.user_avatar),
        artist: artist,
        album: album,
        duration: duration,
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
      speed: 1,
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
  }, []);

  /* 控件操作 */
  MusicControl.on(Command.pause, value => {
    setPlayerCtrlState(value);
  });
  MusicControl.on(Command.play, value => {
    setPlayerCtrlState(value);
  });
  MusicControl.on(Command.nextTrack, value => {
    setPlayerCtrlState(value);
  });
  MusicControl.on(Command.previousTrack, value => {
    setPlayerCtrlState(value);
  });
  MusicControl.on(Command.seek, pos => {
    setPlayerCtrlState(pos * 1000);
  });

  return {
    setNowPlayingCtrl,
    resumePlayerCtrl,
    pausePlayerCtrl,
    seekToPlayerCtrl,
    stopPlayerCtrl,
    playerCtrlState,
  };
};
