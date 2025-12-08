import React, {useState, useEffect, useRef} from 'react';
import {AppState, FlatList, RefreshControl} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Drawer,
  Colors,
  TouchableOpacity,
  Badge,
} from 'react-native-ui-lib';
import {getUserSessions, getSessionsMessages} from '@api/session';
import {useToast} from '@components/common/useToast';
import {
  setLocalMsg,
  decryptMsg,
  formatCloudMsg,
  showMediaType,
} from '@utils/system/chat_utils';
import {
  onDisplayRealMsg,
  cancelNotification,
  playSystemSound,
} from '@utils/system/notification';
import {formatDateTime} from '@utils/common/time_utils';
import {useIsFocused} from '@react-navigation/native';
import {useConfigStore} from '@store/configStore';
import {useChatMsgStore} from '@store/chatMsgStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {setLocalSession} from '@utils/realm/useSessionInfo';
import Feather from 'react-native-vector-icons/Feather';

const Msg = ({navigation}) => {
  const isFocused = useIsFocused();
  const {envConfig, msgSecretKey} = useConfigStore();
  const {notRemindSessionIds, setNotRemindSessionIds, deleteIds, setDeleteIds} =
    useChatMsgStore();
  const {showToast} = useToast();
  const {t} = useTranslation();

  const {list, onEndReached, loading, onRefresh, refreshData} =
    useInfiniteScroll(getUserSessions);

  /* 向服务器确认收到消息 */
  const readMsg = async (msgId, sessionId, userId) => {};

  /* 本地确认收到消息 */
  const readListMsg = async sessionInfo => {};

  // 监听应用状态
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const subscription = AppState.addEventListener('change', nextAppState => {
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  });

  useEffect(() => {
    if (isFocused) {
      refreshData();
    }
    return () => subscription.remove();
  }, [isFocused]);

  /* 强制显示提醒 */
  const [remindSessions, setRemindSessions] = useState([]);
  const [selfRemindList, setSelfRemindList] = useState([]); // 提醒自己的@
  const getSelfReminds = sessions => {
    sessions.forEach(sessionInfo => {
      if (sessionInfo.chat_type === 'group') {
        const selfRemind = `@`;
        setSelfRemindList(prev => {
          if (
            prev.find(
              item =>
                item.id === sessionInfo.id && item.selfRemind === selfRemind,
            )
          ) {
            return prev;
          } else {
            return [
              ...prev,
              {
                id: sessionInfo.id,
                selfRemind,
              },
            ];
          }
        });
      }
    });
  };

  /* 列表元素 */
  const renderSessionItem = ({item}) => {
    const {session = {}, sessionExtra = {}} = item || {};
    return (
      <Drawer
        disableHaptic={true}
        itemsMinWidth={80}
        rightItems={[
          {
            text: notRemindSessionIds.includes(session.id)
              ? t('chat.reminder_restored')
              : t('chat.mute'),
            background: notRemindSessionIds.includes(session.id)
              ? Colors.success
              : Colors.warning,
            onPress: () => {
              setNotRemindSessionIds(session.id);
              refreshData();
            },
          },
          {
            text: t('common.delete'),
            background: Colors.error,
            onPress: () => {
              setDeleteIds(session.id);
            },
          },
        ]}
        leftItem={{
          text: t('chat.read'),
          background: Colors.primary,
          onPress: () => {
            readListMsg(session);
          },
        }}>
        <View bg-white>
          <TouchableOpacity
            centerV
            row
            padding-s4
            onPress={() => {
              navigation.navigate('Chat', {
                primaryId: session.id,
                session_id: session.session_id,
                session_name: sessionExtra.session_name,
                chat_type: session.chat_type,
                userId: sessionExtra.userId,
                groupId: sessionExtra.groupId,
              });
              getSessionsMessages(session.session_id, {}).then(res => {
                console.log('getSessionsMessages', res.data.list);
              });
            }}>
            <Avatar
              source={
                sessionExtra?.session_avatar
                  ? {
                      uri: envConfig.STATIC_URL + sessionExtra.session_avatar,
                    }
                  : require('@assets/images/empty.jpg')
              }
            />
            <View marginL-12>
              <View flexG row centerV spread width={'92%'}>
                <Text text70BL>{sessionExtra.session_name}</Text>
                <View flexS row centerV>
                  {sessionExtra.unread_count > 0 ? (
                    <Badge
                      marginR-6
                      label={sessionExtra.unread_count}
                      backgroundColor={
                        notRemindSessionIds.includes(session.id)
                          ? Colors.grey50
                          : Colors.error
                      }
                      size={16}
                    />
                  ) : null}
                  {notRemindSessionIds.includes(session.id) ? (
                    <Feather name="bell-off" color={Colors.grey40} size={16} />
                  ) : null}
                </View>
              </View>
              <View flexG row centerV spread width={'92%'}>
                <Text text80 numberOfLines={1} grey30 style={{width: '70%'}}>
                  {remindSessions.includes(session.id) ? (
                    <Text text80 red40>
                      {t('chat.reminder')}
                    </Text>
                  ) : null}
                  {sessionExtra?.lastSenderRemarks
                    ? sessionExtra.lastSenderRemarks + ': '
                    : null}
                  {showMediaType(
                    session.lastMsg?.content,
                    session.lastMsg?.msg_type,
                    session.lastMsg?.msg_secret,
                  )}
                </Text>
                <Text text90L grey40>
                  {formatDateTime(session.update_time)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Drawer>
    );
  };

  useEffect(() => {
    setLocalSession(list);
  }, [list]);

  return (
    <View>
      <FlatList
        refreshControl={
          <RefreshControl
            colors={[Colors.primary]}
            refreshing={loading}
            onRefresh={onRefresh}
          />
        }
        data={list.filter(item => !deleteIds.includes(item.id))}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        onEndReached={onEndReached}
        renderItem={renderSessionItem}
        ListFooterComponent={<View marginB-200 />}
        ListEmptyComponent={
          <View marginT-16 center>
            <Text text90L grey40>
              {t('empty.session')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Msg;
