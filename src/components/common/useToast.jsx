import React, {useState, createContext, useContext} from 'react';
import {ToastAndroid, StyleSheet, Platform} from 'react-native';
import {Toast, View, Text, Colors} from 'react-native-ui-lib';
import {useSettingStore} from '@store/settingStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export const ToastContext = createContext();

let timer = null;
const ToastProvider = props => {
  const {children} = props;
  const {toastType} = useSettingStore();
  const [message, setMessage] = useState(null);
  const [isVisible, setVisible] = useState(false);
  const [typeColor, setTypeColor] = useState(Colors.grey40);
  const [iosToastVisible, setIosToastVisible] = useState(false);

  const iosToastShow = useSharedValue(false);
  const AnimatedShowToast = useAnimatedStyle(() => {
    return {
      opacity: withTiming(iosToastShow.value ? 1 : 0),
    };
  });

  const showToast = async (msg, type, important = false) => {
    if (msg) {
      if (toastType === 'system' || important) {
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            msg,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
        if (Platform.OS === 'ios') {
          if (timer) {
            return;
          }
          setIosToastVisible(true);
          iosToastShow.value = true;
          setMessage(msg);
          timer = setTimeout(() => {
            setIosToastVisible(false);
            iosToastShow.value = false;
            clearTimeout(timer);
            timer = null;
          }, 1200);
        }
      }
      if (toastType !== 'system' && !important) {
        setMessage(msg);
        setVisible(true);
      }
    }
    if (type === 'warning') {
      setTypeColor(Colors.warning);
    }
    if (type === 'success') {
      setTypeColor(Colors.success);
    }
    if (type === 'error') {
      setTypeColor(Colors.error);
    }
  };

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <Toast
        onDismiss={() => {
          setVisible(false);
        }}
        position={toastType === 'system' ? 'bottom' : toastType}
        centerMessage={true}
        backgroundColor={typeColor}
        visible={isVisible}
        autoDismiss={1200}
        message={message}
        color={Colors.white}
      />
      {iosToastVisible ? (
        <Animated.View style={[styles.IosToastStyle, AnimatedShowToast]}>
          <View style={styles.IosToastBox} padding-10>
            <Text white text80>
              {message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  IosToastStyle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    bottom: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  IosToastBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    maxWidth: 200,
  },
});

export const useToast = () => useContext(ToastContext);

export default ToastProvider;
