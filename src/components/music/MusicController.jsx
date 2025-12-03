import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react';
import {StyleSheet, ImageBackground} from 'react-native';
import {Image, View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {fullWidth} from '@style/index';
import {Marquee} from '@animatereactnative/marquee';
import {isEmptyObject} from '@utils/common/object_utils';
import {getRandomInt} from '@utils/common/number_utils';
import {useToast} from '@utils/hooks/useToast';
import {getMusic, likeMusic, dislikeMusic} from '@api/music';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useMusicStore} from '@store/musicStore';
import {useTranslation} from 'react-i18next';
import {renderMusicTitle} from '@utils/system/lyric_utils';
import {useMusicControl} from '@utils/hooks/useMusicControl';
import {useAudioPlayer} from '@utils/hooks/useAudioPlayer';
import {recordPlayHistory} from '@utils/realm/useMusicInfo';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
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
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: Colors.white,
    borderWidth: 1,
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
    showMusicCtrl,
    alwaysShowMusicCtrl,
    playList,
    playingMusic,
    closeTime,
    randomNum,
    isRandomPlay,
    setPlayingMusic,
    setIsClosed,
    addPlayList,
    setPlayList,
    removePlayList,
  } = useMusicStore();

  const {t} = useTranslation();

  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false); // 音频是否正在播放
  const [curPosition, setCurPosition] = useState(0); // 当前播放进度
  const [audioDuration, setAudioDuration] = useState(0); // 音频总时长
  const [playingIndex, setPlayingIndex] = useState(0); // 当前播放音乐的索引
  const [playProgress, setPlayProgress] = useState(0); // 进度条数值
  const [playType, setPlayType] = useState('order'); // 列表播放类型 single order random
  const lastPlayedId = useRef(null); // 记录上一次播放的音乐Id

  const [isLoading, setIsLoading] = useState(false);

  const {
    addPlayBackListener,
    startPlayer,
    pausePlayer,
    resumePlayer,
    stopPlayer,
    seekToPlayer,
    removePlayBackListener,
  } = useAudioPlayer();
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
  } = useMusicControl();

  // 音乐播放器
  addPlayBackListener(playbackMeta => {
    const {currentPosition, duration, elapsedTime, progress, isFinished} =
      playbackMeta;

    setAudioIsPlaying(
      currentPosition !== curPosition && currentPosition !== seekToPosition,
    );
    setCurPosition(currentPosition);
    if (duration !== audioDuration) {
      setAudioDuration(duration);
    }
    if (progress) {
      setPlayProgress(progress);
    }

    seekToPlayerCtrl(elapsedTime);

    if (isFinished) {
      autoPlayNext();
    }
  });

  // 自动播放下一首
  const autoPlayNext = useCallback(() => {
    restMusicStatus().then(() => {
      if (isRandomPlay) {
        getRandMusic();
      } else if (playList.length > 0) {
        if (playType === 'single') {
          setPlayingMusic(playList[playingIndex]);
        } else if (playType === 'order') {
          setPlayingMusic(
            playingIndex === playList.length - 1
              ? playList[0]
              : playList[playingIndex + 1],
          );
        } else if (playType === 'random') {
          setPlayingMusic(
            playList[Math.floor(Math.random() * playList.length)],
          );
        }
      } else {
        setPlayingMusic({});
      }
    });
  }, [isRandomPlay, playList, playingIndex, playType]);

  // 上一首
  const previousTrack = useCallback(() => {
    if (playingIndex === 0 && playList.length > 0) {
      setPlayingMusic(playList[playList.length - 1]);
      showToast(t('music.already_first'), 'warning');
      return;
    }
    if (playList.length > 0) {
      setPlayingMusic(playList[playingIndex - 1]);
    } else {
      showToast(t('music.no_music'), 'warning');
    }
  }, [playList, playingIndex]);

  // 播放或暂停
  const playOrPauseTrack = useCallback(() => {
    if (isLoading) {
      showToast(t('music.loading'), 'warning', true);
    }
    if (audioIsPlaying) {
      pausePlayer();
    } else {
      if (isEmptyObject(playingMusic)) {
        showToast(t('music.no_music'), 'warning');
        return;
      }
      resumePlayer();
    }
  }, [audioIsPlaying, playingMusic, isLoading]);

  // 下一首
  const nextTrack = useCallback(() => {
    if (isRandomPlay) {
      getRandMusic();
      return;
    }
    if (playingIndex === playList.length - 1) {
      setPlayingMusic(playList[0]);
      showToast(t('music.already_last'), 'warning');
      return;
    }
    if (playList.length > 0) {
      setPlayingMusic(playList[playingIndex + 1]);
      return;
    } else {
      showToast(t('music.no_music'), 'warning');
      return;
    }
  }, [isRandomPlay, playList, playingIndex]);

  // 调整播放进度
  const [seekToPosition, setSeekToPosition] = useState(0);
  const onSliderChange = useCallback(async position => {
    setSeekToPosition(parseInt(position, 10));
    setAudioIsPlaying(false);
    setIsLoading(true);
    await seekToPlayer(position);
  }, []);

  // 通知栏控件操作
  onPauseCtrl(() => {
    playOrPauseTrack();
  });
  onPlayCtrl(() => {
    playOrPauseTrack();
  });
  onNextTrackCtrl(() => {
    nextTrack();
  });
  onPreviousTrackCtrl(() => {
    previousTrack();
  });
  onSeekCtrl(position => {
    onSliderChange(position);
  });

  // 监听音乐播放状态
  useEffect(() => {
    if (isEmptyObject(playingMusic)) {
      return;
    }
    if (audioIsPlaying) {
      setIsLoading(false);
      setSeekToPosition(0);
      resumePlayerCtrl();
    } else {
      pausePlayerCtrl();
    }
  }, [audioIsPlaying]);

  // 重置音乐播放所有状态
  const restMusicStatus = async () => {
    stopPlayerCtrl();
    setCurPosition(0);
    setAudioDuration(0);
    setPlayProgress(0);
    setSeekToPosition(0);
    setIsLoading(false);
    setAudioIsPlaying(false);
    await stopPlayer();
  };

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

  // 随机播放
  useEffect(() => {
    if (isRandomPlay) {
      getRandMusic();
    }
  }, [isRandomPlay]);

  // 播放新音乐的方法
  const playNewMusic = async () => {
    try {
      if (!playingMusic?.file_key) {
        return;
      }
      await restMusicStatus();
      setIsLoading(true);

      let url = '';
      if (typeof playingMusic?.id === 'number') {
        setCloudMusicId(playingMusic?.id);
        url = envConfig.STATIC_URL + playingMusic?.file_key;
      } else {
        url = playingMusic?.file_key;
      }

      await startPlayer(url, 'music');
      const index = playList.findIndex(item => item.id === playingMusic.id);
      lastPlayedId.current = playingMusic.id;
      setPlayingIndex(index);
      setNowPlayingCtrl(playingMusic);
      recordPlayHistory(playingMusic);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showToast(t('music.unable_to_play'), 'error');
      restMusicStatus();
      setIsLoading(false);
    }
  };

  // 是否播放新的音乐
  useEffect(() => {
    if (
      lastPlayedId.current !== playingMusic?.id ||
      playType === 'single' ||
      !audioIsPlaying
    ) {
      playNewMusic();
    }
  }, [playingMusic?.id]);

  // 加载音乐名
  const renderMarquee = useCallback(() => {
    const {id} = playingMusic;
    let musicText = renderMusicTitle(playingMusic);
    if (isLoading) {
      musicText = t('music.loading');
    }
    const speed = musicText.length > 16 ? 0.4 : 0;
    const spacing = musicText.length > 16 ? fullWidth * 0.2 : fullWidth * 0.6;
    return (
      <View>
        <Marquee
          withGesture={false}
          key={id + String(isLoading)}
          speed={speed}
          spacing={spacing}
          style={styles.marquee}>
          <Text white>{musicText}</Text>
        </Marquee>
      </View>
    );
  }, [isLoading, playingMusic?.id]);

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

  useEffect(() => {
    return () => {
      removePlayBackListener();
      restMusicStatus();
    };
  }, []);

  const ctrlWidth = useSharedValue(fullWidth - 32);
  const animatedStyles = useAnimatedStyle(() => ({
    width: ctrlWidth.value,
  }));

  return (
    <MusicCtrlContext.Provider value={{}}>
      {children}
      {showMusicCtrl ? (
        <View style={styles.CtrlContainer}>
          <Animated.View style={[animatedStyles, styles.ctrlBackImage]}>
            <ImageBackground
              blurRadius={40}
              source={
                userInfo?.user_bg_img
                  ? {
                      uri: envConfig.THUMBNAIL_URL + userInfo.user_bg_img,
                    }
                  : require('@assets/images/user_bg.jpg')
              }
              resizeMode="cover">
              <GestureHandlerRootView>
                <View row centerV spread>
                  <TouchableOpacity
                    row
                    centerV
                    onPress={() => {
                      ctrlWidth.value = withTiming(
                        ctrlWidth.value === 47 ? fullWidth - 32 : 47,
                      );
                    }}>
                    <View>
                      <AnimatedCircularProgress
                        key={playingMusic?.id}
                        size={47}
                        width={3}
                        fill={playProgress}
                        tintColor={Colors.red40}
                        rotation={0}
                        lineCap="square">
                        {() => (
                          <Image
                            source={
                              playingMusic?.musicExtra?.music_cover
                                ? {
                                    uri:
                                      envConfig.THUMBNAIL_URL +
                                      playingMusic.musicExtra.music_cover,
                                  }
                                : require('@assets/images/music_cover.jpg')
                            }
                            style={styles.image}
                          />
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
                        {audioIsPlaying ? (
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
            </ImageBackground>
          </Animated.View>
        </View>
      ) : null}
      <LyricModal
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        isPlaying={audioIsPlaying}
        isLike={isLike}
        onPressLike={editMyFavorite}
        playMode={playType}
        curPosition={curPosition}
        duration={audioDuration}
        onSliderChange={value => {
          onSliderChange(value);
        }}
        onModeChange={() => {
          setPlayType(prev => {
            if (prev === 'order') {
              showToast(t('music.random_play'), 'success', true);
              return 'random';
            }
            if (prev === 'random') {
              showToast(t('music.single_play'), 'success', true);
              return 'single';
            }
            if (prev === 'single') {
              showToast(t('music.order_play'), 'success', true);
              return 'order';
            }
          });
        }}
        onBackWard={previousTrack}
        onPlay={playOrPauseTrack}
        onForWard={nextTrack}
        onPressMenu={() => setListModalVisible(true)}
      />
      <ToBePlayedModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
        onClear={() => {
          setPlayList([]);
        }}
        list={playList}
        onPressItem={item => {
          setPlayingMusic(item);
        }}
        onPressRemove={item => {
          removePlayList([item]);
        }}
      />
    </MusicCtrlContext.Provider>
  );
});

export default MusicCtrlProvider;
