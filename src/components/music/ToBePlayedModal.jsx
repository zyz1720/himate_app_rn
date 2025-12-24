import React, {useMemo, useCallback} from 'react';
import {StyleSheet, Modal, FlatList} from 'react-native';
import {View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import {fullHeight, statusBarHeight} from '@style/index';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useMusicStore} from '@store/musicStore';
import {useTranslation} from 'react-i18next';
import {renderArtists} from '@utils/system/lyric_utils';
import BaseImageBackground from '@components/common/BaseImageBackground';
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

const ToBePlayedModal = props => {
  const {visible = false, onClose = () => {}} = props;
  const {t} = useTranslation();
  const {playingMusic, playList, setPlayingMusic, setPlayList, removePlayList} =
    useMusicStore();
  const {envConfig} = useConfigStore();
  const {userInfo} = useUserStore();

  // 记忆化当前播放的音乐信息
  const currentMusicInfo = useMemo(() => {
    if (!playingMusic?.id) {
      return null;
    }

    return (
      <View marginL-12>
        <Text white text70BO marginT-12>
          {t('music.now_playing')}
        </Text>
        <Text white text80BO marginB-12 flexG>
          {playingMusic.title}
        </Text>
      </View>
    );
  }, [playingMusic]);

  // 记忆化渲染项
  const renderItem = useCallback(
    ({item}) => {
      const artistsText = renderArtists(item);
      const isCurrent = playingMusic?.id === item.id;

      return (
        <View row centerV>
          <View flexG marginB-6>
            <TouchableOpacity
              onPress={() => setPlayingMusic(item)}
              flexS
              centerV
              style={styles.playingStyle}
              backgroundColor={isCurrent ? Colors.black2 : 'transparent'}
              padding-12>
              <View row spread centerV>
                <View width={'86%'}>
                  <Text text80BO white numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text text90L white marginT-4 numberOfLines={1}>
                    {artistsText}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.musicBut}
                  onPress={() => removePlayList([item])}>
                  <AntDesign name="close" color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [playingMusic?.id, setPlayingMusic, removePlayList],
  );

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
          blurRadius={40}
          style={styles.listBackImage}
          source={{uri: envConfig.THUMBNAIL_URL + userInfo?.user_bg_img}}
          resizeMode="cover">
          <View padding-12>
            <View row centerV spread>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" color={Colors.white} size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPlayList([])}>
                <Text white>{t('music.clear_list')}</Text>
              </TouchableOpacity>
            </View>
            {currentMusicInfo}
            <FlatList
              data={playList}
              keyExtractor={(item, index) => `${item.id}_${index}`}
              renderItem={renderItem}
              ListEmptyComponent={
                <View marginT-16 center>
                  <Text text90L white>
                    {t('empty.play_music')}
                  </Text>
                </View>
              }
              ListFooterComponent={<View marginB-140 />}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={11}
              removeClippedSubviews={true}
            />
          </View>
        </BaseImageBackground>
      </View>
    </Modal>
  );
};

export default ToBePlayedModal;
