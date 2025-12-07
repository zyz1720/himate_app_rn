import React, {useState} from 'react';
import {StyleSheet, Vibration} from 'react-native';
import {
  Colors,
  TouchableOpacity,
  AnimatedScanner,
  Image,
} from 'react-native-ui-lib';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useToast} from '@components/common/useToast';
import {downloadFile} from '@utils/system/file_utils';
import ImgModal from '@components/common/ImgModal';
import BaseSheet from '@components/common/BaseSheet';
import Clipboard from '@react-native-clipboard/clipboard';

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 100,
    borderRadius: 12,
    margin: 3,
    resizeMode: 'cover',
  },
});

const ImageMsg = React.memo(props => {
  const {
    currentMessage = {},
    uploadIds = [],
    nowUploadId = null,
    uploadProgress = 0,
  } = props;
  const {t} = useTranslation();
  const {showToast} = useToast();

  const {envConfig} = useConfigStore();

  const [imgVisible, setImgVisible] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const onSave = async url => {
    showToast(t('component.image_saving'), 'success');
    const pathRes = await downloadFile(url, {isInCameraRoll: true});
    if (pathRes) {
      showToast(t('component.save_to') + pathRes, 'success');
    } else {
      showToast(t('component.save_failed'), 'error');
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setImgVisible(true)}
        onLongPress={() => {
          Vibration.vibrate(50);
          setShowActionSheet(true);
        }}>
        <Image style={styles.image} source={{uri: currentMessage.image}} />
        {uploadIds.includes(currentMessage._id) ? (
          <AnimatedScanner
            progress={nowUploadId === currentMessage._id ? uploadProgress : 0}
            duration={1200}
            backgroundColor={Colors.black}
            opacity={0.5}
          />
        ) : null}
      </TouchableOpacity>
      {/* 图片预览弹窗 */}
      <ImgModal
        uris={[
          currentMessage.image.replace(
            envConfig.THUMBNAIL_URL,
            envConfig.STATIC_URL,
          ),
        ]}
        visible={imgVisible}
        onClose={() => {
          setImgVisible(false);
        }}
      />
      {/* 保存文件弹窗 */}
      <BaseSheet
        title={t('component.save_file')}
        visible={showActionSheet}
        setVisible={setShowActionSheet}
        actions={[
          {
            label: t('component.save_to_album'),
            color: Colors.primary,
            onPress: () =>
              onSave(
                currentMessage.image.replace(
                  envConfig.THUMBNAIL_URL,
                  envConfig.STATIC_URL,
                ),
              ),
          },
          {
            label: t('common.copy_link'),
            color: Colors.success,
            onPress: () => {
              Clipboard.setString(
                currentMessage.image.replace(
                  envConfig.THUMBNAIL_URL,
                  envConfig.STATIC_URL,
                ),
              );
              setShowActionSheet(false);
              showToast(t('common.copy_link_success'), 'success');
            },
          },
        ]}
      />
    </>
  );
});

export default ImageMsg;
