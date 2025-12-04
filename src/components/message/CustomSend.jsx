import React from 'react';
import {StyleSheet} from 'react-native';
import {Send} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import {fullHeight} from '@style/index';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    margin: 8,
    height: 30,
  },
  textStyle: {
    color: Colors.white,
    fontSize: 14,
    position: 'relative',
    top: fullHeight * 0.006,
  },
});

/* 自定义加载更多 */
export const CustomSend = props => {
  const {t} = useTranslation();
  return (
    <Send
      {...props}
      containerStyle={styles.containerStyle}
      label={t('chat.send')}
      textStyle={styles.textStyle}
    />
  );
};
