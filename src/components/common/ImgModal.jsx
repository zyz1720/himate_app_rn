import React from 'react';
import {Modal, ActivityIndicator} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import {fullWidth} from '@style/index';
import {useTranslation} from 'react-i18next';
import ImageViewer from 'react-native-image-zoom-viewer';

const ImgModal = props => {
  const {
    visible = false,
    onClose = () => {},
    onSave = () => {},
    allowSave = false,
    uri = '',
  } = props;
  const {t} = useTranslation();
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <ImageViewer
        imageUrls={[{url: uri}]}
        onClick={onClose}
        menuContext={{
          saveToLocal: allowSave
            ? t('imgModal.save_to_album')
            : t('imgModal.exit_preview'),
          cancel: t('common.cancel'),
        }}
        onSave={onSave}
        loadingRender={
          <View flex center>
            <ActivityIndicator color="white" size="large" />
            <Text center grey70 text90 marginT-8>
              {t('imgModal.img_loading')}
            </Text>
          </View>
        }
        renderFooter={() => (
          <View flex center row padding-16 width={fullWidth}>
            <Text center grey70 text90>
              {t('imgModal.click_exit_preview')}
              {allowSave ? t('imgModal.long_press_save') : ''}
            </Text>
          </View>
        )}
      />
    </Modal>
  );
};

export default ImgModal;
