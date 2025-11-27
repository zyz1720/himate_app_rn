import React, {useState, useEffect} from 'react';
import {View, Card, Colors, Button, TextField} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {getFavorites} from '@api/favorites';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {useTranslation} from 'react-i18next';
import FavoritesList from '@components/music/FavoritesList';

const FindFavorites = ({navigation}) => {
  const {t} = useTranslation();
  const {list, onEndReached, loading, refreshData, onRefresh} =
    useInfiniteScroll(getFavorites);

  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

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
          <FavoritesList
            list={list}
            loading={loading}
            onRefresh={onRefresh}
            onPress={item => {
              navigation.navigate('FavoritesDetail', {
                favoritesId: item.id,
              });
            }}
            onEndReached={onEndReached}
          />
        </View>
      </View>
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
export default FindFavorites;
