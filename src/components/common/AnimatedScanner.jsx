import React, {useEffect, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';
import {Colors, View} from 'react-native-ui-lib';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

const AnimatedScanner = React.memo(props => {
  const {borderRadius = 0, progress = 0} = props;
  const progressAnimation = new Animated.Value(progress || 0);
  const animateProgress = toValue => {
    if (toValue) {
      Animated.timing(progressAnimation, {
        duration: 300,
        easing: Easing.ease,
        toValue,
        useNativeDriver: true,
      }).start();
    }
  };

  const [containerWidth, setContainerWidth] = useState(0);

  const getContainerWidth = event => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const newProgress = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [0, containerWidth],
  });

  useEffect(() => {
    animateProgress(progress);
  }, [progress]);

  return (
    <View absT height={'100%'} width={'100%'}>
      <View
        onLayout={getContainerWidth}
        style={styles.container}
        width={'100%'}
        height={'100%'}
        borderRadius={borderRadius}
        backgroundColor={Colors.white1}>
        <Animated.View
          style={[
            styles.progress,
            {
              transform: [
                {
                  translateX: newProgress,
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
});

export default AnimatedScanner;
