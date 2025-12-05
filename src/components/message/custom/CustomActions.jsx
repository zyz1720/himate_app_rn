import React, {useState, useEffect} from 'react';
import {Colors, TouchableOpacity, View} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {useToast} from '@components/common/useToast';
import {fullHeight} from '@style/index';
import Ionicons from 'react-native-vector-icons/Ionicons';

/* 自定义操作按钮 */
const CustomActions = ({userInGroupInfo, uploadIds, onExpand}) => {
  const {t} = useTranslation();
  const {showToast} = useToast();
  const [showMore, setShowMore] = useState(false);

  const rotate = useSharedValue('0deg');

  const rotateAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: rotate.value}],
    };
  });

  useEffect(() => {
    if (showMore) {
      rotate.value = withTiming('45deg');
    } else {
      rotate.value = withTiming('0deg');
    }
  }, [showMore]);

  return (
    <View flexS center style={{marginBottom: fullHeight * 0.008}}>
      <TouchableOpacity
        onPress={() => {
          setShowMore(prev => {
            onExpand(!prev);
            if (userInGroupInfo?.member_status === 'forbidden') {
              showToast(t('chat.msg_mute_error'), 'error');
              return false;
            }
            if (uploadIds.length > 0) {
              showToast(t('chat.msg_wait_error'), 'error');
              return false;
            }
            return !prev;
          });
        }}>
        <Animated.View style={rotateAnimatedStyle}>
          <Ionicons
            name="add-circle-outline"
            color={Colors.primary}
            size={34}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomActions;
