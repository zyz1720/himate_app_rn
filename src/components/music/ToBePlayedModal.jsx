import React, {useMemo, useCallback} from 'react';
import {StyleSheet, Modal, ImageBackground, FlatList} from 'react-native';
import {View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import {fullHeight, statusBarHeight} from '@style/index';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';

const styles = StyleSheet.create({
  playingStyle: {
    borderRadius: 12,
  },
  listBackImage: {
    width: '100%',
    height: fullHeight * 0.8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    elevation: 2,
  },
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ToBePlayedModal = React.memo(props => {
  const {
    visible = false,
    list = [],
    music = {},
    onClose = () => {},
    onClear = () => {},
    onPressItem = () => {},
    onPressRemove = () => {},
  } = props;
  const {t} = useTranslation();

  const {envConfig} = useConfigStore();
  const {userInfo} = useUserStore();

  // 记忆化背景图片URI
  const backgroundImageUri = useMemo(
    () => envConfig.STATIC_URL + userInfo?.user_bg_img,
    [userInfo?.user_bg_img],
  );

  // 记忆化当前播放的音乐信息
  const currentMusicInfo = useMemo(() => {
    if (!music?.id) {
      return null;
    }

    return (
      <View marginL-12>
        <Text white text70BO marginT-12>
          {t('music.now_playing')}
        </Text>
        <Text white text80BO marginB-12 flexG>
          {music.title}
        </Text>
      </View>
    );
  }, [music]);

  // 记忆化空列表组件
  const emptyListComponent = useMemo(
    () => (
      <View marginT-16 center>
        <Text text90L white>
          {t('empty.play_music')}
        </Text>
      </View>
    ),
    [],
  );

  // 记忆化列表底部组件
  const listFooterComponent = useMemo(() => <View marginB-140 />, []);

  // 记忆化渲染项
  const renderItem = useCallback(
    ({item}) => {
      const artistsText =
        item?.artists?.length > 0 ? item.artists.join('/') : '未知歌手';
      const albumText = item?.album ?? '未知专辑';
      const isCurrent = music?.id === item.id;

      return (
        <View row centerV>
          <View flexG marginB-6>
            <TouchableOpacity
              onPress={() => onPressItem(item)}
              flexS
              centerV
              style={styles.playingStyle}
              backgroundColor={isCurrent ? Colors.black4 : 'transparent'}
              padding-12>
              <View row spread centerV>
                <View width={'86%'}>
                  <Text text80BO white numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text text90L white marginT-4 numberOfLines={1}>
                    {`${artistsText} - ${albumText}`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.musicBut}
                  onPress={() => onPressRemove(item)}>
                  <AntDesign name="close" color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [music?.id, onPressItem, onPressRemove],
  );

  // 记忆化keyExtractor
  const keyExtractor = useCallback((item, index) => `${item.id}_${index}`, []);

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
          blurRadius={40}
          style={styles.listBackImage}
          source={{uri: backgroundImageUri}}
          resizeMode="cover">
          <View padding-12>
            <View row centerV spread>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" color={Colors.white} size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClear}>
                <Text white>清空列表</Text>
              </TouchableOpacity>
            </View>
            {currentMusicInfo}
            <FlatList
              data={list}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListEmptyComponent={emptyListComponent}
              ListFooterComponent={listFooterComponent}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={11}
              removeClippedSubviews={true}
            />
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
});

export default ToBePlayedModal;
