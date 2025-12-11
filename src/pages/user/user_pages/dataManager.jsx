import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Vibration, RefreshControl} from 'react-native';
import {
  View,
  Checkbox,
  Button,
  TouchableOpacity,
  Image,
  Colors,
  Dialog,
  Card,
  Text,
  Badge,
  ProgressBar,
} from 'react-native-ui-lib';
import {getFiles, delFiles, getUserMsgs, delUserMsgs} from '@api/data_manager';
import {useToast} from '@components/common/useToast';
import {
  downloadFile,
  getFileFromDocumentPicker,
  uploadFile,
  getFileColor,
  getFileExt,
  formatFileSize,
} from '@utils/system/file_utils';
import {formatDateTime} from '@utils/common/time_utils';
import {showMessageText} from '@utils/system/chat_utils';
import {getLocalSessionById} from '@utils/realm/useSessionInfo';
import {FileTypeEnum, FileUseTypeEnum} from '@const/database_enum';
import {usePermissionStore} from '@store/permissionStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import Clipboard from '@react-native-clipboard/clipboard';
import BaseTopBar from '@components/common/BaseTopBar';
import VideoModal from '@components/common/VideoModal';
import ImgModal from '@components/common/ImgModal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DocumentPicker from 'react-native-document-picker';
import BaseDialog from '@components/common/BaseDialog';
import dayjs from 'dayjs';

const DataManager = ({navigation}) => {
  const {accessFolder, setAccessFolder} = usePermissionStore();
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  const {showToast} = useToast();

  const [focusedIndex, setFocusedIndex] = useState(0);

  const [progress, setProgress] = useState(0); // 保存文件进度
  const [showDownloadDialog, setShowDownloadDialog] = useState(false); // 下载进度条
  const [isDownload, setIsDownload] = useState(false); // 是否正在下载
  const [fileNum, setFileNum] = useState(1); // 总文件数
  const [nowFileIndex, setNowFileIndex] = useState(1); // 当前文件索引

  const [delVisible, setDelVisible] = useState(false); // 删除文件弹窗

  // 多选
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAllSelect, setIsAllSelect] = useState(false);

  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [selectedMsgIds, setSelectedMsgIds] = useState([]);

  /* 点击操作 */
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoUri, setVideoUri] = useState(null);

  const [previewImgUris, setPreviewImgUris] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [imageShow, setImageShow] = useState(false);

  // 上传文件
  const uploadFiles = async files => {
    setIsDownload(false);
    setShowDownloadDialog(true);
    setFileNum(files.length);
    for (let i = 0; i < files.length; i++) {
      const media = files[i];
      const mediaInfo = getFileFromDocumentPicker(media);
      setNowFileIndex(i + 1);
      const res = await uploadFile(mediaInfo.file, {
        form: {
          file_type: mediaInfo.type,
          use_type: FileUseTypeEnum.upload,
        },
        onProgress: p => setProgress(p),
      });
      const upRes = JSON.parse(res.text());
      setProgress(0);
      if (upRes.code === 0) {
        showToast(t('common.upload_file_success', {index: i + 1}), 'success');
        refreshFileList({use_type: routes[focusedIndex].key});
      } else {
        showToast(t('common.upload_file_failed', {index: i + 1}), 'error');
        continue;
      }
    }
    setShowDownloadDialog(false);
    setFileNum(1);
  };

  /*  保存多个文件 */
  const saveFiles = async () => {
    if (selectedFileIds.length === 0) {
      showToast(t('empty.select'), 'warning');
      return;
    }
    setIsDownload(true);
    setShowDownloadDialog(true);
    const selectedFiles = [];
    fileList.forEach(item => {
      if (selectedFileIds.includes(item.id)) {
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
          isInCameraRoll:
            file.file_type === FileTypeEnum.image ||
            file.file_type === FileTypeEnum.video,
          onProgress: p => setProgress(p),
        },
      );
      setProgress(0);
      if (!savePath) {
        showToast(t('common.download_file_failed', {index: i + 1}), 'error');
      }
    }
    showToast(t('common.download_file_complete'), 'success');
    setShowDownloadDialog(false);
    setFileNum(1);
    setSelectedFileIds([]);
    setNowFileIndex(1);
    setIsAllSelect(false);
    setIsMultiSelect(false);
  };

  /* 删除文件 */
  const deleteFiles = async () => {
    if (selectedFileIds.length === 0) {
      showToast(t('empty.select'), 'warning');
      return;
    }
    const fileDelRes = await delFiles({
      ids: selectedFileIds,
    });
    if (fileDelRes.code === 0) {
      showToast(
        t('common.delete_file_success', {count: selectedFileIds.length}),
        'success',
      );
      refreshFileList({use_type: routes[focusedIndex].key});
    } else {
      showToast(fileDelRes.message, 'error');
    }
    setIsAllSelect(false);
    setSelectedFileIds([]);
    setIsMultiSelect(false);
  };

  /* 删除聊天记录 */
  const deleteMsgs = async () => {
    if (isMultiSelect && selectedMsgIds.length === 0) {
      showToast(t('empty.select'), 'warning');
      return;
    }
    const msgDelRes = await delUserMsgs({
      ids: selectedMsgIds,
    });
    if (msgDelRes.code === 0) {
      showToast(
        t('common.delete_msg_success', {count: selectedMsgIds.length || 1}),
        'success',
      );
      refreshMsgList();
    } else {
      showToast(msgDelRes.message, 'error');
    }
    setIsAllSelect(false);
    setSelectedMsgIds([]);
    setIsMultiSelect(false);
  };

  // 选择文件
  const pickFile = async () => {
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: true,
    }).then(files => {
      uploadFiles(files);
    });
  };

  // 渲染文件图标
  const renderFileIcon = (type, name) => {
    return (
      <View
        center
        width={50}
        height={50}
        br20
        marginR-12
        backgroundColor={getFileColor(getFileExt(name))}>
        {type === 'video' ? (
          <FontAwesome name="file-video-o" color={Colors.white} size={32} />
        ) : type === 'audio' ? (
          <FontAwesome name="file-audio-o" color={Colors.white} size={32} />
        ) : type === 'other' ? (
          <Text white text70BO>
            {getFileExt(name).toUpperCase()}
          </Text>
        ) : null}
      </View>
    );
  };

  // 点击文件
  const clickFile = file => {
    const fileUrl = envConfig.STATIC_URL + file.file_key;
    if (file.file_type === FileTypeEnum.image) {
      const imgs = [];
      fileList.forEach((item, index) => {
        if (item.file_type === FileTypeEnum.image) {
          imgs.push(envConfig.STATIC_URL + item.file_key);
        }
        if (item.id === file.id) {
          setInitialIndex(index);
        }
      });
      setPreviewImgUris(imgs);
      setImageShow(true);
    } else if (
      file.file_type === FileTypeEnum.video ||
      file.file_type === FileTypeEnum.audio
    ) {
      setVideoVisible(true);
      setVideoUri(fileUrl);
    } else if (
      file.file_type === FileTypeEnum.document &&
      file.file_key.endsWith('.pdf')
    ) {
      navigation.navigate('PdfView', {
        url: fileUrl,
      });
    } else {
      showToast(t('common.file_not_supported'), 'warning');
    }
  };

  // 加载文件子组件
  const renderFileItem = ({item}) => {
    return (
      <TouchableOpacity
        padding-12
        row
        centerV
        bg-white
        onPress={() => {
          clickFile(item);
        }}
        onLongPress={() => {
          Vibration.vibrate(50);
          Clipboard.setString(envConfig.STATIC_URL + item.file_key);
          showToast(t('common.copy_link_success'), 'success');
        }}>
        {isMultiSelect ? (
          <Checkbox
            marginR-12
            color={Colors.primary}
            size={20}
            borderRadius={10}
            value={selectedFileIds.includes(item.id)}
            onValueChange={value => {
              if (value) {
                setSelectedFileIds(prevItem => {
                  const newItem = [...new Set([...prevItem, item.id])];
                  return newItem;
                });
              } else {
                setSelectedFileIds(prevItem => {
                  const newItem = prevItem.filter(id => id !== item.id);
                  return newItem;
                });
              }
            }}
          />
        ) : null}

        {item.file_type === 'image' ? (
          <Image
            style={styles.image}
            source={{
              uri: envConfig.THUMBNAIL_URL + item.file_key,
            }}
          />
        ) : (
          renderFileIcon(item.file_type, item.file_key)
        )}
        <View width={isMultiSelect ? '72%' : '82%'}>
          <Text text70L numberOfLines={1} ellipsizeMode={'middle'}>
            {item.file_key}
          </Text>
          <View row marginT-4 bottom spread>
            <Text grey30>{formatFileSize(item.file_size)}</Text>
            <Text grey40 text90L>
              {formatDateTime(item.create_time)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 加载消息子组件
  const renderMsgItem = ({item}) => {
    return (
      <TouchableOpacity
        padding-12
        row
        centerV
        bg-white
        onLongPress={() => {
          Vibration.vibrate(50);
          Clipboard.setString(item.content);
          showToast(t('common.copy_text_success'), 'success');
        }}>
        {isMultiSelect ? (
          <Checkbox
            marginR-12
            color={Colors.primary}
            size={20}
            borderRadius={10}
            value={selectedMsgIds.includes(item.id)}
            onValueChange={value => {
              if (value) {
                setSelectedMsgIds(prevItem => {
                  const newItem = [...new Set([...prevItem, item.id])];
                  return newItem;
                });
              } else {
                setSelectedMsgIds(prevItem => {
                  const newItem = prevItem.filter(id => id !== item.id);
                  return newItem;
                });
              }
            }}
          />
        ) : null}
        <View width={isMultiSelect ? '92%' : '100%'}>
          <Text numberOfLines={1} ellipsizeMode={'middle'}>
            {showMessageText(item)}
          </Text>
          <View row spread>
            <Text text90L grey30>
              {t('chat.send_to', {
                name:
                  getLocalSessionById(item.session_primary_id)[0]
                    ?.session_name || t('chat.unknown_user'),
              })}
            </Text>
          </View>
          <View row marginT-6 spread>
            <View row>
              <Badge
                backgroundColor={Colors.blue50}
                label={t(
                  'chat.chat_type_' +
                    getLocalSessionById(item.session_primary_id)[0]
                      ?.chat_type || '',
                )}
              />
              <View marginL-6>
                <Badge
                  backgroundColor={Colors.green50}
                  label={t('chat.msg_type_' + item.msg_type)}
                />
              </View>
              {item.msg_secret ? (
                <View marginL-6>
                  <Badge
                    backgroundColor={Colors.orange50}
                    label={t('chat.encrypted')}
                  />
                </View>
              ) : null}
            </View>
            <Text marginL-8 text90L grey40>
              {dayjs(item.create_time).format('YYYY/MM/DD HH:mm:ss')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const {
    list: fileList,
    onEndReached: onEndReachedFile,
    loading: fileLoading,
    refreshData: refreshFileList,
  } = useInfiniteScroll(getFiles);

  const {
    list: msgList,
    onEndReached: onEndReachedMsg,
    loading: msgLoading,
    refreshData: refreshMsgList,
  } = useInfiniteScroll(getUserMsgs);

  const fileScreen = (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={fileLoading}
          colors={[Colors.primary]}
          onRefresh={() => {
            refreshFileList({use_type: routes[focusedIndex].key});
          }}
        />
      }
      data={fileList}
      showsVerticalScrollIndicator={false}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={onEndReachedFile}
      onEndReachedThreshold={0.8}
      ListEmptyComponent={
        <View marginT-16 center>
          <Text text90L grey40>
            {t('empty.file')}
          </Text>
        </View>
      }
      renderItem={renderFileItem}
      ListFooterComponent={<View marginB-200 />}
    />
  );

  const MsgScreen = (
    <FlatList
      data={msgList}
      keyExtractor={(_, index) => index.toString()}
      refreshControl={
        <RefreshControl
          colors={[Colors.primary]}
          refreshing={msgLoading}
          onRefresh={refreshMsgList}
        />
      }
      onEndReached={onEndReachedMsg}
      onEndReachedThreshold={0.8}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View marginT-16 center>
          <Text text90L grey40>
            {t('empty.chat')}
          </Text>
        </View>
      }
      renderItem={renderMsgItem}
      ListFooterComponent={<View marginB-200 />}
    />
  );

  /* 顶部导航栏 */
  const routes = [
    {
      key: FileUseTypeEnum.chat,
      title: t('common.chat_files'),
      screen: fileScreen,
    },
    {
      key: FileUseTypeEnum.user,
      title: t('common.user_files'),
      screen: fileScreen,
    },
    {
      key: FileUseTypeEnum.group,
      title: t('common.group_files'),
      screen: fileScreen,
    },
    {
      key: FileUseTypeEnum.upload,
      title: t('common.temporary_files'),
      screen: fileScreen,
    },
    {key: 'msg', title: t('common.msg_files'), screen: MsgScreen},
  ];

  useEffect(() => {
    refreshFileList({use_type: routes[focusedIndex].key});
  }, []);

  return (
    <>
      <View row spread padding-8 paddingR-16>
        <Button
          size={'small'}
          borderRadius={8}
          label={t('common.upload_files')}
          backgroundColor={Colors.primary}
          onPress={() => {
            if (!accessFolder) {
              showToast(t('permissions.folder_please'), 'warning');
              setAccessFolder();
              return;
            }
            pickFile();
          }}
        />
        <View row right spread>
          {isMultiSelect ? (
            <View row spread gap-12>
              <Button
                size={'xSmall'}
                label={
                  isAllSelect
                    ? t('common.unselect_all')
                    : t('common.select_all')
                }
                link
                color={Colors.cyan30}
                onPress={() => {
                  setIsAllSelect(prev => {
                    if (!prev) {
                      focusedIndex === 4
                        ? setSelectedMsgIds(msgList.map(item => item.id))
                        : setSelectedFileIds(fileList.map(item => item.id));
                    } else {
                      focusedIndex === 4
                        ? setSelectedMsgIds([])
                        : setSelectedFileIds([]);
                    }
                    return !prev;
                  });
                }}
              />
              {focusedIndex !== 4 ? (
                <Button
                  size={'xSmall'}
                  label={t('common.download')}
                  link
                  color={Colors.primary}
                  onPress={() => {
                    saveFiles();
                  }}
                />
              ) : null}
              <Button
                size={'xSmall'}
                label={t('common.delete')}
                link
                color={Colors.error}
                onPress={() => {
                  setDelVisible(true);
                }}
              />
              <Button
                size={'xSmall'}
                label={t('common.cancel')}
                link
                color={Colors.primary}
                onPress={() => {
                  setIsMultiSelect(false);
                }}
              />
            </View>
          ) : (
            <TouchableOpacity center onPress={() => setIsMultiSelect(true)}>
              <AntDesign name="bars" color={Colors.grey40} size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <BaseTopBar
        routes={routes}
        initialIndex={focusedIndex}
        onChange={(index, {key}) => {
          if (index === 4) {
            refreshMsgList();
          } else {
            refreshFileList({use_type: key});
          }
          setFocusedIndex(index);
          setIsAllSelect(false);
          setSelectedFileIds([]);
          setSelectedMsgIds([]);
        }}
      />
      <Dialog
        visible={showDownloadDialog}
        onDismiss={() => setShowDownloadDialog(false)}>
        <Card padding-16>
          <Text text70BL marginB-8>
            {t('chat.msg_type_file')}
            {isDownload ? t('common.download') : t('common.upload')}
          </Text>
          <View>
            <Text marginB-16>
              {t('component.batch_save_tips', {
                total: fileNum,
                type: isDownload ? t('common.download') : t('common.upload'),
                index: nowFileIndex,
              })}
            </Text>
            {progress ? (
              <ProgressBar progress={progress} progressColor={Colors.primary} />
            ) : null}
          </View>
        </Card>
      </Dialog>

      <BaseDialog
        title={true}
        onConfirm={() => {
          setDelVisible(false);
          focusedIndex === 4 ? deleteMsgs() : deleteFiles();
        }}
        visible={delVisible}
        setVisible={setDelVisible}
        description={t('common.delete_tips')}
      />
      {/* 视频播放器 */}
      <VideoModal
        uri={videoUri}
        visible={videoVisible}
        onClose={() => {
          setPreviewImgUris(null);
          setVideoVisible(!videoVisible);
        }}
        onPressClose={() => setVideoVisible(false)}
        onError={e => {
          showToast(t('common.video_load_failed'), 'error');
          console.log(e);
        }}
      />
      {/* 图片预览 */}
      <ImgModal
        uris={previewImgUris}
        initialIndex={initialIndex}
        visible={imageShow}
        onClose={() => setImageShow(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  image: {width: 50, height: 50, borderRadius: 4, marginRight: 12},
});
export default DataManager;
