import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {
  View,
  Card,
  Text,
  Colors,
  Button,
  TextField,
  TouchableOpacity,
  Avatar,
} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {searchUsers} from '@api/user';
import {addMate} from '@api/mate';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BaseDialog from '@components/common/BaseDialog';

const AddMate = ({navigation, route}) => {
  const {account} = route?.params || {};
  const {showToast} = useToast();
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  const [keyword, setKeyword] = useState('');
  const {list, onEndReached, refreshData} = useInfiniteScroll(searchUsers);

  const [userId, setUserId] = useState(null);

  /*  添加好友 */
  const [isVisible, setIsVisible] = useState(false);
  const [remark, setRemark] = useState('');
  const [message, setMessage] = useState('');
  const addFriend = async () => {
    try {
      const addRes = await addMate({
        friend_id: userId,
        friend_remarks: remark,
        validate_msg: message,
      });
      if (addRes.code === 0) {
        showToast(t('mate.add_success'), 'success');
        reset();
        return;
      }
      showToast(addRes.message, 'error');
    } catch (error) {
      console.error(error);
    }
  };

  const reset = () => {
    setIsVisible(false);
    setRemark('');
    setMessage('');
  };

  useEffect(() => {
    if (account) {
      refreshData({
        keyword: account,
      });
    }
  }, [account]);

  const renderItem = ({item}) => (
    <Card marginT-16 padding-12 paddingB-16>
      <View flexS backgroundColor={Colors.white} spread row centerV>
        <TouchableOpacity
          flexS
          row
          centerV
          onPress={() => {
            navigation.navigate('MateInfo', {
              userId: item.id,
            });
          }}>
          <Avatar
            size={60}
            source={{
              uri: envConfig.STATIC_URL + item?.user_avatar,
            }}
            imageProps={{errorSource: require('@assets/images/empty.jpg')}}
            backgroundColor={Colors.transparent}
          />
          <View marginL-10>
            <Text text80BL>{item?.user_name || ''}</Text>
            <Text text90L marginT-2 grey30>
              {t('user.account')}: {item.self_account}
            </Text>
            <Text text90L marginT-2 grey30>
              {t('user.email')}: {item.account}
            </Text>
          </View>
        </TouchableOpacity>
        <View marginL-10 flexS row>
          <Button
            onPress={() => {
              setUserId(item.id);
              setIsVisible(true);
            }}
            marginL-8
            label={t('common.append')}
            borderRadius={8}
            text70L
            avoidMinWidth={true}
            outline
            outlineColor={Colors.primary}
            size={Button.sizes.xSmall}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <View padding-16>
      <Card padding-12 flexS enableShadow={false} row spread>
        <TextField
          placeholder={t('mate.search_placeholder')}
          text80L
          showClearButton
          onChangeText={value => {
            setKeyword(value);
          }}
          maxLength={30}
        />
        <View flexS centerV row>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CodeScanner');
            }}>
            <AntDesign name="scan1" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Button
            marginL-12
            label={t('common.search')}
            borderRadius={8}
            text70L
            avoidMinWidth={true}
            size={Button.sizes.small}
            backgroundColor={Colors.primary}
            onPress={() => {
              if (!keyword) {
                showToast(t('common.search_keyword'), 'warning');
                return;
              }
              refreshData({keyword});
            }}
          />
        </View>
      </Card>
      <FlatList
        data={list}
        renderItem={renderItem}
        onEndReachedThreshold={0.8}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={onEndReached}
        ListFooterComponent={<View marginB-200 />}
      />

      <BaseDialog
        onConfirm={addFriend}
        visible={isVisible}
        setVisible={setIsVisible}
        description={t('mate.add_mate')}
        renderBody={
          <View paddingR-16>
            <TextField
              marginT-8
              placeholder={t('mate.remark_placeholder')}
              floatingPlaceholder
              showClearButton
              text70L
              onChangeText={value => {
                setRemark(value);
              }}
              maxLength={10}
              showCharCounter={true}
            />
            <TextField
              marginT-8
              placeholder={t('mate.message_placeholder')}
              floatingPlaceholder
              showClearButton
              text70L
              onChangeText={value => {
                setMessage(value);
              }}
              maxLength={50}
              showCharCounter={true}
              multiline={true}
            />
          </View>
        }
      />
    </View>
  );
};

export default AddMate;
