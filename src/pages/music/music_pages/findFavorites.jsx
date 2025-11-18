import React, {useState, useRef, useEffect} from 'react';
import {View, Card, Colors, Button, TextField} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {getFavoritesList} from '../../../api/music';
import FavoritesList from '../../../components/music/FavoritesList';
import FullScreenLoading from '../../../components/common/FullScreenLoading';

const FindFavorites = ({navigation}) => {
  /* 获取收藏夹列表 */
  const [isLoading, setIsLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pageNum, setPageNum] = useState(0);
  const [favoritesList, setFavoritesList] = useState([]);
  const pageSize = 20;
  const isEnd = useRef(false);
  const getAllFavoritesList = async () => {
    try {
      setIsLoading(pageNum < 2);
      const res = await getFavoritesList({
        pageNum,
        pageSize,
        is_public: 1,
        favorites_name: keyword,
      });
      if (res.success) {
        const {list} = res.data;
        setFavoritesList(prev => [...prev, ...list]);
        if (list.length < pageSize && pageNum !== 0) {
          isEnd.current = true;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    isEnd.current = false;
    setPageNum(0);
    setFavoritesList([]);
  };

  useEffect(() => {
    getAllFavoritesList();
  }, [pageNum]);

  return (
    <>
      <View padding-12>
        <Card row centerV>
          <TextField
            containerStyle={styles.input}
            placeholder={'请输入歌单关键字'}
            value={keyword}
            onChangeText={value => {
              setKeyword(value);
              if (!value) {
                getAllFavoritesList();
              }
            }}
          />
          <Button
            label={'搜索'}
            link
            linkColor={Colors.primary}
            onPress={() => {
              resetState();
              getAllFavoritesList();
            }}
          />
        </Card>
        <View marginT-12>
          <FavoritesList
            List={favoritesList}
            OnPress={item => {
              navigation.navigate('FavoritesDetail', {
                favoritesId: item.id,
              });
            }}
            OnEndReached={() => {
              if (!isEnd.current) {
                setPageNum(prev => prev + 1);
              }
            }}
          />
        </View>
      </View>
      {isLoading ? <FullScreenLoading /> : null}
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
