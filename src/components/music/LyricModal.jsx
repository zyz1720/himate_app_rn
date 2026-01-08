import React, {useEffect, useMemo} from 'react';
import {StyleSheet, Modal} from 'react-native';
import {
  View,
  Text,
  Colors,
  Image,
  TouchableOpacity,
  Slider,
  Carousel,
} from 'react-native-ui-lib';
import {useScreenDimensions} from '@components/contexts/ScreenDimensionsContext';
import {isEmptyString} from '@utils/common/string_utils';
import {formatMilliSeconds} from '@utils/common/time_utils';
import Animated, {FadeInUp, FadeOutDown} from 'react-native-reanimated';
import {getColors} from 'react-native-image-colors';
import {getWhitenessScore} from '@utils/system/color_utils';
import {useKeepAwake} from 'expo-keep-awake';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useMusicCtrl, useMusicPlayback} from './MusicController';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BaseImageBackground from '@components/common/BaseImageBackground';
import LrcView from './LrcView';

const styles = StyleSheet.create({
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backImage: {
    backgroundColor: Colors.black,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    elevation: 2,
  },
  HbigImage: {
    borderRadius: 20,
    borderWidth: 0.4,
  },
  bigImage: {
    borderRadius: 20,
    borderWidth: 0.4,
  },
  trackStyle: {
    height: 3,
    maxWidth: '100%',
  },
  thumbStyle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});

const LyricModal = props => {
  const {
    visible = false,
    isLike = false,
    onPressLike = () => {},
    onClose = () => {},
    onSliderChange = () => {},
    onModeChange = () => {},
    onBackWard = () => {},
    onPlay = () => {},
    onForWard = () => {},
    onPressMenu = () => {},
  } = props;

  useKeepAwake();
  const {t} = useTranslation();
  const {fullWidth, fullHeight, isHorizontal, statusBarHeight} =
    useScreenDimensions();
  const {
    playingMusic,
    musicDuration,
    musicPlayMode,
    isMusicPlaying,
  } = useMusicCtrl();
  const {nowLyric, progressPosition} = useMusicPlayback();

  const {envConfig} = useConfigStore();
  const musicExtra = playingMusic?.musicExtra;

  // 艺术家字符串
  const artistsString = useMemo(
    () =>
      Array.isArray(playingMusic?.artists)
        ? playingMusic?.artists?.join(' / ')
        : t('music.empty_artist'),
    [playingMusic?.artists],
  );

  // 当前时间和总时长格式化
  const currentTimeFormatted = useMemo(
    () => formatMilliSeconds(progressPosition),
    [progressPosition],
  );

  const durationFormatted = useMemo(
    () => formatMilliSeconds(musicDuration),
    [musicDuration],
  );

  const bgImgSource = useMemo(
    () => ({uri: envConfig.THUMBNAIL_URL + musicExtra?.music_cover}),
    [musicExtra?.music_cover],
  );

  const musicCoverSource = useMemo(() => {
    if (musicExtra?.music_cover) {
      return {uri: envConfig.STATIC_URL + musicExtra.music_cover};
    }
    return require('@assets/images/music_cover.jpg');
  }, [musicExtra?.music_cover]);

  // 歌词动画组件
  const lyricAnimation = useMemo(() => {
    if (isEmptyString(nowLyric)) {
      return null;
    }
    return (
      <Animated.View entering={FadeInUp} exiting={FadeOutDown} key={nowLyric}>
        <Text
          numberOfLines={1}
          width={fullWidth * 0.8}
          color={Colors.lyricColor}>
          {nowLyric}
        </Text>
      </Animated.View>
    );
  }, [nowLyric]);

  // 颜色计算 - 只在相关依赖变化时执行
  useEffect(() => {
    if (musicExtra?.music_cover) {
      getColors(
        (envConfig.THUMBNAIL_URL + musicExtra.music_cover).replace(/\\/g, '/'),
        {
          fallback: Colors.black,
          cache: true, // 启用缓存
        },
      )
        .then(res => {
          const platform = res.platform;
          const colorValue =
            platform === 'android' ? res.average : res.background;
          const num = getWhitenessScore(colorValue);
          Colors.loadColors({
            lyricColor: num > 76 ? Colors.grey10 : Colors.white,
          });
        })
        .catch(error => {
          console.error('error', error);
        });
    }
  }, [musicExtra?.music_cover]);

  return (
    <Modal
      animationType="slide"
      hardwareAccelerated={true}
      transparent={true}
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}>
      <View
        height={fullHeight + statusBarHeight}
        backgroundColor={Colors.black4}>
        <BaseImageBackground
          blurRadius={50}
          style={[styles.backImage, {height: fullHeight + statusBarHeight}]}
          source={bgImgSource}
          resizeMode="cover">
          <TouchableOpacity paddingT-48 paddingL-22 onPress={onClose}>
            <Ionicons name="chevron-down" color={Colors.lyricColor} size={24} />
          </TouchableOpacity>
          {isHorizontal ? (
            <View flexS row spread>
              {/* 第一页：音乐信息 */}
              <View width={'50%'} paddingH-50>
                <View flexS center marginT-8>
                  <Image
                    source={musicCoverSource}
                    style={[
                      styles.HbigImage,
                      {
                        borderColor: Colors.lyricColor,
                        width: (fullWidth / 2) * 0.6,
                        height: (fullWidth / 2) * 0.6,
                      },
                    ]}
                  />
                </View>
                <View flexS centerH>
                  <View width={(fullWidth / 2) * 0.6}>
                    <View row centerV spread marginT-24>
                      <View flexS>
                        <Text text60BO color={Colors.lyricColor}>
                          {playingMusic?.title || t('empty.play_music')}
                        </Text>
                        <Text marginT-6 color={Colors.lyricColor} text90L>
                          {artistsString}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.musicBut}
                        onPress={onPressLike}>
                        <AntDesign
                          name={isLike ? 'heart' : 'hearto'}
                          color={Colors.lyricColor}
                          size={18}
                        />
                      </TouchableOpacity>
                    </View>
                    <View marginT-8>
                      <Slider
                        value={progressPosition}
                        minimumValue={0}
                        disabled={!musicDuration}
                        maximumValue={musicDuration || 100}
                        maximumTrackTintColor={Colors.lyricColor}
                        thumbTintColor={Colors.primary}
                        thumbStyle={styles.thumbStyle}
                        trackStyle={styles.trackStyle}
                        disableActiveStyling={true}
                        minimumTrackTintColor={Colors.primary}
                        onValueChange={onSliderChange}
                      />
                      <View row centerV spread>
                        <Text text90L color={Colors.lyricColor}>
                          {currentTimeFormatted}
                        </Text>
                        <Text text90L color={Colors.lyricColor}>
                          {durationFormatted}
                        </Text>
                      </View>
                    </View>

                    <View row centerV spread marginT-16>
                      <TouchableOpacity
                        style={styles.musicBut}
                        onPress={onModeChange}>
                        {musicPlayMode === 'order' ? (
                          <Ionicons
                            name="repeat"
                            color={Colors.lyricColor}
                            size={30}
                          />
                        ) : musicPlayMode === 'random' ? (
                          <Ionicons
                            name="shuffle"
                            color={Colors.lyricColor}
                            size={30}
                          />
                        ) : musicPlayMode === 'single' ? (
                          <Ionicons
                            name="reload"
                            color={Colors.lyricColor}
                            size={24}
                          />
                        ) : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.musicBut}
                        onPress={onBackWard}>
                        <Ionicons
                          name="play-skip-back-sharp"
                          color={Colors.lyricColor}
                          size={24}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onPlay}>
                        <Ionicons
                          name={
                            isMusicPlaying
                              ? 'pause-circle-outline'
                              : 'play-circle-outline'
                          }
                          color={Colors.lyricColor}
                          size={64}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.musicBut}
                        onPress={onForWard}>
                        <Ionicons
                          name="play-skip-forward-sharp"
                          color={Colors.lyricColor}
                          size={24}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.musicBut}
                        onPress={onPressMenu}>
                        <AntDesign
                          name="menu-fold"
                          color={Colors.lyricColor}
                          size={20}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
              {/* 第二页：歌词视图 */}
              <View width={'50%'} paddingH-20 centerV>
                <LrcView isHorizontal={true} />
              </View>
            </View>
          ) : (
            <Carousel
              pageControlPosition={Carousel.pageControlPositions.UNDER}
              pageControlProps={{
                color: Colors.lyricColor,
                inactiveColor: Colors.white4,
              }}
              pageWidth={fullWidth}
              itemSpacings={0}
              containerMarginHorizontal={0}
              initialPage={0}>
              {/* 第一页：音乐信息 */}
              <View>
                <View flexS center marginT-40>
                  <Image
                    source={musicCoverSource}
                    style={[
                      styles.bigImage,
                      {
                        borderColor: Colors.lyricColor,
                        width: fullWidth * 0.86,
                        height: fullWidth * 0.86,
                      },
                    ]}
                  />
                </View>
                <View padding-26>
                  <View row centerV spread marginT-12>
                    <View flexS>
                      <Text text60BO color={Colors.lyricColor}>
                        {playingMusic?.title || t('empty.play_music')}
                      </Text>
                      <Text marginT-6 color={Colors.lyricColor} text70>
                        {artistsString}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.musicBut}
                      onPress={onPressLike}>
                      <AntDesign
                        name={isLike ? 'heart' : 'hearto'}
                        color={Colors.lyricColor}
                        size={22}
                      />
                    </TouchableOpacity>
                  </View>
                  {lyricAnimation}
                  {playingMusic?.sample_rate ? (
                    <View marginT-12 row centerV spread>
                      <Text color={Colors.lyricColor} text100L>
                        {t('music.sample_rate', {
                          rate: playingMusic.sample_rate,
                        })}
                      </Text>
                      <Text color={Colors.lyricColor} text100L>
                        {t('music.bitrate', {rate: playingMusic.bitrate})}
                      </Text>
                    </View>
                  ) : null}
                  <View marginT-16>
                    <Slider
                      value={progressPosition}
                      minimumValue={0}
                      disabled={!musicDuration}
                      maximumValue={musicDuration || 100}
                      maximumTrackTintColor={Colors.lyricColor}
                      thumbTintColor={Colors.primary}
                      thumbStyle={styles.thumbStyle}
                      trackStyle={styles.trackStyle}
                      disableActiveStyling={true}
                      minimumTrackTintColor={Colors.primary}
                      onValueChange={onSliderChange}
                    />
                    <View row centerV spread>
                      <Text text90L color={Colors.lyricColor}>
                        {currentTimeFormatted}
                      </Text>
                      <Text text90L color={Colors.lyricColor}>
                        {durationFormatted}
                      </Text>
                    </View>
                  </View>

                  <View row centerV spread marginT-8>
                    <TouchableOpacity
                      style={styles.musicBut}
                      onPress={onModeChange}>
                      {musicPlayMode === 'order' ? (
                        <Ionicons
                          name="repeat"
                          color={Colors.lyricColor}
                          size={30}
                        />
                      ) : musicPlayMode === 'random' ? (
                        <Ionicons
                          name="shuffle"
                          color={Colors.lyricColor}
                          size={30}
                        />
                      ) : musicPlayMode === 'single' ? (
                        <Ionicons
                          name="reload"
                          color={Colors.lyricColor}
                          size={24}
                        />
                      ) : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.musicBut}
                      onPress={onBackWard}>
                      <Ionicons
                        name="play-skip-back-sharp"
                        color={Colors.lyricColor}
                        size={24}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onPlay}>
                      <Ionicons
                        name={
                          isMusicPlaying
                            ? 'pause-circle-outline'
                            : 'play-circle-outline'
                        }
                        color={Colors.lyricColor}
                        size={64}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.musicBut}
                      onPress={onForWard}>
                      <Ionicons
                        name="play-skip-forward-sharp"
                        color={Colors.lyricColor}
                        size={24}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.musicBut}
                      onPress={onPressMenu}>
                      <AntDesign
                        name="menu-fold"
                        color={Colors.lyricColor}
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 第二页：歌词视图 */}
              <LrcView />
            </Carousel>
          )}
        </BaseImageBackground>
      </View>
    </Modal>
  );
};

export default LyricModal;
