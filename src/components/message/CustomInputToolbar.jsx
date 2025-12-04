import React from 'react';
import {InputToolbar} from 'react-native-gifted-chat';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  inputToolbarContainerStyle: {
    paddingRight: 6,
    paddingLeft: 10,
    paddingVertical: 8,
  },
  inputToolbarAccessoryStyle: {paddingLeft: 26},
  height80: {height: 80},
  height0: {height: 0},
});

/* 自定义加载更多 */
const CustomInputToolbar = ({props, showActions}) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbarContainerStyle}
      accessoryStyle={[
        styles.inputToolbarAccessoryStyle,
        showActions ? styles.height80 : styles.height0,
      ]}
    />
  );
};

export default CustomInputToolbar;
