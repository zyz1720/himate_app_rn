import React from 'react';
import {StyleSheet, ScrollView, Modal} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Image,
  Colors,
  TouchableOpacity,
} from 'react-native-ui-lib';
import {useScreenDimensions} from '@components/contexts/ScreenDimensionsContext';
import {useConfigStore} from '@store/configStore';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BaseImageBackground from '@components/common/BaseImageBackground';

const styles = StyleSheet.create({
  listBackImage: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
});

const FavoriteModal = React.memo(props => {
  const {
    visible = false,
    onClose = () => {},
    backgroundImg,
    title = '',
    remarks = '',
    userAvatar = '',
    userName = '',
  } = props;
  const {fullHeight, statusBarHeight} = useScreenDimensions();

  const {envConfig} = useConfigStore();

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated={true}
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View
        height={fullHeight + statusBarHeight}
        backgroundColor={Colors.black4}>
        <BaseImageBackground
          blurRadius={50}
          style={[styles.listBackImage, {height: fullHeight + statusBarHeight}]}
          source={{uri: envConfig.THUMBNAIL_URL + backgroundImg}}
          resizeMode="cover">
          <TouchableOpacity paddingT-48 paddingL-22 onPress={onClose}>
            <AntDesign name="close" color={Colors.white} size={24} />
          </TouchableOpacity>
          <ScrollView>
            <View marginB-46>
              <View flexS center marginT-20>
                <Image
                  source={{uri: envConfig.STATIC_URL + backgroundImg}}
                  errorSource={require('@assets/images/favorites_cover.jpg')}
                  style={styles.image}
                />
              </View>
              <View row center marginT-20>
                <Avatar
                  size={26}
                  source={{
                    uri: envConfig.STATIC_URL + userAvatar,
                  }}
                  imageProps={{
                    errorSource: require('@assets/images/empty.jpg'),
                  }}
                  backgroundColor={Colors.transparent}
                />
                <Text text70 marginL-6 white>
                  {userName}
                </Text>
              </View>
              <View center marginT-20 paddingH-20>
                <Text text60 marginL-6 white>
                  {title}
                </Text>
              </View>
              <View marginT-20 paddingH-20>
                <Text text80 marginL-6 white>
                  {remarks}
                </Text>
              </View>
            </View>
          </ScrollView>
        </BaseImageBackground>
      </View>
    </Modal>
  );
});

export default FavoriteModal;
