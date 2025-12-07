import {useCallback} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioPlayer = new AudioRecorderPlayer();

export const useAudioPlayer = () => {

  // 监听播放状态变化
  const addPlayBackListener = useCallback(
    callback => {
      audioPlayer.addPlayBackListener(playbackMeta => {
        const {currentPosition, duration, isFinished} = playbackMeta;
        callback({
          currentPosition: currentPosition,
          duration: duration,
          elapsedTime: Math.round(currentPosition / 1000),
          progress: Math.round((currentPosition / duration) * 100),
          isFinished,
        });
      });
    },
    [audioPlayer],
  );

  // 播放音频
  const startPlayer = useCallback(
    async url => {
      await audioPlayer.startPlayer(url);
    },
    [audioPlayer],
  );

  // 暂停播放
  const pausePlayer = useCallback(async () => {
    await audioPlayer.pausePlayer();
  }, [audioPlayer]);

  // 继续播放
  const resumePlayer = useCallback(async () => {
    await audioPlayer.resumePlayer();
  }, [audioPlayer]);

  // 停止播放
  const stopPlayer = useCallback(async () => {
    await audioPlayer.stopPlayer();
  }, [audioPlayer]);

  // 跳转播放位置
  const seekToPlayer = useCallback(
    async position => {
      await audioPlayer.seekToPlayer(position);
    },
    [audioPlayer],
  );

  // 移除播放状态变化监听
  const removePlayBackListener = useCallback(() => {
    audioPlayer.removePlayBackListener();
  }, [audioPlayer]);

  return {
    startPlayer,
    pausePlayer,
    resumePlayer,
    stopPlayer,
    seekToPlayer,
    removePlayBackListener,
    addPlayBackListener,
  };
};
