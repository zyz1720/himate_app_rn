import React, {useState, useRef, useEffect} from 'react';
import {View, Text, Card, Colors, Button, TextField} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {getMusic} from '@api/music';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {useTranslation} from 'react-i18next';
import MusicList from '@components/music/MusicList';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';

const SearchMusic = () => {
  const {t} = useTranslation();
  const {list, total, loading, onEndReached, refreshData} =
    useInfiniteScroll(getMusic);
  /* 获取收藏夹列表 */
  const [keyword, setKeyword] = useState('');

  return (
    <>
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
          <View row centerV marginL-4 marginB-12>
            <FontAwesome name="clock-o" color={Colors.blue40} size={18} />
            <Text text70BO blue40 marginL-4>
              {t('music.recent_update')}
            </Text>
          </View>
          <MusicList
            heightScale={0.8}
            list={list}
            total={total}
            onEndReached={onEndReached}
          />
        </View>
      </View>
      {loading ? <FullScreenLoading /> : null}
    </>
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
