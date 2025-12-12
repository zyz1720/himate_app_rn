import React from 'react';
import {Bubble} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';
import {MsgTypeEnum} from '@const/database_enum';

/* 自定义消息气泡 */
const CustomBubble = props => {
  const isText =
    !props.currentMessage?.msg_type ||
    props.currentMessage?.msg_type === MsgTypeEnum.text;

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: isText ? Colors.primary : 'transparent',
          borderRadius: 8,
          padding: isText ? 4 : 0,
        },
        left: {
          backgroundColor: isText ? Colors.white : 'transparent',
          borderRadius: 8,
          padding: isText ? 4 : 0,
        },
      }}
    />
  );
};

export default CustomBubble;
