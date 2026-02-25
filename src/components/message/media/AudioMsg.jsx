import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet} from 'react-native';
import {
  Colors,
  TouchableOpacity,
  View,
  Slider,
  Text,
} from 'react-native-ui-lib';
import {useMusicStore} from '@store/musicStore';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';

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

const AudioMsg = React.memo(props => {
  const {
    currentMessage = {},
    onLongPress = () => {},
    nowPlayAudioId = null,
    setNowPlayAudioId = () => {},
  } = props;

  const {setIsMusicResumePlay, setIsMusicBreak} = useMusicStore();

  const videoRef = useRef(null);

  const [curPosition, setCurPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);

  const stopPlay = () => {
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
    setNowPlayAudioId(null);
    setCurPosition(0);
    setAudioDuration(0);
    setAudioIsPlaying(false);
  };

  const resumePlay = () => {
    setAudioIsPlaying(true);
  };

  const pausePlay = () => {
    setAudioIsPlaying(false);
  };

  const startPlay = () => {
    setIsMusicBreak(true);
    stopPlay();
    setNowPlayAudioId(currentMessage._id);
    setAudioIsPlaying(true);
  };

  const seekToPlay = value => {
    const newPosition = parseInt(value, 10);
    setCurPosition(newPosition);
    if (videoRef.current) {
      videoRef.current.seek(newPosition / 1000);
    }
  };

  const handleLoad = meta => {
    setAudioDuration(meta.duration * 1000);
  };

  const handleProgress = data => {
    setCurPosition(data.currentTime * 1000);
  };

  const handleEnd = () => {
    stopPlay();
    setIsMusicResumePlay(true);
  };

  useEffect(() => {
    return () => {
      handleEnd();
    };
  }, []);

  return (
    <View style={styles.audioBut}>
      <TouchableOpacity
        onPress={() => startPlay()}
        onLongPress={() => {
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
      {nowPlayAudioId === currentMessage._id && (
        <Video
          ref={videoRef}
          source={{uri: currentMessage.audio}}
          paused={!audioIsPlaying}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onEnd={handleEnd}
          allowsExternalPlayback={false}
          controls={false}
        />
      )}
    </View>
  );
});

export default AudioMsg;
