import React, {useState} from 'react';
import {Vibration, StyleSheet, Modal, FlatList} from 'react-native';
import {
  View,
  Card,
  Text,
  Colors,
  Button,
  TextField,
  TouchableOpacity,
  Avatar,
} from 'react-native-ui-lib';
import {useToast} from '@components/common/useToast';
import {searchUsers} from '@api/user';
import {addMate} from '@api/mate';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {fullHeight} from '@style/index';
import {usePermissionStore} from '@store/permissionStore';
import {useSettingStore} from '@store/settingStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BaseDialog from '@components/common/BaseDialog';

const AddMate = ({navigation}) => {
  const {showToast} = useToast();
  const {isFullScreen} = useSettingStore();
  const {accessCamera, setAccessCamera} = usePermissionStore();
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  const [keyword, setKeyword] = useState('');
  const {list, onEndReached, refreshData} = useInfiniteScroll(searchUsers);

  const [userId, setUserId] = useState(null);

  /*  添加好友 */
  const [isVisible, setIsVisible] = useState(false);
  const [remark, setRemark] = useState('');
  const [message, setMessage] = useState('');
  const addFriend = async () => {
    try {
      const addRes = await addMate({
        friend_id: userId,
        friend_remarks: remark,
        validate_msg: message,
      });
      if (addRes.code === 0) {
        showToast(t('mate.add_success'), 'success');
        reset();
        return;
      }
      showToast(addRes.message, 'error');
    } catch (error) {
      console.error(error);
    }
  };

  const reset = () => {
    setIsVisible(false);
    setRemark('');
    setMessage('');
  };

  /* 扫描二维码 */
  const [modalVisible, setModalVisible] = useState(false);
  const device = useCameraDevice('back');
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (codes[0]?.value) {
        Vibration.vibrate(50);
        refreshData({keyword: codes[0].value});
        setModalVisible(false);
      } else {
        showToast(t('common.scan_qrcode_failed'), 'error');
      }
    },
  });

  const renderItem = ({item}) => (
    <Card marginT-16 padding-12 paddingB-16>
      <View flexS backgroundColor={Colors.white} spread row centerV>
        <TouchableOpacity
          flexS
          row
          centerV
          onPress={() => {
            navigation.navigate('MateInfo', {
              userId: item.id,
            });
          }}>
          <Avatar
            size={60}
            source={{
              uri: envConfig.STATIC_URL + item?.user_avatar,
            }}
            imageProps={{errorSource: require('@assets/images/empty.jpg')}}
            backgroundColor={Colors.transparent}
          />
          <View marginL-10>
            <Text text80BL>{item?.user_name || ''}</Text>
            <Text text90L marginT-2 grey30>
              {t('user.account')}: {item.self_account}
            </Text>
            <Text text90L marginT-2 grey30>
              {t('user.email')}: {item.account}
            </Text>
          </View>
        </TouchableOpacity>
        <View marginL-10 flexS row>
          <Button
            onPress={() => {
              setUserId(item.id);
              setIsVisible(true);
            }}
            marginL-8
            label={t('common.append')}
            borderRadius={8}
            text70L
            avoidMinWidth={true}
            outline
            outlineColor={Colors.primary}
            size={Button.sizes.xSmall}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <View padding-16>
      <Card padding-12 flexS enableShadow={false} row spread>
        <TextField
          placeholder={t('mate.search_placeholder')}
          text80L
          showClearButton
          onChangeText={value => {
            setKeyword(value);
          }}
          maxLength={30}
        />
        <View flexS centerV row>
          <TouchableOpacity
            onPress={() => {
              if (!accessCamera) {
                showToast(t('permission.camera_please'), 'warning');
                setAccessCamera();
                return;
              }
              if (device) {
                setModalVisible(true);
              } else {
                showToast(t('mate.camera_error'), 'error');
              }
            }}>
            <AntDesign name="scan1" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Button
            marginL-12
            label={t('common.search')}
            borderRadius={8}
            text70L
            avoidMinWidth={true}
            size={Button.sizes.small}
            backgroundColor={Colors.primary}
            onPress={() => {
              if (!keyword) {
                showToast(t('common.search_keyword'), 'warning');
                return;
              }
              refreshData({keyword});
            }}
          />
        </View>
      </Card>
      <FlatList
        data={list}
        renderItem={renderItem}
        onEndReachedThreshold={0.8}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={onEndReached}
        ListFooterComponent={<View marginB-200 />}
      />

      <BaseDialog
        onConfirm={addFriend}
        visible={isVisible}
        setVisible={setIsVisible}
        description={t('mate.add_mate')}
        renderBody={
          <View paddingR-16>
            <TextField
              marginT-8
              placeholder={t('mate.remark_placeholder')}
              floatingPlaceholder
              showClearButton
              text70L
              onChangeText={value => {
                setRemark(value);
              }}
              maxLength={10}
              showCharCounter={true}
            />
            <TextField
              marginT-8
              placeholder={t('mate.message_placeholder')}
              floatingPlaceholder
              showClearButton
              text70L
              onChangeText={value => {
                setMessage(value);
              }}
              maxLength={50}
              showCharCounter={true}
              multiline={true}
            />
          </View>
        }
      />
      {/* 扫描二维码弹窗 */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View bg-white>
          {!isFullScreen ? (
            <View padding-12 row center backgroundColor={Colors.primary}>
              <TouchableOpacity
                style={styles.BackBut}
                onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
              <View paddingT-4>
                <Text white>{t('mate.scan_qrcode')}</Text>
              </View>
            </View>
          ) : null}
          <Camera
            style={styles.Camera}
            device={device}
            codeScanner={codeScanner}
            isActive={true}
          />
          <Text center white style={styles.tipText}>
            {t('mate.scan_qrcode_tip')}
          </Text>
          <View marginT-16>
            <TouchableOpacity
              center
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('QrCode');
              }}>
              <View style={styles.selfCode}>
                <AntDesign name="qrcode" size={32} color={Colors.black} />
              </View>
              <Text grey30 marginT-4 text80>
                {t('mate.my_qrcode')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  Camera: {width: '100%', height: fullHeight * 0.8, zIndex: -1},
  tipText: {
    position: 'absolute',
    width: '100%',
    bottom: fullHeight * 0.2,
  },
  selfCode: {
    padding: 2,
    backgroundColor: Colors.grey60,
    borderRadius: 6,
  },
  BackBut: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
});
export default AddMate;
