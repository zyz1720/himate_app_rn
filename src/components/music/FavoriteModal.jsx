import React from 'react';
import {StyleSheet, ScrollView, Modal, ImageBackground} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Image,
  Colors,
  TouchableOpacity,
} from 'react-native-ui-lib';
import {fullHeight, statusBarHeight} from '@style/index';
import AntDesign from 'react-native-vector-icons/AntDesign';

const styles = StyleSheet.create({
  listBackImage: {
    width: '100%',
    height: fullHeight + statusBarHeight,
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
    borderRadius: 8,
  },
});

const FavoriteModal = React.memo(props => {
  const {
    visible = false,
    onClose = () => {},
    backgroundImg = '',
    title = '',
    remarks = '',
    userAvatar = '',
    userName = '',
  } = props;

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
        <ImageBackground
          blurRadius={50}
          style={styles.listBackImage}
          source={{uri: backgroundImg}}
          resizeMode="cover">
          <TouchableOpacity paddingT-48 paddingL-22 onPress={onClose}>
            <AntDesign name="close" color={Colors.white} size={24} />
          </TouchableOpacity>
          <ScrollView>
            <View flexS center marginT-20>
              <Image source={{uri: backgroundImg}} style={styles.image} />
            </View>
            <View row center marginT-20>
              <Avatar
                size={26}
                source={{
                  uri: userAvatar,
                }}
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
          </ScrollView>
        </ImageBackground>
      </View>
    </Modal>
  );
});

export default FavoriteModal;
