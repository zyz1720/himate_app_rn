import React, {useEffect, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, Colors} from 'react-native-ui-lib';
import {fullWidth} from '@style/index';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const HIDDEN_TEXTS = ['//', '本翻译作品'];

const styles = StyleSheet.create({
  lyricViewAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
});

const LrcItem = React.memo(
  props => {
    const {
      item = {},
      index = 0,
      nowIndex = 0,
      progress = 0,
      displayChars = [],
      fullText = '',
      yrcVisible = false,
      transVisible = false,
      romaVisible = false,
      onItemLayout = () => {},
      isHorizontal = false,
    } = props;

    // 共享动画值
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const color = useSharedValue(Colors.lyricColor);
    const transOpacity = useSharedValue(1);
    const paddingH = useSharedValue(0);
    const textWidth = useSharedValue(0);

    // 文本尺寸状态
    const [textDimensions, setTextDimensions] = useState({
      width: fullWidth * 0.84,
      height: 24,
    });

    const itemLayout = _index => event => {
      const {height} = event.nativeEvent.layout;
      onItemLayout(_index, height);
    };

    // 处理文本布局
    const handleTextLayout = useCallback(event => {
      const {height, width} = event.nativeEvent.layout;
      setTextDimensions(prev => {
        // 只有当尺寸变化时才更新状态
        if (prev.width !== width || prev.height !== height) {
          return {width, height};
        }
        return prev;
      });
    }, []);

    // 检查文本是否可见
    const isTextVisible = useCallback(text => {
      return !HIDDEN_TEXTS.some(hidden => text.includes(hidden));
    }, []);

    // 动画样式
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: scale.value}],
      opacity: opacity.value,
      color: color.value,
      paddingHorizontal: paddingH.value,
    }));

    const transAnimatedStyle = useAnimatedStyle(() => ({
      color: color.value,
      opacity: transOpacity.value,
    }));

    const yrcAnimatedStyle = useAnimatedStyle(() => ({
      paddingHorizontal: paddingH.value,
      width: textWidth.value * textDimensions?.width || 0,
    }));

    // 更新动画效果
    useEffect(() => {
      const isActive = nowIndex === index;
      const isAdjacent = Math.abs(nowIndex - index) === 1;
      const isNearby = Math.abs(nowIndex - index) === 2;

      // 批量更新动画值
      if (isActive) {
        scale.value = withTiming(1.3, {duration: 200});
        paddingH.value = withTiming(
          isHorizontal ? (fullWidth / 2) * 0.1 : fullWidth * 0.105,
          {
            duration: 400,
          },
        );
        textWidth.value = withTiming(progress, {
          duration: 390,
          easing: Easing.in,
        });
        opacity.value = withTiming(1, {duration: 200});
        transOpacity.value = withTiming(1, {duration: 200});
        color.value = withTiming(Colors.lyricColor, {duration: 100});
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
    }, [index, nowIndex, progress]);

    return (
      <View paddingV-12 paddingH-20 onLayout={itemLayout(index)}>
        {yrcVisible ? (
          <Animated.View style={[{width: fullWidth * 0.95}, animatedStyle]}>
            <Text
              color={Colors.lyricColor}
              text70BO
              onLayout={handleTextLayout}>
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
              {item.lyric}
            </Text>
          </Animated.Text>
        )}
        {transVisible && isTextVisible(item.trans) && (
          <Animated.Text style={transAnimatedStyle}>
            <Text color={Colors.lyricColor} text80L>
              {item.trans}
            </Text>
          </Animated.Text>
        )}
        {romaVisible && isTextVisible(item.roma) && (
          <Animated.Text style={transAnimatedStyle}>
            <Text color={Colors.lyricColor} text80L>
              {item.roma}
            </Text>
          </Animated.Text>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数，只在必要属性变化时重新渲染
    return (
      prevProps.item === nextProps.item &&
      prevProps.index === nextProps.index &&
      prevProps.progress === nextProps.progress &&
      prevProps.nowIndex === nextProps.nowIndex &&
      prevProps.displayChars === nextProps.displayChars &&
      prevProps.fullText === nextProps.fullText &&
      prevProps.yrcVisible === nextProps.yrcVisible &&
      prevProps.transVisible === nextProps.transVisible &&
      prevProps.romaVisible === nextProps.romaVisible
    );
  },
);

export default LrcItem;
