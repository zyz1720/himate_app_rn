import {LoaderScreen, Colors} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import React from 'react';

const FullScreenLoading = ({message}) => {
  const {t} = useTranslation();
  return (
    <LoaderScreen
      message={message || t('common.loading')}
      color={Colors.primary}
      backgroundColor={Colors.white4}
      overlay={true}
      messageStyle={{color: Colors.primary}}
    />
  );
};

export default FullScreenLoading;
