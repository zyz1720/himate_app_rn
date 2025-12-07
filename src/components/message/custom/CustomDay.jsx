import React from 'react';
import {StyleSheet} from 'react-native';
import {Day} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';

const styles = StyleSheet.create({
  DayContainerStyle: {marginVertical: 20},
  DayTextStyle: {color: Colors.grey40, fontWeight: 'normal'},
});

/* 自定义时间 */
const CustomDay = props => {
  return (
    <Day
      {...props}
      containerStyle={styles.DayContainerStyle}
      wrapperStyle={{backgroundColor: Colors.transparent}}
      textStyle={styles.DayTextStyle}
    />
  );
};

export default CustomDay;
