import React from 'react';
import {StyleSheet} from 'react-native';
import {TouchableOpacity, Colors, View, Badge, Text} from 'react-native-ui-lib';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ListItem = props => {
  const {
    onConfirm = () => {},
    iconName,
    iconColor,
    iconSize,
    itemName,
    showBottomLine,
    showBadge,
    badgeCount,
    rightText,
    renderRight = null,
  } = props;

  return (
    <>
      <TouchableOpacity
        flexG
        spread
        row
        centerV
        paddingH-16
        paddingV-12
        onPress={() => onConfirm()}>
        <View flexS centerV row>
          <View width={22} center>
            <FontAwesome
              name={iconName}
              color={iconColor}
              size={iconSize ? iconSize : 22}
            />
          </View>
          <Text text70 marginL-8>
            {itemName}
          </Text>
        </View>
        {renderRight ? (
          renderRight
        ) : (
          <View flexS row spread centerV>
            {showBadge && badgeCount > 0 ? (
              <View marginR-12>
                <Badge
                  label={badgeCount}
                  backgroundColor={Colors.error}
                  size={16}
                />
              </View>
            ) : null}
            {rightText ? (
              <Text
                marginR-12
                numberOfLines={2}
                style={styles.maxWidth160}
                text80
                grey40>
                {rightText}
              </Text>
            ) : null}
            <FontAwesome name="angle-right" color={Colors.grey50} size={26} />
          </View>
        )}
      </TouchableOpacity>
      <View style={showBottomLine ? styles.boxBottomLine : null} />
    </>
  );
};
const styles = StyleSheet.create({
  boxBottomLine: {
    borderBottomColor: Colors.grey80,
    borderBottomWidth: 1,
    width: '82%',
    position: 'absolute',
    right: 18,
  },
  maxWidth160: {
    maxWidth: 160,
  },
});
export default ListItem;
