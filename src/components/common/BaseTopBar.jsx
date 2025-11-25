import React, {useState} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {View, TouchableOpacity, Text, Colors} from 'react-native-ui-lib';
import {fullWidth} from '@style/index';
import Animated, {FadeInLeft, FadeOutRight} from 'react-native-reanimated';

const BaseTopBar = props => {
  const {routes = [], initialIndex = 0, onChange = () => {}} = props;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  return (
    <View width={fullWidth}>
      <View flexG row spread bg-white style={styles.topStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            routes.length <= 4 ? styles.flexContainerStyle : null
          }>
          {routes.map((item, index) => {
            return (
              <View key={item.key} flex>
                <TouchableOpacity
                  style={[styles.barStyle]}
                  onPress={() => {
                    setFocusedIndex(index);
                    onChange(index, item);
                  }}>
                  <Text
                    color={
                      index === focusedIndex ? Colors.primary : Colors.grey30
                    }>
                    {item.title}
                  </Text>
                </TouchableOpacity>
                {index === focusedIndex ? (
                  <Animated.View
                    entering={FadeInLeft}
                    exiting={FadeOutRight}
                    height={2}
                    backgroundColor={Colors.primary}
                  />
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View>{routes[focusedIndex].screen}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainerStyle: {flex: 1, justifyContent: 'center'},
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
