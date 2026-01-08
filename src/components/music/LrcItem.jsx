import React, {useEffect, useCallback, useState, useRef} from 'react';
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

  const fullWidthRef = useRef(fullWidth);

  // 缓存fullWidth值
  useEffect(() => {
    fullWidthRef.current = fullWidth;
  }, [fullWidth]);

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

  // 处理文本布局
  const handleTextLayout = useCallback(event => {
    const {height, width} = event.nativeEvent.layout;
    setTextDimensions(prev => {
      // 只有当尺寸变化明显时才更新状态
      if (
        Math.abs(prev.width - width) > 1 ||
        Math.abs(prev.height - height) > 1
      ) {
        return {width, height};
      }
      return prev;
    });
  }, []);

  // 检查文本是否可见 - 优化：使用some代替find，更高效
  const isTextVisible = useCallback(text => {
    return !text || !HIDDEN_TEXTS.some(hidden => text.includes(hidden));
  }, []);

  // 动画样式 - 优化：减少不必要的动画样式属性
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

  // 更新动画效果
  useEffect(() => {
    const isActive = nowLyricIndex === index;
    const diff = Math.abs(nowLyricIndex - index);
    const isAdjacent = diff === 1;
    const isNearby = diff === 2;
    const currentFullWidth = fullWidthRef.current;

    // 批量更新动画值，避免多次触发动画
    if (isActive) {
      scale.value = withTiming(1.3, {duration: 200});
      paddingH.value = withTiming(
        isHorizontal ? (currentFullWidth / 2) * 0.1 : currentFullWidth * 0.105,
        {duration: 300},
      );
      // 只有在yrc模式下才需要更新textWidth
      if (yrcVisible) {
        textWidth.value = withTiming(progress, {
          duration: yrcDuration,
          easing: Easing.in,
        });
      }
      opacity.value = withTiming(1, {duration: 200});
      transOpacity.value = withTiming(1, {duration: 200});
    } else if (isAdjacent) {
      opacity.value = withTiming(0.8, {duration: 200});
      transOpacity.value = withTiming(0.8, {duration: 200});
      scale.value = withTiming(1, {duration: 200});
      paddingH.value = withTiming(0, {duration: 200});
    } else if (isNearby) {
      opacity.value = withTiming(0.6, {duration: 200});
      transOpacity.value = withTiming(0.6, {duration: 200});
      scale.value = withTiming(1, {duration: 200});
      paddingH.value = withTiming(0, {duration: 200});
    } else {
      opacity.value = withTiming(0.3, {duration: 200});
      transOpacity.value = withTiming(0.3, {duration: 200});
      scale.value = withTiming(1, {duration: 200});
      paddingH.value = withTiming(0, {duration: 200});
    }
  }, [index, nowLyricIndex, progress, yrcDuration, yrcVisible, isHorizontal]);

  return (
    <View paddingV-12 paddingH-20 onLayout={itemLayout(index)}>
      {yrcVisible ? (
        <Animated.View style={[{width: fullWidth * 0.95}, animatedStyle]}>
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
        <Animated.Text style={animatedStyle}>
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

// 自定义比较函数，避免不必要的重渲染
LrcItem.displayName = 'LrcItem';

export default LrcItem;
