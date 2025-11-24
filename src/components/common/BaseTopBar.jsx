import React from 'react';
import {StyleSheet} from 'react-native';
import {View, TouchableOpacity, Text, Colors} from 'react-native-ui-lib';
import {fullWidth, fullHeight} from '@style/index';
import Animated, {FadeInLeft, FadeOut} from 'react-native-reanimated';

const BaseTopBar = props => {
  const {
    routes = [],
    focusIndex = 0,
    onChange = () => {},
    heightScale = 0.92,
  } = props;

  return (
    <View width={fullWidth} height={fullHeight * heightScale}>
      <View row spread backgroundColor="white" style={styles.topStyle}>
        {routes.map((item, index) => {
          return (
            <View key={item.key}>
              <TouchableOpacity
                style={[styles.barStyle]}
                onPress={() => onChange(index, item)}>
                <Text
                  color={index === focusIndex ? Colors.primary : Colors.grey30}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              {index === focusIndex ? (
                <Animated.View
                  entering={FadeInLeft}
                  exiting={FadeOut}
                  height={2}
                  backgroundColor={Colors.primary}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <View>{routes[focusIndex].screen}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  topStyle: {
    borderBottomWidth: 0.8,
    borderBottomColor: Colors.grey70,
  },
  barStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
});
export default BaseTopBar;
