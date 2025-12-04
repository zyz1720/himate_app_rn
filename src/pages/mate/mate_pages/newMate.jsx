import React, {useState, useEffect} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {
  View,
  Text,
  Avatar,
  Button,
  Colors,
  TouchableOpacity,
  TextField,
} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {
  getApplyList,
  getRejectedList,
  deleteMate,
  agreeMateApply,
  refuseMateApply,
} from '@api/mate';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import BaseDialog from '@components/common/BaseDialog';
import BaseTopBar from '@components/common/BaseTopBar';

const NewMate = ({navigation}) => {
  const {envConfig} = useConfigStore();
  const {showToast} = useToast();
  const {t} = useTranslation();

  /* 申请好友列表 */
  const {
    loading: applyLoading,
    list: applyList,
    onEndReached: onEndReachedApply,
    refreshData: refreshDataApply,
  } = useInfiniteScroll(getApplyList);
  const {
    loading: refusedLoading,
    list: refusedList,
    onEndReached: onEndReachedRefused,
    refreshData: refreshDataRefused,
  } = useInfiniteScroll(getRejectedList);

  const [remarkVisible, setRemarkVisible] = useState(false);
  const [remark, setRemark] = useState('');
  const [mateId, setMateId] = useState(null);

  const [focusedIndex, setFocusedIndex] = useState(0);

  // 同意好友申请
  const agreeApply = () => {
    agreeMateApply(mateId, {remarks: remark})
      .then(res => {
        if (res.code === 0) {
          showToast(t('mate.agreed'), 'success');
          refreshDataApply();
          return;
        }
        showToast(res.message, 'error');
      })
      .catch(error => {
        console.error(error);
      });
  };

  // 拒绝好友申请
  const refuseApply = () => {
    refuseMateApply(mateId)
      .then(res => {
        if (res.code === 0) {
          showToast(t('mate.refused'), 'success');
          refreshDataApply();
          refreshDataRefused();
          return;
        }
        showToast(res.message, 'error');
      })
      .catch(error => {
        console.error(error);
      });
  };

  /* 删除好友申请 */
  const [deleteVisible, setDeleteVisible] = useState(false);
  const deleteApplyInfo = async () => {
    try {
      const delRes = await deleteMate(mateId);
      if (delRes.success) {
        setDeleteVisible(false);
        refreshDataRefused();
      }
      showToast(delRes.message, delRes.success ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /* 拒绝好友申请 */
  const [refusedVisible, setRefusedVisible] = useState(false);

  const renderApplyItem = ({item}) => (
    <View padding-10 flexS backgroundColor={Colors.white} spread row centerV>
      <TouchableOpacity
        flexS
        row
        centerV
        onPress={() => {
          navigation.navigate('MateInfo', {
            userId: item.user.id,
          });
        }}>
        <Avatar
          source={{
            uri: envConfig.STATIC_URL + item.user.user_avatar,
          }}
        />
        <View marginL-10>
          <Text text80BL>{item.user.user_name}</Text>
          <View width={190}>
            <Text text90L marginT-5 grey30>
              {item.validate_msg}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View marginL-10 flexG row>
        <Button
          label={t('common.agree')}
          borderRadius={6}
          text70L
          avoidMinWidth={true}
          size={'xSmall'}
          backgroundColor={Colors.primary}
          onPress={() => {
            setMateId(item.id);
            setRemarkVisible(true);
          }}
        />
        <Button
          marginL-8
          label={t('common.refuse')}
          borderRadius={6}
          text70L
          avoidMinWidth={true}
          outline
          outlineColor={Colors.error}
          size={'xSmall'}
          onPress={() => {
            setMateId(item.id);
            setRefusedVisible(true);
          }}
        />
      </View>
    </View>
  );

  const renderRefuseItem = ({item}) => (
    <View padding-10 flexS backgroundColor={Colors.white} spread row centerV>
      <TouchableOpacity
        flexS
        row
        centerV
        onPress={() => {
          navigation.navigate('MateInfo', {
            userId: item.user.id,
          });
        }}>
        <Avatar
          source={{
            uri: envConfig.STATIC_URL + item.user.user_avatar,
          }}
        />
        <View marginL-10>
          <Text text80BL>{item.remark}</Text>
          <View width={210}>
            <Text text90L marginT-5 grey30>
              {item.validate_msg}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View flexG row>
        <View center>
          <Text grey30 text90L>
            {t('mate.refused')}
          </Text>
        </View>
        <Button
          marginL-8
          label={t('common.delete')}
          borderRadius={6}
          text70L
          avoidMinWidth={true}
          outline
          outlineColor={Colors.error}
          size={Button.sizes.xSmall}
          onPress={() => {
            setMateId(item.id);
            setDeleteVisible(true);
          }}
        />
      </View>
    </View>
  );

  /* 顶部导航栏 */
  const routes = [
    {
      key: 'apply',
      title: t('mate.apply'),
      refreshFunc: refreshDataApply,
      screen: (
        <FlatList
          refreshControl={
            <RefreshControl
              colors={[Colors.primary]}
              refreshing={applyLoading}
              onRefresh={refreshDataApply}
            />
          }
          data={applyList}
          renderItem={renderApplyItem}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={onEndReachedApply}
          onEndReachedThreshold={0.8}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={<View height={0.5} bg-grey60 />}
          ListFooterComponent={<View marginB-200 />}
          ListEmptyComponent={
            <View marginT-16 center>
              <Text text90L grey40>
                {t('empty.mate_apply')}
              </Text>
            </View>
          }
        />
      ),
    },
    {
      key: 'refused',
      title: t('mate.refused'),
      refreshFunc: refreshDataRefused,
      screen: (
        <FlatList
          refreshControl={
            <RefreshControl
              colors={[Colors.primary]}
              refreshing={refusedLoading}
              onRefresh={refreshDataRefused}
            />
          }
          data={refusedList}
          renderItem={renderRefuseItem}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={onEndReachedRefused}
          onEndReachedThreshold={0.8}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={<View height={0.5} bg-grey60 />}
          ListFooterComponent={<View marginB-200 />}
          ListEmptyComponent={
            <View marginT-16 center>
              <Text text90L grey40>
                {t('empty.mate_refused')}
              </Text>
            </View>
          }
        />
      ),
    },
  ];

  useEffect(() => {
    refreshDataApply();
  }, []);

  return (
    <View>
      <BaseTopBar
        routes={routes}
        initialIndex={focusedIndex}
        onChange={index => {
          setFocusedIndex(index);
          routes[index].refreshFunc();
        }}
      />

      <BaseDialog
        onConfirm={() => {
          agreeApply();
        }}
        visible={remarkVisible}
        setVisible={setRemarkVisible}
        description={t('mate.remarks')}
        renderBody={
          <TextField
            marginT-8
            placeholder={t('mate.remark_placeholder')}
            floatingPlaceholder
            onChangeText={value => {
              setRemark(value);
            }}
            maxLength={10}
            showCharCounter={true}
          />
        }
      />
      <BaseDialog
        title={true}
        onConfirm={() => {
          refuseApply();
        }}
        visible={refusedVisible}
        setVisible={setRefusedVisible}
        description={t('mate.refuse_tips')}
      />

      <BaseDialog
        title={true}
        onConfirm={() => {
          deleteApplyInfo();
        }}
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        description={t('mate.delete_tips')}
      />
    </View>
  );
};

export default NewMate;
