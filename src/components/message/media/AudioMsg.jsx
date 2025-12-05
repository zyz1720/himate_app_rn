import {StyleSheet} from 'react-native';
import React from 'react';
import {
  Colors,
  TouchableOpacity,
  View,
  Slider,
  Text,
} from 'react-native-ui-lib';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const AudioMsg = props => {
  const {
    message = {},
    onPress = () => {},
    onLongPress = () => {},
    nowReadyAudioId = null,
    audioPlayProgress = {},
    audioIsPlaying = false,
    onPause = () => {},
    onPlay = () => {},
    onValueChange = () => {},
  } = props;

  const {duration = 10, currentPosition = 0} = audioPlayProgress;

  return (
    <View style={styles.audioBut}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        row
        centerV
        paddingV-6
        paddingH-12>
        {nowReadyAudioId === message.client_msg_id ? (
          <>
            {audioIsPlaying ? (
              <TouchableOpacity onPress={onPause}>
                <AntDesign
                  name="pausecircle"
                  color={
                    message.user._id === 1 ? Colors.primary : Colors.grey10
                  }
                  size={20}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onPlay}>
                <AntDesign
                  name="playcircleo"
                  color={
                    message.user._id === 1 ? Colors.primary : Colors.grey10
                  }
                  size={20}
                />
              </TouchableOpacity>
            )}
            <View row centerV marginL-8>
              <View style={styles.audioProgress}>
                <Slider
                  thumbStyle={styles.audioThumb}
                  value={currentPosition}
                  minimumValue={0}
                  maximumValue={duration}
                  minimumTrackTintColor={Colors.primary}
                  onValueChange={value => {
                    onValueChange(value);
                  }}
                />
              </View>
              <Text marginL-4 grey30 text90L>
                {Math.round(duration / 1000)}s
              </Text>
            </View>
          </>
        ) : (
          <FontAwesome
            name="volume-down"
            color={message.user._id === 1 ? Colors.primary : Colors.grey10}
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
