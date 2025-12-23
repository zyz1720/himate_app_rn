import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioPlayer = new AudioRecorderPlayer();

// 监听播放状态变化
export const addPlayBackListener = callback => {
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
};

// 播放音频
export const startPlayer = async url => {
  await audioPlayer.startPlayer(url);
};

// 暂停播放
export const pausePlayer = async () => {
  await audioPlayer.pausePlayer();
};

// 继续播放
export const resumePlayer = async () => {
  await audioPlayer.resumePlayer();
};

// 停止播放
export const stopPlayer = async () => {
  await audioPlayer.stopPlayer();
};

// 跳转播放位置
export const seekToPlayer = async position => {
  await audioPlayer.seekToPlayer(position);
};

// 移除播放状态变化监听
export const removePlayBackListener = () => {
  audioPlayer.removePlayBackListener();
};
