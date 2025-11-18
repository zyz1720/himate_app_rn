import {configureStore} from '@reduxjs/toolkit';
import userSlice from './store_slice/userStore';
import settingSlice from './store_slice/settingStore';
import chatMsgSlice from './store_slice/chatMsgStore';
import permissionSlice from './store_slice/permissionStore';
import baseConfigSlice from './store_slice/baseConfigStore';
import errorMsgSlice from './store_slice/errorMsgStore';
import musicSlice from './store_slice/musicStore';

export const store = configureStore({
  reducer: {
    userStore: userSlice,
    settingStore: settingSlice,
    chatMsgStore: chatMsgSlice,
    permissionStore: permissionSlice,
    baseConfigStore: baseConfigSlice,
    musicStore: musicSlice,
    errorMsgStore: errorMsgSlice,
  },
});
