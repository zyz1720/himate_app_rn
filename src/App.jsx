import React from 'react';
import RootView from './router';
import {RealmProvider} from '@realm/react';
import {I18nextProvider} from 'react-i18next';
import ToastProvider from '@/utils/hooks/useToast';
import MusicCtrlProvider from '@components/music/MusicController';
import SocketProvider from '@utils/hooks/useSocket';
import {ChatMsg, UsersInfo, MusicInfo, LocalMusic} from '@const/realm_model';
import i18n from './i18n/index';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <RealmProvider schema={[ChatMsg, UsersInfo, MusicInfo, LocalMusic]}>
          <SocketProvider>
            <MusicCtrlProvider>
              <RootView />
            </MusicCtrlProvider>
          </SocketProvider>
        </RealmProvider>
      </ToastProvider>
    </I18nextProvider>
  );
};

export default App;
