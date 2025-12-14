import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {createRandomLetters} from '@utils/common/string_utils';
import {useUserStore} from '@store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultState = {
  updateKey: 'update_key', // 更新key，用于刷新会话列表
  notRemindSessionIds: [], // 不用提醒的会话id列表
  nowJoinSessions: [], // 现在加入的会话session_id
  remindSessionIds: [], // 提醒会话session_id列表
};

export const useChatMsgStore = create(
  persist(
    set => ({
      ...defaultState,
      setUpdateKey: () => set({updateKey: createRandomLetters()}),
      setRemindSessions: (data = []) => {
        const {userInfo} = useUserStore.getState();
        set(state => {
          data.forEach(sessionWithExtra => {
            const {session} = sessionWithExtra;
            const {reminders = []} = session?.lastMsg || {};
            if (reminders.includes(userInfo.id)) {
              const remindInfo = {
                sessionId: session.id,
                msg_id: session?.lastMsg?.client_msg_id || null,
              };
              const index = state.remindSessionIds.findIndex(
                item => item.sessionId === session.id,
              );
              if (index !== -1) {
                state.remindSessionIds[index] = remindInfo;
              } else {
                state.remindSessionIds.push(remindInfo);
              }
            }
          });
          return state;
        });
      },
      removeRemindSession: sessionId =>
        set(state => {
          const index = state.remindSessionIds.findIndex(
            item => item.sessionId === sessionId,
          );
          if (index !== -1) {
            state.remindSessionIds.splice(index, 1);
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
        remindSessionIds: state.remindSessionIds,
      }),
    },
  ),
);
