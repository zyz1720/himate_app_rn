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
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Marquee} from '@animatereactnative/marquee';
import {isEmptyObject, deepClone} from '@utils/common/object_utils';
import {getRandomInt} from '@utils/common/number_utils';
import {useToast} from '@utils/hooks/useToast';
import {useRealm} from '@realm/react';
import MusicControl, {Command} from 'react-native-music-control';
import {
  getMusic,
  getMusicDetail,
  likeMusic,
  removeFavoritesMusic,
} from '@api/music';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useMusicStore} from '@store/musicStore';
import {useTranslation} from 'react-i18next';
import {renderMusicTitle} from '@utils/system/lyric_utils';
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
    width: '100%',
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
const audioPlayer = new AudioRecorderPlayer();

const MusicCtrlProvider = React.memo(props => {
  const {children} = props;
  const {showToast} = useToast();
  const realm = useRealm();
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
  const lastPlayedId = useRef(null); // 记录上一次播放的音乐Id
  const [playingIndex, setPlayingIndex] = useState(0); // 当前播放音乐的索引
  const [playProgress, setPlayProgress] = useState(0); // 进度条数值
  const [playType, setPlayType] = useState('order'); // 列表播放类型 single order random

  const [isLoading, setIsLoading] = useState(false);
  // 音乐播放器
  const subscription = audioPlayer.addPlayBackListener(playbackMeta => {
    const {currentPosition, duration} = playbackMeta;

    setAudioIsPlaying(
      currentPosition !== curPosition && currentPosition !== seekToPosition,
    );

    setCurPosition(currentPosition);

    if (duration !== audioDuration) {
      setAudioDuration(duration);
    }

    MusicControl.updatePlayback({
      elapsedTime: Math.round(currentPosition / 1000),
    });

    const progress = Math.round((currentPosition / duration) * 100);
    if (progress) {
      setPlayProgress(progress);
    }

    if (playbackMeta.isFinished) {
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
    }
  });

  // 上一首
  const previousRemote = useCallback(() => {
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
  const playOrPauseRemote = useCallback(() => {
    if (isLoading) {
      showToast(t('music.loading'), 'warning', true);
    }
    if (audioIsPlaying) {
      audioPlayer.pausePlayer();
    } else {
      if (isEmptyObject(playingMusic)) {
        showToast(t('music.no_music'), 'warning');
        return;
      }
      audioPlayer.resumePlayer();
    }
  }, [audioIsPlaying, playingMusic, isLoading]);

  // 下一首
  const nextRemote = useCallback(() => {
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
    await audioPlayer?.seekToPlayer(position);
    setAudioIsPlaying(false);
    setIsLoading(true);
  }, []);

  //  监听音乐播放状态
  useEffect(() => {
    if (isEmptyObject(playingMusic)) {
      return;
    }
    if (audioIsPlaying) {
      setIsLoading(false);
      setSeekToPosition(0);
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PLAYING,
      });
    } else {
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PAUSED,
      });
    }
  }, [audioIsPlaying]);

  // 重置音乐播放所有状态
  const restMusicStatus = async () => {
    MusicControl.stopControl();
    setCurPosition(0);
    setAudioDuration(0);
    setPlayProgress(0);
    setSeekToPosition(0);
    setIsLoading(false);
    setAudioIsPlaying(false);
    try {
      const stopResult = await audioPlayer.stopPlayer();
      return stopResult;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  /* 写入本地播放记录 */
  const addOrUpdateLocalMusic = music => {
    if (typeof music?.id === 'string') {
      return;
    }
    const localMusic = deepClone(music);
    for (const key in localMusic) {
      if (localMusic[key] === null) {
        delete localMusic[key];
      }
    }
    const musicList = realm
      .objects('music_info')
      .filtered('id == $0', localMusic.id);
    if (musicList.length > 0) {
      realm.write(() => {
        for (const ele of musicList) {
          ele.updated_at = Date.now().toString();
        }
      });
    } else {
      localMusic.created_at = Date.now().toString();
      localMusic.updated_at = Date.now().toString();
      realm.write(() => {
        realm.create('music_info', localMusic);
      });
    }
  };

  /* 开启播放控件 */
  const startPlayCtrl = musicInfo => {
    const {title, artist, album, duration, musicExtra} = musicInfo;
    MusicControl.setNotificationId(5173, 'cancelPlayer');
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', false);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableControl('seek', true);
    MusicControl.enableControl('closeNotification', true, {when: 'paused'});
    MusicControl.enableBackgroundMode(true);
    MusicControl.handleAudioInterruptions(true);
    MusicControl.setNowPlaying({
      title: title,
      artwork:
        envConfig.STATIC_URL +
        (musicExtra?.music_cover || userInfo?.user_avatar),
      artist: artist,
      album: album,
      duration: duration,
      color: 0x0000ff,
      date: Date.now().toString(),
      isLiveStream: true,
    });
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PLAYING,
      speed: 1,
    });
  };

  useEffect(() => {
    /* 控件操作 */
    MusicControl.on(Command.pause, () => {
      playOrPauseRemote();
    });
    MusicControl.on(Command.play, () => {
      playOrPauseRemote();
    });
    MusicControl.on(Command.nextTrack, () => {
      nextRemote();
    });
    MusicControl.on(Command.previousTrack, () => {
      previousRemote();
    });
    MusicControl.on(Command.seek, pos => {
      onSliderChange(pos * 1000);
    });
  }, [playOrPauseRemote, nextRemote, previousRemote, onSliderChange]);

  // 是否要定时关闭音乐
  let timer = null;
  useEffect(() => {
    if (closeTime) {
      timer = setTimeout(() => {
        audioPlayer.pausePlayer();
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PAUSED,
        });
        setIsClosed(true);
        clearTimeout(timer);
      }, closeTime * 60000);
    } else {
      clearTimeout(timer);
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
  }, [randomNum.max, randomNum.min]);

  // 随机播放
  useEffect(() => {
    if (isRandomPlay) {
      getRandMusic();
    }
  }, [isRandomPlay]);

  // 播放新音乐的方法
  const playNewMusic = async () => {
    if (!playingMusic?.file_key) {
      return;
    }
    const isStopped = await restMusicStatus();
    if (!isStopped) {
      return;
    }
    setIsLoading(true);
    try {
      let url = '';
      if (typeof playingMusic?.id === 'number') {
        url = envConfig.STATIC_URL + playingMusic?.file_key;
      } else {
        url = playingMusic?.file_key;
      }

      await audioPlayer.startPlayer(url);
      const index = playList.findIndex(item => item.id === playingMusic.id);
      lastPlayedId.current = playingMusic.id;
      setPlayingIndex(index);
      startPlayCtrl(playingMusic);
      if (realm) {
        addOrUpdateLocalMusic(playingMusic);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showToast('无法播放的音乐！', 'error');
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
  }, [playingMusic]);

  // 加载音乐名
  const renderMarquee = useCallback(
    music => {
      const {id} = music;
      let musicText = renderMusicTitle(music);
      if (isLoading) {
        musicText = t('music.loading');
      }
      const speed = musicText.length > 16 ? 0.4 : 0;
      const spacing = musicText.length > 16 ? fullWidth * 0.2 : fullWidth * 0.6;
      return (
        <View>
          <Marquee
            key={id + isLoading}
            speed={speed}
            spacing={spacing}
            style={styles.marquee}>
            <Text white>{musicText}</Text>
          </Marquee>
        </View>
      );
    },
    [isLoading],
  );

  // 编辑用户收藏的音乐
  const [isLike, setIsLike] = useState(false);
  const editMyFavorite = async (id, isFavorite) => {
    // try {
    //   const res = await editDefaultFavorites({
    //     handleType: isFavorite ? 'remove' : 'add',
    //     favorites_uid: userId,
    //     musicIds: [id],
    //   });
    //   if (res.success) {
    //     showToast(isFavorite ? '已取消收藏' : '已收藏', 'success');
    //     getAllMusicList(userId);
    //   } else {
    //     showToast(res.message, 'error');
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
  };

  useEffect(() => {
    setBgSource({
      uri: envConfig.THUMBNAIL_URL + userInfo?.user_bg_img || '',
    });
    return () => {
      audioPlayer.removePlayBackListener();
      restMusicStatus();
    };
  }, []);

  const [bgSource, setBgSource] = useState({});

  return (
    <MusicCtrlContext.Provider value={{}}>
      {children}
      {showMusicCtrl ? (
        <View style={styles.CtrlContainer}>
          <ImageBackground
            blurRadius={40}
            style={styles.ctrlBackImage}
            source={bgSource}
            onError={() => setBgSource(require('@assets/images/user_bg.jpg'))}
            resizeMode="cover">
            <GestureHandlerRootView>
              <View row centerV spread>
                <TouchableOpacity
                  row
                  centerV
                  onPress={() => {
                    setMusicModalVisible(true);
                  }}>
                  <View marginR-6>
                    <AnimatedCircularProgress
                      key={playingMusic}
                      size={47}
                      width={3}
                      fill={playProgress}
                      tintColor={Colors.red40}
                      rotation={0}
                      lineCap="square">
                      {() => (
                        <Image
                          source={{
                            uri:
                              envConfig.THUMBNAIL_URL +
                              playingMusic?.musicExtra?.music_cover,
                          }}
                          errorSource={require('@assets/images/music_cover.jpg')}
                          style={styles.image}
                        />
                      )}
                    </AnimatedCircularProgress>
                  </View>
                  <View centerV>{renderMarquee(playingMusic)}</View>
                </TouchableOpacity>
                <View row centerV>
                  <TouchableOpacity
                    style={styles.musicBut}
                    onPress={() => {
                      playOrPauseRemote();
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
            </GestureHandlerRootView>
          </ImageBackground>
        </View>
      ) : null}
      <LyricModal
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        Music={playingMusic}
        IsPlaying={audioIsPlaying}
        isLike={isLike}
        OnFavorite={editMyFavorite}
        PlayMode={playType}
        CurPosition={curPosition}
        Duration={audioDuration}
        OnSliderChange={value => {
          onSliderChange(value);
        }}
        onModeChange={() => {
          setPlayType(prev => {
            if (prev === 'order') {
              showToast('随机播放', 'success', true);
              return 'random';
            }
            if (prev === 'random') {
              showToast('单曲循环', 'success', true);
              return 'single';
            }
            if (prev === 'single') {
              showToast('顺序播放', 'success', true);
              return 'order';
            }
          });
        }}
        OnBackWard={() => {
          previousRemote();
        }}
        OnPlay={() => {
          playOrPauseRemote();
        }}
        OnForWard={() => {
          nextRemote();
        }}
        OnMain={() => {
          setListModalVisible(true);
        }}
      />
      <ToBePlayedModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
        OnClearList={() => {
          setPlayList([]);
        }}
        Music={playingMusic}
        list={playList}
        OnPressItem={item => {
          setPlayingMusic(item);
        }}
        OnPressRemove={item => {
          removePlayList([item]);
        }}
      />
    </MusicCtrlContext.Provider>
  );
});

export default MusicCtrlProvider;
