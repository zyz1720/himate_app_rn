import React, {useRef} from 'react';
import {StyleSheet, Vibration} from 'react-native';
import {View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {fullHeight} from '@style/index';
import {useTranslation} from 'react-i18next';
import {useToast} from '@components/common/useToast';
import {validate} from 'uuid';
import AntDesign from 'react-native-vector-icons/AntDesign';

const styles = StyleSheet.create({
  Camera: {width: '100%', height: fullHeight * 0.8, zIndex: -1},
  tipText: {
    position: 'absolute',
    width: '100%',
    bottom: fullHeight * 0.2,
  },
  BackBut: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
});

const CodeScanner = ({navigation}) => {
  const {showToast} = useToast();
  const {t} = useTranslation();

  const codeRef = useRef(null);

  const device = useCameraDevice('back');
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (codes[0]?.value) {
        if (codeRef.current === codes[0].value) {
          return;
        }
        codeRef.current = codes[0].value;
        Vibration.vibrate(50);
        if (validate(codeRef.current)) {
          navigation.navigate('QrCodeLogin', {
            qrcode_id: codeRef.current,
          });
        } else {
          navigation.navigate('AddMate', {
            account: codeRef.current,
          });
        }
      } else {
        showToast(t('common.scan_qrcode_failed'), 'error');
      }
    },
  });

  return (
    <View bg-white height={'100%'}>
      {device ? (
        <Camera
          style={styles.Camera}
          device={device}
          codeScanner={codeScanner}
          isActive={true}
        />
      ) : (
        <View style={styles.Camera} center bg-black>
          <Text center white>
            {t('mate.camera_error')}
          </Text>
        </View>
      )}

      <Text center white style={styles.tipText}>
        {t('mate.scan_qrcode_tip')}
      </Text>
      <View marginT-16>
        <TouchableOpacity
          center
          onPress={() => {
            navigation.navigate('QrCode');
          }}>
          <View padding-2 bg-grey60 borderRadius={6}>
            <AntDesign name="qrcode" size={32} color={Colors.black} />
          </View>
          <Text grey30 marginT-4 text80>
            {t('mate.my_qrcode')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CodeScanner;
