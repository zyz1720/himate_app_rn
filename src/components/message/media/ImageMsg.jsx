import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Colors,
  TouchableOpacity,
  AnimatedScanner,
  Image,
} from 'react-native-ui-lib';

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
    message = {},
    onPress = () => {},
    onLongPress = () => {},
    uploadingIds = [],
    nowSendId = null,
    uploadProgress = 0,
  } = props;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Image style={styles.image} source={{uri: message.image}} />
      {uploadingIds.includes(message._id) ? (
        <AnimatedScanner
          progress={nowSendId === message._id ? uploadProgress : 0}
          duration={1200}
          backgroundColor={Colors.black}
          opacity={0.5}
        />
      ) : null}
    </TouchableOpacity>
  );
});

export default ImageMsg;
