import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Vibration} from 'react-native';
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
import {useToast} from '@utils/hooks/useToast';
import {
  downloadFile,
  getFileFromDocumentPicker,
  uploadFile,
  getFileColor,
  getFileExt,
  getFileName,
  formatFileSize,
} from '@utils/system/file_utils';
import {formatDateTime} from '@utils/common/time_utils';
import {useRealm} from '@realm/react';
import {setLocalMsg, getLocalUser, formatMsg} from '@utils/system/chat_utils';
import {MsgTypeEnum, ChatTypeEnum, FileTypeEnum} from '@const/database_enum';
import {usePermissionStore} from '@store/permissionStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import Clipboard from '@react-native-clipboard/clipboard';
import BaseTopBar from '@components/common/BaseTopBar';
import VideoModal from '@components/common/VideoModal';
import ImgModal from '@components/common/ImgModal';
import FullScreenLoading from '@components/common/FullScreenLoading';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DocumentPicker from 'react-native-document-picker';
import BaseDialog from '@components/common/BaseDialog';
import dayjs from 'dayjs';

const DataManager = ({navigation}) => {
  const {accessFolder, setAccessFolder} = usePermissionStore();
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();
  const realm = useRealm();

  const {showToast} = useToast();

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
      data={fileList}
      keyExtractor={(item, index) => item?.id + index}
      onEndReached={onEndReachedFile}
      ListEmptyComponent={
        <View marginT-16 center>
          <Text text90L grey40>
            {t('empty.file')}
          </Text>
        </View>
      }
      renderItem={renderItem}
      ListFooterComponent={<View marginB-140 />}
    />
  );

  const MsgScreen = (
    <FlatList
      data={msgList}
      keyExtractor={(item, index) => item?.id + index}
      onEndReached={onEndReachedMsg}
      ListEmptyComponent={
        <View marginT-16 center>
          <Text text90L grey40>
            {t('empty.chat')}
          </Text>
        </View>
      }
      renderItem={renderMsgItem}
      ListFooterComponent={<View marginB-140 />}
    />
  );

  /* 顶部导航栏 */
  const routes = [
    {key: 'chat', title: t('common.chat_files'), screen: fileScreen},
    {key: 'user', title: t('common.user_files'), screen: fileScreen},
    {key: 'group', title: t('common.group_files'), screen: fileScreen},
    {key: 'upload', title: t('common.temporary_files'), screen: fileScreen},
    {key: 'msg', title: t('common.msg_files'), screen: MsgScreen},
  ];

  // 渲染文件图标
  const renderFileIcon = (type, name) => {
    return (
      <View
        center
        style={styles.fileIcon}
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

  // 多选
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAllSelect, setIsAllSelect] = useState(false);

  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [selectedMsgIds, setSelectedMsgIds] = useState([]);

  /* 点击操作 */
  const [modalVisible, setModalVisible] = useState(false);
  const [fullscreenUri, setFullscreenUri] = useState(null);
  const [imageShow, setImageShow] = useState(false);

  const clickFile = file => {
    const url = envConfig.STATIC_URL + file.file_key;
    setFullscreenUri(url);
    if (file.file_type === FileTypeEnum.image) {
      setImageShow(true);
    } else if (
      file.file_type === FileTypeEnum.video ||
      file.file_type === FileTypeEnum.audio
    ) {
      setModalVisible(true);
    } else if (
      file.file_type === FileTypeEnum.document &&
      file.file_key.endsWith('.pdf')
    ) {
      navigation.navigate('PdfView', {url});
    } else {
      showToast(t('common.file_not_supported'), 'warning');
    }
  };

  const [selectedFileId, setSelectedFileId] = useState(null);

  // 加载列表子组件
  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        padding-12
        row
        centerV
        bg-white
        backgroundColor={
          selectedFileId === item.id ? Colors.grey60 : Colors.white
        }
        onPress={() => {
          clickFile(item);
        }}
        onLongPress={() => {
          Clipboard.setString(envConfig.STATIC_URL + item.file_key);
          showToast('已复制链接到剪贴板', 'success');
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
                  const newItem = [...prevItem, item.id];
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

  // 加载聊天记录列表子组件
  const matchInfoList = getLocalUser(realm) || [];
  const matchMsgInfo = (list, msgInfo) => {
    let originName = '';
    if (list.length === 0) {
      return '未知';
    }
    list.forEach(item => {
      if (item.session_id === msgInfo.session_id) {
        if (msgInfo.chat_type === 'group') {
          originName = item.session_name;
        }
        if (msgInfo.chat_type === 'personal') {
          if (item.userId !== msgInfo.send_uid) {
            originName = item.remark;
          }
        }
      }
    });
    return originName;
  };

  const renderMsgItem = ({item}) => {
    return (
      <TouchableOpacity
        padding-12
        row
        centerV
        style={styles.msgItem}
        backgroundColor={
          selectedFileId === item.id ? Colors.grey60 : Colors.white
        }
        onLongPress={() => {
          Clipboard.setString(item.content);
          showToast('已复制消息到剪贴板', 'success');
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
                  const newItem = [...prevItem, item.id];
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
            {item.text}
          </Text>
          <View row spread>
            <Text text90L grey30>
              发送给 {matchMsgInfo(matchInfoList, item)}
            </Text>
          </View>
          <View row marginT-6 spread>
            <View row>
              <Badge
                backgroundColor={Colors.blue50}
                label={ChatTypeEnum[item.chat_type] || '未知'}
              />
              <View marginL-6>
                <Badge
                  backgroundColor={Colors.green50}
                  label={MsgTypeEnum[item.msg_type] || '未知'}
                />
              </View>
              <View marginL-6>
                <Badge
                  backgroundColor={Colors.red50}
                  label={MsgTypeEnum[item.msg_status] || '未知'}
                />
              </View>
              {item.msg_secret ? (
                <View marginL-6>
                  <Badge backgroundColor={Colors.orange50} label={'加密'} />
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

  const uploadFiles = async (files, useType) => {
    setIsDownload(false);
    setShowDialog(true);
    setFileNum(files.length);
    for (let i = 0; i < files.length; i++) {
      const media = files[i];
      const mediaRes = getFileFromDocumentPicker(useType, media, true);
      setNowFileIndex(i + 1);
      const res = await uploadFile(
        mediaRes.file,
        value => {
          setProgress(value);
        },
        {
          file_type: mediaRes.type,
          use_type: useType,
        },
      );
      const upRes = JSON.parse(res.text());
      setProgress(0);
      if (upRes.success) {
        showToast(`第${i + 1}个文件上传成功`, 'success');
      } else {
        showToast(`第${i + 1}个文件上传失败`, 'error');
        continue;
      }
    }
    setShowDialog(false);
    setFileNum(1);
  };

  /*  保存多个文件 */
  const saveFiles = async () => {
    if (selectedFileIds.length === 0) {
      showToast(t('empty.select'), 'warning');
      return;
    }
    setIsDownload(true);
    setShowDialog(true);
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
          onProgress: progress => setProgress(progress),
        },
      );
      setProgress(0);
      if (!savePath) {
        showToast(`第${i + 1}个文件下载失败`, 'error');
      }
    }
    showToast('文件下载完成', 'success');
    setShowDialog(false);
    setFileNum(1);
    setSelectedFileIds([]);
    setNowFileIndex(1);
    setIsAllSelect(false);
    setIsMultiSelect(false);
  };

  /* 删除文件 */
  const deleteFiles = async () => {
    if (isMultiSelect && selectedFileIds.length === 0) {
      showToast(t('empty.select'), 'warning');
      return;
    }
    const fileDelRes = await delFiles({
      ids: selectedFileIds,
    });
    if (fileDelRes.code === 0) {
      showToast(`成功删除${selectedFileIds.length || 1}个云端文件`, 'success');
    } else {
      showToast(fileDelRes.message, 'error');
    }

    setIsAllSelect(false);
    setSelectedFileIds([]);
    setIsMultiSelect(false);
    setShowFileActionSheet(false);
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
      showToast(`成功删除${selectedMsgIds.length || 1}条聊天记录`, 'success');
    } else {
      showToast(msgDelRes.message, 'error');
    }

    setIsAllSelect(false);
    setSelectedMsgIds([]);
    setIsMultiSelect(false);
    setShowMsgActionSheet(false);
  };

  const [focusedIndex, setFocusedIndex] = useState(0);

  const [showFileActionSheet, setShowFileActionSheet] = useState(false);
  const [showMsgActionSheet, setShowMsgActionSheet] = useState(false);

  const [progress, setProgress] = useState(0); // 保存文件进度
  const [showDialog, setShowDialog] = useState(false); // 下载进度条
  const [isDownload, setIsDownload] = useState(false); // 是否正在下载
  const [fileNum, setFileNum] = useState(1); // 总文件数
  const [nowFileIndex, setNowFileIndex] = useState(1); // 当前文件索引

  const [delVisible, setDelVisible] = useState(false); // 删除文件弹窗

  useEffect(() => {
    if (!showFileActionSheet) {
      setSelectedFileId(null);
    }
  }, [showFileActionSheet]);

  // 选择文件
  const pickFile = async () => {
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: true,
    })
      .then(files => {
        uploadFiles(files, 'upload');
      })
      .finally(() => {
        showToast(t('common.cancel'), 'success');
      });
  };

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
        <View row width={'50%'} spread>
          {isMultiSelect ? (
            <>
              <Button
                size={'xSmall'}
                label={isAllSelect ? '全不选' : '全选'}
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
              <Button
                size={'xSmall'}
                label={'下载'}
                link
                color={Colors.primary}
                onPress={() => {
                  setDelVisible(true);
                }}
              />
              <Button
                size={'xSmall'}
                label={'删除'}
                link
                color={Colors.primary}
                onPress={() => {
                  setDelVisible(true);
                }}
              />
            </>
          ) : (
            <View />
          )}
        </View>
      </View>
      <BaseTopBar
        routes={routes}
        focusedIndex={focusedIndex}
        onChange={(index, {key}) => {
          if (index < 4) {
            refreshFileList(key);
          } else {
            refreshMsgList(key);
          }
          setFocusedIndex(index);
          setIsAllSelect(false);
          setSelectedFileIds([]);
          setSelectedMsgIds([]);
        }}
      />
      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Card padding-16>
          <Text text70BL marginB-8>
            文件{isDownload ? '保存' : '上传'}
          </Text>
          <View>
            <Text marginB-16>
              共
              <Text text70 blue30 marginB-16>
                {fileNum}
              </Text>
              个文件，正在{isDownload ? '保存' : '上传'}第{nowFileIndex}
              个文件...
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
          deleteFiles();
          setDelVisible(false);
        }}
        visible={delVisible}
        setVisible={setDelVisible}
        description={'您确定要删除吗？'}
      />
      {/* 视频播放器 */}
      <VideoModal
        uri={fullscreenUri}
        visible={modalVisible}
        onClose={() => {
          setFullscreenUri(null);
          setModalVisible(!modalVisible);
        }}
        onPress={() => setModalVisible(false)}
        onError={e => {
          showToast('视频加载失败', 'error');
          console.log(e);
        }}
      />
      {/* 图片预览 */}
      <ImgModal
        uri={fullscreenUri}
        visible={imageShow}
        onClose={() => setImageShow(false)}
      />
      {fileLoading || msgLoading ? <FullScreenLoading /> : null}
    </>
  );
};

const styles = StyleSheet.create({
  image: {width: 50, height: 50, borderRadius: 4, marginRight: 12},
  fileIcon: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  msgItem: {
    borderBottomWidth: 1,
    borderColor: Colors.grey60,
  },
});
export default DataManager;
