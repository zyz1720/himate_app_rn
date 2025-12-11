import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {v4 as uuid} from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  updateKey: 'update_key', // 更新key，用于刷新会话列表
  cloudSessions: [], // 云端会话列表
  notRemindSessionIds: [], // 不用提醒的会话id列表
  nowJoinSessions: [], // 现在加入的会话session_id
};

export const useChatMsgStore = create(
  persist(
    set => ({
      ...defaultState,
      setUpdateKey: () => set({updateKey: uuid()}),
      setCloudSessions: (data = []) =>
        set(state => {
          data.forEach(sessionWithExtra => {
            const {session} = sessionWithExtra;
            const index = state.cloudSessions.findIndex(
              item => item.session.id === session.id,
            );
            if (index !== -1) {
              state.cloudSessions[index] = sessionWithExtra;
            } else {
              state.cloudSessions.unshift(sessionWithExtra);
            }
          });
          return state;
        }),
      removeCloudSession: sessionId =>
        set(state => {
          const index = state.cloudSessions.findIndex(
            item => item.id === sessionId,
          );
          if (index !== -1) {
            state.cloudSessions.splice(index, 1);
          }
          return state;
        }),
      setNotRemindSessionIds: sessionId =>
        set(state => {
          if (!state.notRemindSessionIds.includes(sessionId)) {
            state.notRemindSessionIds.push(sessionId);
          } else {
            const index = state.notRemindSessionIds.indexOf(sessionId);
            if (index !== -1) {
              state.notRemindSessionIds.splice(index, 1);
            }
          }
          return state;
        }),
      setNowJoinSession: session_id =>
        set(state => {
          if (!state.nowJoinSessions.includes(session_id)) {
            state.nowJoinSessions.push(session_id);
          }
          return state;
        }),
      removeNowJoinSession: session_id =>
        set(state => {
          const index = state.nowJoinSessions.indexOf(session_id);
          if (index !== -1) {
            state.nowJoinSessions.splice(index, 1);
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
