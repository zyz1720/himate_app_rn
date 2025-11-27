import {useCallback, useRef, useState} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioPlayer = new AudioRecorderPlayer();

export const useAudioPlayer = () => {
  const prevPlayType = useRef(null);
  const prevPlayUrl = useRef(null);
  const prevPlayPosition = useRef(0);
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 监听播放状态变化
  audioPlayer.addPlayBackListener(playbackMeta => {
    const {currentPosition: cp, duration: d} = playbackMeta;
    setCurrentPosition(cp);
    setDuration(d);

    setElapsedTime(Math.round(cp / 1000));

    setProgress(Math.round((cp / d) * 100));
  });

  // 播放音频
  const startPlayer = useCallback(
    async (url, playType = 'other') => {
      if (prevPlayUrl.current !== url) {
        prevPlayUrl.current = url;
        prevPlayPosition.current = currentPosition;
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
    currentPosition,
    duration,
    elapsedTime,
    progress,
    startPlayer,
    pausePlayer,
    resumePlayer,
    stopPlayer,
    seekToPlayer,
    removePlayBackListener,
    resumePrevPlayer,
  };
};
