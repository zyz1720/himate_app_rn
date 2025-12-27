import React from 'react';
import {StyleSheet} from 'react-native';
import {Colors} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import {useToast} from '@components/common/useToast';
import Pdf from 'react-native-pdf';

const BasePdfView = ({route}) => {
  const {t} = useTranslation();
  const {url} = route.params || {};
  const {showToast} = useToast();

  return (
    <Pdf
      style={styles.pdfView}
      source={{uri: url, cache: true}}
      trustAllCerts={false}
      onError={error => {
        showToast('pdf' + t('common.load_error'), 'error');
        console.error(error);
      }}
    />
  );
};
const styles = StyleSheet.create({
  pdfView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  },
});

export default BasePdfView;
