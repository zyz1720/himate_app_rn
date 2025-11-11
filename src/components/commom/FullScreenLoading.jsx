import {LoaderScreen, Colors} from 'react-native-ui-lib';
import React from 'react';

const FullScreenLoading = ({Message}) => {
  return (
    <LoaderScreen
      message={Message || '加载中...'}
      color={Colors.Primary}
      backgroundColor={Colors.loadingWhite}
      overlay={true}
      messageStyle={{color: Colors.Primary}}
    />
  );
};

export default FullScreenLoading;
