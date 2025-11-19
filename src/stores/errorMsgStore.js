import {create} from 'zustand';

const defaultState = {
  errorMsg: null,
  errorMsgList: [],
};

export const useErrorMsgStore = create(set => ({
  ...defaultState,
  setErrorMsg: errorMsg =>
    set(state => {
      if (!state.errorMsgList.includes(errorMsg) && errorMsg) {
        state.errorMsgList.push(errorMsg);
        state.errorMsg = errorMsg;
      }
      return state;
    }),
  clearErrorMsgStore: () => set(defaultState),
}));
