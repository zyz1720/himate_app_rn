import React, {useEffect} from 'react';
import {Bubble} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';
import {MsgTypeEnum} from '@const/database_enum';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';

/* 自定义消息气泡 */
const CustomBubble = React.memo(props => {
  const {searchMsgCid, currentMessage} = props;
  const isText =
    !props.currentMessage?.msg_type ||
    props.currentMessage?.msg_type === MsgTypeEnum.text;
  const isSearchMsg = searchMsgCid === currentMessage._id;

  const originalBgColor = Colors.transparent;
  const flashColor = '#45C3A4';

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (isSearchMsg && isText) {
      animationProgress.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 600}),
          withTiming(0, {duration: 600}),
        ),
        -1, // 无限循环
        false, // 不反向播放
      );
    } else {
      cancelAnimation(animationProgress);
      animationProgress.value = withTiming(0, {duration: 100});
    }

    return () => {
      cancelAnimation(animationProgress);
    };
  }, [isSearchMsg, isText, animationProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        animationProgress.value,
        [0, 1],
        [originalBgColor, flashColor],
      ),
      borderRadius: 8,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: isSearchMsg
              ? 'transparent'
              : isText
              ? Colors.primary
              : 'transparent',
            borderRadius: 8,
            padding: isText ? 4 : 0,
          },
          left: {
            backgroundColor: isSearchMsg
              ? 'transparent'
              : isText
              ? Colors.white
              : 'transparent',
            borderRadius: 8,
            padding: isText ? 4 : 0,
          },
        }}
      />
    </Animated.View>
  );
});

export default CustomBubble;
