import {create} from 'zustand';

const defaultState = {
  networkIsConnected: true,
  isAppActive: true,
};

export const useAppStateStore = create((set, get) => ({
  ...defaultState,
  setNetworkIsConnected: status => {
    if (status === get().networkIsConnected) {
      return;
    }
    set({networkIsConnected: status ?? true});
  },
  setIsAppActive: status => {
    if (status === get().isAppActive) {
      return;
    }
    set({isAppActive: status ?? true});
  },
  clearAppState: () => set(defaultState),
}));
