import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, TouchableOpacity} from 'react-native-ui-lib';

const BaseColorPicker = ({onConfirm, selectedColor}) => {
  const colorList = [
    {id: 1, name: '薄暮', color: '#f5222d'},
    {id: 2, name: '火山', color: '#fa541c'},
    {id: 3, name: '日暮', color: '#ffa940'},
    {id: 4, name: '金盏花', color: '#faad14'},
    {id: 5, name: '日出', color: '#fadb14'},
    {id: 6, name: '青柠', color: '#a0d911'},
    {id: 7, name: '极光绿', color: '#52c41a'},
    {id: 8, name: '明青', color: '#13c2c2'},
    {id: 9, name: '拂晓蓝', color: '#1677ff'},
    {id: 10, name: '极客蓝', color: '#2f54eb'},
    {id: 11, name: '酱紫', color: '#722ed1'},
    {id: 12, name: '洋红', color: '#eb2f96'},
  ];

  return colorList.map(item => (
    <TouchableOpacity key={item.id} onPress={() => onConfirm(item)}>
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
          {item.name}
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
