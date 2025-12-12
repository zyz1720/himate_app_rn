import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {
  Colors,
  TouchableOpacity,
  View,
  Slider,
  Text,
} from 'react-native-ui-lib';
import {useAudioPlayer} from '@utils/hooks/useAudioPlayer';
import {useMusicStore} from '@store/musicStore';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const AudioMsg = props => {
  const {
    currentMessage = {},
    onLongPress = () => {},
    nowPlayAudioId = null,
    setNowPlayAudioId = () => {},
  } = props;

  const {
    addPlayBackListener,
    startPlayer,
    pausePlayer,
    resumePlayer,
    stopPlayer,
    seekToPlayer,
  } = useAudioPlayer();
  const {setIsMusicResumePlay, setIsMusicPaused} = useMusicStore();

  const [curPosition, setCurPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const [audioIsPlaying, setAudioIsPlaying] = useState(false);

  // 停止播放
  const stopPlay = async () => {
    setNowPlayAudioId(null);
    setCurPosition(0);
    setAudioDuration(0);
    setAudioIsPlaying(false);
    await stopPlayer();
  };

  // 恢复播放
  const resumePlay = async () => {
    setAudioIsPlaying(true);
    await resumePlayer();
  };

  // 暂停播放
  const pausePlay = async () => {
    setAudioIsPlaying(false);
    await pausePlayer();
  };

  // 开始播放
  const startPlay = async () => {
    setIsMusicPaused(true);
    await stopPlay();
    await startPlayer(currentMessage.audio);
    setNowPlayAudioId(currentMessage._id);
    setAudioIsPlaying(true);
  };

  // 跳转播放
  const seekToPlay = async value => {
    const newPosition = parseInt(value, 10);
    setCurPosition(newPosition);
    await seekToPlayer(newPosition);
  };

  useEffect(() => {
    if (nowPlayAudioId === currentMessage._id) {
      addPlayBackListener(playbackMeta => {
        const {currentPosition, duration, isFinished} = playbackMeta;

        setCurPosition(currentPosition);

        if (duration !== audioDuration) {
          setAudioDuration(duration);
        }

        if (isFinished) {
          stopPlay();
          setIsMusicResumePlay(true);
        }
      });
    }
  }, [nowPlayAudioId, currentMessage._id, audioDuration]);

  useEffect(() => {
    return () => {
      stopPlay();
      setIsMusicResumePlay(true);
    };
  }, []);

  return (
    <View style={styles.audioBut}>
      <TouchableOpacity
        onPress={async () => startPlay()}
        onLongPress={()=>{
          onLongPress({
            type: 'media',
            url: currentMessage?.audio,
          });
        }}
        row
        centerV
        paddingV-6
        paddingH-12>
        {nowPlayAudioId === currentMessage._id ? (
          <>
            {audioIsPlaying ? (
              <TouchableOpacity onPress={() => pausePlay()}>
                <AntDesign
                  name="pausecircle"
                  color={
                    currentMessage.user._id === 1
                      ? Colors.primary
                      : Colors.grey10
                  }
                  size={20}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => resumePlay()}>
                <AntDesign
                  name="playcircleo"
                  color={
                    currentMessage.user._id === 1
                      ? Colors.primary
                      : Colors.grey10
                  }
                  size={20}
                />
              </TouchableOpacity>
            )}
            <View row centerV marginL-8>
              <View style={styles.audioProgress}>
                <Slider
                  thumbStyle={styles.audioThumb}
                  value={curPosition}
                  minimumValue={0}
                  maximumValue={audioDuration || 100}
                  minimumTrackTintColor={Colors.primary}
                  onValueChange={value => {
                    seekToPlay(value);
                  }}
                />
              </View>
              <Text marginL-4 grey30 text90L>
                {Math.round(audioDuration / 1000)}s
              </Text>
            </View>
          </>
        ) : (
          <FontAwesome
            name="volume-down"
            color={
              currentMessage.user._id === 1 ? Colors.primary : Colors.grey10
            }
            size={24}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  audioBut: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
    marginVertical: 4,
  },
  audioProgress: {
    width: 50,
  },
  audioThumb: {
    width: 2,
    height: 24,
    backgroundColor: Colors.red30,
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.red30,
  },
});

export default AudioMsg;
