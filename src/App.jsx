import React from 'react';
import RootView from './router';
import {Provider} from 'react-redux';
import {store} from './stores';
import {RealmProvider} from '@realm/react';
import {I18nextProvider} from 'react-i18next';
import ToastProvider from '@components/common/Toast';
import MusicCtrlProvider from '@components/music/MusicController';
import SocketProvider from '@utils/common/socket';
import i18n from './i18n/index';
import {
  ChatMsg,
  UsersInfo,
  MusicInfo,
  LocalMusic,
} from '@const/realm_model';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
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
    </I18nextProvider>
  );
};

export default App;
