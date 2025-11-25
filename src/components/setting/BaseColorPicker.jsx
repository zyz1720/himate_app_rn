import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, TouchableOpacity} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import {colorList} from '@style/index';

const BaseColorPicker = ({onConfirm, selectedColor}) => {
  const {t} = useTranslation();

  return colorList.map(item => (
    <TouchableOpacity
      key={item.id}
      onPress={() =>
        onConfirm({
          ...item,
          name: t(`setting.color_${item.id}`),
        })
      }>
      <View flexS width={80} center padding-8>
        <View
          height={34}
          width={34}
          flexG
          center
          style={
            (selectedColor === item.color ? styles.selectedStyle : null,
            {
              borderColor: item.color,
            })
          }>
          <View style={styles.smallbox} backgroundColor={item.color} />
        </View>
        <Text marginT-4 text90>
          {t(`setting.color_${item.id}`)}
        </Text>
      </View>
    </TouchableOpacity>
  ));
};

const styles = StyleSheet.create({
  smallbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  selectedStyle: {
    borderRadius: 10,
    borderWidth: 2,
  },
});

export default BaseColorPicker;
