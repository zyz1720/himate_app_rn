import {audioExtNames} from '@const/file_ext_names';
import {v4 as uuid} from 'uuid';
import {Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

export const rootDir =
  Platform.OS === 'ios'
    ? ReactNativeBlobUtil.fs.dirs.DocumentDir
    : ReactNativeBlobUtil.fs.dirs.LegacySDCardDir;

export const cacheDir = ReactNativeBlobUtil.fs.dirs.CacheDir;

/**
 * 删除目录及子目录下的所有文件
 * @returns {Promise<void>}
 */
export const deleteDir = async dir => {
  try {
    await ReactNativeBlobUtil.fs.unlink(dir);
  } catch (error) {
    console.error('deleteDir error', error);
  }
};

/**
 * 检查文件是否为音频文件
 * @param {string} fileName - 文件名
 * @returns {boolean} - 是否为音频文件
 */
export const isAudioFile = fileName => {
  return audioExtNames.some(ext => fileName.toLowerCase().endsWith(ext));
};

/**
 * 检查路径是否为目录
 * @param {string} path - 路径
 * @returns {boolean} - 是否为目录
 */
const isDirectory = async path => {
  try {
    const isDir = await ReactNativeBlobUtil.fs.isDir(path);
    return isDir;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

/**
 * 扫描目录下的音频文件
 * @param {string} path - 目录路径
 * @returns {Promise<Array>} - 音频文件列表
 */
export const scanDirAudio = async path => {
  const audioFilesInDir = [];
  try {
    const files = await ReactNativeBlobUtil.fs.ls(path);
    if (files.length === 0) {
      return audioFilesInDir;
    }

    for (const file of files) {
      const filePath = `${path}/${file}`;
      try {
        const isDir = await isDirectory(filePath);
        if (!isDir && isAudioFile(file)) {
          audioFilesInDir.push({
            id: uuid(),
            title: file.split('.').shift(),
            file_key: filePath,
          });
        } else if (isDir && !file.startsWith('.')) {
          // 递归扫描子目录
          const subDirFiles = await scanDirAudio(filePath);
          audioFilesInDir.push(...subDirFiles);
        }
      } catch (err) {
        console.error(`处理文件 ${filePath} 时出错:`, err);
      }
    }
  } catch (err) {
    console.error(`扫描目录 ${path} 时出错:`, err);
  }
  return audioFilesInDir;
};

/**
 * 扫描目录
 * @param {string} directory - 目录路径
 * @returns {Promise<Object>} - 包含目录列表和根目录路径的对象
 */
export const scanDir = async directory => {
  const scanDirectory = async dirPath => {
    try {
      const files = await ReactNativeBlobUtil.fs.ls(dirPath);
      const dirList = [];
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const file_path = `${dirPath}/${file}`;
          const isDir = await isDirectory(file_path);
          if (!file.startsWith('.')) {
            if (isDir) {
              dirList.push({
                name: file,
                path: file_path,
                isDir: true,
              });
            } else {
              dirList.push({
                name: file,
                path: file_path,
                isDir: false,
                file: file,
              });
            }
          }
        }
      }
      return dirList;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const dirList = await scanDirectory(directory);
  return dirList;
};

/**
 * 获取缓存大小
 * @returns {Promise<number>} - 缓存大小（单位：字节）
 */
export const getCacheSize = async () => {
  try {
    // 递归遍历目录并计算总大小
    const calculateDirectorySize = async path => {
      let totalSize = 0;
      try {
        const files = await ReactNativeBlobUtil.fs.ls(path);
        if (files.length === 0) {
          return totalSize;
        }
        for (const file of files) {
          const filePath = `${path}/${file}`;
          try {
            const isDir = await ReactNativeBlobUtil.fs.isDir(filePath);
            if (!isDir) {
              const stats = await ReactNativeBlobUtil.fs.stat(filePath);
              totalSize += stats.size;
            } else if (isDir) {
              const dirSize = await calculateDirectorySize(filePath);
              totalSize += dirSize;
            }
          } catch (err) {
            console.error(`处理文件 ${filePath} 时出错:`, err);
          }
        }
      } catch (err) {
        console.error(`扫描目录 ${path} 时出错:`, err);
      }
      return totalSize;
    };
    // 计算缓存目录总大小（转换为MB）
    const totalBytes = await calculateDirectorySize(cacheDir);
    return totalBytes;
  } catch (error) {
    console.error('getCacheSize error', error);
    return 0;
  }
};
