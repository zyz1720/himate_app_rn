import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Card,
  Colors,
  Image,
  TouchableOpacity,
  GridList,
  TextField,
  Drawer,
  Checkbox,
  Button,
  Switch,
  PanningProvider,
  Dialog,
  Slider,
} from 'react-native-ui-lib';
import {FlatList, StyleSheet, Vibration} from 'react-native';
import {useToast} from '@utils/hooks/useToast';
import {fullHeight, fullWidth} from '@style/index';
import {
  getOneselfFavorites,
  addFavorites,
  getFavorites,
  deleteFavorites,
  importFavorites,
} from '@api/favorites';
import {getMusic, getMusicFromDefaultFavorites} from '@api/music';
import {useConfigStore} from '@store/configStore';
import {useMusicStore} from '@store/musicStore';
import {useUserStore} from '@store/userStore';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BaseDialog from '@components/common/BaseDialog';
import {useRealm} from '@realm/react';
import dayjs from 'dayjs';

const Music = ({navigation}) => {
  const {showToast} = useToast();
  const {t} = useTranslation();
  const realm = useRealm();

  const {userInfo} = useUserStore();
  const {isClosed, randomNum, setRandomNum, setCloseTime, setIsRandomPlay} =
    useMusicStore();
  const {envConfig} = useConfigStore();

  const {list, total, onEndReached, refreshData} =
    useInfiniteScroll(getOneselfFavorites);

  useEffect(() => {
    getDefaultFavoritesCount();
    getAllFavoritesCount();
    getAllMusicCount();
    if (realm) {
      getLocalMusicInfo();
    }
  }, []);

  const [showAddDialog, setShowAddDialog] = useState(false);

  // 宫格列表数据
  const [itemData, setItemData] = useState([
    {
      title: t('music.find_favorites'),
      icon: 'cloud',
      iconColor: Colors.blue50,
      num: 0,
      route: 'FindFavorites',
    },
    {
      title: t('music.recent_play'),
      icon: 'clock-o',
      iconColor: Colors.green50,
      num: 0,
      route: 'LatelyMusic',
    },
    {
      title: t('music.local_music'),
      icon: 'folder-open',
      iconColor: Colors.yellow40,
      num: 0,
      route: 'LocalMusic',
    },
    {
      title: t('music.my_favorites'),
      icon: 'heart',
      iconColor: Colors.red40,
      num: 0,
      route: 'MyFavorites',
    },
  ]);

  /* 默认收藏数量 */
  const getDefaultFavoritesCount = async () => {
    try {
      const res = await getMusicFromDefaultFavorites({pageSize: 0});
      if (res.code === 0) {
        setItemData(prev => {
          prev[3].num = res.data.total;
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* 提交歌单 */
  const [favoritesName, setFavoritesName] = useState('');
  const submitData = async () => {
    setShowAddDialog(false);
    try {
      const addRes = await addFavorites({
        favorites_name: favoritesName,
      });
      if (addRes.code === 0) {
        refreshData();
      }
      showToast(addRes.message, addRes.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /* 删除歌单 */
  const [delVisible, setDelVisible] = useState(false);
  const [delIds, setDelIds] = useState([]);
  const [delName, setDelName] = useState('');
  const delFavorites = async () => {
    try {
      const delRes = await deleteFavorites({
        ids: delIds,
      });
      if (delRes.code === 0) {
        refreshData();
      }
      showToast(delRes.message, delRes.code === 0 ? 'success' : 'error');
      resetMultiSelect();
    } catch (error) {
      console.error(error);
    }
  };

  /* 多选 */
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelect, setIsAllSelect] = useState(false);

  const resetMultiSelect = () => {
    setIsMultiSelect(false);
    setIsAllSelect(false);
    setSelectedItems([]);
  };

  // 最近播放
  const [latelyDay, setLatelyDay] = useState(0);

  /* 获取最近播放数据 */
  const getLocalMusicInfo = () => {
    const playHistory = realm
      .objects('MusicInfo')
      .sorted('updateAt', true)
      .toJSON();
    if (playHistory.length > 0) {
      const latelyMusic = playHistory[0];
      const endDate = dayjs(Number(latelyMusic.updateAt));
      const diffInDays = dayjs().diff(endDate, 'day');
      setLatelyDay(diffInDays);
    }
    const localMusic = realm.objects('LocalMusic').toJSON();
    setItemData(prev => {
      prev[1].num = playHistory.length;
      prev[2].num = localMusic.length;
      return prev;
    });
  };

  /* 定时关闭 */
  const [showAlarmDialog, setShowAlarmDialog] = useState(false);
  const [alarmSwitch, setAlarmSwitch] = useState(false);
  const [alarmTime, setAlarmTime] = useState(0);

  useEffect(() => {
    if (isClosed) {
      setAlarmSwitch(false);
    }
  }, [isClosed]);

  /* 随机播放 */
  const [showRandomDialog, setShowRandomDialog] = useState(false);
  const [randomSwitch, setRandomSwitch] = useState(false);

  // 获取所有歌曲数
  const [allMusicNum, setAllMusicNum] = useState(1);
  const getAllMusicCount = async () => {
    try {
      const res = await getMusic({pageSize: 0});
      if (res.code === 0) {
        setAllMusicNum(res.data.total);
        setRandomNum(1, res.data.total);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAllFavoritesCount = async () => {
    try {
      const res = await getFavorites({pageSize: 0});
      if (res.code === 0) {
        setItemData(prev => {
          prev[0].num = res.data.total;
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 导入外部歌单
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const onImport = async () => {
    try {
      const urlRegex = /https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*/g;
      const urls = importUrl.match(urlRegex);
      if (urls && urls?.[0]) {
        const trueUrl = urls?.[0];
        showToast(t('music.import_loading'), 'success');
        const res = await importFavorites(trueUrl);
        showToast(res.message, res.success ? 'success' : 'error');
        refreshData();
        getAllMusicCount();
      } else {
        showToast(t('music.url_error'), 'error');
      }
    } catch (error) {
      console.error(error);
      showToast(t('music.import_favorites_error'), 'error');
    }
  };

  const scales = ['00:00', '00:30', '01:00', '01:30', '02:00'];

  return (
    <View top padding-16 height={fullHeight}>
      <Card
        borderRadius={20}
        padding-6
        paddingL-12
        row
        centerV
        onPress={() => {
          navigation.navigate('SearchMusic');
        }}>
        <FontAwesome name="search" color={Colors.primary} size={16} />
        <View marginL-8>
          <TextField readOnly placeholder={t('common.search')} />
        </View>
      </Card>
      <Card marginT-16 padding-12>
        <View row centerV marginB-12>
          <View>
            <Image
              source={{uri: envConfig.STATIC_URL + userInfo?.user_avatar}}
              style={styles.image}
            />
          </View>
          <View marginL-12 flexG>
            <View row centerV>
              <Text grey20 text70BO>
                {userInfo?.user_name}
              </Text>
              <View flexS row center marginL-6>
                {userInfo?.sex === 'woman' ? (
                  <FontAwesome name="venus" color={Colors.magenta} size={12} />
                ) : userInfo?.sex === 'man' ? (
                  <FontAwesome name="mars" color={Colors.blue50} size={12} />
                ) : null}
              </View>
            </View>
            <Text grey20 text100L marginT-6>
              {latelyDay > 0 ? (
                <Text grey20 text100L marginT-6>
                  {t('music.recent_play_tips')}
                  <Text blue60 text80L marginT-6>
                    {latelyDay}
                  </Text>
                  {t('music.recent_play_day')}
                </Text>
              ) : (
                t('music.welcome')
              )}
            </Text>
          </View>
        </View>
        <View paddingT-12 row centerV style={styles.funBox}>
          <View width={'50%'} center>
            <TouchableOpacity
              centerV
              row
              onPress={() => {
                setShowRandomDialog(true);
              }}>
              <MaterialIcons
                name="library-music"
                color={randomSwitch ? Colors.primary : Colors.grey50}
                size={20}
              />
              <Text text80 marginL-4 grey30>
                {t('music.random_play')}
              </Text>
            </TouchableOpacity>
          </View>
          <View width={'50%'} center style={styles.rightBox}>
            <TouchableOpacity
              row
              centerV
              onPress={() => {
                setShowAlarmDialog(true);
              }}>
              <MaterialIcons
                name="access-alarm"
                color={alarmSwitch ? Colors.primary : Colors.grey50}
                size={20}
              />
              <Text text80 marginL-4 grey30>
                {t('music.alarm_close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
      <View marginT-16>
        <GridList
          data={itemData}
          containerWidth={fullWidth - 32}
          numColumns={2}
          keyExtractor={(item, index) => item.title + index}
          renderItem={({item, index}) => (
            <Card flexS centerV enableShadow={true} padding-12>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(item.route);
                }}>
                <FontAwesome
                  name={item.icon}
                  color={item.iconColor}
                  size={22}
                />
                <View row bottom>
                  <Text marginT-6 text70BO grey20>
                    {item.title}
                  </Text>
                  <Text text90L grey40 marginL-4 marginB-2>
                    {item.num}
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>
          )}
        />
      </View>
      <View marginT-16 flexS>
        <View row centerV spread>
          <View row centerV>
            <Text text70BL>{t('music.my_playlist')}</Text>
            <Text text80L grey40 marginL-4>
              {total}
            </Text>
          </View>
          <View row centerV>
            {isMultiSelect ? (
              <>
                <Button
                  marginR-12
                  size={'xSmall'}
                  label={t('common.delete')}
                  link
                  color={Colors.red30}
                  onPress={() => {
                    if (selectedItems.length) {
                      delFavorites(selectedItems);
                      return;
                    }
                    showToast(t('common.delete_select'), 'error');
                  }}
                />
                <Button
                  marginR-12
                  size={'xSmall'}
                  label={
                    isAllSelect
                      ? t('common.unselect_all')
                      : t('common.select_all')
                  }
                  link
                  color={Colors.primary}
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
                  marginR-12
                  size={'xSmall'}
                  label={t('common.cancel')}
                  link
                  color={Colors.blue40}
                  onPress={() => {
                    resetMultiSelect();
                  }}
                />
              </>
            ) : null}
            <TouchableOpacity
              row
              centerV
              padding-4
              marginR-10
              onPress={() => {
                setShowAddDialog(true);
                setFavoritesName('');
              }}>
              <AntDesign name="pluscircleo" color={Colors.grey40} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              row
              centerV
              padding-4
              onPress={() => {
                setShowImportDialog(true);
                setImportUrl('');
              }}>
              <AntDesign
                name="login"
                style={styles.importStyle}
                color={Colors.grey40}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={list}
          keyExtractor={(item, index) => item?.id + index}
          onEndReached={onEndReached}
          renderItem={({item}) => (
            <View marginT-8 row centerV>
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
              <Drawer
                disableHaptic={true}
                itemsTintColor={Colors.red30}
                rightItems={[
                  {
                    text: isMultiSelect ? '' : t('common.delete'),
                    background: Colors.background,
                    onPress: () => {
                      if (isMultiSelect) {
                        return;
                      }
                      setDelName(item.favorites_name);
                      setDelIds([item.id]);
                      setDelVisible(true);
                    },
                  },
                ]}
                leftItem={{background: Colors.background}}>
                <TouchableOpacity
                  row
                  centerV
                  onLongPress={() => {
                    Vibration.vibrate(50);
                    setIsMultiSelect(true);
                  }}
                  onPress={() => {
                    navigation.navigate('FavoritesDetail', {
                      favoritesId: item.id,
                    });
                  }}>
                  <Image
                    source={{
                      uri: envConfig.THUMBNAIL_URL + item.favorites_cover,
                    }}
                    style={styles.favoritesCover}
                  />
                  <View centerV marginL-12>
                    <Text>{item.favorites_name}</Text>
                    <Text marginT-4 text90L grey40>
                      {t('common.num_songs', {num: item.musicCount})}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Drawer>
            </View>
          )}
          ListEmptyComponent={
            <View marginT-16 center>
              <Text text90L grey40>
                还没有任何歌单，快去新建一个吧~
              </Text>
            </View>
          }
          ListFooterComponent={<View marginB-140 />}
        />
      </View>
      <BaseDialog
        onConfirm={() => {
          submitData();
        }}
        visible={showAddDialog}
        setVisible={setShowAddDialog}
        description={t('common.create_favorites')}
        renderBody={
          <View>
            <TextField
              text70
              placeholderTextColor={Colors.grey40}
              placeholder={t('common.input_favorites_name')}
              floatingPlaceholder
              value={favoritesName}
              maxLength={10}
              onChangeText={value => {
                setFavoritesName(value);
              }}
            />
          </View>
        }
      />
      <BaseDialog
        onConfirm={() => {
          onImport();
          setShowImportDialog(false);
        }}
        visible={showImportDialog}
        setVisible={setShowImportDialog}
        description={t('common.import_favorites')}
        renderBody={
          <View>
            <Text marginT-2 text90L blue40>
              {t('common.import_favorites_tips')}
            </Text>
            <TextField
              text70
              placeholderTextColor={Colors.grey40}
              placeholder={t('common.input_favorites_url')}
              floatingPlaceholder
              value={importUrl}
              onChangeText={value => {
                setImportUrl(value);
              }}
            />
          </View>
        }
      />
      <BaseDialog
        title={true}
        onConfirm={() => {
          delFavorites();
          setDelVisible(false);
        }}
        visible={delVisible}
        setVisible={setDelVisible}
        description={t('common.delete_select', {name: delName})}
      />
      <Dialog
        visible={showAlarmDialog}
        useSafeArea={true}
        onDismiss={() => setShowAlarmDialog(false)}
        width={'90%'}
        panDirection={PanningProvider.Directions.DOWN}>
        <Card flexS padding-16>
          <View row centerV>
            <Text text70BL marginR-12>
              {t('common.alarm_close')}
            </Text>
            <Switch
              onColor={Colors.primary}
              offColor={Colors.grey50}
              value={alarmSwitch}
              onValueChange={value => {
                if (value) {
                  setCloseTime(alarmTime);
                } else {
                  setAlarmTime(0);
                  setCloseTime(0);
                }
                setAlarmSwitch(value);
              }}
            />
          </View>
          <View marginT-8>
            <Text text90L grey30 marginV-6>
              {t('common.alarm_close_tips', {time: alarmTime})}
            </Text>
            <Slider
              thumbTintColor={Colors.primary}
              minimumTrackTintColor={Colors.primary}
              thumbStyle={styles.thumbStyle}
              minimumValue={0}
              maximumValue={120}
              value={alarmTime}
              step={1}
              onValueChange={value => {
                setAlarmTime(value);
                if (alarmSwitch) {
                  setCloseTime(value);
                }
              }}
            />
            <View row centerV spread>
              {scales.map(item => (
                <Text text90L grey40 key={item}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        </Card>
      </Dialog>
      <Dialog
        visible={showRandomDialog}
        useSafeArea={true}
        onDismiss={() => setShowRandomDialog(false)}
        width={'90%'}
        panDirection={PanningProvider.Directions.DOWN}>
        <Card flexS padding-16>
          <View row centerV>
            <Text text70BL marginR-12>
              {t('common.random_play')}
            </Text>
            <Switch
              onColor={Colors.primary}
              offColor={Colors.grey50}
              value={randomSwitch}
              onValueChange={value => {
                if (value) {
                  setIsRandomPlay(value);
                  showToast(t('common.random_play_on'), 'success');
                } else {
                  setRandomNum(1, allMusicNum);
                  setIsRandomPlay(value);
                  showToast(t('common.random_play_off'), 'success');
                }
                setRandomSwitch(value);
              }}
            />
          </View>
          <View marginT-8>
            <Text text90L grey30 marginV-4>
              {t('common.random_play_range', {
                min: randomNum?.min,
                max: randomNum?.max,
              })}
            </Text>
            <Slider
              thumbTintColor={Colors.primary}
              minimumTrackTintColor={Colors.primary}
              thumbStyle={styles.thumbStyle}
              minimumValue={1}
              maximumValue={allMusicNum}
              initialMinimumValue={randomNum?.min}
              initialMaximumValue={randomNum?.max}
              useGap={true}
              useRange={true}
              step={1}
              onRangeChange={values => {
                setRandomNum(values);
              }}
            />
          </View>
        </Card>
      </Dialog>
    </View>
  );
};
const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: Colors.grey80,
    borderWidth: 1,
  },
  favoritesCover: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  delBox: {
    color: Colors.background,
  },
  funBox: {
    borderTopWidth: 1,
    borderColor: Colors.grey80,
  },
  rightBox: {
    borderLeftWidth: 1,
    borderColor: Colors.grey80,
  },
  thumbStyle: {
    width: 10,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  importStyle: {
    transform: [{rotate: '180deg'}],
  },
});
export default Music;
