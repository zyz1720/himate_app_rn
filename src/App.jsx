import {I18nextProvider} from 'react-i18next';
import React from 'react';
import RootView from './router';
import i18n from './i18n/index';
import ToastProvider from '@components/common/useToast';
import MusicCtrlProvider from '@components/music/MusicController';
import ScreenDimensionsProvider from '@components/contexts/ScreenDimensionsContext';

const App = () => {
  return (
    <ScreenDimensionsProvider>
      <I18nextProvider i18n={i18n}>
        <ToastProvider>
            <MusicCtrlProvider>
              <RootView />
            </MusicCtrlProvider>
        </ToastProvider>
      </I18nextProvider>
    </ScreenDimensionsProvider>
  );
};

export default App;
