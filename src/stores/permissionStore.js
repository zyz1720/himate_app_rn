import {create} from 'zustand';
import {
  checkPermissions,
  requestNotifyPermission,
  requestCameraPermission,
  requestMicrophonePermission,
  requestFolderPermission,
  requestOverlayPermission,
} from '@utils/system/permissions_utils';

const defaultState = {
  accessCamera: false, // 相机权限
  accessMicrophone: false, // 麦克风权限
  accessFolder: false, // 文件夹权限
  accessNotify: false, // 通知权限
  accessOverlay: false, // 悬浮窗权限
};

export const usePermissionStore = create(set => ({
  ...defaultState,
  setAllPermissions: async () => {
    const permissions = await checkPermissions();
    if (permissions) {
      set(state => ({
        ...state,
        ...permissions,
      }));
    }
  },
  setAccessNotify: async () => {
    const status = await requestNotifyPermission();
    set({accessNotify: status});
  },
  setAccessCamera: async () => {
    const status = await requestCameraPermission();
    set({accessCamera: status});
  },
  setAccessMicrophone: async () => {
    const status = await requestMicrophonePermission();
    set({accessMicrophone: status});
  },
  setAccessFolder: async () => {
    const status = await requestFolderPermission();
    set({accessFolder: status});
  },
  setAccessOverlay: async () => {
    const status = await requestOverlayPermission();
    set({accessOverlay: status});
  },
}));

const {setAllPermissions} = usePermissionStore.getState();
setAllPermissions();
