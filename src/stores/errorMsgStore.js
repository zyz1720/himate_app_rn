import {create} from 'zustand';

const defaultState = {
  errorMsg: null,
};

export const useErrorMsgStore = create((set, get) => ({
  ...defaultState,
  setErrorMsg: errorMsg => {
    if (errorMsg !== get().errorMsg) {
      set({errorMsg});
    } else {
      set({errorMsg: null});
    }
  },
  clearMsgStore: () => set(defaultState),
}));
