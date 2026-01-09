import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {View, Text, Colors, TouchableOpacity, Image} from 'react-native-ui-lib';
import {useScreenDimensions} from '@components/contexts/ScreenDimensionsContext';
import {useToast} from '@components/common/useToast';
import {useMusicStore} from '@store/musicStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {renderArtists} from '@utils/system/lyric_utils';
import {
  useMusicCtrl,
  useMusicPlayPosition,
  useMusicPlayback,
} from './MusicController';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LrcItem from './LrcItem';

const styles = StyleSheet.create({
  lyricText: {
    fontSize: 16,
    color: Colors.lyricColor,
    width: '100%',
  },
  transText: {
    fontSize: 14,
    color: Colors.lyricColor,
    width: '100%',
    marginTop: 10,
  },
  image: {
    width: 46,
    height: 46,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 0.2,
  },
  line: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 10,
  },
  activeLine: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  activeLine2: {
    fontSize: 16,
    color: Colors.lyricColor,
    fontWeight: 'bold',
  },
  switchView: {
    position: 'absolute',
    bottom: 16,
    right: 24,
  },
  switchBut: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const LrcView = React.memo(props => {
  const {isHorizontal = false} = props;
  const {t} = useTranslation();
  const {fullWidth, fullHeight} = useScreenDimensions();
  const {
    playingMusic = {},
    lyrics = [],
    isHasYrc,
    isHasTrans,
    isHasRoma,
  } = useMusicCtrl();
  const {nowLyricIndex} = useMusicPlayback();
  const {playPosition} = useMusicPlayPosition();

  const {envConfig} = useConfigStore();
  const {switchCount, setSwitchCount} = useMusicStore();
  const {musicExtra = {}} = playingMusic;
  const {showToast} = useToast();
  const flatListRef = useRef(null);

  const [availableModes, setAvailableModes] = useState([]);
  const [transVisible, setTransVisible] = useState(true);
  const [romaVisible, setRomaVisible] = useState(false);
  const [yrcVisible, setYrcVisible] = useState(false);
  // 歌词是否为两行
  const [isTwoLines, setIsTwoLines] = useState(true);

  const MODES = [
    {name: 'lrc+trans', label: t('music.lrc_trans')},
    {name: 'lrc+roma', label: t('music.lrc_roma')},
    {name: 'lrc', label: t('music.lrc')},
    {name: 'yrc+trans', label: t('music.yrc_trans')},
    {name: 'yrc+roma', label: t('music.yrc_roma')},
    {name: 'yrc', label: t('music.yrc')},
  ];

  // 过滤出可用的歌词模式
  const filteredModes = (_haveYrc, _haveTrans, _haveRoma) => {
    const modes = MODES.filter(mode => {
      switch (mode.name) {
        case 'lrc+trans':
          return _haveTrans;
        case 'lrc+roma':
          return _haveRoma;
        case 'lrc':
          return true;
        case 'yrc+trans':
          return _haveTrans && _haveYrc;
        case 'yrc+roma':
          return _haveRoma && _haveYrc;
        case 'yrc':
          return _haveYrc;
        default:
          return false;
      }
    });
    return modes;
  };

  // 显示对应歌词
  const showLyric = _mode => {
    const {name} = _mode || {};
    switch (name) {
      case 'lrc+trans':
        setYrcVisible(false);
        setTransVisible(true);
        setRomaVisible(false);
        setIsTwoLines(true);
        break;
      case 'lrc+roma':
        setYrcVisible(false);
        setTransVisible(false);
        setRomaVisible(true);
        setIsTwoLines(true);
        break;
      case 'lrc':
        setYrcVisible(false);
        setTransVisible(false);
        setRomaVisible(false);
        setIsTwoLines(false);
        break;
      case 'yrc+trans':
        setYrcVisible(true);
        setTransVisible(true);
        setRomaVisible(false);
        setIsTwoLines(true);
        break;
      case 'yrc+roma':
        setYrcVisible(true);
        setTransVisible(false);
        setRomaVisible(true);
        setIsTwoLines(true);
        break;
      case 'yrc':
        setYrcVisible(true);
        setTransVisible(false);
        setRomaVisible(false);
        setIsTwoLines(false);
        break;
      default:
        setYrcVisible(false);
        setTransVisible(true);
        setRomaVisible(false);
        setIsTwoLines(true);
        break;
    }
  };

  // 切换歌词
  const switchLyric = useCallback(() => {
    shouldSkip.current = false;

    const currentModeIndex = (switchCount + 1) % availableModes.length;
    const currentMode = availableModes[currentModeIndex];
    showLyric(currentMode);
    setSwitchCount(currentModeIndex);
    showToast(t('music.switch_to', {mode: currentMode.label}), 'success', true);
  }, [switchCount, availableModes]);

  // 每行歌词高度变化
  const [itemHeights, setItemHeights] = useState(() => new Map());
  const shouldSkip = useRef(false);
  const isTwoLinesRef = useRef(isTwoLines);

  // 缓存isTwoLines值，避免在回调中依赖
  useEffect(() => {
    isTwoLinesRef.current = isTwoLines;
  }, [isTwoLines]);

  const onItemLayout = useCallback(
    (index, height) => {
      if (shouldSkip.current || index === lyrics.length - 1) {
        shouldSkip.current = true;
        return;
      }

      const currentIsTwoLines = isTwoLinesRef.current;

      // 避免不必要的状态更新
      if (
        (currentIsTwoLines && height === 68) ||
        (!currentIsTwoLines && height === 48)
      ) {
        return;
      }

      setItemHeights(prev => {
        if (prev.get(index) === height) {
          return prev;
        }
        const newMap = new Map(prev);
        newMap.set(index, height);
        return newMap;
      });
    },
    [lyrics.length],
  );

  const itemLayouts = useMemo(() => {
    const newLengths = new Map();
    const newOffsets = new Map();
    if (!lyrics.length || itemHeights.size === 0 || !shouldSkip.current) {
      return {lengths: newLengths, offsets: newOffsets};
    }

    const defaultHeight = isTwoLines ? 68 : 48; // 动态默认高度
    const maxIndex = lyrics.length - 1;

    for (let i = 0; i <= maxIndex; i++) {
      newLengths.set(i, itemHeights.get(i) || defaultHeight);
    }

    let currentOffset = 0;
    for (let i = 0; i <= newLengths.size; i++) {
      newOffsets.set(i, currentOffset);
      currentOffset += newLengths.get(i) || defaultHeight;
    }

    return {
      lengths: newLengths,
      offsets: newOffsets,
    };
  }, [isTwoLines, itemHeights, lyrics.length, shouldSkip.current]);

  const lrcHeight = useMemo(() => {
    const h = isHorizontal ? fullHeight * 0.9 : fullHeight * 0.78;
    return h - (h % 68);
  }, [fullWidth, isHorizontal]);

  // 计算每行歌词高度
  const getItemLayout = useCallback(
    (_, index) => {
      const {lengths, offsets} = itemLayouts || {};
      return {
        length: lengths.get(index) || isTwoLines ? 68 : 48,
        offset: offsets.get(index) || (isTwoLines ? 68 : 48) * index,
        index,
      };
    },
    [isTwoLines, itemLayouts],
  );

  // 渲染每行歌词
  const renderItem = ({item, index}) => {
    const isActive = nowLyricIndex === index;
    const hasWords = item?.words;
    const fullText = hasWords
      ? item.words.map(w => w.char).join('')
      : item?.text;

    let progress = 0;
    let displayChars = '';
    let yrcDuration = 0;

    if (isActive && hasWords) {
      const lineTime = playPosition - item.startTime;

      progress = lineTime / item.duration;
      if (progress < 0) {
        progress = 0;
      } else if (progress > 1) {
        progress = 1;
      }

      const words = item.words;
      const wordsLength = words.length;

      for (let i = 0; i < wordsLength; i++) {
        const word = words[i];
        if (playPosition >= word.startTime) {
          displayChars += word.char;
          yrcDuration = word.duration;
        } else {
          break;
        }
      }
    }

    return (
      <LrcItem
        lyric={item?.lyric}
        trans={item?.trans}
        roma={item?.roma}
        index={index}
        nowLyricIndex={nowLyricIndex}
        yrcDuration={yrcDuration}
        progress={progress}
        displayChars={displayChars}
        fullText={fullText}
        yrcVisible={yrcVisible && isHasYrc}
        transVisible={transVisible && isHasTrans}
        romaVisible={romaVisible && isHasRoma}
        onItemLayout={onItemLayout}
        isHorizontal={isHorizontal}
      />
    );
  };

  // 自动滚动到当前歌词
  useEffect(() => {
    if (flatListRef.current && nowLyricIndex >= 0) {
      flatListRef.current.scrollToIndex({index: nowLyricIndex});
    }
  }, [nowLyricIndex]);

  // 解析歌词
  useEffect(() => {
    const modes = filteredModes(isHasYrc, isHasTrans, isHasRoma);
    setAvailableModes(modes);
    showLyric(modes[switchCount]);

    setItemHeights(new Map());
    shouldSkip.current = false;
  }, [isHasYrc, isHasTrans, isHasRoma]);

  const musicCoverSource = useMemo(() => {
    if (musicExtra?.music_cover) {
      return {uri: envConfig.THUMBNAIL_URL + musicExtra.music_cover};
    }
    return require('@assets/images/music_cover.jpg');
  }, [musicExtra?.music_cover]);

  return (
    <View>
      {isHorizontal ? null : (
        <View flexS row centerV paddingV-16 paddingH-20 paddingB-20>
          {playingMusic?.title ? (
            <>
              <Image
                source={musicCoverSource}
                style={[styles.image, {borderColor: Colors.lyricColor}]}
              />
              <View>
                <Text
                  color={Colors.lyricColor}
                  text70BO
                  width={fullWidth * 0.78}
                  numberOfLines={1}>
                  {playingMusic?.title}
                </Text>
                <Text
                  color={Colors.lyricColor}
                  marginT-2
                  width={fullWidth * 0.78}
                  numberOfLines={1}>
                  {renderArtists(playingMusic)}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      )}
      <View height={lrcHeight}>
        {lyrics.length ? (
          <FlatList
            ref={flatListRef}
            data={lyrics}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: isTwoLines
                ? lrcHeight / 2 - 48
                : lrcHeight / 2 - 68,
            }}
            getItemLayout={getItemLayout}
          />
        ) : (
          <View height={'100%'} center>
            <Text color={Colors.lyricColor} text80>
              {t('empty.music_lrc')}
            </Text>
          </View>
        )}
      </View>
      {(isHasYrc || isHasTrans || isHasRoma) && lyrics.length > 0 && (
        <View style={styles.switchView}>
          <View backgroundColor={Colors.white4} style={styles.switchBut}>
            <TouchableOpacity style={styles.musicBut} onPress={switchLyric}>
              <Ionicons name="sync-sharp" color={Colors.lyricColor} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

export default LrcView;
