import React, {useEffect} from 'react';
import {Colors} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import {useToast} from '@utils/hooks/useToast';
import {usePermissionStore} from '@/stores/permissionStore';
import {getFileFromImageCropPicker} from '@utils/system/file_utils';
import BaseSheet from '@components/common/BaseSheet';
import ImagePicker from 'react-native-image-crop-picker';

const AvatarPicker = props => {
  const {visible, setVisible, onSelected, onError, isCleanCache} = props;
  const {showToast} = useToast();
  const {t} = useTranslation();
  const {accessCamera, accessFolder, setAccessCamera, setAccessFolder} =
    usePermissionStore();

  useEffect(() => {
    if (isCleanCache) {
      ImagePicker.clean()
        .then(() => {
          console.log('清除缓存的头像tmp');
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [isCleanCache]);

  return (
    <BaseSheet
      title={t('group.choose_avatar')}
      visible={visible}
      setVisible={setVisible}
      actions={[
        {
          label: t('permissions.camera'),
          color: Colors.primary,
          onPress: () => {
            if (!accessCamera) {
              showToast(t('permissions.camera_please'), 'warning');
              setAccessCamera();
              return;
            }
            ImagePicker.openCamera({
              width: 300,
              height: 300,
              cropping: true,
              mediaType: 'photo',
              cropperCircleOverlay: true,
              cropperActiveWidgetColor: Colors.primary,
            })
              .then(image => {
                const fileInfo = getFileFromImageCropPicker(image);
                onSelected(fileInfo);
              })
              .catch(error => {
                onError(error);
              })
              .finally(() => {
                setVisible(false);
              });
          },
        },
        {
          label: t('permissions.photo'),
          color: Colors.primary,
          onPress: () => {
            if (!accessFolder) {
              showToast(t('permissions.folder_please'), 'warning');
              setAccessFolder();
              return;
            }
            ImagePicker.openPicker({
              width: 300,
              height: 300,
              cropping: true,
              mediaType: 'photo',
              cropperCircleOverlay: true,
              cropperActiveWidgetColor: Colors.primary,
            })
              .then(image => {
                const fileInfo = getFileFromImageCropPicker(image);
                onSelected(fileInfo);
              })
              .catch(error => {
                onError(error);
              })
              .finally(() => {
                setVisible(false);
              });
          },
        },
      ]}
    />
  );
};
export default AvatarPicker;
