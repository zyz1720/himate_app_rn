import {useCallback, useRef} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioPlayer = new AudioRecorderPlayer();

export const useAudioPlayer = () => {
  const prevPlayType = useRef(null);
  const prevPlayUrl = useRef(null);
  const prevPlayPosition = useRef(0);

  // 监听播放状态变化
  const addPlayBackListener = useCallback(
    callback => {
      audioPlayer.addPlayBackListener(playbackMeta => {
        const {currentPosition, duration, isFinished} = playbackMeta;
        prevPlayPosition.current = currentPosition;
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
    async (url, playType = 'other') => {
      if (prevPlayUrl.current !== url) {
        prevPlayUrl.current = url;
        prevPlayType.current = playType;
      }
      return audioPlayer.startPlayer(url);
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

  // 继续上一次播放
  const resumePrevPlayer = useCallback(async () => {
    if (
      prevPlayUrl.current &&
      prevPlayPosition.current &&
      prevPlayType.current === 'music'
    ) {
      await startPlayer(prevPlayUrl.current, prevPlayType.current);
      await seekToPlayer(prevPlayPosition.current);
    }
  }, [startPlayer, seekToPlayer]);

  return {
    startPlayer,
    pausePlayer,
    resumePlayer,
    stopPlayer,
    seekToPlayer,
    removePlayBackListener,
    resumePrevPlayer,
    addPlayBackListener,
  };
};
