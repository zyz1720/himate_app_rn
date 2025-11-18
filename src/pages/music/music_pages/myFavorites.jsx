import React, {useState, useEffect} from 'react';
import {View} from 'react-native-ui-lib';
import {useSelector} from 'react-redux';
import {getFavoritesDetail} from '../../../api/music';
import MusicList from '../../../components/music/MusicList';
import FullScreenLoading from '../../../components/common/FullScreenLoading';

const MyFavorites = () => {
  const userId = useSelector(state => state.userStore.userId);

  const [music, setMusic] = useState([]);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* 获取用户收藏的音乐列表 */
  const getAllMusicList = async _userId => {
    try {
      setLoading(true);
      const res = await getFavoritesDetail({
        creator_uid: _userId,
        is_default: 1,
      });
      if (res.success) {
        setFavoriteId(res.data.id);
        setMusic(res.data.music);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getAllMusicList(userId);
    }
  }, [userId]);

  return (
    <View padding-12>
      {loading ? <FullScreenLoading /> : null}
      <MusicList
        HeightScale={0.92}
        List={music}
        FavoriteId={favoriteId}
        RefreshList={() => {
          getAllMusicList(userId);
        }}
        IsOwn={true}
      />
    </View>
  );
};

export default MyFavorites;
