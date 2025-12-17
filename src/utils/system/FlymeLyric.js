import { NativeModules } from 'react-native';

const { FlymeLyric } = NativeModules;

/**
 * Flyme状态栏歌词工具类
 * 用于在魅族Flyme系统上显示状态栏歌词
 */
class FlymeLyricUtil {
  /**
   * 检查当前设备是否支持Flyme状态栏歌词功能
   * @returns {Promise<boolean>} 是否支持
   */
  static async isSupported() {
    try {
      return await FlymeLyric.isSupported();
    } catch (error) {
      console.warn('FlymeLyric: isSupported error:', error);
      return false;
    }
  }

  /**
   * 设置状态栏歌词
   * @param {string} text 歌词文本
   * @returns {Promise<boolean>} 是否设置成功
   */
  static async setLyric(text) {
    try {
      if (!text || typeof text !== 'string') {
        console.log('FlymeLyric: Invalid lyric text, skipping');
        return false;
      }
      console.log('FlymeLyric: Setting lyric:', text);
      const result = await FlymeLyric.setLyric(text);
      console.log('FlymeLyric: Set lyric result:', result);
      return result;
    } catch (error) {
      console.warn('FlymeLyric: setLyric error:', error);
      return false;
    }
  }

  /**
   * 更新播放状态图标
   * @param {boolean} isPlaying 是否正在播放
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async updatePlayState(isPlaying) {
    try {
      return await FlymeLyric.updatePlayState(!!isPlaying);
    } catch (error) {
      console.warn('FlymeLyric: updatePlayState error:', error);
      return false;
    }
  }

  /**
   * 清除状态栏歌词
   * @returns {Promise<boolean>} 是否清除成功
   */
  static async clearLyric() {
    try {
      return await FlymeLyric.clearLyric();
    } catch (error) {
      console.warn('FlymeLyric: clearLyric error:', error);
      return false;
    }
  }

  /**
   * 设置歌词和播放状态
   * @param {string} text 歌词文本
   * @param {boolean} isPlaying 是否正在播放
   * @returns {Promise<boolean>} 是否设置成功
   */
  static async setLyricWithPlayState(text, isPlaying) {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        return false;
      }

      if (!text || typeof text !== 'string') {
        await this.clearLyric();
        return false;
      }

      // 先更新播放状态，再设置歌词
      await this.updatePlayState(isPlaying);
      return await this.setLyric(text);
    } catch (error) {
      console.warn('FlymeLyric: setLyricWithPlayState error:', error);
      return false;
    }
  }
}

export default FlymeLyricUtil;
