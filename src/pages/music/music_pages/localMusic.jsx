import React, {useState, useEffect} from 'react';
import {View, Colors, Button} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {usePermissionStore} from '@store/permissionStore';
import {useTranslation} from 'react-i18next';
import {
  getLocalMusic,
  saveLocalMusic,
  clearLocalMusic,
} from '@utils/realm/useLocalMusic';
import {scanDirAudio} from '@utils/system/fs_utils';
import BaseDialog from '@components/common/BaseDialog';
import FullScreenLoading from '@components/common/FullScreenLoading';
import MusicList from '@components/music/MusicList';
import FolderModal from '@components/common/FolderModal';

const LocalMusic = () => {
  const {showToast} = useToast();
  const {t} = useTranslation();

  const {accessFolder, setAccessFolder} = usePermissionStore();

  const [loading, setLoading] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [dirVisible, setDirVisible] = useState(false);

  // 扫描本地音乐
  const scanMusic = async dirPathList => {
    setLoading(true);
    try {
      const allAudioFilesPromises = dirPathList.map(path => scanDirAudio(path));
      const allAudioFilesResults = await Promise.all(allAudioFilesPromises);
      const audioFileList = allAudioFilesResults.flat();
      updateAudioFiles(audioFileList);
    } catch (error) {
      console.error('扫描音乐时发生错误:', error);
      showToast(t('music.scan_error'), 'error', true);
    } finally {
      setLoading(false);
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
                }}
              />
            </View>
          </View>
        }
      />
      <FolderModal
        visible={dirVisible}
        setVisible={setDirVisible}
        onConfirm={scanMusic}
      />
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
      {loading ? <FullScreenLoading message={t('music.scanning')} /> : null}
    </View>
  );
};

export default LocalMusic;
