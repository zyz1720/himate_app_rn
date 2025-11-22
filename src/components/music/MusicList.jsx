import React, {useEffect, useState} from 'react';
import {StyleSheet, Modal, Vibration, FlatList} from 'react-native';
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
import {statusBarHeight, fullHeight} from '@style/index';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useToast} from '@utils/hooks/useToast';
import {isEmptyObject} from '@utils/common/object_utils';
import {
  getDefaultFavorites,
  updateFavorites,
  getFavoritesDetail,
  getOneselfFavorites,
} from '@api/favorites';
import {downloadFile, getFileExt} from '@utils/system/file_utils';
import {useConfigStore} from '@store/configStore';
import {useMusicStore} from '@store/musicStore';
import {useTranslation} from 'react-i18next';

const MusicList = props => {
  const {
    list = [],
    total = 0,
    onEndReached = () => {},
    onPress = () => {},
    favoriteId,
    refreshList = () => {},
    isOneself = false,
    isLocal = false,
    rightBut = null,
    heightScale = 0.92,
  } = props;
  const {t} = useTranslation();
  const {showToast} = useToast();
  const {envConfig} = useConfigStore();
  const {
    playingMusic,
    addPlayList,
    unshiftPlayList,
    setPlayingMusic,
    setPlayList,
  } = useMusicStore();

  /* 获取用户收藏的音乐列表 */
  const [collectMusic, setCollectMusic] = useState([]);
  const getAllMusicList = async _userId => {
    try {
      const res = await getDefaultFavorites();
      if (res.success) {
        setCollectMusic(res.data.music);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 个人歌单列表
  const [pageNum, setPageNum] = useState(0);
  const [favoritesList, setFavoritesList] = useState([]);
  const getUserFavoritesList = async _userId => {
    try {
      const res = await getOneselfFavorites({
        pageSize: pageNum * 20,
        creator_uid: _userId,
      });
      if (res.success) {
        // console.log(res.data.list);
        setFavoritesList(res.data.list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 操作栏
  const [modalVisible, setModalVisible] = useState(false);

  // 选择歌单
  const [favoriteVisible, setFavoriteVisible] = useState(false);

  /* 多选 */
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelect, setIsAllSelect] = useState(false);

  /* 重置多选 */
  const resetMultiSelect = () => {
    setIsMultiSelect(false);
    setIsAllSelect(false);
    setSelectedItems([]);
  };

  /* 是否收藏 */
  const isFavorite = musicId => {
    return collectMusic.some(item => item.id === musicId);
  };

  /* 音乐选项 */
  const [nowMusic, setNowMusic] = useState({});
  const [selectedFavoriteItems, setSelectedFavoriteItems] = useState([]);

  const handleMusicOptions = [
    {
      title: t('music.add_to_play_list'),
      icon: 'login',
      iconColor: Colors.grey30,
      onPress: () => {
        if (isMultiSelect) {
          const selectedMusic = list.filter(item =>
            selectedItems.includes(item.id),
          );
          addPlayList(selectedMusic);
        } else {
          addPlayList([nowMusic]);
        }
        showToast(t('music.add_success'), 'success');
        setModalVisible(false);
      },
    },
    {
      title: isFavorite(nowMusic?.id)
        ? t('music.already_favorite')
        : t('music.favorite'),
      icon: isFavorite(nowMusic?.id) ? 'heart' : 'hearto',
      iconColor: isFavorite(nowMusic?.id) ? Colors.red50 : Colors.grey30,
      onPress: () => {
        let musicIds = [];
        if (isMultiSelect) {
          musicIds = selectedItems;
        } else {
          musicIds = [nowMusic.id];
        }
        if (musicIds.length === 0) {
          showToast(t('music.please_select_music'), 'warning');
          return;
        }
        // editDefaultFavorites({
        //   handleType: isFavorite(nowMusic?.id) ? 'remove' : 'add',
        //   creator_uid: userId,
        //   musicIds,
        // })
        //   .then(res => {
        //     if (res.success) {
        //       showToast(
        //         isFavorite(nowMusic?.id) ? '已取消收藏' : '已收藏',
        //         'success',
        //       );
        //     } else {
        //       showToast(res.message, 'error');
        //     }
        //     setNowMusic({});
        //     setModalVisible(false);
        //     // getAllMusicList(userId);
        //   })
        //   .catch(error => {
        //     console.error(error);
        //     setNowMusic({});
        //     setModalVisible(false);
        //   });
      },
    },
    {
      title: '添加到歌单',
      icon: 'pluscircleo',
      iconColor: Colors.grey30,
      onPress: () => {
        setModalVisible(false);
        setFavoriteVisible(true);
      },
    },
    {
      title: '下载',
      icon: 'download',
      iconColor: Colors.grey30,
      onPress: () => {
        setModalVisible(false);
        saveFiles();
      },
    },
    {
      title: '移出该歌单',
      icon: 'delete',
      iconColor: Colors.grey30,
      onPress: () => {
        let musicIds = [];
        if (isMultiSelect) {
          musicIds = selectedItems;
        } else {
          musicIds = [nowMusic.id];
        }
        if (musicIds.length === 0) {
          showToast('请选择歌曲', 'warning');
          return;
        }
        updateFavorites({
          id: favoriteId,
          handleType: 'remove',
          musicIds,
        })
          .then(res => {
            if (res.success) {
              showToast('已移出该歌单', 'success');
            } else {
              showToast(res.message, 'error');
            }
            refreshList();
            setNowMusic({});
            setModalVisible(false);
          })
          .catch(error => {
            console.error(error);
            setNowMusic({});
            setModalVisible(false);
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
      musicIds = selectedItems;
    } else {
      musicIds = [nowMusic.id];
    }
    if (musicIds.length === 0) {
      showToast(t('music.please_select'), 'warning');
      return;
    }
    try {
      let count = 0;
      for (let i = 0; i < selectedFavoriteItems.length; i++) {
        const element = selectedFavoriteItems[i];
        const updateRes = await updateFavorites({
          id: element,
          handleType: 'add',
          musicIds,
        });
        if (updateRes.success) {
          count += 1;
        }
      }
      if (count > 0) {
        showToast('成功添加歌曲到' + count + '个歌单', 'success');
      }
      resetMultiSelect();
      setSelectedFavoriteItems([]);
      setNowMusic({});
    } catch (error) {
      showToast('添加歌曲到歌单失败', 'error');
      console.error(error);
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
      musicIds = selectedItems;
    } else {
      musicIds = [nowMusic.id];
    }
    if (musicIds.length === 0) {
      showToast('请选择要下载的歌曲', 'warning');
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
      if (savePath) {
        // showToast('保存成功', 'success');
      } else {
        showToast(`第${i + 1}首歌曲下载失败`, 'error');
      }
    }
    showToast('歌曲下载完成', 'success');
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
          value={selectedItems.includes(item.id)}
          onValueChange={value => {
            if (value) {
              setSelectedItems(prevItem => {
                const newItem = [...prevItem, item.id];
                return newItem;
              });
            } else {
              setSelectedItems(prevItem => {
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
            onPress(item);
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
                {item.title}
              </Text>
              <Text
                text90L
                grey30
                marginT-4
                numberOfLines={1}
                color={
                  playingMusic?.id === item.id ? Colors.primary : Colors.grey10
                }>
                {(item.artists && item.artists?.length > 0
                  ? item.artists.join('/')
                  : t('music.empty_artist')) +
                  ' - ' +
                  (item.album ?? t('music.empty_album'))}
              </Text>
            </View>
            <View row bottom centerV spread>
              <TouchableOpacity
                style={styles.musicBut}
                onPress={() => {
                  addPlayList([item]);
                  showToast(t('music.add_success'), 'success');
                }}>
                <AntDesign name="pluscircleo" color={Colors.grey50} size={20} />
              </TouchableOpacity>
              {isMultiSelect || isLocal ? null : (
                <TouchableOpacity
                  style={styles.musicBut}
                  marginL-6
                  onPress={() => {
                    setNowMusic(item);
                    setModalVisible(true);
                  }}>
                  <AntDesign
                    name="menuunfold"
                    color={Colors.grey50}
                    size={20}
                  />
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
          <Text marginL-12 text80BO grey20>
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
                    setSelectedItems(list.map(item => item.id));
                  } else {
                    setSelectedItems([]);
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
          data={list}
          keyExtractor={(item, index) => item + index}
          onEndReached={() => {
            onEndReached();
          }}
          onEndReachedThreshold={0.8}
          renderItem={renderItem}
          ListEmptyComponent={
            <View marginT-16 center>
              <Text text90L grey40>
                {t('empty.music')}
              </Text>
            </View>
          }
          ListFooterComponent={
            list.length > 6 ? (
              <View marginB-100 padding-12 center>
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
                  {nowMusic?.title +
                    ' - ' +
                    (nowMusic?.artists?.join('/') || t('music.empty_artist'))}
                </Text>
                <View paddingH-32 marginT-12>
                  <View height={1} backgroundColor={Colors.grey70} />
                </View>
              </>
            )}
            <FlatList
              data={handleMusicOptions}
              keyExtractor={(item, index) => item + index}
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
              keyExtractor={(item, index) => item + index}
              onEndReached={() => {
                setPageNum(prev => prev + 1);
              }}
              ListEmptyComponent={
                <View marginT-16 center>
                  <Text text90L grey40>
                    {t('music.empty_favorites_tips')}
                  </Text>
                </View>
              }
              renderItem={({item, index}) => (
                <View marginT-8 row centerV paddingH-12>
                  <Checkbox
                    marginR-12
                    color={Colors.primary}
                    size={20}
                    borderRadius={10}
                    disabled={favoriteId === item.id}
                    value={selectedFavoriteItems.includes(item.id)}
                    onValueChange={value => {
                      if (value) {
                        setSelectedFavoriteItems(prevItem => {
                          const newItem = [...prevItem, item.id];
                          return newItem;
                        });
                      } else {
                        setSelectedFavoriteItems(prevItem => {
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
            歌曲下载
          </Text>
          <View>
            <Text marginB-16>
              共
              <Text text70 blue30 marginB-16>
                {fileNum}
              </Text>
              首歌曲，正在下载第{nowFileIndex}
              首歌曲...
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
