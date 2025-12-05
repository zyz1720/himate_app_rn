import React from 'react';
import {View, Text} from 'react-native-ui-lib';

/* 自定义发送 */
export const CustomSystemMessage = props => {
  return (
    <View center padding-4>
      <Text text90L grey40>
        {props.currentMessage.text}
      </Text>
    </View>
  );
};
