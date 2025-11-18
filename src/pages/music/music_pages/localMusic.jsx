import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Colors,
  TouchableOpacity,
  Checkbox,
  Button,
} from 'react-native-ui-lib';
import {FlatList, StyleSheet, Platform, Modal} from 'react-native';
import {useToast} from '../../../components/common/Toast';
import ReactNativeBlobUtil from 'react-native-blob-util';
import MusicList from '../../../components/music/MusicList';
import {useRealm} from '@realm/react';
import {v4 as uuid} from 'uuid';
import {fullHeight, statusBarHeight} from '../../../styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BaseDialog from '../../../components/common/BaseDialog';
import {requestFolderPermission} from '../../../stores/store_slice/permissionStore';
import {useSelector, useDispatch} from 'react-redux';
import {audioExtNames} from '../../../constants/base_const';
import FullScreenLoading from '../../../components/common/FullScreenLoading';

const LocalMusic = () => {
  const {showToast} = useToast();
  const realm = useRealm();
  const dispatch = useDispatch();

  const accessFolder = useSelector(state => state.permissionStore.accessFolder);

  // 扫描本地音乐
  const [loading, setLoading] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);

  // 检查是否为音频文件
  const isAudioFile = fileName => {
    return audioExtNames.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // 扫描单个目录的函数
  const scanADirectory = async path => {
    const audioFilesInDir = [];
    try {
      const files = await ReactNativeBlobUtil.fs.ls(path);
      if (files.length === 0) {
        return audioFilesInDir;
      }

      for (const file of files) {
        const filePath = `${path}/${file}`;
        try {
          const isDir = await isDirectory(filePath);
          if (!isDir && isAudioFile(file)) {
            audioFilesInDir.push({
              id: uuid(),
              title: file.split('.').shift(),
              file_name: filePath,
            });
          } else if (isDir && !file.startsWith('.')) {
            // 递归扫描子目录
            const subDirFiles = await scanADirectory(filePath);
            audioFilesInDir.push(...subDirFiles);
          }
        } catch (err) {
          console.error(`处理文件 ${filePath} 时出错:`, err);
        }
      }
    } catch (err) {
      console.error(`扫描目录 ${path} 时出错:`, err);
    }
    return audioFilesInDir;
  };

  const scanMusic = async dirPathList => {
    setLoading(true);
    try {
      const allAudioFilesPromises = dirPathList.map(path =>
        scanADirectory(path),
      );
      const allAudioFilesResults = await Promise.all(allAudioFilesPromises);
      const audioFileList = allAudioFilesResults.flat();
      updateAudioFiles(audioFileList);
    } catch (error) {
      console.error('扫描音乐时发生错误:', error);
      showToast('扫描过程中发生错误', 'error', true);
    } finally {
      setLoading(false);
      setSelectedDirs([]);
    }
  };

  // 更新音频文件列表和数据库
  const updateAudioFiles = newAudioFiles => {
    setAudioFiles(prevItems => {
      const uniqueNewFiles = newAudioFiles.filter(
        newFile =>
          !prevItems.find(prevFile => prevFile.title === newFile.title),
      );

      if (uniqueNewFiles.length > 0) {
        try {
          realm.write(() => {
            uniqueNewFiles.forEach(file => {
              realm.create('LocalMusic', file);
            });
          });
        } catch (err) {
          console.error('保存到数据库时出错:', err);
        }
      }

      showToast(
        uniqueNewFiles.length
          ? `已扫描到${uniqueNewFiles.length}首新音乐`
          : '没有找到新音乐',
        uniqueNewFiles.length ? 'success' : 'warning',
        true,
      );
      return [...uniqueNewFiles, ...prevItems];
    });
  };

  // 扫描目录
  const [nowDirPath, setNowDirPath] = useState('');
  const scanDir = path => {
    let directory = path || ReactNativeBlobUtil.fs.dirs.LegacySDCardDir;
    if (Platform.OS === 'ios') {
      directory = path || ReactNativeBlobUtil.fs.dirs.DocumentDir;
    }
    const scanDirectory = async dirPath => {
      try {
        const files = await ReactNativeBlobUtil.fs.ls(dirPath);
        const dirList = [];
        if (files) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const file_path = directory + '/' + file;
            const isDir = await isDirectory(file_path);
            if (isDir && !file.startsWith('.')) {
              dirList.push({
                name: file,
                path: file_path,
              });
            }
          }
        }

        setDirList(dirList);
      } catch (error) {
        showToast('没有权限访问该目录', 'error', true);
        console.error(error);
      }
    };
    setNowDirPath(directory);
    scanDirectory(directory);
  };

  // 判断是否是目录
  const isDirectory = async path => {
    try {
      const isDir = await ReactNativeBlobUtil.fs.isDir(path);
      return isDir;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  // 选择目录
  const [dirVisible, setDirVisible] = useState(false);
  const [dirList, setDirList] = useState([]);
  const [selectedDirs, setSelectedDirs] = useState([]);

  // 获取最近播放的音乐记录
  const getLocalMusic = async () => {
    const music = realm.objects('LocalMusic').toJSON();
    setAudioFiles(music);
  };

  /* 删除本地音乐记录 */
  const [delVisible, setDelVisible] = useState(false);
  const delLocalMusic = () => {
    const toDelete = realm.objects('LocalMusic');
    realm.write(() => {
      realm.delete(toDelete);
    });
    showToast('清空成功', 'success');
    getLocalMusic();
  };

  useEffect(() => {
    if (realm) {
      getLocalMusic();
    }
  }, [realm]);

  return (
    <View padding-12>
      <MusicList
        List={audioFiles}
        IsLocal={true}
        HeightScale={0.92}
        RightBut={
          <View row centerV>
            <View paddingR-12>
              <Button
                label="清空记录"
                size="small"
                link
                linkColor={Colors.red40}
                onPress={() => {
                  setDelVisible(true);
                }}
              />
            </View>
            <View>
              <Button
                label="扫描歌曲"
                size="small"
                backgroundColor={Colors.primary}
                onPress={() => {
                  if (!accessFolder) {
                    showToast('请授予应用文件和媒体使用权限', 'warning');
                    dispatch(requestFolderPermission());
                    return;
                  }
                  setDirVisible(true);
                  scanDir();
                }}
              />
            </View>
          </View>
        }
      />
      {loading ? <FullScreenLoading Message="正在扫描中..." /> : null}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dirVisible}
        statusBarTranslucent
        onRequestClose={() => {
          setDirVisible(!dirVisible);
          setDirList([]);
        }}>
        <View
          height={fullHeight + statusBarHeight}
          backgroundColor={Colors.hyalineGrey}>
          <View height={fullHeight * 0.6} style={styles.CtrlModal} padding-12>
            <View row spread centerV paddingH-6>
              <TouchableOpacity
                style={styles.musicBut}
                onPress={() => {
                  setDirVisible(false);
                  setDirList([]);
                }}>
                <AntDesign name="close" color={Colors.grey40} size={20} />
              </TouchableOpacity>
              <View row centerV>
                <Button
                  label={'返回上一级'}
                  size={'small'}
                  link
                  linkColor={Colors.blue40}
                  marginR-24
                  onPress={() => {
                    if (
                      nowDirPath === '' ||
                      nowDirPath === ReactNativeBlobUtil.fs.dirs.LegacySDCardDir
                    ) {
                      showToast('已经是根目录了', 'warning', true);
                      return;
                    }
                    const paths = nowDirPath.split('/');
                    paths.pop();
                    const newPath = paths.join('/');
                    scanDir(newPath);
                  }}
                />
                <Button
                  label={'确认'}
                  size={'small'}
                  link
                  linkColor={Colors.primary}
                  onPress={() => {
                    setDirVisible(false);
                    scanMusic(selectedDirs);
                  }}
                />
              </View>
            </View>
            <FlatList
              data={dirList}
              keyExtractor={(item, index) => item + index}
              ListEmptyComponent={
                <View marginT-16 center>
                  <Text text90L grey40>
                    已经是最后一级目录了
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
                    value={selectedDirs.includes(item.path)}
                    onValueChange={value => {
                      if (value) {
                        setSelectedDirs(prevItem => {
                          const newItem = [...prevItem, item.path];
                          return newItem;
                        });
                      } else {
                        setSelectedDirs(prevItem => {
                          const newItem = prevItem.filter(
                            path => path !== item.path,
                          );
                          return newItem;
                        });
                      }
                    }}
                  />
                  <TouchableOpacity
                    row
                    centerV
                    padding-6
                    onPress={() => {
                      scanDir(item.path);
                    }}>
                    <FontAwesome
                      name="folder-open"
                      color={Colors.yellow40}
                      size={28}
                    />
                    <View centerV marginL-12 width={'86%'}>
                      <Text>{item.name}</Text>
                      <Text marginT-4 text90L grey40>
                        {item.path}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
      <BaseDialog
        IsWarning={true}
        Title={true}
        IsButton={true}
        Fun={() => {
          delLocalMusic();
          setDelVisible(false);
        }}
        Visible={delVisible}
        SetVisible={setDelVisible}
        MainText={'您确定清空本地音乐记录吗？'}
      />
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
});

export default LocalMusic;
