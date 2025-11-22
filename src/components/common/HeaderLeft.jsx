import React from 'react';
import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useUserStore} from '@store/userStore';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function HeaderLeft(navigation) {
  const {isLogin} = useUserStore();
  return (
    <TouchableOpacity paddingH-26 onPress={() => navigation.goBack()}>
      <FontAwesome
        name="angle-left"
        color={isLogin ? Colors.white : Colors.black}
        size={26}
      />
    </TouchableOpacity>
  );
}
