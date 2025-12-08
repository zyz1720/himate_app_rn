import React from 'react';
import RootView from './router';
import {RealmProvider} from '@realm/react';
import {I18nextProvider} from 'react-i18next';
import {ChatMsg, SessionInfo, MusicInfo, LocalMusic} from '@const/realm_model';
import i18n from './i18n/index';
import ToastProvider from '@components/common/useToast';
import MusicCtrlProvider from '@components/music/MusicController';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <RealmProvider schema={[SessionInfo, ChatMsg, MusicInfo, LocalMusic]}>
          <MusicCtrlProvider>
            <RootView />
          </MusicCtrlProvider>
        </RealmProvider>
      </ToastProvider>
    </I18nextProvider>
  );
};

export default App;
