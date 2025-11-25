import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  msgData: {}, // 从服务器获取到的消息数据
  notRemindSessionIds: [], // 不用提醒的会话id列表
};

export const useChatMsgStore = create(
  persist(
    (set, get) => ({
      ...defaultState,
      setMsgData: msgData => set({msgData}),
      setNotRemindSessionIds: sessionId =>
        set(state => {
          if (!state.notRemindSessionIds.includes(sessionId)) {
            state.notRemindSessionIds.push(sessionId);
          }
          return state;
        }),
      delNotRemindSessionIds: sessionId =>
        set(state => {
          const index = state.notRemindSessionIds.indexOf(sessionId);
          if (index !== -1) {
            state.notRemindSessionIds.splice(index, 1);
          }
          return state;
        }),
    }),
    {
      name: 'chat-msg-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        notRemindSessionIds: state.notRemindSessionIds,
      }),
    },
  ),
);
