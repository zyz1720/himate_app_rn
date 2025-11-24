import React from 'react';
import {Modal, ActivityIndicator} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import {fullWidth} from '@style/index';
import {useTranslation} from 'react-i18next';
import {useToast} from '@utils/hooks/useToast';
import {downloadFile} from '@utils/system/file_utils';
import ImageViewer from 'react-native-image-zoom-viewer';

const ImgModal = props => {
  const {visible = false, onClose = () => {}, uris = []} = props;
  const {t} = useTranslation();
  const {showToast} = useToast();

  const onSave = async url => {
    showToast(t('component.image_saving'), 'success');
    const pathRes = await downloadFile(url, {isInCameraRoll: true});
    if (pathRes) {
      showToast(t('component.save_to') + pathRes, 'success');
    } else {
      showToast(t('component.save_failed'), 'error');
    }
  };

  const loadingRender = () => (
    <View flex center>
      <ActivityIndicator color="white" size="large" />
      <Text center grey70 text90 marginT-8>
        {t('component.img_loading')}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <ImageViewer
        imageUrls={uris.map(item => ({url: item}))}
        onClick={onClose}
        menuContext={{
          saveToLocal: t('component.save_to_album'),
          cancel: t('common.cancel'),
        }}
        onSave={onSave}
        loadingRender={loadingRender}
        renderFooter={() => (
          <View flex center row padding-16 width={fullWidth}>
            <Text center grey70 text90>
              {t('component.img_modal_tips')}
            </Text>
          </View>
        )}
      />
    </Modal>
  );
};

export default ImgModal;
