import {create} from 'zustand';

const defaultState = {
  networkIsConnected: true,
  appIsActive: true,
};

export const useAppStateStore = create((set, get) => ({
  ...defaultState,
  setNetworkIsConnected: status => {
    if (status === get().networkIsConnected) {
      return;
    }
    set({networkIsConnected: status ?? true});
  },
  setAppIsActive: status => {
    if (status === get().appIsActive) {
      return;
    }
    set({appIsActive: status ?? true});
  },
  clearAppState: () => set(defaultState),
}));
