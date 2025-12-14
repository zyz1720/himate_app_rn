import {create} from 'zustand';

const defaultState = {
  errorMsg: null,
  lastErrorTimestamp: 0,
};

export const useErrorMsgStore = create((set, get) => ({
  ...defaultState,
  setErrorMsg: errorMsg => {
    const currentState = get();
    const currentTime = Date.now();
    const timeDiff = currentTime - currentState.lastErrorTimestamp;

    if (errorMsg !== currentState.errorMsg) {
      set({errorMsg, lastErrorTimestamp: currentTime});
    } else if (timeDiff >= 1000) {
      set({errorMsg: null, lastErrorTimestamp: currentTime});
    }
  },
  clearMsgStore: () => set(defaultState),
}));
