import {Platform} from 'react-native';
import {
  audioExtNames,
  imageExtNames,
  videoExtNames,
  textExtNames,
  docTypes,
  excelTypes,
  pptTypes,
  pdfTypes,
} from '@const/file_ext_names';
import {Colors} from 'react-native-ui-lib';
import {displayName} from '@root/app.json';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import ReactNativeBlobUtil from 'react-native-blob-util';

/* 获取文件名 */
export const getFileName = url => {
  // 使用最后一个'/'作为分隔符来分割字符串
  try {
    const parts = url?.split('/');
    // parts数组的最后一个元素是文件名
    const fileName = parts[parts.length - 1];
    return fileName;
  } catch (error) {
    console.error(error);
    return '';
  }
};

/* 获取文件扩展名 */
export const getFileExt = url => {
  const lastIndex = url?.lastIndexOf('.');
  let ext = '';
  if (lastIndex > -1 && lastIndex < url.length - 1) {
    ext = url?.slice(lastIndex + 1);
  }
  return ext;
};

/* 获取文件图标颜色 */
export const getFileColor = ext => {
  let color = Colors.yellow40;
  if (textExtNames.includes(ext)) {
    color = Colors.grey40;
  }
  if (docTypes.includes(ext)) {
    color = Colors.blue40;
  }
  if (excelTypes.includes(ext)) {
    color = Colors.green40;
  }
  if (pptTypes.includes(ext)) {
    color = Colors.orange40;
  }
  if (pdfTypes.includes(ext)) {
    color = Colors.red40;
  }
  return color;
};

/**
 * 获取文件来自react-native-image-crop-picker
 * @param {string} doName 文件名
 * @param {object} fileInfo 文件信息
 * @returns {object} 文件信息
 */
export const getFileFromImageCropPicker = (doName, fileInfo) => {
  const baseType = fileInfo.mime;

  let type = 'image';
  if (baseType.startsWith('image/')) {
    type = 'image';
  } else if (baseType.startsWith('video/')) {
    type = 'video';
  } else if (baseType.startsWith('audio/')) {
    type = 'audio';
  }

  const uri = fileInfo.path;
  const ext = getFileExt(uri);

  const file = {
    name: 'file',
    filename: `${doName}_${type}_${Math.random()
      .toString(16)
      .substring(2)}.${ext}`,
    data: ReactNativeBlobUtil.wrap(fileInfo.path),
  };

  return {
    file,
    type,
    uri,
    ext,
  };
};

/**
 * 获取文件来自react-native-document-picker
 * @param {string} doName 文件名
 * @param {object} fileInfo 文件信息
 * @param {boolean} useOriginalName 是否使用原始文件名
 * @returns {object} 文件信息
 */
export const getFileFromDocumentPicker = (
  doName,
  fileInfo,
  useOriginalName = false,
) => {
  const baseType = fileInfo.type;
  const originalName = fileInfo.name;
  const ext = getFileExt(originalName);

  let type = 'other';
  if (baseType.startsWith('image/') || imageExtNames.includes(ext)) {
    type = 'image';
  } else if (baseType.startsWith('video/') || videoExtNames.includes(ext)) {
    type = 'video';
  } else if (baseType.startsWith('audio/') || audioExtNames.includes(ext)) {
    type = 'audio';
  }

  const file = {
    name: 'file',
    filename: useOriginalName
      ? originalName
      : `${doName}_${type}_${Math.random().toString(16).substring(2)}.${ext}`,
    data: ReactNativeBlobUtil.wrap(fileInfo.uri),
  };
  return {
    file,
    type,
    uri: fileInfo.uri,
    ext,
  };
};

/**
 * 获取录音文件来自react-native-audio-recorder-player
 * @param {string} doName 文件名
 * @param {string} filePath 文件路径
 * @returns {object} 文件信息
 */
export const getFileFromAudioRecorderPlayer = (doName, filePath) => {
  const type = 'audio';

  const ext = getFileExt(filePath);

  const file = {
    name: 'file',
    filename: `${doName}_${type}_${Math.random()
      .toString(16)
      .substring(2)}.${ext}`,
    data: Platform.OS === 'ios' ? filePath : ReactNativeBlobUtil.wrap(filePath),
  };

  return {
    file,
    type,
    uri: filePath,
    ext,
  };
};

/**
 * 上传文件
 * @param {object} fileData 文件数据
 * @param {function} callback 回调函数
 * @param {object} form 参数
 * @returns {object} 文件信息
 */
export const uploadFile = async (fileData, callback = () => {}, form = {}) => {
  const {access_token, token_type} = useUserStore.getState();
  const {envConfig} = useConfigStore.getState();

  const {uid, fileType, useType} = form;

  // 构建URL
  const url = `${envConfig.BASE_URL}api/upload/file`;

  return ReactNativeBlobUtil.fetch(
    'POST',
    url,
    {
      Authorization: token_type + ' ' + access_token,
      'Content-Type': 'multipart/form-data',
    },
    [fileData],
  ).uploadProgress((written, total) => {
    const progress = Math.round((written / total) * 100);
    callback(progress);
  });
};

/**
 * 下载文件
 * @param {string} fileUrl 文件URL
 * @param {string} fileName 文件名
 * @param {function} callback 回调函数
 * @param {boolean} isInCameraRoll 是否保存到相册
 * @param {boolean} isSystemDownload 是否使用系统下载
 * @returns {string} 下载路径
 */
export const downloadFile = async (
  fileUrl,
  fileName,
  callback = () => {},
  isInCameraRoll = false,
  isSystemDownload = true,
) => {
  // 处理下载路径
  const dirs = ReactNativeBlobUtil.fs.dirs;
  let originPath = dirs.LegacyDownloadDir;
  let dirName = displayName;

  if (isInCameraRoll) {
    originPath = dirs.LegacyDCIMDir;
  }
  if (Platform.OS === 'ios') {
    originPath = dirs.DocumentDir;
    dirName = 'Download';
    if (isInCameraRoll) {
      dirName = 'Picture';
    }
  }

  const path = originPath + `/${dirName}`;

  const isDirExists = await ReactNativeBlobUtil.fs.exists(path);
  if (!isDirExists) {
    const flag = await ReactNativeBlobUtil.fs.mkdir(path);
    if (!flag) {
      console.log('创建文件夹失败:', path);
      return false;
    }
  }
  const downloadDest = `${path}/${fileName}`;

  // 处理下载配置
  let config = {path: downloadDest, fileCache: false};
  if (Platform.OS === 'ios') {
    config.IOSBackgroundTask = true;
    config.indicator = true;
  } else if (Platform.OS === 'android' && isSystemDownload) {
    delete config.path;
    config.addAndroidDownloads = {
      useDownloadManager: true,
      notification: true,
      mime: 'application/octet-stream',
      path: downloadDest,
      title: fileName,
      description: displayName + '文件下载',
    };
  }

  // 开始下载
  return new Promise(resolve => {
    ReactNativeBlobUtil.config(config)
      .fetch('GET', fileUrl)
      .progress((received, total) => {
        const progress = Math.round((received / total) * 100);
        callback(progress);
      })
      .then(resp => {
        resolve(resp.path());
        // console.log('下载成功:', resp.path());
      })
      .catch(error => {
        resolve(null);
        console.error(error);
      });
  });
};

/**
 * 写入JSON文件
 * @param {object} jsonData JSON数据
 * @param {string} fileName 文件名
 * @returns {boolean} 是否写入成功
 */
export const writeJSONFile = async (jsonData, fileName) => {
  // 将 JSON 数据转换为字符串
  const jsonString = JSON.stringify(jsonData);

  // 定义文件路径
  const dirs = ReactNativeBlobUtil.fs.dirs;

  let originPath = dirs.LegacyDownloadDir;
  let dirName = displayName;

  if (Platform.OS === 'ios') {
    originPath = dirs.DocumentDir;
    dirName = 'Download';
  }
  const path = originPath + `/${dirName}`;
  const isDirExists = await ReactNativeBlobUtil.fs.exists(path);
  if (!isDirExists) {
    const flag = await ReactNativeBlobUtil.fs.mkdir(path);
    if (!flag) {
      console.log('创建文件夹失败:', path);
      return false;
    }
  }
  const writeDest = `${path}/${fileName}`;
  return new Promise(resolve => {
    ReactNativeBlobUtil.fs
      .writeFile(writeDest, jsonString, 'utf8')
      .then(() => {
        resolve(true);
        // console.log('文件写入成功:', path);
      })
      .catch(error => {
        console.log('文件写入失败:', error);
        resolve(false);
      });
  });
};

/**
 * 读取JSON文件
 * @param {string} path 文件路径
 * @returns {object} JSON数据
 */
export const readJSONFile = async path => {
  try {
    const jsonString = await ReactNativeBlobUtil.fs.readFile(path, 'utf8');
    const jsonData = JSON.parse(jsonString);
    return jsonData;
  } catch (error) {
    console.log('文件读取失败:', error);
    return null;
  }
};
