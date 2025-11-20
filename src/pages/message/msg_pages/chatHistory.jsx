import React, {useState} from 'react';
import {View, Card, Colors} from 'react-native-ui-lib';
import {useToast} from '../../../utils/hooks/useToast';
import {useRealm} from '@realm/react';
import {getSessionDetail} from '../../../api/session';
import {formatMsg, setLocalMsg} from '@utils/system/chat_utils';
import ListItem from '../../../components/common/ListItem';
import BaseDialog from '@components/common/BaseDialog';
import FullScreenLoading from '../../../components/common/FullScreenLoading';

const ChatHistory = ({navigation, route}) => {
  const {showToast} = useToast();
  const realm = useRealm();
  const {session_id, to_uid} = route.params || {};

  /* 清空历史消息 */
  const clearChatHistory = se_id => {
    const toDelete = realm
      .objects('ChatMsg')
      .filtered('session_id == $0', se_id);
    realm.write(() => {
      realm.delete(toDelete);
      showToast('清除成功', 'success');
      navigation.navigate('Msg');
    });
  };

  /* 获取历史消息 */
  const [loading, setLoading] = useState(false);
  const getCouldChatHistory = async () => {
    try {
      setLoading(true);
      const res = await getSessionDetail({session_id, msg_status: 'read'});
      if (res.success) {
        const newlist = [];
        res.data.msgs.forEach(item => {
          newlist.push(formatMsg(item));
        });
        setLocalMsg(realm, newlist);
        navigation.navigate('Msg');
      }
      setLoading(false);
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const [clearVisible, setClearVisible] = useState(false);

  return (
    <View flexG paddingH-16 paddingT-16>
      <Card enableShadow={false}>
        <ListItem
          ItemName={'创建群聊'}
          IconName={'group'}
          IconSize={20}
          IconColor={Colors.primary}
          onConfirm={() => {
            navigation.navigate('CreateGroup', {
              uid: to_uid,
              is_create: true,
            });
          }}
        />
      </Card>

      <Card marginT-16 enableShadow={false}>
        <ListItem
          ItemName={'查找历史消息'}
          IconName={'search'}
          IconSize={20}
          IconColor={Colors.grey40}
          onConfirm={() => {
            navigation.navigate('SearchMsg', {
              session_id: session_id,
            });
          }}
        />
        <ListItem
          ItemName={'导出聊天记录'}
          IconName={'download'}
          IconColor={Colors.cyan30}
          IconSize={20}
          onConfirm={() => {
            navigation.navigate('ChatMsg', {
              session_id: session_id,
            });
          }}
        />
        <ListItem
          ItemName={'清空历史消息'}
          IconName={'remove'}
          IconColor={Colors.error}
          onConfirm={() => {
            setClearVisible(true);
          }}
        />
      </Card>
      <Card marginT-16 enableShadow={false}>
        <ListItem
          ItemName={'从云端同步消息'}
          IconName={'cloud-download'}
          IconSize={20}
          IconColor={Colors.blue30}
          onConfirm={() => {
            getCouldChatHistory();
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
        description={'您确定要清除历史消息吗？'}
      />
      {loading ? <FullScreenLoading Message="同步中..." /> : null}
    </View>
  );
};

export default ChatHistory;
