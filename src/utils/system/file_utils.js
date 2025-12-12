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
import {isEmptyString} from '../common/string_utils';
import {useConfigStore} from '@store/configStore';
import {FileTypeEnum} from '@const/database_enum';
import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * 格式化文件大小
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = size => {
  if (size === 0) {
    return '0B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + sizes[i];
};

/**
 * 获取文件名
 * @param {string} url 文件路径或URL
 * @returns {string} 文件名
 */
export const getFileName = url => {
  try {
    if (isEmptyString(url)) {
      return '';
    }
    let cleanPath = url.split('?')[0].split('#')[0];

    const slashIndex = cleanPath.lastIndexOf('/');
    const backslashIndex = cleanPath.lastIndexOf('\\');

    const lastSeparatorIndex = Math.max(slashIndex, backslashIndex);
    if (
      lastSeparatorIndex !== -1 &&
      lastSeparatorIndex < cleanPath.length - 1
    ) {
      return cleanPath.substring(lastSeparatorIndex + 1);
    }
    return cleanPath;
  } catch (error) {
    console.error('获取文件名失败:', error);
    return '';
  }
};

/**
 * 获取文件扩展名
 * @param {string} url 文件url
 * @returns {string} 文件扩展名
 */
export const getFileExt = url => {
  const lastIndex = url?.lastIndexOf('.');
  let ext = '';
  if (lastIndex > -1 && lastIndex < url.length - 1) {
    ext = url?.slice(lastIndex + 1);
  }
  return ext;
};

/**
 * 获取文件图标颜色
 * @param {string} ext 文件扩展名
 * @returns {string} 文件图标颜色
 */
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
 * @param {object} fileInfo 文件信息
 * @returns {object} 文件信息
 */
export const getFileFromImageCropPicker = fileInfo => {
  const baseType = fileInfo.mime;

  let type = FileTypeEnum.image;
  if (baseType.startsWith('image/')) {
    type = FileTypeEnum.image;
  } else if (baseType.startsWith('video/')) {
    type = FileTypeEnum.video;
  } else if (baseType.startsWith('audio/')) {
    type = FileTypeEnum.audio;
  }

  const uri = fileInfo.path;
  const ext = getFileExt(uri);

  const file = {
    name: 'file',
    filename: fileInfo.filename,
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
 * @param {object} fileInfo 文件信息
 * @returns {object} 文件信息
 */
export const getFileFromDocumentPicker = fileInfo => {
  const baseType = fileInfo.type;
  const originalName = fileInfo.name;
  const ext = getFileExt(originalName);
  const documentTypes = [...docTypes, ...excelTypes, ...pptTypes, ...pdfTypes];

  let type = FileTypeEnum.other;
  if (baseType.startsWith('image/') || imageExtNames.includes(ext)) {
    type = FileTypeEnum.image;
  } else if (baseType.startsWith('video/') || videoExtNames.includes(ext)) {
    type = FileTypeEnum.video;
  } else if (baseType.startsWith('audio/') || audioExtNames.includes(ext)) {
    type = FileTypeEnum.audio;
  } else if (documentTypes.includes(ext)) {
    type = FileTypeEnum.document;
  }

  const file = {
    name: 'file',
    filename: originalName,
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
 * @param {string} filePath 文件路径
 * @returns {object} 文件信息
 */
export const getFileFromAudioRecorderPlayer = filePath => {
  const type = FileTypeEnum.audio;

  const ext = getFileExt(filePath);

  const file = {
    name: 'file',
    filename: getFileName(filePath),
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
 * 格式化表单数据
 * @param {object} form 表单数据
 * @returns {object} 格式化后的表单数据
 */
const formatFormData = form => {
  const formData = [];
  Object.keys(form).forEach(key => {
    formData.push({name: key, data: form[key]});
  });
  return formData;
};

/**
 * 上传文件
 * @param {object} fileData 文件数据
 * @param {object} options 选项
 * @param {function} options.onProgress 进度回调函数
 * @param {object} options.form 表单数据
 * @returns {object} 文件信息
 */
export const uploadFile = async (fileData, options = {}) => {
  const {onProgress = () => {}, form = {}} = options;
  const {access_token, token_type} = useUserStore.getState();
  const {envConfig} = useConfigStore.getState();

  const url = `${envConfig.BASE_URL}api/upload/file`;

  return ReactNativeBlobUtil.fetch(
    'POST',
    url,
    {
      Authorization: token_type + ' ' + access_token,
      'Content-Type': 'multipart/form-data',
    },
    [...formatFormData(form), fileData],
  ).uploadProgress((written, total) => {
    const progress = Math.round((written / total) * 100);
    onProgress(progress);
  });
};

/**
 * 下载文件
 * @param {string} fileUrl 文件URL
 * @param {object} options 选项
 * @param {string} options.fileName 文件名
 * @param {boolean} options.isInCameraRoll 是否保存到相册
 * @param {boolean} options.isSystemDownload 是否使用系统下载
 * @param {function} options.callback 回调函数
 * @returns {string} 下载路径
 */
export const downloadFile = async (fileUrl, options = {}) => {
  const {
    fileName = getFileName(fileUrl),
    isInCameraRoll = false,
    isSystemDownload = true,
    onProgress = () => {},
  } = options;
  if (isEmptyString(fileName)) {
    return false;
  }
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
      description: displayName + ' file Download',
    };
  }

  // 开始下载
  return new Promise(resolve => {
    ReactNativeBlobUtil.config(config)
      .fetch('GET', fileUrl)
      .progress((received, total) => {
        const progress = Math.round((received / total) * 100);
        onProgress(progress);
      })
      .then(resp => {
        resolve(resp.path());
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
        console.log('文件写入成功:', path);
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
