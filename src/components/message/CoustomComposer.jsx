import React from 'react';
import {StyleSheet} from 'react-native';
import {Composer} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';

const styles = StyleSheet.create({
  textInputStyle: {
    backgroundColor: Colors.$backgroundNeutral,
    borderRadius: 8,
    padding: 8,
    lineHeight: 22,
  },
});

/* 自定义加载更多 */
export const CustomComposer = props => {
  return <Composer {...props} textInputStyle={styles.textInputStyle} />;
};
