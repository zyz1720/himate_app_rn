import React, {useEffect} from 'react';
import {Colors} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import {useToast} from '@utils/hooks/useToast';
import {usePermissionStore} from '@store/permissionStore';
import {getFileFromImageCropPicker} from '@utils/system/file_utils';
import BaseSheet from '@components/common/BaseSheet';
import ImagePicker from 'react-native-image-crop-picker';

const ImgPicker = props => {
  const {
    visible,
    setVisible,
    onSelected,
    onError = () => {},
    isCleanCache,
    isAvatar = false,
  } = props;
  const {showToast} = useToast();
  const {t} = useTranslation();
  const {accessCamera, accessFolder, setAccessCamera, setAccessFolder} =
    usePermissionStore();

  const avatarProps = isAvatar
    ? {
        width: 300,
        height: 300,
        cropperCircleOverlay: true,
      }
    : {};

  useEffect(() => {
    if (isCleanCache) {
      ImagePicker.clean()
        .then(() => {
          console.log('清除缓存的图片tmp');
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [isCleanCache]);

  return (
    <BaseSheet
      title={t('component.choose_img')}
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
              ...avatarProps,
              cropping: true,
              cropperActiveWidgetColor: Colors.primary,
              mediaType: 'photo',
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
              ...avatarProps,
              cropping: true,
              cropperActiveWidgetColor: Colors.primary,
              mediaType: 'photo',
            })
              .then(image => {
                console.log(image);
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
export default ImgPicker;
