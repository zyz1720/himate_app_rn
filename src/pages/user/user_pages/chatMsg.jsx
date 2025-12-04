import React, {useState} from 'react';
import {View, Button, TextField, Card, Colors, Text} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {useRealm} from '@realm/react';
import {encryptAES, decryptAES} from '@utils/system/crypto_utils';
import {writeJSONFile, readJSONFile} from '@utils/system/file_utils';
import {setLocalMsg} from '@utils/system/chat_utils';
import {usePermissionStore} from '@store/permissionStore';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DocumentPicker from 'react-native-document-picker';
import ListItem from '@components/common/ListItem';
import BaseDialog from '@components/common/BaseDialog';
import PasswordEye from '@components/form/PasswordEye';

const ChatMsg = ({route}) => {
  const {session_id} = route.params || {};
  const {showToast} = useToast();
  const {t} = useTranslation();
  const realm = useRealm();
  const {accessFolder, setAccessFolder} = usePermissionStore();

  const [hideFlag, setHideFlag] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [msgSecret, setMsgSecret] = useState('');

  /* 导出聊天记录 */
  const [handlerType, setHandlerType] = useState('export');
  const exportChatMsgText = async () => {
    let localMsgs = realm.objects('ChatMsg');
    if (session_id) {
      localMsgs = localMsgs.filtered('session_id == $0', session_id);
    }
    const newList = localMsgs.toJSON();
    const exportData = encryptAES(newList, msgSecret);
    // console.log(exportData);
    const writeRes = await writeJSONFile(
      exportData,
      `chatHistory_${Date.now()}.json`,
    );
    if (writeRes) {
      showToast(t('user.export_chat_success'), 'success');
    } else {
      showToast(t('user.export_chat_failed'), 'error');
    }
  };

  /* 选择文件 */
  const [importFile, setImportFile] = useState([]);
  const selectFile = async () => {
    DocumentPicker.pick({
      type: [DocumentPicker.types.json],
      allowMultiSelection: true,
    })
      .then(JSONfiles => {
        setImportFile(JSONfiles);
        setInputVisible(true);
      })
      .finally();
  };

  /* 导入聊天记录 */
  const importChatMsgText = async () => {
    let successCount = 0;
    for (let i = 0; i < importFile.length; i++) {
      const magData = await readJSONFile(importFile[i].uri);
      if (!magData?.encryptedData && !magData?.iv) {
        showToast(t('user.chat_file_error'), 'error');
        continue;
      }
      const msgList = decryptAES(magData.encryptedData, magData.iv, msgSecret);
      if (!msgList) {
        showToast(t('user.chat_secret_error'), 'error');
        continue;
      }
      setLocalMsg(realm, msgList);
      successCount += 1;
    }
    if (successCount > 0) {
      showToast(
        t('user.import_chat_success', {count: successCount}),
        'success',
      );
    }
  };

  /* 清空聊天记录 */
  const [clearMsgVisible, setClearMsgVisible] = useState(false);
  const clearChatMsg = () => {
    const toDelete = realm.objects('ChatMsg');
    realm.write(() => {
      realm.delete(toDelete);
      showToast(t('user.clear_chat_success'), 'success');
    });
  };

  return (
    <>
      <View flexG paddingH-16 paddingT-18>
        <Text text90L marginB-16 grey30 center>
          <FontAwesome
            name="exclamation-circle"
            color={Colors.red30}
            size={14}
          />
          &nbsp;{t('user.chat_secret_warning')}
        </Text>
        <Card enableShadow={false}>
          <View>
            <ListItem
              itemName={
                session_id ? t('user.export_chat') : t('user.export_all_chat')
              }
              iconName={'download'}
              iconColor={Colors.grey10}
              iconSize={20}
              rightText={t('user.export_chat')}
              onConfirm={() => {
                if (!accessFolder) {
                  showToast(t('permissions.folder_please'), 'warning');
                  setAccessFolder();
                  return;
                }
                setHandlerType('export');
                setInputVisible(true);
              }}
            />
            <View paddingH-16 paddingB-16>
              <Text grey30 text90L>
                {t('user.chat_secret_tip')}
              </Text>
            </View>
          </View>
          {!session_id ? (
            <View>
              <ListItem
                itemName={t('user.import_chat')}
                iconName={'upload'}
                iconColor={Colors.grey10}
                iconSize={20}
                rightText={t('user.import_chat_select')}
                onConfirm={() => {
                  if (!accessFolder) {
                    showToast(t('permissions.folder_please'), 'warning');
                    setAccessFolder();
                    return;
                  }
                  setHandlerType('import');
                  selectFile();
                }}
              />
              <View paddingH-16 paddingB-16>
                <Text grey30 text90L>
                  {t('user.import_chat_tip')}
                </Text>
              </View>
            </View>
          ) : null}
        </Card>
        {!session_id ? (
          <Button
            bg-white
            marginT-16
            text70
            red30
            borderRadius={12}
            label={t('user.clear_chat')}
            onPress={() => setClearMsgVisible(true)}
          />
        ) : null}
      </View>
      <BaseDialog
        onConfirm={
          handlerType === 'export' ? exportChatMsgText : importChatMsgText
        }
        visible={inputVisible}
        setVisible={setInputVisible}
        description={t('user.chat_secret')}
        renderBody={
          <View>
            <TextField
              marginT-8
              placeholder={t('user.chat_secret_placeholder')}
              text70L
              floatingPlaceholder
              secureTextEntry={hideFlag}
              onChangeText={value => {
                setMsgSecret(value);
              }}
              maxLength={10}
              showCharCounter={true}
            />
            <PasswordEye
              visible={hideFlag}
              setVisible={setHideFlag}
              isFloat={true}
              right={0}
              top={30}
            />
          </View>
        }
      />
      <BaseDialog
        title={true}
        onConfirm={clearChatMsg}
        visible={clearMsgVisible}
        setVisible={setClearMsgVisible}
        description={t('user.clear_chat_confirm')}
      />
    </>
  );
};
export default ChatMsg;
