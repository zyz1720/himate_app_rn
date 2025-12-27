import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Colors,
  Image,
  TouchableOpacity,
  Avatar,
} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {getFavoritesDetail} from '@api/favorites';
import {getMusicFromFavorites} from '@api/music';
import {isEmptyObject} from '@utils/common/object_utils';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import MusicList from '@components/music/MusicList';
import FavoriteModal from '@components/music/FavoriteModal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';
import dayjs from 'dayjs';

const FavoritesDetail = ({navigation, route}) => {
  const {favoritesId} = route.params || {};
  const {t} = useTranslation();
  const {envConfig} = useConfigStore();
  const {userInfo} = useUserStore();

  // 获取收藏夹音乐列表
  const getMusicList = async params => {
    return getMusicFromFavorites(favoritesId, params);
  };

  const {list,total, onEndReached, refreshData} = useInfiniteScroll(getMusicList);

  /* 获取收藏夹详情 */
  const [loading, setLoading] = useState(false);
  const [favoritesInfo, setFavoritesInfo] = useState({});

  const getFavoritesInfo = async () => {
    try {
      setLoading(true);
      const res = await getFavoritesDetail(favoritesId);
      if (res.code === 0) {
        setFavoritesInfo(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (favoritesId) {
      getFavoritesInfo();
      refreshData();
    }
  }, [favoritesId]);

  const [detailModalVisible, setDetailModalVisible] = useState(false);

  return (
    <>
      {isEmptyObject(favoritesInfo) ? null : (
        <>
          <View padding-24 row spread>
            <View flexS row width={'70%'}>
              <TouchableOpacity
                onPress={() => {
                  setDetailModalVisible(true);
                }}>
                <Image
                  source={{
                    uri:
                      envConfig.THUMBNAIL_URL + favoritesInfo?.favorites_cover,
                  }}
                  errorSource={require('@assets/images/favorites_cover.jpg')}
                  style={styles.image}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDetailModalVisible(true);
                }}>
                <View marginL-12>
                  <Text text60 grey10 marginT-4 numberOfLines={2}>
                    {favoritesInfo?.favorites_name}
                  </Text>
                  <View row centerV marginT-10>
                    <Avatar
                      size={26}
                      source={{
                        uri:
                          envConfig.STATIC_URL + favoritesInfo?.user?.user_avatar,
                      }}
                      imageProps={{errorSource: require('@assets/images/empty.jpg')}}
                      backgroundColor={Colors.transparent}
                    />
                    <Text text90 marginL-4 grey20>
                      {favoritesInfo?.user?.user_name}
                    </Text>
                  </View>
                  <Text marginT-10 text90L grey40>
                    {t('common.created') +
                      dayjs(favoritesInfo?.create_time).format('YYYY/MM/DD')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {favoritesInfo?.favorites_uid === userInfo?.id ? (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('EditFavorites', {
                    favoritesId: favoritesInfo?.id,
                  });
                }}
                row
                centerV>
                <FontAwesome name="edit" color={Colors.grey40} size={20} />
                <Text marginL-4 text80BO grey40>
                  {t('common.edit')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
          </View>
          <TouchableOpacity
            paddingH-16
            onPress={() => {
              setDetailModalVisible(true);
            }}>
            <Text grey20 text70BO>
              {t('music.favorites_remarks')}
            </Text>
            <Text grey40 text90L marginT-4 numberOfLines={1}>
              {favoritesInfo.favorites_remarks || t('empty.introduction')}
            </Text>
          </TouchableOpacity>
        </>
      )}
      <View paddingH-12 marginT-12>
        <MusicList
          list={list}
          total={total}
          favoriteId={favoritesId}
          refreshList={refreshData}
          onEndReached={onEndReached}
          isOneself={favoritesInfo?.favorites_uid === userInfo?.id}
        />
      </View>
      <FavoriteModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        backgroundImg={favoritesInfo?.favorites_cover}
        title={favoritesInfo?.favorites_name}
        remarks={favoritesInfo?.favorites_remarks}
        userAvatar={favoritesInfo?.user?.user_avatar}
        userName={favoritesInfo?.user?.user_name}
      />
      {loading ? <FullScreenLoading /> : null}
    </>
  );
};
const styles = StyleSheet.create({
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  userName: {
    maxWidth: 80,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
export default FavoritesDetail;
