import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Colors,
  TouchableOpacity,
  Checkbox,
  Button,
} from 'react-native-ui-lib';
import {FlatList, StyleSheet, Modal, RefreshControl} from 'react-native';
import {useToast} from '@components/common/useToast';
import {useScreenDimensions} from '@components/contexts/ScreenDimensionsContext';
import {useTranslation} from 'react-i18next';
import {scanDir, rootDir} from '@utils/system/fs_utils';
import {getFileExt} from '@utils/system/file_utils';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const FolderModal = props => {
  const {visible, setVisible, onConfirm = () => {}, isShowFile = false} = props;
  const {showToast} = useToast();
  const {fullHeight, statusBarHeight} = useScreenDimensions();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [nowDirPath, setNowDirPath] = useState(rootDir);
  const [dirList, setDirList] = useState([]);
  const [selectedDirs, setSelectedDirs] = useState([]);

  const scanDirList = async path => {
    try {
      setLoading(true);
      setNowDirPath(path);
      const newDirList = await scanDir(path);
      setDirList(newDirList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanDirList(rootDir);
  }, []);

  // 渲染文件图标
  const renderFileIcon = name => {
    const ext = getFileExt(name);
    return (
      <View row centerV>
        <View
          center
          width={32}
          height={32}
          br20
          padding-4
          backgroundColor={Colors.blue40}>
          <Text white text100BO>
            {ext.toUpperCase()}
          </Text>
        </View>
        <View width={'86%'}>
          <Text
            marginL-8
            marginT-4
            text90L
            grey10
            numberOfLines={1}
            ellipsizeMode={'middle'}>
            {name}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({item}) => (
    <View marginT-8 row centerV paddingH-12>
      {item.isDir ? (
        <>
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
                  const newItem = prevItem.filter(path => path !== item.path);
                  return newItem;
                });
              }
            }}
          />
          <TouchableOpacity
            row
            centerV
            padding-6
            onPress={async () => {
              scanDirList(item.path);
            }}>
            <FontAwesome name="folder-open" color={Colors.yellow40} size={28} />
            <View centerV marginL-12 width={'86%'}>
              <Text>{item.name}</Text>
              <Text marginT-4 text90L grey40>
                {item.path}
              </Text>
            </View>
          </TouchableOpacity>
        </>
      ) : isShowFile ? (
        renderFileIcon(item.file)
      ) : null}
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent
      onRequestClose={() => {
        setVisible(false);
      }}>
      <View
        height={fullHeight + statusBarHeight}
        backgroundColor={Colors.black4}>
        <View height={fullHeight * 0.6} style={styles.modalStyle} padding-12>
          <View row spread centerV paddingH-6>
            <TouchableOpacity
              style={styles.musicBut}
              onPress={() => {
                setVisible(false);
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
                  if (nowDirPath === '' || nowDirPath === rootDir) {
                    showToast(t('music.is_root_dir'), 'warning', true);
                    return;
                  }
                  const paths = nowDirPath.split('/');
                  paths.pop();
                  const newPath = paths.join('/');
                  scanDirList(newPath);
                }}
              />
              <Button
                label={t('common.confirm')}
                size={'small'}
                link
                linkColor={Colors.primary}
                onPress={() => {
                  onConfirm(selectedDirs);
                  setVisible(false);
                }}
              />
            </View>
          </View>
          <Text text90L grey40 marginB-12>
            {nowDirPath}
          </Text>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={loading}
                colors={[Colors.primary]}
                onRefresh={() => {
                  scanDirList(nowDirPath);
                }}
              />
            }
            data={dirList}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={
              <View marginT-16 center>
                <Text text90L grey40>
                  {t('music.is_last_dir')}
                </Text>
              </View>
            }
            renderItem={renderItem}
          />
        </View>
      </View>
    </Modal>
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
  modalStyle: {
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

export default FolderModal;
