import React, {useEffect, useState} from 'react';
import {View, Colors} from 'react-native-ui-lib';
import {getMateList, getApplyList} from '@api/mate';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  getLocalMates,
  setLocalMateInfo,
  clearLocalMateInfo,
} from '@utils/realm/useMateInfo';
import ListItem from '@components/common/ListItem';
import MateList from '@components/mate/MateList';

const Mate = ({navigation}) => {
  const isFocused = useIsFocused();
  const {t} = useTranslation();

  const [mateList, setMateList] = useState([]);
  /*   好友列表 */
  const {list, loading, onRefresh, refreshData, onEndReached} =
    useInfiniteScroll(getMateList);
  /* 申请好友数量 */
  const [applyCount, setApplyCount] = useState(null);
  const getApplyListFunc = () => {
    getApplyList()
      .then(res => {
        if (res.code === 0) {
          setApplyCount(res.data.total);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (isFocused) {
      getApplyListFunc();
      refreshData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (list.length) {
      setMateList(list);
      clearLocalMateInfo();
      setLocalMateInfo(list);
    }
  }, [list]);

  useEffect(() => {
    setMateList(getLocalMates());
  }, []);

  return (
    <View>
      <View>
        <View flexS paddingV-4 backgroundColor={Colors.white}>
          <ListItem
            itemName={t('mate.new_mate')}
            iconName={'user'}
            iconColor={Colors.primary}
            showBadge={true}
            badgeCount={applyCount}
            onConfirm={() => {
              navigation.navigate('NewMate');
            }}
          />
          <View marginT-8>
            <ListItem
              itemName={t('mate.my_groups')}
              iconName={'group'}
              iconColor={Colors.success}
              iconSize={20}
              onConfirm={() => {
                navigation.navigate('GroupList');
              }}
            />
          </View>
        </View>
        <MateList
          loading={loading}
          onRefresh={onRefresh}
          originalList={mateList}
          onEndReached={onEndReached}
          onConfirm={item => {
            navigation.navigate('MateInfo', {
              userId: item.theOther.id,
            });
          }}
        />
      </View>
    </View>
  );
};

export default Mate;
