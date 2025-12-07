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
import {useToast} from '@components/common/useToast';
import {v4 as uuid} from 'uuid';
import {fullHeight, statusBarHeight} from '@style/index';
import {audioExtNames} from '@const/file_ext_names';
import {usePermissionStore} from '@store/permissionStore';
import {useTranslation} from 'react-i18next';
import {
  getLocalMusic,
  saveLocalMusic,
  clearLocalMusic,
} from '@utils/realm/useLocalMusic';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BaseDialog from '@components/common/BaseDialog';
import FullScreenLoading from '@components/common/FullScreenLoading';
import MusicList from '@components/music/MusicList';

const LocalMusic = () => {
  const {showToast} = useToast();
  const {t} = useTranslation();

  const {accessFolder, setAccessFolder} = usePermissionStore();

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
              file_key: filePath,
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
      showToast(t('music.scan_error'), 'error', true);
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
          saveLocalMusic(uniqueNewFiles);
        } catch (err) {
          console.error('保存到数据库时出错:', err);
        }
      }

      showToast(
        uniqueNewFiles.length
          ? t('music.scan_complete_tips', {
              total: uniqueNewFiles.length,
            })
          : t('music.no_new_music'),
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
        showToast(t('music.scan_no_permission'), 'error', true);
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

  // 获取本地音乐
  const getLocalMusicFunc = async () => {
    const music = getLocalMusic();
    setAudioFiles(music);
  };

  /* 删除本地音乐记录 */
  const [delVisible, setDelVisible] = useState(false);
  const delLocalMusic = () => {
    clearLocalMusic();
    showToast(t('music.clear_local_success'), 'success');
    getLocalMusicFunc();
  };

  useEffect(() => {
    getLocalMusicFunc();
  }, []);

  return (
    <View padding-12>
      <MusicList
        list={audioFiles}
        isLocal={true}
        rightBut={
          <View row centerV>
            <View paddingR-12>
              <Button
                label={t('music.clear_label')}
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
                label={t('music.scan_music')}
                size="small"
                backgroundColor={Colors.primary}
                onPress={() => {
                  if (!accessFolder) {
                    showToast(t('permissions.folder_please'), 'warning');
                    setAccessFolder();
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
          backgroundColor={Colors.black4}>
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
                  label={t('music.back_label')}
                  size={'small'}
                  link
                  linkColor={Colors.blue40}
                  marginR-24
                  onPress={() => {
                    if (
                      nowDirPath === '' ||
                      nowDirPath === ReactNativeBlobUtil.fs.dirs.LegacySDCardDir
                    ) {
                      showToast(t('music.is_root_dir'), 'warning', true);
                      return;
                    }
                    const paths = nowDirPath.split('/');
                    paths.pop();
                    const newPath = paths.join('/');
                    scanDir(newPath);
                  }}
                />
                <Button
                  label={t('common.confirm')}
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
                    {t('music.is_last_dir')}
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
                    value={selectedDirs.includes(item.path)}
                    onValueChange={value => {
                      if (value) {
                        setSelectedDirs(prevItem => {
                          const newItem = [...new Set([...prevItem, item.path])];
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
        title={true}
        onConfirm={() => {
          delLocalMusic();
          setDelVisible(false);
        }}
        visible={delVisible}
        setVisible={setDelVisible}
        description={t('music.local_clear_confirm')}
      />
      {loading ? <FullScreenLoading Message={t('music.scanning')} /> : null}
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
