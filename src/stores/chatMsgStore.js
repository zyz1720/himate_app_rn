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
          const nowJoinSessions = state.nowJoinSessions;
          const oldRemindSessionIds = [...state.remindSessionIds];
          data.forEach(sessionWithExtra => {
            const {session} = sessionWithExtra;
            const {reminders = []} = session?.lastMsg || {};
            if (
              reminders.includes(userInfo.id) &&
              !nowJoinSessions.includes(session.session_id)
            ) {
              const remindInfo = {
                sessionId: session.id,
                client_msg_id: session?.lastMsg?.client_msg_id || null,
              };
              const index = oldRemindSessionIds.findIndex(
                item => item.sessionId === session.id,
              );
              if (index !== -1) {
                oldRemindSessionIds[index] = remindInfo;
              } else {
                oldRemindSessionIds.push(remindInfo);
              }
            }
          });
          return {remindSessionIds: oldRemindSessionIds};
        });
      },
      removeRemindSession: sessionId =>
        set(state => {
          const oldRemindSessionIds = [...state.remindSessionIds];
          const index = oldRemindSessionIds.findIndex(
            item => item.sessionId === sessionId,
          );
          if (index !== -1) {
            oldRemindSessionIds.splice(index, 1);
          }
          return {remindSessionIds: oldRemindSessionIds};
        }),
      setNotRemindSessionIds: sessionId =>
        set(state => {
          const oldNotRemindSessionIds = [...state.notRemindSessionIds];
          if (!oldNotRemindSessionIds.includes(sessionId)) {
            oldNotRemindSessionIds.push(sessionId);
          } else {
            const index = oldNotRemindSessionIds.indexOf(sessionId);
            if (index !== -1) {
              oldNotRemindSessionIds.splice(index, 1);
            }
          }
          return {notRemindSessionIds: oldNotRemindSessionIds};
        }),
      setNowJoinSession: session_id =>
        set(state => {
          const oldNowJoinSessions = [...state.nowJoinSessions];
          if (!oldNowJoinSessions.includes(session_id)) {
            oldNowJoinSessions.push(session_id);
          }
          return {nowJoinSessions: oldNowJoinSessions};
        }),
      removeNowJoinSession: session_id =>
        set(state => {
          const oldNowJoinSessions = [...state.nowJoinSessions];
          const index = oldNowJoinSessions.indexOf(session_id);
          if (index !== -1) {
            oldNowJoinSessions.splice(index, 1);
          }
          return {nowJoinSessions: oldNowJoinSessions};
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
