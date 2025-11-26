import React, {useState, useEffect} from 'react';
import {View, Card, Colors, Button, TextField} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {getMusic} from '@api/music';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {useTranslation} from 'react-i18next';
import MusicList from '@components/music/MusicList';

const SearchMusic = () => {
  const {t} = useTranslation();
  const {list, total, loading, onRefresh, onEndReached, refreshData} =
    useInfiniteScroll(getMusic);
  /* 获取收藏夹列表 */
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <View padding-12>
      <Card row centerV>
        <TextField
          containerStyle={styles.input}
          placeholder={t('common.search_keyword')}
          value={keyword}
          onChangeText={value => {
            setKeyword(value);
            if (!value) {
              refreshData();
            }
          }}
        />
        <Button
          label={t('common.search')}
          link
          linkColor={Colors.primary}
          onPress={() => {
            refreshData({keyword});
          }}
        />
      </Card>
      <View marginT-12>
        <MusicList
          loading={loading}
          list={list}
          total={total}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '86%',
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 42,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
});
export default SearchMusic;
