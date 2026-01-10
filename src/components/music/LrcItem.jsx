import React, {useEffect, useCallback, useState, useMemo, useRef} from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, Colors} from 'react-native-ui-lib';
import {useScreenDimensions} from '@components/contexts/ScreenDimensionsContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {HIDDEN_TEXTS} from '@utils/system/lyric_utils';

const styles = StyleSheet.create({
  lyricViewAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
});

const isTextVisible = text => {
  return !text || !HIDDEN_TEXTS.some(hidden => text.includes(hidden));
};

const LrcItem = React.memo(props => {
  const {
    lyric = '',
    trans = '',
    roma = '',
    index = 0,
    progress = 0,
    yrcDuration = 0,
    displayChars = [],
    fullText = '',
    yrcVisible = false,
    transVisible = false,
    romaVisible = false,
    onItemLayout = () => {},
    isHorizontal = false,
    nowLyricIndex = -1,
  } = props;

  const {fullWidth} = useScreenDimensions();

  // 共享动画值
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const transOpacity = useSharedValue(1);
  const paddingH = useSharedValue(0);
  const textWidth = useSharedValue(0);

  // 文本尺寸状态
  const [textDimensions, setTextDimensions] = useState({
    width: fullWidth * 0.84,
    height: 24,
  });

  const itemLayout = useCallback(
    _index => event => {
      const {height} = event.nativeEvent.layout;
      onItemLayout(_index, height);
    },
    [onItemLayout],
  );

  const handleTextLayout = useCallback(event => {
    const {height, width} = event.nativeEvent.layout;
    setTextDimensions(prev => {
      if (
        Math.abs(prev.width - width) > 1 ||
        Math.abs(prev.height - height) > 1
      ) {
        return {width, height};
      }
      return prev;
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
    paddingHorizontal: paddingH.value,
  }));

  const transAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transOpacity.value,
  }));

  const yrcAnimatedStyle = useAnimatedStyle(() => ({
    paddingHorizontal: paddingH.value,
    width: textWidth.value * textDimensions?.width || 0,
  }));

  const isHorizontalPadding = useMemo(
    () => (fullWidth / 2) * 0.105,
    [fullWidth],
  );

  const unHorizontalPadding = useMemo(() => fullWidth * 0.105, [fullWidth]);

  const lyricWidth = useMemo(
    () => (isHorizontal ? (fullWidth / 2) * 0.95 : fullWidth * 0.95),
    [fullWidth, isHorizontal],
  );

  useEffect(() => {
    const isActive = nowLyricIndex === index;
    const diff = Math.abs(nowLyricIndex - index);
    const isAdjacent = diff === 1;
    const isNearby = diff === 2;

    // 批量更新动画值，减少动画调用次数
    const updateAnimations = () => {
      if (isActive) {
        paddingH.value = withTiming(
          isHorizontal ? isHorizontalPadding : unHorizontalPadding,
          {duration: 100},
        );
        if (yrcVisible) {
          textWidth.value = withTiming(progress, {
            duration: yrcDuration,
            easing: Easing.in,
          });
        }
        scale.value = withTiming(1.3, {duration: 300});
        opacity.value = withTiming(1, {duration: 300});
        transOpacity.value = withTiming(1, {duration: 300});
      } else if (isAdjacent) {
        opacity.value = withTiming(0.8, {duration: 400});
        transOpacity.value = withTiming(0.8, {duration: 400});
        scale.value = withTiming(1, {duration: 400});
        paddingH.value = withTiming(0, {duration: 100});
      } else if (isNearby) {
        opacity.value = withTiming(0.6, {duration: 400});
        transOpacity.value = withTiming(0.6, {duration: 400});
        scale.value = withTiming(1, {duration: 400});
        paddingH.value = withTiming(0, {duration: 100});
      } else {
        opacity.value = withTiming(0.3, {duration: 400});
        transOpacity.value = withTiming(0.3, {duration: 400});
        scale.value = withTiming(1, {duration: 400});
        paddingH.value = withTiming(0, {duration: 100});
      }
    };

    updateAnimations();
  }, [index, nowLyricIndex, yrcVisible, isHorizontal, progress, yrcDuration]);

  return (
    <View paddingV-12 paddingH-20 onLayout={itemLayout(index)}>
      {yrcVisible ? (
        <Animated.View style={[{width: lyricWidth}, animatedStyle]}>
          <Text color={Colors.lyricColor} text70BO onLayout={handleTextLayout}>
            {fullText}
          </Text>
          <Animated.View style={[styles.lyricViewAbs, yrcAnimatedStyle]}>
            <View
              width={textDimensions?.width || 0}
              height={textDimensions?.height || 0}>
              <Text text70BO color={Colors.primary}>
                {displayChars}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.Text style={[{width: lyricWidth}, animatedStyle]}>
          <Text color={Colors.lyricColor} text70BO>
            {lyric}
          </Text>
        </Animated.Text>
      )}
      {transVisible && isTextVisible(trans) && (
        <Animated.Text style={transAnimatedStyle}>
          <Text color={Colors.lyricColor} text80L>
            {trans}
          </Text>
        </Animated.Text>
      )}
      {romaVisible && isTextVisible(roma) && (
        <Animated.Text style={transAnimatedStyle}>
          <Text color={Colors.lyricColor} text80L>
            {roma}
          </Text>
        </Animated.Text>
      )}
    </View>
  );
});

export default LrcItem;
