import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Colors,
  TouchableOpacity,
  TextField,
} from 'react-native-ui-lib';
import {showMediaType} from '@utils/system/chat_utils';
import {fullHeight, fullWidth} from '@style/index';
import {useConfigStore} from '@store/configStore';
import {
  searchLocalMessagesById,
  searchLocalMessages,
} from '@utils/realm/useChatMsg';
import {getLocalSession} from '@utils/realm/useSessionInfo';
import {deepClone} from '@utils/common/object_utils';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';

const SearchMsg = ({navigation, route}) => {
  const {session_id} = route.params || {};
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  // 群聊列表
  const [localMessages, setLocalMessages] = useState([]);

  /* 查询历史记录 */
  const getMsgList = async keyword => {
    if (!keyword || keyword.trim() === '') {
      setLocalMessages([]);
      return;
    }
    let msgList = [];
    if (session_id) {
      msgList = searchLocalMessagesById(keyword, session_id);
    } else {
      msgList = searchLocalMessages(keyword);
    }
    const needList = msgList.map(item => {
      const newItem = deepClone(item);
      const sessionExtras = getLocalSession(item.session_id);
      newItem.sessionExtra = sessionExtras[0] || {};
      return newItem;
    });

    setLocalMessages(needList);
  };

  /* 关键词高亮样式 */
  const [keyword, setKeyword] = useState('');
  const setHighlightStyle = (text, highlightText) => {
    const regex = new RegExp(highlightText, 'gi');
    const parts = text?.split(regex) || [];
    const highlights = text?.match(regex) || [];
    return (
      <Text>
        {parts.map((part, index) => (
          // 如果当前部分是搜索词，则应用高亮样式
          <Text key={index}>
            {part}
            <Text style={styles.highlightStyle}>
              {highlights[index] ? highlights[index] : null}
            </Text>
          </Text>
        ))}
      </Text>
    );
  };

  const renderMsgItem = ({item}) => {
    return (
      <TouchableOpacity
        padding-10
        flexS
        backgroundColor={Colors.white}
        spread
        row
        centerV
        marginB-1
        onPress={() => {
          navigation.navigate('Chat', {
            search_msg_cid: item.client_msg_id,
            primaryId: item.session_primary_id,
            session_id: item.session_id,
            session_name: item.sessionExtra?.session_name,
            chat_type: item.chat_type,
            userId: item.sessionExtra?.userId,
            groupId: item.sessionExtra?.groupId,
          });
        }}>
        <View flexS row centerV>
          <Avatar
            source={
              item.sessionExtra?.session_avatar
                ? {uri: envConfig.STATIC_URL + item.sessionExtra.session_avatar}
                : require('@assets/images/empty.jpg')
            }
          />
          <View marginL-10 width={fullWidth * 0.78}>
            <View flexS row spread>
              <Text text80BO grey30>
                {setHighlightStyle(item.sessionExtra?.session_name, keyword)}
              </Text>
              <Text grey40 text90L>
                {dayjs(item.create_time).format('YYYY/MM/DD HH:mm:ss')}
              </Text>
            </View>
            <View>
              <Text text70 numberOfLines={3}>
                {item.msg_type !== 'text'
                  ? showMediaType(item.content, item.msg_type, item?.msg_secret)
                  : setHighlightStyle(item.decrypted_content, keyword)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (keyword) {
      getMsgList(keyword);
    }
  }, [keyword]);

  return (
    <View>
      <View padding-12 flexS width={'100%'}>
        <TextField
          containerStyle={styles.input}
          placeholder={t('chat.search_placeholder')}
          value={keyword}
          onChangeText={value => {
            setKeyword(value);
            getMsgList(value);
          }}
        />
      </View>
      <View height={fullHeight * 0.9}>
        <FlatList
          data={localMessages}
          renderItem={renderMsgItem}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <View marginT-16 paddingB-120 center>
              <Text text90L grey40>
                {t('chat.empty_search_result')}
              </Text>
            </View>
          }
          ListFooterComponent={
            localMessages.length > 10 ? (
              <View marginB-80 padding-12 center>
                <Text text90L grey40>
                  {t('common.footer')}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    height: 42,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  highlightStyle: {
    color: Colors.blue50,
  },
});
export default SearchMsg;
