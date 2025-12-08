import React from 'react';
import {StyleSheet} from 'react-native';
import {Send} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';
import {fullHeight} from '@style/index';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    height: 32,
  },
  textStyle: {
    color: Colors.white,
    fontSize: 14,
    position: 'relative',
    top: fullHeight * 0.006,
  },
});

/* 自定义加载更多 */
const CustomSend = props => {
  return (
    <Send
      {...props}
      containerStyle={styles.containerStyle}
      label={props.label}
      textStyle={styles.textStyle}
    />
  );
};

export default CustomSend;
