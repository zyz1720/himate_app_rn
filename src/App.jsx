import React from 'react';
import RootView from './router';
import {Provider} from 'react-redux';
import {store} from './stores';
import ToastProvider from './components/common/Toast';
import MusicCtrlProvider from './components/music/MusicController';
import SocketProvider from './utils/common/socket';
import {RealmProvider} from '@realm/react';
import {
  ChatMsg,
  UsersInfo,
  MusicInfo,
  LocalMusic,
} from './constants/realm_model';

const App = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <RealmProvider schema={[ChatMsg, UsersInfo, MusicInfo, LocalMusic]}>
          <SocketProvider>
            <MusicCtrlProvider>
              <RootView />
            </MusicCtrlProvider>
          </SocketProvider>
        </RealmProvider>
      </ToastProvider>
    </Provider>
  );
};

export default App;
