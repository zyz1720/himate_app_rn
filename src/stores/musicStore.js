import {getMusicDetail} from '@api/music';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {isEmptyObject, excludeFields} from '@utils/common/object_utils';
import {formatLrc} from '@utils/system/lyric_utils';
import {findLyricIndex} from '@utils/system/lyric_utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  playingMusic: {}, // 当前播放音乐
  playList: [], // 播放列表
  showMusicCtrl: false, // 是否显示音乐控制器
  closeTime: 0, // 关闭时间
  isClosed: false, // 是否关闭
  randomNum: {min: 0, max: 1}, // 随机数范围
  switchCount: 0, // 切换次数
  isRandomPlay: false, // 是否随机播放
  musicPlayMode: 'order', // 列表播放类型 single order random
  isMusicResumePlay: false, // 是否恢复播放
  isMusicBreak: false, // 是否暂停
};

const defaultPlayingMusicState = {
  playPosition: 0, // 播放位置
  lyrics: [], // 歌词列表
  nowLyric: '', // 当前歌词
  nowTrans: '', // 当前翻译歌词
  nowRoma: '', // 当前音译歌词
  nowLyricIndex: -1, // 当前歌词索引
  isHasYrc: false, // 是否有逐字歌词
  isHasTrans: false, // 是否有翻译歌词
  isHasRoma: false, // 是否有音译歌词
  isMusicPlaying: false, // 音乐是否正在播放
  isMusicLoading: false, // 音乐是否正在加载
  musicDuration: 0, // 音乐总时长
  playingMusicIndex: 0, // 当前播放音乐的索引
  playingMusicProgress: 0, // 当前播放音乐的进度
};

export const useMusicStore = create(
  persist(
    (set, get) => ({
      ...defaultState,
      ...defaultPlayingMusicState,
      setPlayingMusic: music => {
        if (!music || isEmptyObject(music)) {
          return set({playingMusic: {}});
        }
        if (typeof music?.id === 'string') {
          return set({playingMusic: music});
        }
        getMusicDetail(music?.id).then(res => {
          if (res.code === 0) {
            const musicInfo = res.data;
            const musicExtra = musicInfo?.musicExtra;
            const musicWithExtra = excludeFields(musicExtra, [
              'music_lyric',
              'music_trans',
              'music_roma',
              'music_yrc',
            ]);
            musicInfo.musicExtra = musicWithExtra;
            set({playingMusic: musicInfo || {}});
            if (musicExtra) {
              const {lyrics, haveTrans, haveRoma, haveYrc} =
                formatLrc(musicExtra);
              set({
                lyrics,
                isHasTrans: haveTrans,
                isHasRoma: haveRoma,
                isHasYrc: haveYrc,
              });
            }
          }
        });
      },
      setPlayList: (list = []) => set({playList: list}),
      addPlayList: (list = []) =>
        set(state => {
          const oldPlayList = [...state.playList];
          list.forEach(item => {
            if (!oldPlayList.find(e => e?.id === item?.id)) {
              oldPlayList.push(item);
            }
          });
          return {playList: oldPlayList};
        }),
      unshiftPlayList: (list = []) =>
        set(state => {
          const oldPlayList = [...state.playList];
          list.forEach(item => {
            if (!oldPlayList.find(e => e?.id === item?.id)) {
              oldPlayList.unshift(item);
            }
          });
          return {playList: oldPlayList};
        }),
      removePlayList: (list = []) =>
        set(state => {
          const oldPlayList = [...state.playList];
          list.forEach(item => {
            const index = oldPlayList.findIndex(e => e?.id === item?.id);
            if (index > -1) {
              oldPlayList.splice(index, 1);
            }
          });
          return {playList: oldPlayList};
        }),
      setShowMusicCtrl: router => {
        if (router.includes('Music') || router.includes('Favorites')) {
          set({showMusicCtrl: true});
        } else {
          set({showMusicCtrl: false});
        }
      },
      setCloseTime: time => set({closeTime: time || 0}),
      setIsClosed: flag => set({isClosed: flag ?? false}),
      setRandomNum: (min = 0, max = 1) => set({randomNum: {min, max}}),
      setIsRandomPlay: flag => set({isRandomPlay: flag ?? false}),
      setSwitchCount: count => set({switchCount: count || 0}),
      setIsMusicResumePlay: flag => set({isMusicResumePlay: flag ?? false}),
      setIsMusicBreak: flag => set({isMusicBreak: flag ?? false}),
      setIsMusicPlaying: flag => set({isMusicPlaying: flag ?? false}),
      setIsMusicLoading: flag => set({isMusicLoading: flag ?? false}),
      setMusicDuration: duration => set({musicDuration: duration || 0}),
      setPlayingMusicIndex: index => set({playingMusicIndex: index || 0}),
      setPlayingMusicProgress: progress =>
        set({playingMusicProgress: progress || 0}),
      setMusicPlayMode: mode => set({musicPlayMode: mode || 'order'}),
      setPlayPosition: position => {
        const {playPosition, lyrics, isHasYrc, nowLyricIndex} = get();
        if (position === playPosition) {
          return;
        }
        set({playPosition: position});
        if (lyrics.length === 0) {
          return;
        }
        const nowIndex = findLyricIndex(lyrics, position, isHasYrc) - 1;
        if (nowLyricIndex === nowIndex) {
          return;
        }
        const nowLyric = lyrics[nowIndex] || {};
        set({
          nowLyricIndex: nowIndex,
          nowLyric: nowLyric?.lyric || '',
          nowTrans: nowLyric?.trans || '',
          nowRoma: nowLyric?.roma || '',
        });
      },
      resetPlayingMusic: () => set(defaultPlayingMusicState),
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        switchCount: state.switchCount,
        musicPlayMode: state.musicPlayMode,
      }),
    },
  ),
);
