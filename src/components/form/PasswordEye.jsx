import React from 'react';
import {TouchableOpacity, Colors} from 'react-native-ui-lib';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PasswordEye = props => {
  const {visible, setVisible, isFloat, top, bottom, left, right} = props;

  const absoluteStyle = {
    position: 'absolute',
    right,
    bottom,
    top,
    left,
  };

  return (
    <TouchableOpacity
      style={isFloat ? absoluteStyle : null}
      onPress={() => setVisible(prev => !prev)}>
      {visible ? (
        <FontAwesome name="eye-slash" color={Colors.grey40} size={20} />
      ) : (
        <FontAwesome name="eye" color={Colors.grey40} size={20} />
      )}
    </TouchableOpacity>
  );
};
export default PasswordEye;
