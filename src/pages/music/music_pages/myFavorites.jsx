import React, {useState, useEffect} from 'react';
import {View} from 'react-native-ui-lib';
import {getMusicFromDefaultFavorites} from '@api/music';
import {getDefaultFavorites} from '@api/favorites';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import MusicList from '@components/music/MusicList';
import FullScreenLoading from '@components/common/FullScreenLoading';

const MyFavorites = () => {
  const [favoritesId, setFavoritesId] = useState(null);
  const {list, loading, onEndReached, onRefresh} = useInfiniteScroll(
    getMusicFromDefaultFavorites,
  );

  const getDefaultFavoritesId = async () => {
    try {
      const res = await getDefaultFavorites();
      if (res.code === 0) {
        setFavoritesId(res.data.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onRefresh();
    getDefaultFavoritesId();
  }, []);

  return (
    <View padding-12>
      <MusicList
        heightScale={0.92}
        list={list}
        favoriteId={favoritesId}
        isOneself={true}
        onEndReached={onEndReached}
        onRefresh={onRefresh}
      />
      {loading ? <FullScreenLoading /> : null}
    </View>
  );
};

export default MyFavorites;
