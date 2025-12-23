import {Platform, NativeModules} from 'react-native';
import {
  requestNotifications,
  request,
  checkNotifications,
  checkMultiple,
  PERMISSIONS,
  openSettings,
  requestMultiple,
} from 'react-native-permissions';

const {FloatingLyric} = NativeModules;

// 检查悬浮窗权限
const checkOverlayPermission = () => {
  return new Promise(resolve => {
    FloatingLyric.checkOverlayPermission(hasPermission => {
      resolve(hasPermission);
    });
  });
};

/* 检查系统所有所需权限 */
export const checkPermissions = async () => {
  try {
    let permissions = [];
    const permissionObj = {};

    if (Platform.OS === 'android') {
      permissions = [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
      ];
    }
    if (Platform.OS === 'ios') {
      permissions = [
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.MEDIA_LIBRARY,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      ];
    }
    const statuses = await checkMultiple(permissions);
    const {status: notificationStatus} = await checkNotifications();
    const overlayPermission = await checkOverlayPermission();

    if (Platform.OS === 'android') {
      permissionObj.accessCamera =
        statuses[PERMISSIONS.ANDROID.CAMERA] === 'granted';
      permissionObj.accessFolder =
        statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === 'granted' ||
        (statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.READ_MEDIA_AUDIO] === 'granted');
      permissionObj.accessMicrophone =
        statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === 'granted';
      permissionObj.accessOverlay = overlayPermission;
    }
    if (Platform.OS === 'ios') {
      permissionObj.accessCamera =
        statuses[PERMISSIONS.IOS.CAMERA] === 'granted';
      permissionObj.accessFolder =
        statuses[PERMISSIONS.IOS.MEDIA_LIBRARY] === 'granted';
      permissionObj.accessMicrophone =
        statuses[PERMISSIONS.IOS.MICROPHONE] === 'granted';
    }
    permissionObj.accessNotify = notificationStatus === 'granted';
    return permissionObj;
  } catch (error) {
    console.error('检查权限失败', error);
    return null;
  }
};

/* 请求相机权限 */
export const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const status = await request(PERMISSIONS.ANDROID.CAMERA);
      if (status !== 'granted') {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return status === 'granted';
    }
    if (Platform.OS === 'ios') {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      if (status !== 'granted') {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return status === 'granted';
    }
    return false;
  } catch (error) {
    console.error('请求相机权限失败', error);
    return false;
  }
};

/* 请求录音权限 */
export const requestMicrophonePermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const status = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      if (status !== 'granted') {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return status === 'granted';
    }
    if (Platform.OS === 'ios') {
      const status = await request(PERMISSIONS.IOS.MICROPHONE);
      if (status !== 'granted') {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return status === 'granted';
    }
    return false;
  } catch (error) {
    console.error('请求录音权限失败', error);
    return false;
  }
};

/* 请求文件夹权限 */
export const requestFolderPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const statuses = await requestMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]);
      const isGranted =
        statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === 'granted' ||
        (statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.READ_MEDIA_AUDIO] === 'granted');
      if (!isGranted) {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return isGranted;
    }
    if (Platform.OS === 'ios') {
      const status = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
      if (status !== 'granted') {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return status === 'granted';
    }
    return false;
  } catch (error) {
    console.error('请求文件夹权限失败', error);
    return false;
  }
};

/* 请求通知权限 */
export const requestNotifyPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      openSettings().catch(() => console.warn('打开设置失败'));
      return false;
    }
    if (Platform.OS === 'android') {
      const {status} = await requestNotifications();
      if (status !== 'granted') {
        openSettings().catch(() => console.warn('打开设置失败'));
      }
      return status === 'granted';
    }
    return false;
  } catch (error) {
    console.error('请求通知权限失败', error);
    return false;
  }
};

// 请求悬浮窗权限
export const requestOverlayPermission = async () => {
  FloatingLyric.requestOverlayPermission();
  const isGranted = await checkOverlayPermission();
  return isGranted;
};
