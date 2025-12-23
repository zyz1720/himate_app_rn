import React, {
  useCallback,
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';
import {StyleSheet} from 'react-native';
import {Image, View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {fullWidth} from '@style/index';
import {Marquee} from '@animatereactnative/marquee';
import {isEmptyObject} from '@utils/common/object_utils';
import {getRandomInt} from '@utils/common/number_utils';
import {useToast} from '@components/common/useToast';
import {getMusic, likeMusic, dislikeMusic} from '@api/music';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useMusicStore} from '@store/musicStore';
import {useSettingStore} from '@store/settingStore';
import {useTranslation} from 'react-i18next';
import {renderMusicTitle} from '@utils/system/lyric_utils';
import {useMusicControl} from '@utils/hooks/useMusicControl';
import {recordPlayHistory} from '@utils/realm/useMusicInfo';
import {useAppStateStore} from '@store/appStateStore';
import {isEmptyString} from '@/utils/common/string_utils';
import {useFloatingLyric} from '@utils/hooks/useFloatingLyric';
import {
  addPlayBackListener,
  startPlayer,
  pausePlayer,
  resumePlayer,
  stopPlayer,
  seekToPlayer,
  removePlayBackListener,
} from '@utils/system/audioPlayer';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedStyle,
  cancelAnimation,
} from 'react-native-reanimated';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BaseImageBackground from '@components/common/BaseImageBackground';
import LyricModal from './LyricModal';
import ToBePlayedModal from './ToBePlayedModal';

const styles = StyleSheet.create({
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ctrlBackImage: {
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 2,
  },

  CtrlContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  image: {
    width: 47,
    height: 47,
    borderRadius: 25,
  },
  marquee: {
    flex: 1,
    width: fullWidth * 0.56,
    overflow: 'hidden',
  },
});

export const MusicCtrlContext = createContext();
export const useMusicCtrl = () => useContext(MusicCtrlContext);

const MusicCtrlProvider = React.memo(props => {
  const {children} = props;
  const {showToast} = useToast();
  const {userInfo} = useUserStore();
  const {envConfig} = useConfigStore();
  const {
    nowLyric,
    nowTrans,
    nowRoma,
    showMusicCtrl,
    playList,
    playingMusic,
    closeTime,
    randomNum,
    isRandomPlay,
    setPlayingMusic,
    setIsClosed,
    addPlayList,
    setIsMusicResumePlay,
    isMusicResumePlay,
    playPosition,
    setPlayPosition,
    isMusicBreak,
    setIsMusicBreak,
    isMusicLoading,
    setIsMusicLoading,
    musicDuration,
    setMusicDuration,
    playingMusicIndex,
    setPlayingMusicIndex,
    playingMusicProgress,
    setPlayingMusicProgress,
    musicPlayMode,
    setMusicPlayMode,
    isMusicPlaying,
    setIsMusicPlaying,
    resetPlayingMusic,
  } = useMusicStore();
  const {statusBarLyricType, isShowDesktopLyric} = useSettingStore();
  const {isAppActive} = useAppStateStore();

  // 旋转动画共享值
  const rotation = useSharedValue(0);

  // 旋转动画样式
  const rotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const {t} = useTranslation();
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [seekToPosition, setSeekToPosition] = useState(0);

  const {
    setNowPlayingCtrl,
    resumePlayerCtrl,
    pausePlayerCtrl,
    seekToPlayerCtrl,
    stopPlayerCtrl,
    onPauseCtrl,
    onPlayCtrl,
    onNextTrackCtrl,
    onPreviousTrackCtrl,
    onSeekCtrl,
    setFlymeLyric,
  } = useMusicControl();

  const {
    showWidget,
    hideWidget,
    updateLyric,
    addOnClickListener,
    setLyricFontSize,
  } = useFloatingLyric();

  // 音乐播放器
  addPlayBackListener(playbackMeta => {
    const {currentPosition, duration, elapsedTime, progress, isFinished} =
      playbackMeta;

    setIsMusicPlaying(currentPosition !== playPosition);

    if (currentPosition === seekToPosition) {
      setIsMusicLoading(true);
    }

    if (currentPosition !== playPosition) {
      setPlayPosition(currentPosition);
    }

    if (duration !== musicDuration) {
      setMusicDuration(duration);
    }

    if (progress !== playingMusicProgress) {
      setPlayingMusicProgress(progress);
    }

    seekToPlayerCtrl(elapsedTime);
    if (isFinished) {
      autoPlayNext();
    }
  });

  // 自动播放下一首
  const autoPlayNext = useCallback(() => {
    resetPlayingMusic();

    if (isRandomPlay) {
      getRandMusic();
    } else if (playList.length > 0) {
      if (musicPlayMode === 'single') {
        setPlayingMusic(playList[playingMusicIndex]);
      } else if (musicPlayMode === 'order') {
        setPlayingMusic(
          playingMusicIndex === playList.length - 1
            ? playList[0]
            : playList[playingMusicIndex + 1],
        );
      } else if (musicPlayMode === 'random') {
        setPlayingMusic(playList[Math.floor(Math.random() * playList.length)]);
      }
    } else {
      setPlayingMusic({});
    }
  }, [isRandomPlay, playList, playingMusicIndex, musicPlayMode]);

  // 上一首
  const previousTrack = useCallback(() => {
    if (playingMusicIndex === 0 && playList.length > 0) {
      setPlayingMusic(playList[playList.length - 1]);
      showToast(t('music.already_first'), 'warning');
      return;
    }
    if (playList.length > 0) {
      setPlayingMusic(playList[playingMusicIndex - 1]);
    } else {
      showToast(t('music.no_music'), 'warning');
    }
  }, [playList, playingMusicIndex]);

  // 播放或暂停
  const playOrPauseTrack = useCallback(async () => {
    if (isMusicLoading) {
      showToast(t('music.loading'), 'warning', true);
    }
    if (isMusicPlaying) {
      await pausePlayer();
    } else {
      if (isEmptyObject(playingMusic)) {
        showToast(t('music.no_music'), 'warning');
        return;
      }
      await resumePlayer();
    }
  }, [playingMusic, isMusicLoading, isMusicPlaying]);

  // 播放或暂停
  const pauseTrack = useCallback(async () => {
    if (isEmptyObject(playingMusic)) {
      return;
    }
    if (isMusicPlaying || isMusicLoading) {
      pausePlayerCtrl();
      await pausePlayer();
    }
  }, [playingMusic, isMusicLoading, isMusicPlaying]);

  // 下一首
  const nextTrack = useCallback(() => {
    if (isRandomPlay) {
      getRandMusic();
      return;
    }
    if (playingMusicIndex === playList.length - 1) {
      setPlayingMusic(playList[0]);
      showToast(t('music.already_last'), 'warning');
      return;
    }
    if (playList.length > 0) {
      setPlayingMusic(playList[playingMusicIndex + 1]);
      return;
    } else {
      showToast(t('music.no_music'), 'warning');
      return;
    }
  }, [isRandomPlay, playList, playingMusicIndex]);

  // 调整播放进度
  const onSliderChange = useCallback(async position => {
    setSeekToPosition(parseInt(position, 10));
    await seekToPlayer(position);
  }, []);

  // 重置音乐播放所有状态
  const restMusicStatus = async () => {
    stopPlayerCtrl();
    resetPlayingMusic();
    await stopPlayer();
  };

  // 获取随机歌曲
  const getRandMusic = useCallback(async () => {
    const index = getRandomInt(randomNum.min, randomNum.max);
    try {
      const res = await getMusic({current: index, pageSize: 1});
      if (res.code === 0 && res.data.list.length > 0) {
        const music = res.data.list[0];
        setPlayingMusic(music);
        addPlayList([music]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [randomNum]);

  // 播放新音乐的方法
  const playNewMusic = async () => {
    try {
      if (!playingMusic?.file_key) {
        return;
      }
      await restMusicStatus();
      setIsMusicLoading(true);
      let url = '';
      if (typeof playingMusic?.id === 'number') {
        setCloudMusicId(playingMusic?.id);
        url = envConfig.STATIC_URL + playingMusic?.file_key;
      } else {
        url = playingMusic?.file_key;
      }

      await startPlayer(url);
      const index = playList.findIndex(item => item.id === playingMusic.id);
      setPlayingMusicIndex(index);
      setNowPlayingCtrl(playingMusic);
      recordPlayHistory(playingMusic);
      setIsMusicLoading(false);
    } catch (error) {
      console.error(error);
      showToast(t('music.unable_to_play'), 'error');
      restMusicStatus();
    }
  };

  // 加载音乐名
  const renderMarquee = useCallback(() => {
    const {id} = playingMusic;
    let musicText = renderMusicTitle(playingMusic);
    if (isMusicLoading) {
      musicText = t('music.loading');
    }
    const speed = musicText.length > 16 ? 0.4 : 0;
    const spacing = musicText.length > 16 ? fullWidth * 0.2 : fullWidth * 0.6;
    return (
      <View>
        <Marquee
          withGesture={false}
          key={id + String(isMusicLoading)}
          speed={speed}
          spacing={spacing}
          style={styles.marquee}>
          <Text white>{musicText}</Text>
        </Marquee>
      </View>
    );
  }, [isMusicLoading, playingMusic?.id]);

  // 编辑用户收藏的音乐
  const [isLike, setIsLike] = useState(false);
  const [cloudMusicId, setCloudMusicId] = useState(null);
  const editMyFavorite = async () => {
    try {
      if (!cloudMusicId) {
        showToast(t('music.unable_favorite'), 'warning');
        return;
      }
      if (isLike) {
        const res = await dislikeMusic({
          ids: [cloudMusicId],
        });
        if (res.code === 0) {
          showToast(t('music.unfavorite'), 'success');
          setIsLike(false);
          return;
        }
        showToast(res.message, 'error');
      } else {
        const res = await likeMusic({
          ids: [cloudMusicId],
        });
        if (res.code === 0) {
          showToast(t('music.already_favorite'), 'success');
          setIsLike(true);
          return;
        }
        showToast(res.message, 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [isExpand, setIsExpand] = useState(true);
  const ctrlWidth = useSharedValue(fullWidth - 32);
  const expandAnimatedStyle = useAnimatedStyle(() => ({
    width: ctrlWidth.value,
  }));

  const display = useSharedValue('none');
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const fadeDownAnimatedStyle = useAnimatedStyle(() => ({
    display: display.value,
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  const musicCoverSource = useMemo(() => {
    if (playingMusic?.musicExtra?.music_cover) {
      return {
        uri: envConfig.THUMBNAIL_URL + playingMusic.musicExtra.music_cover,
      };
    }
    return require('@assets/images/music_cover.jpg');
  }, [playingMusic?.musicExtra?.music_cover]);

  const rotateAnimate = () => {
    const currentRotation = rotation.value;
    rotation.value = withRepeat(
      withTiming(currentRotation + 360, {
        duration: 6000,
        easing: Easing.linear,
      }),
      -1,
    );
  };

  // 通知栏控件操作
  onPauseCtrl(playOrPauseTrack);
  onPlayCtrl(playOrPauseTrack);
  onNextTrackCtrl(nextTrack);
  onPreviousTrackCtrl(previousTrack);
  onSeekCtrl(onSliderChange);

  useEffect(() => {
    if (showMusicCtrl) {
      display.value = 'flex';
      opacity.value = withTiming(1);
      translateY.value = withTiming(0);
    } else {
      display.value = 'none';
      opacity.value = withTiming(0);
      translateY.value = withTiming(50);
    }
  }, [showMusicCtrl]);

  // 是否播放新的音乐
  useEffect(() => {
    if (playingMusic?.id) {
      playNewMusic();
    }
  }, [playingMusic?.id]);

  useEffect(() => {
    if (isMusicResumePlay) {
      setIsMusicResumePlay(false);
      setIsMusicBreak(false);
      playNewMusic().then(() => {
        if (playPosition) {
          onSliderChange(playPosition);
        }
      });
    }
  }, [isMusicResumePlay]);

  // 是否被其它组件中断播放
  useEffect(() => {
    if (isMusicBreak) {
      pauseTrack();
    }
  }, [isMusicBreak]);

  // 随机播放
  useEffect(() => {
    if (isRandomPlay) {
      getRandMusic();
    }
  }, [isRandomPlay]);

  // 监听音乐播放状态
  useEffect(() => {
    if (isEmptyObject(playingMusic)) {
      return;
    }
    if (isMusicPlaying) {
      setSeekToPosition(0);
      setIsMusicLoading(false);
      resumePlayerCtrl();
    } else {
      pausePlayerCtrl();
    }
  }, [isMusicPlaying]);

  // 是否要定时关闭音乐
  let playerTimer = null;
  useEffect(() => {
    if (closeTime) {
      playerTimer = setTimeout(() => {
        pausePlayer();
        pausePlayerCtrl();
        setIsClosed(true);
        clearTimeout(playerTimer);
      }, closeTime * 60000);
    } else {
      clearTimeout(playerTimer);
    }
  }, [closeTime]);

  useEffect(() => {
    if (!isEmptyString(nowLyric) && statusBarLyricType === 'lrc') {
      setFlymeLyric(nowLyric);
    }
    if (!isEmptyString(nowTrans) && statusBarLyricType === 'trans') {
      setFlymeLyric(nowTrans);
    }
    if (!isEmptyString(nowRoma) && statusBarLyricType === 'roma') {
      setFlymeLyric(nowRoma);
    }
    if (isShowDesktopLyric) {
      updateLyric(nowLyric, nowTrans);
    }
  }, [nowLyric, statusBarLyricType]);

  // 添加悬浮歌词点击事件监听
  useEffect(() => {
    const clickListener = addOnClickListener(() => {
      playOrPauseTrack();
    });
    return () => clickListener.remove();
  }, [playOrPauseTrack]);

  useEffect(() => {
    if (isAppActive) {
      hideWidget();
    } else {
      setLyricFontSize(32);
      showWidget();
    }
  }, [isAppActive]);

  // 监听音乐播放状态，控制旋转动画
  useEffect(() => {
    if (isMusicPlaying && playingMusic?.id && !isExpand) {
      rotateAnimate();
    } else {
      rotation.value = withTiming(0);
      cancelAnimation(rotation);
    }
  }, [isMusicPlaying, playingMusic?.id, isExpand]);

  useEffect(() => {
    return () => {
      removePlayBackListener();
      restMusicStatus();
    };
  }, []);

  return (
    <MusicCtrlContext.Provider value={{}}>
      {children}
      <View style={styles.CtrlContainer}>
        <Animated.View
          style={[
            expandAnimatedStyle,
            fadeDownAnimatedStyle,
            styles.ctrlBackImage,
          ]}>
          <BaseImageBackground
            blurRadius={40}
            source={{
              uri: envConfig.THUMBNAIL_URL + userInfo?.user_bg_img,
            }}
            resizeMode="cover">
            <GestureHandlerRootView>
              <View row centerV spread>
                <TouchableOpacity
                  row
                  centerV
                  onPress={() => {
                    setIsExpand(!isExpand);
                    ctrlWidth.value = withTiming(
                      ctrlWidth.value === 50 ? fullWidth - 32 : 50,
                    );
                  }}>
                  <View>
                    <AnimatedCircularProgress
                      key={playingMusic?.id}
                      size={50}
                      width={3}
                      fill={playingMusicProgress}
                      tintColor={Colors.red40}
                      rotation={0}
                      lineCap="square">
                      {() => (
                        <Animated.View style={rotateAnimatedStyle}>
                          <Image
                            source={musicCoverSource}
                            style={styles.image}
                          />
                        </Animated.View>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                </TouchableOpacity>
                <View row centerV>
                  <TouchableOpacity
                    centerV
                    onPress={() => {
                      setMusicModalVisible(true);
                    }}>
                    {renderMarquee()}
                  </TouchableOpacity>
                  <View row centerV>
                    <TouchableOpacity
                      style={styles.musicBut}
                      onPress={() => {
                        playOrPauseTrack();
                      }}>
                      {isMusicPlaying ? (
                        <AntDesign
                          name="pausecircleo"
                          color={Colors.white}
                          size={24}
                        />
                      ) : (
                        <AntDesign
                          name="playcircleo"
                          color={Colors.white}
                          size={24}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.musicBut}
                      marginL-6
                      marginR-12
                      onPress={() => setListModalVisible(true)}>
                      <AntDesign
                        name="menuunfold"
                        color={Colors.white}
                        size={22}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </GestureHandlerRootView>
          </BaseImageBackground>
        </Animated.View>
      </View>
      <LyricModal
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        isLike={isLike}
        onPressLike={editMyFavorite}
        onSliderChange={value => {
          onSliderChange(value);
        }}
        onModeChange={() => {
          let newPlayMode;
          if (musicPlayMode === 'order') {
            showToast(t('music.random_play'), 'success', true);
            newPlayMode = 'random';
          }
          if (musicPlayMode === 'random') {
            showToast(t('music.single_play'), 'success', true);
            newPlayMode = 'single';
          }
          if (musicPlayMode === 'single') {
            showToast(t('music.order_play'), 'success', true);
            newPlayMode = 'order';
          }
          setMusicPlayMode(newPlayMode);
        }}
        onBackWard={previousTrack}
        onPlay={playOrPauseTrack}
        onForWard={nextTrack}
        onPressMenu={() => setListModalVisible(true)}
      />
      <ToBePlayedModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
      />
    </MusicCtrlContext.Provider>
  );
});

export default MusicCtrlProvider;
