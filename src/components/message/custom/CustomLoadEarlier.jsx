import React from 'react';
import {LoadEarlier} from 'react-native-gifted-chat';
import {Colors} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';

/* 自定义加载更多 */
const CustomLoadEarlier = props => {
  const {t} = useTranslation();
  return (
    <LoadEarlier
      {...props}
      label={t('common.load_more')}
      wrapperStyle={{
        backgroundColor: Colors.white,
      }}
      textStyle={{color: Colors.grey20}}
      activityIndicatorColor={Colors.primary}
    />
  );
};

export default CustomLoadEarlier;
