import React, {useState, useEffect} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Drawer,
  Colors,
  TouchableOpacity,
  Badge,
} from 'react-native-ui-lib';
import {
  getUserSessions,
  getSessionUnreadMsgs,
  readSessionUnreadMsgs,
} from '@api/session';
import {useToast} from '@components/common/useToast';
import {
  showMessageText,
  formatLocalSessionToTmp,
} from '@utils/system/chat_utils';
import {formatDateTime} from '@utils/common/time_utils';
import {useConfigStore} from '@store/configStore';
import {useChatMsgStore} from '@store/chatMsgStore';
import {useAppStateStore} from '@store/appStateStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {
  setLocalSession,
  getLocalSessions,
  deleteLocalSession,
  resetUnreadCount,
} from '@utils/realm/useSessionInfo';
import {delay} from '@utils/common/time_utils';
import {useIsFocused} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

const Msg = ({navigation}) => {
  const {envConfig} = useConfigStore();
  const {
    notRemindSessionIds,
    setNotRemindSessionIds,
    updateKey,
    remindSessionIds,
  } = useChatMsgStore();
  const {networkIsConnected} = useAppStateStore();
  const {showToast} = useToast();
  const {t} = useTranslation();
  const isFocused = useIsFocused();

  const {list, onEndReached, loading, onRefresh, refreshData} =
    useInfiniteScroll(getUserSessions);

  const [sessions, setSessions] = useState([]);

  // 获取本地会话
  const refreshLocalSessions = () => {
    const localSessions = getLocalSessions();
    const tmpSessions = formatLocalSessionToTmp(localSessions);
    setSessions(tmpSessions);
  };

  /* 向服务器确认收到消息 */
  const pageSize = 100;
  const readSessionAllUnreadMsgs = async (current, session_id) => {
    try {
      const res = await getSessionUnreadMsgs(session_id, {
        current: current,
        pageSize: pageSize,
      });
      if (res.code === 0) {
        const msgs = res.data.list;
        if (msgs.length === 0) {
          return;
        }
        const unreadMsgIds = msgs.map(item => item.id);
        await readSessionUnreadMsgs({
          session_id,
          ids: unreadMsgIds,
        });
        if (msgs.length < pageSize) {
          return;
        }
        await delay();
        return readSessionAllUnreadMsgs(current + 1, session_id);
      }
      showToast(res.message, 'error');
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  // 是否有@当前用户
  const isHasAtCurrentUser = id => {
    const remindInfo = remindSessionIds.find(e => e.sessionId === id);
    return remindInfo || {};
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
              refreshLocalSessions();
            },
          },
          {
            text: t('common.delete'),
            background: Colors.error,
            onPress: () => {
              deleteLocalSession(session.session_id);
              refreshLocalSessions();
            },
          },
        ]}
        leftItem={{
          text: t('chat.read'),
          background: Colors.primary,
          onPress: () => {
            resetUnreadCount(session.session_id);
            refreshLocalSessions();
            readSessionAllUnreadMsgs(1, session.session_id);
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
                search_msg_cid: isHasAtCurrentUser(session.id)?.client_msg_id,
              });
            }}>
            <Avatar
              source={{
                uri: envConfig.STATIC_URL + sessionExtra?.session_avatar,
              }}
              imageProps={{errorSource: require('@assets/images/empty.jpg')}}
              backgroundColor={Colors.transparent}
            />
            <View marginL-12>
              <View flexG row centerV spread width={'92%'}>
                <Text text70BL>{sessionExtra?.session_name}</Text>
                <View flexS row centerV>
                  {session?.unread_count ? (
                    <Badge
                      marginR-6
                      label={session.unread_count}
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
                  {isHasAtCurrentUser(session.id)?.sessionId ? (
                    <Text text80 red40>
                      {t('chat.reminder')}
                    </Text>
                  ) : null}
                  {sessionExtra?.lastSenderRemarks
                    ? sessionExtra.lastSenderRemarks + ': '
                    : null}
                  {session?.lastMsgContent || showMessageText(session.lastMsg)}
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
    refreshLocalSessions();
  }, [updateKey]);

  useEffect(() => {
    setLocalSession(list);
    refreshLocalSessions();
  }, [list]);

  useEffect(() => {
    if (isFocused) {
      refreshLocalSessions();
    }
  }, [isFocused]);

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <View>
      {networkIsConnected ? null : (
        <View padding-6 center bg-red40 centerV>
          <Text text90L white>
            <FontAwesome
              name="exclamation-circle"
              color={Colors.white}
              size={14}
            />
            &nbsp;
            {t('httpError.unConnected')}
          </Text>
        </View>
      )}
      <FlatList
        refreshControl={
          <RefreshControl
            colors={[Colors.primary]}
            refreshing={loading}
            onRefresh={onRefresh}
          />
        }
        data={sessions}
        keyExtractor={(_, index) => index.toString()}
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
