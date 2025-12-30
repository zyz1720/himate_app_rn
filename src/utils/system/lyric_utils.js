import {isEmptyString} from '@utils/common/string_utils';
import {mergeArraysByIndex} from '@utils/common/array_utils';
import i18n from 'i18next';

/**
 * 渲染艺术家文本函数
 * @param {Array} artists 艺术家数组
 * @returns {string} 渲染后的艺术家文本
 */
export const renderArtists = item => {
  let _artists = Array.isArray(item?.artists)
    ? item.artists.join('/')
    : i18n.t('music.empty_artist');
  return _artists + ' - ' + (item?.album || i18n.t('music.empty_album'));
};

/**
 * 渲染音乐文本函数
 * @param {Object} music 音乐对象
 * @returns {string} 渲染后的音乐文本
 */
export const renderMusicTitle = music => {
  const {title, artists} = music;
  const _title = title || i18n.t('music.empty_title');
  const _artists = Array.isArray(artists)
    ? artists.join('/')
    : i18n.t('music.empty_artist');
  return _title + ' - ' + _artists;
};

/**
 * 解析普通歌词函数
 * @param {string} lrc 普通歌词字符串
 * @returns {Array} 解析后的歌词数组
 */
export const parserLrc = lrc => {
  if (!lrc) {
    return [];
  }
  const lines = lrc.split('\n');
  return lines
    .map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3], 10);
        const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds * 10;
        const text = match[4].trim();
        return {time, text};
      }
      return null;
    })
    .filter(line => line !== null && !isEmptyString(line.text));
};

/**
 * 解析逐字歌词函数
 * @param {string} lyricsString 逐字歌词字符串
 * @returns {Array} 解析后的逐字歌词数组
 */
export const parseYrcs = lyricsString => {
  if (!lyricsString) {
    return [];
  }

  // 分割各行
  const lines = lyricsString.split('\n').filter(line => line.trim());

  return lines
    .map((line, index) => {
      // 解析行信息 [startTime,duration]
      const lineMatch = line.match(/^\[(\d+),(\d+)\]/);
      if (!lineMatch) {
        return null;
      }

      const startTime = parseInt(lineMatch[1], 10);
      const duration = parseInt(lineMatch[2], 10);
      const endTime = startTime + duration;

      // 解析每个字
      const wordRegex = /([^]+?)\((\d+),(\d+)\)/g;
      const words = [];
      let match;

      while ((match = wordRegex.exec(line)) !== null) {
        words.push({
          char: match[1].replace(/\[\d+,\d+\]/g, ''),
          startTime: parseInt(match[2], 10),
          duration: parseInt(match[3], 10),
          endTime: parseInt(match[2], 10) + parseInt(match[3], 10),
        });
      }

      return {
        id: `${index}-${startTime}`,
        startTime,
        duration,
        endTime,
        words,
      };
    })
    .filter(line => line !== null);
};

/**
 * 格式化歌词函数
 * @param {object} musicExtra 音乐对象
 * @returns {object} 格式化后的歌词对象
 */
export const formatLrc = musicExtra => {
  const {music_lyric, music_trans, music_yrc, music_roma} = musicExtra || {};

  const lyric = parserLrc(music_lyric);
  const transLyrics = parserLrc(music_trans);
  const romaLyrics = parseYrcs(music_roma);
  const yrcLyrics = parseYrcs(music_yrc);

  // 将歌词数组转换为以 time 为键的对象
  const transLyricsMap = transLyrics.reduce((map, _lyric) => {
    map[_lyric.time] = _lyric.text;
    return map;
  }, {});

  const romaLyricsMap = romaLyrics.map(item => {
    return {roma: item.words.map(word => word.char).join('')};
  });

  // 合并歌词
  const mergedLyrics = lyric.map(zhLyric => {
    const transText = transLyricsMap[zhLyric.time] || '';
    return {
      time: zhLyric.time,
      lyric: zhLyric.text,
      trans: transText,
    };
  });
  return {
    lyrics: mergeArraysByIndex(mergedLyrics, yrcLyrics, romaLyricsMap),
    haveYrc: yrcLyrics.length > 0,
    haveTrans: transLyrics.length > 0,
    haveRoma: romaLyricsMap.length > 0,
  };
};

export const findLyricIndex = (lyrics, position, isHasYrc) => {
  let left = 0;
  let right = lyrics.length - 1;
  let result = -1; // 默认值，如果都 <= position 则返回 -1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const matchTime = isHasYrc ? lyrics[mid].startTime : lyrics[mid].time;

    if (matchTime > position) {
      // 找到 > position 的，记录位置，继续向左找更早的
      result = mid;
      right = mid - 1;
    } else {
      // matchTime <= position，向右找
      left = mid + 1;
    }
  }

  return result;
};
