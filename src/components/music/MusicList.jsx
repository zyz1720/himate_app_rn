import React, {useState} from 'react';
import {
  StyleSheet,
  Modal,
  Vibration,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  View,
  Text,
  Colors,
  TouchableOpacity,
  Card,
  Button,
  Checkbox,
  Image,
  Dialog,
  ProgressBar,
} from 'react-native-ui-lib';
import {useScreenDimensions} from '@components/contexts/ScreenDimensionsContext';
import {useToast} from '@components/common/useToast';
import {isEmptyObject} from '@utils/common/object_utils';
import {getOneselfFavorites} from '@api/favorites';
import {
  getMusicIsLiked,
  appendMusicToFavorites,
  removeMusicToFavorites,
  likeMusic,
  dislikeMusic,
} from '@api/music';
import {downloadFile, getFileExt} from '@utils/system/file_utils';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {renderMusicTitle, renderArtists} from '@utils/system/lyric_utils';
import {useMusicCtrl} from './MusicController';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

const MusicList = props => {
  const {
    list = [],
    total = 0,
    onEndReached = () => {},
    onMusicPress = () => {},
    favoriteId,
    isOneself = false,
    isLocal = false,
    rightBut = null,
    heightScale = 1,
    loading = false,
    onRefresh = () => {},
    listHeader = null,
  } = props;
  const {fullHeight, statusBarHeight} = useScreenDimensions();
  const {t} = useTranslation();
  const {showToast} = useToast();
  const {envConfig} = useConfigStore();
  const {
    playingMusic,
    addPlayList,
    unshiftPlayList,
    setPlayingMusic,
    setPlayList,
  } = useMusicCtrl();

  console.log('MusicList');

  /* 音乐是否收藏 */
  const [isLiked, setIsLiked] = useState(false);
  const getMusicIsLikedFunc = async id => {
    try {
      const res = await getMusicIsLiked(id);
      if (res.code === 0) {
        setIsLiked(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 个人歌单列表
  const {
    list: favoritesList,
    refreshData: refreshFavoritesList,
    onEndReached: onFavoritesEndReached,
  } = useInfiniteScroll(getOneselfFavorites);

  // 操作栏
  const [modalVisible, setModalVisible] = useState(false);

  // 选择歌单
  const [favoriteVisible, setFavoriteVisible] = useState(false);

  /* 多选 */
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelect, setIsAllSelect] = useState(false);

  /* 重置多选 */
  const resetMultiSelect = () => {
    setIsMultiSelect(false);
    setIsAllSelect(false);
    setSelectedIds([]);
  };

  /* 音乐选项 */
  const [nowMusic, setNowMusic] = useState({});
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState([]);

  /* 操作选项 */
  const handleMusicOptions = [
    {
      title: t('music.add_to_play_list'),
      icon: 'login',
      iconColor: Colors.grey30,
      onPress: () => {
        if (isMultiSelect) {
          const selectedMusic = list.filter(item =>
            selectedIds.includes(item.id),
          );
          addPlayList(selectedMusic);
        } else {
          addPlayList([nowMusic]);
        }
        showToast(t('music.add_success'), 'success');
        setModalVisible(false);
        resetMultiSelect();
      },
    },
    {
      title: isLiked ? t('music.already_favorite') : t('music.favorite'),
      icon: isLiked ? 'heart' : 'hearto',
      iconColor: isLiked ? Colors.red50 : Colors.grey30,
      onPress: () => {
        let musicIds = [];
        if (isMultiSelect) {
          musicIds = selectedIds;
        } else {
          musicIds = [nowMusic.id];
        }
        if (musicIds.length === 0) {
          showToast(t('music.please_select_music'), 'warning');
          return;
        }
        setIsLiked(async prev => {
          if (prev) {
            try {
              const res = await dislikeMusic({
                ids: musicIds,
              });
              if (res.code === 0) {
                showToast(t('music.unfavorite'), 'success');
                return;
              }
              showToast(res.message, 'error');
            } catch (error) {
              console.error(error);
            }
          } else {
            try {
              const res = await likeMusic({
                ids: musicIds,
              });
              if (res.code === 0) {
                showToast(t('music.already_favorite'), 'success');
                return;
              }
              showToast(res.message, 'error');
            } catch (error) {
              console.error(error);
            }
          }
          return !prev;
        });
        setNowMusic({});
        setModalVisible(false);
        resetMultiSelect();
      },
    },
    {
      title: t('music.add_to_favorites'),
      icon: 'pluscircleo',
      iconColor: Colors.grey30,
      onPress: () => {
        setModalVisible(false);
        setFavoriteVisible(true);
        refreshFavoritesList();
      },
    },
    {
      title: t('common.download'),
      icon: 'download',
      iconColor: Colors.grey30,
      onPress: () => {
        setModalVisible(false);
        saveFiles();
      },
    },
    {
      title: t('music.remove_from_favorites'),
      icon: 'delete',
      iconColor: Colors.grey30,
      onPress: () => {
        let musicIds = [];
        if (isMultiSelect) {
          musicIds = selectedIds;
        } else {
          musicIds = [nowMusic.id];
        }
        if (musicIds.length === 0) {
          showToast(t('music.please_select'), 'warning');
          return;
        }
        removeMusicToFavorites(favoriteId, {
          ids: musicIds,
        })
          .then(res => {
            if (res.code === 0) {
              showToast(t('music.remove_success'), 'success');
            } else {
              showToast(res.message, 'error');
            }
          })
          .finally(() => {
            onRefresh();
            setNowMusic({});
            setModalVisible(false);
            resetMultiSelect();
          });
      },
    },
  ];

  if (!favoriteId || !isOneself) {
    handleMusicOptions.pop();
  }

  /* 添加到歌单 */
  const addMusicToFavorites = async () => {
    let musicIds = [];
    if (isMultiSelect) {
      musicIds = selectedIds;
    } else {
      musicIds = [nowMusic.id];
    }
    if (musicIds.length === 0) {
      showToast(t('music.please_select'), 'warning');
      return;
    }
    try {
      const res = await appendMusicToFavorites({
        ids: musicIds,
        favoritesIds: selectedFavoriteIds,
      });
      if (res.code === 0) {
        showToast(
          t('music.add_to_favorites_success', {
            count1: musicIds.length,
            count2: selectedFavoriteIds.length,
          }),
          'success',
        );
        return;
      }
      showToast(res.message, 'error');
    } catch (error) {
      console.error(error);
    } finally {
      resetMultiSelect();
      setSelectedFavoriteIds([]);
      setNowMusic({});
    }
  };

  /* 保存文件 */
  const [showDialog, setShowDialog] = useState(false); // 下载进度条
  const [downloadProgress, setDownloadProgress] = useState(0); // 下载进度
  const [fileNum, setFileNum] = useState(1); // 总文件数
  const [nowFileIndex, setNowFileIndex] = useState(1); // 当前文件索引
  const saveFiles = async () => {
    setShowDialog(true);
    let musicIds = [];
    if (isMultiSelect) {
      musicIds = selectedIds;
    } else {
      musicIds = [nowMusic.id];
    }
    if (musicIds.length === 0) {
      showToast(t('music.please_select'), 'warning');
      return;
    }
    const selectedFiles = [];
    list.forEach(item => {
      if (musicIds.includes(item.id)) {
        selectedFiles.push(item);
      }
    });
    setFileNum(selectedFiles.length);
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setNowFileIndex(i + 1);
      const savePath = await downloadFile(
        envConfig.STATIC_URL + file.file_key,
        {
          fileName: `${file.title} - ${file.artist.replace(
            /\//g,
            ' - ',
          )}.${getFileExt(file.file_key)}`,
          onProgress: num => setDownloadProgress(num),
        },
      );
      setDownloadProgress(0);
      if (!savePath) {
        showToast(t('music.download_failed', {index: i + 1}), 'error');
      }
    }
    showToast(t('music.download_complete'), 'success');
    setShowDialog(false);
    setFileNum(1);
    setNowFileIndex(1);
    resetMultiSelect();
    setNowMusic({});
  };

  const renderItem = ({item}) => (
    <View row centerV>
      {isMultiSelect ? (
        <Checkbox
          marginR-12
          color={Colors.primary}
          size={20}
          borderRadius={10}
          value={selectedIds.includes(item.id)}
          onValueChange={value => {
            if (value) {
              setSelectedIds(prevItem => {
                const newItem = [...new Set([...prevItem, item.id])];
                return newItem;
              });
            } else {
              setSelectedIds(prevItem => {
                const newItem = prevItem.filter(id => id !== item.id);
                return newItem;
              });
            }
          }}
        />
      ) : null}
      <Card flexG marginB-6 enableShadow={false} backgroundColor={Colors.white}>
        <TouchableOpacity
          flexS
          centerV
          padding-12
          onLongPress={() => {
            if (isLocal) {
              return;
            }
            setIsMultiSelect(true);
            Vibration.vibrate(50);
          }}
          onPress={() => {
            onMusicPress(item);
            setPlayingMusic(item);
            unshiftPlayList([item]);
          }}>
          <View row spread centerV>
            <View width={'80%'}>
              <Text
                text80BO
                grey10
                numberOfLines={1}
                color={
                  playingMusic?.id === item.id ? Colors.primary : Colors.grey10
                }>
                {item?.title}
              </Text>
              <Text
                text90L
                grey30
                marginT-4
                numberOfLines={1}
                color={
                  playingMusic?.id === item.id ? Colors.primary : Colors.grey10
                }>
                {renderArtists(item)}
              </Text>
            </View>
            <View row bottom centerV spread>
              <TouchableOpacity
                style={styles.musicBut}
                onPress={() => {
                  addPlayList([item]);
                  showToast(t('music.add_success'), 'success');
                }}>
                <AntDesign name="plus" color={Colors.grey50} size={22} />
              </TouchableOpacity>
              {isMultiSelect || isLocal ? null : (
                <TouchableOpacity
                  style={styles.musicBut}
                  marginL-4
                  onPress={() => {
                    setNowMusic(item);
                    getMusicIsLikedFunc(item.id);
                    setModalVisible(true);
                  }}>
                  <AntDesign name="bars" color={Colors.grey50} size={24} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </View>
  );

  return (
    <View>
      <View row centerV spread>
        <View row centerV>
          <TouchableOpacity
            style={styles.musicBut}
            onPress={() => {
              setPlayList(list);
              setPlayingMusic(list[0]);
            }}>
            <FontAwesome name="play-circle" color={Colors.grey50} size={26} />
          </TouchableOpacity>
          <Text marginL-4 text80BO grey20>
            {t('music.total_music', {total: total || list.length})}
          </Text>
        </View>
        {rightBut}
      </View>
      <View row centerV spread marginB-12>
        <View />
        {isMultiSelect ? (
          <View row centerV marginT-12>
            <Button
              marginR-12
              size={'xSmall'}
              label={t('common.operation')}
              backgroundColor={Colors.primary}
              onPress={() => {
                setModalVisible(true);
              }}
            />
            <Button
              marginR-12
              size={'xSmall'}
              label={
                isAllSelect ? t('common.unselect_all') : t('common.select_all')
              }
              backgroundColor={Colors.success}
              onPress={() => {
                setIsAllSelect(prev => {
                  if (!prev) {
                    setSelectedIds(list.map(item => item.id));
                  } else {
                    setSelectedIds([]);
                  }
                  return !prev;
                });
              }}
            />
            <Button
              size={'xSmall'}
              label={t('common.cancel')}
              backgroundColor={Colors.blue40}
              onPress={() => {
                resetMultiSelect();
              }}
            />
          </View>
        ) : null}
      </View>
      <View height={fullHeight * heightScale}>
        <FlatList
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              colors={[Colors.primary]}
              onRefresh={onRefresh}
            />
          }
          data={list}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.8}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View marginT-16 center>
              <Text text90L grey40>
                {t('empty.music')}
              </Text>
            </View>
          }
          ListFooterComponent={
            list.length > 6 ? (
              <View marginB-280 padding-12 center>
                <Text text90L grey40>
                  {t('common.footer')}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setNowMusic({});
        }}>
        <View
          height={fullHeight + statusBarHeight}
          backgroundColor={Colors.black4}>
          <View height={fullHeight * 0.46} style={styles.CtrlModal} padding-12>
            <TouchableOpacity
              style={styles.musicBut}
              onPress={() => {
                setModalVisible(false);
                setNowMusic({});
              }}>
              <AntDesign name="close" color={Colors.grey40} size={20} />
            </TouchableOpacity>
            {isEmptyObject(nowMusic) ? null : (
              <>
                <Text center text70BO marginT-12 grey30>
                  {renderMusicTitle(nowMusic)}
                </Text>
                <View paddingH-32 marginT-12>
                  <View height={1} backgroundColor={Colors.grey70} />
                </View>
              </>
            )}
            <FlatList
              data={handleMusicOptions}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({item}) => (
                <View row centerV>
                  <TouchableOpacity
                    flexG
                    row
                    centerV
                    padding-12
                    paddingH-32
                    onPress={item.onPress}>
                    <AntDesign
                      name={item.icon}
                      color={item.iconColor}
                      size={20}
                    />
                    <Text text70 marginL-12 grey30>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View marginT-16 center>
                  <Text text90L grey30>
                    {t('empty.play_music')}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={favoriteVisible}
        statusBarTranslucent
        onRequestClose={() => {
          setFavoriteVisible(!favoriteVisible);
          setNowMusic({});
        }}>
        <View
          height={fullHeight + statusBarHeight}
          backgroundColor={Colors.black4}>
          <View height={fullHeight * 0.6} style={styles.CtrlModal} padding-12>
            <View row spread centerV paddingH-6>
              <TouchableOpacity
                style={styles.musicBut}
                onPress={() => {
                  setFavoriteVisible(false);
                  setNowMusic({});
                }}>
                <AntDesign name="close" color={Colors.grey40} size={20} />
              </TouchableOpacity>
              <Button
                label={t('common.confirm')}
                size={'small'}
                link
                linkColor={Colors.primary}
                onPress={() => {
                  setFavoriteVisible(false);
                  addMusicToFavorites();
                }}
              />
            </View>
            <FlatList
              data={favoritesList}
              keyExtractor={(_, index) => index.toString()}
              onEndReached={onFavoritesEndReached}
              onEndReachedThreshold={0.8}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View marginB-100 />}
              ListEmptyComponent={
                <View marginT-16 center>
                  <Text text90L grey40>
                    {t('music.empty_favorites_tips')}
                  </Text>
                </View>
              }
              renderItem={({item}) => (
                <View marginT-8 row centerV paddingH-12>
                  <Checkbox
                    marginR-12
                    color={Colors.primary}
                    size={20}
                    borderRadius={10}
                    disabled={favoriteId === item.id}
                    value={selectedFavoriteIds.includes(item.id)}
                    onValueChange={value => {
                      if (value) {
                        setSelectedFavoriteIds(prevItem => {
                          const newItem = [...new Set([...prevItem, item.id])];
                          return newItem;
                        });
                      } else {
                        setSelectedFavoriteIds(prevItem => {
                          const newItem = prevItem.filter(id => id !== item.id);
                          return newItem;
                        });
                      }
                    }}
                  />
                  <View row centerV padding-6>
                    <Image
                      source={{
                        uri: envConfig.THUMBNAIL_URL + item.favorites_cover,
                      }}
                      errorSource={require('@assets/images/favorites_cover.jpg')}
                      style={styles.favoritesCover}
                    />
                    <View centerV marginL-12>
                      <Text>{item.favorites_name}</Text>
                      <Text marginT-4 text90L grey40>
                        {t('music.total_music', {total: item.musicCount})}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Card padding-16>
          <Text text70BL marginB-8>
            {t('music.download_music')}
          </Text>
          <View>
            <Text marginB-16>
              {t('music.download_complete_tips', {
                total: fileNum,
                now: nowFileIndex,
              })}
            </Text>
            {downloadProgress ? (
              <ProgressBar
                progress={downloadProgress}
                progressColor={Colors.primary}
              />
            ) : null}
          </View>
        </Card>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  CtrlModal: {
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 2,
  },
  favoritesCover: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderColor: Colors.white,
    borderWidth: 1,
  },
});

export default MusicList;
