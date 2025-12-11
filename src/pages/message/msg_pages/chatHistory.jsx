import React, {useState} from 'react';
import {View, Card, Colors} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {getSessionMessages} from '@api/session';
import {formatCloudMsgToLocal} from '@utils/system/chat_utils';
import {delay} from '@utils/common/time_utils';
import {deleteLocalMessages, setLocalMessages} from '@utils/realm/useChatMsg';
import {useTranslation} from 'react-i18next';
import ListItem from '@components/common/ListItem';
import BaseDialog from '@components/common/BaseDialog';
import FullScreenLoading from '@components/common/FullScreenLoading';

const ChatHistory = ({navigation, route}) => {
  const {session_id, userId} = route.params || {};

  const {showToast} = useToast();
  const {t} = useTranslation();

  /* 清空历史消息 */
  const clearChatHistory = _session_id => {
    deleteLocalMessages(_session_id);
    showToast(t('mate.clear_success'), 'success');
    navigation.navigate('Msg');
  };

  /* 获取历史消息 */
  const [loadingAll, setLoadingAll] = useState(false);
  const pageSize = 100;
  const getCouldChatHistory = async current => {
    try {
      setLoadingAll(true);
      const res = await getSessionMessages(session_id, {
        current: current,
        pageSize: pageSize,
      });
      if (res.code === 0) {
        const list = res.data.list;
        if (list.length === 0) {
          showToast(t('empty.chat'), 'warning');
          navigation.navigate('Msg');
          return;
        }
        const newList = formatCloudMsgToLocal(list, session_id);
        setLocalMessages(newList);
        if (list.length < pageSize) {
          showToast(t('mate.sync_success'), 'success');
          setLoadingAll(false);
          navigation.navigate('Msg');
          return;
        }
        await delay();
        return getCouldChatHistory(current + 1);
      }
      setLoadingAll(false);
      showToast(t('mate.sync_failed'), 'error');
      return;
    } catch (error) {
      console.error(error);
      setLoadingAll(false);
      showToast(t('mate.sync_failed'), 'error');
      return;
    }
  };

  const [clearVisible, setClearVisible] = useState(false);

  return (
    <View flexG paddingH-16 paddingT-16>
      <Card enableShadow={false}>
        <ListItem
          itemName={t('mate.create_group')}
          iconName={'group'}
          iconSize={20}
          iconColor={Colors.primary}
          onConfirm={() => {
            navigation.navigate('CreateGroup', {
              initialSelectIds: [userId],
              isCreate: true,
            });
          }}
        />
      </Card>

      <Card marginT-16 enableShadow={false}>
        <ListItem
          itemName={t('mate.search_history')}
          iconName={'search'}
          iconSize={20}
          iconColor={Colors.grey40}
          onConfirm={() => {
            navigation.navigate('SearchMsg', {
              session_id: session_id,
            });
          }}
        />
        <ListItem
          itemName={t('mate.export_chat_history')}
          iconName={'download'}
          iconColor={Colors.cyan30}
          iconSize={20}
          onConfirm={() => {
            navigation.navigate('ChatMsg', {
              session_id: session_id,
            });
          }}
        />
        <ListItem
          itemName={t('mate.clear_chat_history')}
          iconName={'remove'}
          iconColor={Colors.error}
          onConfirm={() => {
            setClearVisible(true);
          }}
        />
      </Card>
      <Card marginT-16 enableShadow={false}>
        <ListItem
          itemName={t('mate.sync_chat_history')}
          iconName={'cloud-download'}
          iconSize={20}
          iconColor={Colors.blue30}
          onConfirm={() => {
            getCouldChatHistory(1);
          }}
        />
      </Card>
      <BaseDialog
        title={true}
        onConfirm={() => {
          clearChatHistory(session_id);
        }}
        visible={clearVisible}
        setVisible={setClearVisible}
        description={t('mate.clear_chat_history_tips')}
      />
      {loadingAll ? <FullScreenLoading message={t('common.syncing')} /> : null}
    </View>
  );
};

export default ChatHistory;
