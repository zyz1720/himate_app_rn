import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {TouchableOpacity, Image} from 'react-native-ui-lib';
import {useConfigStore} from '@store/configStore';
import ImgModal from '@components/common/ImgModal';
import AnimatedScanner from '@components/common/AnimatedScanner';

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 100,
    borderRadius: 12,
    margin: 3,
  },
});

const ImageMsg = React.memo(props => {
  const {
    currentMessage = {},
    uploadIds = [],
    nowUploadId = null,
    uploadProgress = 0,
    onLongPress = () => {},
  } = props;

  const {envConfig} = useConfigStore();

  const [imgVisible, setImgVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setImgVisible(true)}
        onLongPress={() => {
          onLongPress({
            type: 'media',
            url: currentMessage.image.replace(
              envConfig.THUMBNAIL_URL,
              envConfig.STATIC_URL,
            ),
          });
        }}>
        <Image
          style={styles.image}
          source={{uri: currentMessage.image}}
          errorSource={require('@assets/images/image_empty.jpg')}
          resizeMode="cover"
        />
        {uploadIds.includes(currentMessage._id) ? (
          <AnimatedScanner
            progress={nowUploadId === currentMessage._id ? uploadProgress : 0}
            borderRadius={12}
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
    </>
  );
});

export default ImageMsg;
