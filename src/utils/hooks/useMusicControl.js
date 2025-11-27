import MusicControl, {Command} from 'react-native-music-control';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';

export const useMusicControl = musicInfo => {
  const {title, artist, album, duration, musicExtra} = musicInfo;

  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();

  MusicControl.setNotificationId(5173, 'cancelPlayer');
  MusicControl.enableControl('play', true);
  MusicControl.enableControl('pause', true);
  MusicControl.enableControl('stop', false);
  MusicControl.enableControl('nextTrack', true);
  MusicControl.enableControl('previousTrack', true);
  MusicControl.enableControl('seek', true);
  MusicControl.enableControl('closeNotification', true, {when: 'paused'});
  MusicControl.enableBackgroundMode(true);
  MusicControl.handleAudioInterruptions(true);
  MusicControl.setNowPlaying({
    title: title,
    artwork:
      envConfig.STATIC_URL + (musicExtra?.music_cover || userInfo?.user_avatar),
    artist: artist,
    album: album,
    duration: duration,
    color: 0x0000ff,
    date: Date.now().toString(),
    isLiveStream: true,
  });
  MusicControl.updatePlayback({
    state: MusicControl.STATE_PLAYING,
    speed: 1,
  });
};
