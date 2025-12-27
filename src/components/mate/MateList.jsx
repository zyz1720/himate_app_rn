import React, {useEffect, useState} from 'react';
import {FlatList, SectionList, RefreshControl} from 'react-native';
import {
  View,
  Text,
  Colors,
  Avatar,
  TouchableOpacity,
  Dialog,
  PanningProvider,
  Checkbox,
} from 'react-native-ui-lib';
import {getFirstLetter} from '@utils/common/string_utils';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {useScreenDimensionsContext} from '@components/contexts/ScreenDimensionsContext';

const MateList = props => {
  const {
    originalList = [],
    onConfirm = () => {},
    allowSelect = false,
    onSelectChange = () => {},
    initialSelectIds = [],
    excludeIds = [],
    onEndReached = () => {},
    loading = false,
    onRefresh = () => {},
    heightScale = 1,
  } = props;

  const {t} = useTranslation();
  const {fullHeight} = useScreenDimensionsContext();
  const {envConfig} = useConfigStore();

  const [mateList, setMateList] = useState([]);
  const [alphabetList, setAlphabetList] = useState([]);
  const [scrollData, setScrollData] = useState([]);

  /* 处理为分组数据 */
  const toGroupList = list => {
    const newList = list.map(item => {
      return {
        title: getFirstLetter(item.remarks),
        data: item,
      };
    });
    const newData = newList.reduce((accumulator, currentValue) => {
      const foundIndex = accumulator.findIndex(
        item => item.title === currentValue.title,
      );
      if (foundIndex !== -1) {
        accumulator[foundIndex].data.push(currentValue.data);
      } else {
        accumulator.push({
          title: currentValue.title,
          data: [currentValue.data],
        });
      }
      return accumulator;
    }, []);
    newData.sort((a, b) => {
      if (a.title === '#') {
        return 1;
      }
      if (b.title === '#') {
        return -1;
      }
      return a.title.localeCompare(b.title);
    });
    const letterList = newData.map(item => {
      return item.title;
    });

    return {
      mList: newData,
      letterList: letterList,
    };
  };

  const [pressIndex, setPressIndex] = useState(-1);
  const [hintVisible, setHintVisible] = useState(false);
  const [groupHeight, setGroupHeight] = useState(0);

  /* 滑动字母对应表 */
  const scrollSetting = list => {
    const newList = [];
    const itemHeight = groupHeight / 2 - (20 * list.length) / 2 + 46;
    for (let i = 0; i < list.length; i++) {
      const element = {
        min: Math.floor(itemHeight + i * 20),
        max: Math.floor(itemHeight + (i + 1) * 20),
        index: i,
      };
      newList.push(element);
    }
    return JSON.parse(JSON.stringify(newList));
  };

  const [flatListRef, setFlatListRef] = useState(null);
  /* 处理滑动字母对应表 */
  const showLetter = num => {
    const findIndex = scrollData.findIndex(
      range => num >= range.min && num < range.max,
    );
    if (findIndex === -1) {
      setHintVisible(false);
    } else {
      setHintVisible(true);
      setPressIndex(findIndex);
      flatListRef.scrollToLocation({
        itemIndex: 0, // 要滚动到的项的索引
        sectionIndex: findIndex, // 要滚动到的组的索引
      });
    }
  };

  const handleData = () => {
    const needRes = toGroupList(originalList);
    setMateList(needRes.mList);
    setAlphabetList(needRes.letterList);
    setScrollData(scrollSetting(needRes.letterList));
  };

  useEffect(() => {
    handleData();
  }, [originalList]);

  const [selectedItem, setSelectedItem] = useState(initialSelectIds);

  const renderItem = ({item}) => {
    return allowSelect ? (
      <View flexS row centerV backgroundColor={Colors.white} padding-12>
        <Checkbox
          marginR-12
          color={Colors.primary}
          size={20}
          borderRadius={10}
          value={
            selectedItem.includes(item.theOther.id) ||
            excludeIds.includes(item.theOther.id)
          }
          disabled={excludeIds.includes(item.theOther.id)}
          onValueChange={value => {
            if (value) {
              setSelectedItem(prevItem => {
                const newItem = [...new Set([...prevItem, item.theOther.id])];
                onSelectChange(newItem);
                return newItem;
              });
            } else {
              setSelectedItem(prevItem => {
                const newItem = prevItem.filter(
                  userId => userId !== item.theOther.id,
                );
                onSelectChange(newItem);
                return newItem;
              });
            }
          }}
        />
        <View flexS row centerV>
          <Avatar
            source={{
              uri: envConfig.STATIC_URL + item.theOther.user_avatar,
            }}
            imageProps={{errorSource: require('@assets/images/empty.jpg')}}
            backgroundColor={Colors.transparent}
            size={40}
          />
          <Text marginL-10 text70>
            {item.remarks}
          </Text>
        </View>
      </View>
    ) : (
      <View>
        <TouchableOpacity
          flexS
          row
          centerV
          backgroundColor={Colors.white}
          padding-12
          onPress={() => {
            onConfirm(item);
          }}>
          <Avatar
            source={{
              uri: envConfig.STATIC_URL + item.theOther.user_avatar,
            }}
            imageProps={{errorSource: require('@assets/images/empty.jpg')}}
            backgroundColor={Colors.transparent}
            size={40}
          />
          <Text marginL-10 text70>
            {item.remarks}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <SectionList
        style={{height: fullHeight * heightScale}}
        refreshControl={
          <RefreshControl
            colors={[Colors.primary]}
            refreshing={loading}
            onRefresh={onRefresh}
          />
        }
        sections={mateList}
        keyExtractor={(_, index) => index.toString()}
        onEndReachedThreshold={0.8}
        showsVerticalScrollIndicator={false}
        ref={Ref => setFlatListRef(Ref)}
        onEndReached={onEndReached()}
        renderItem={renderItem}
        ListFooterComponent={<View marginB-280 />}
        renderSectionHeader={({section: {title}}) => (
          <View padding-4 marginL-10>
            <Text grey30 text80>
              {title}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View marginT-16 center>
            <Text text90L grey40>
              {t('empty.mate')}
            </Text>
          </View>
        }
      />
      <View
        absR
        top={0}
        right={0}
        height={fullHeight - 180}
        flexG
        centerV
        onStartShouldSetResponder={() => true}
        onResponderMove={event => {
          showLetter(event.nativeEvent.pageY);
        }}
        onResponderRelease={() => {
          setHintVisible(false);
          setPressIndex(-1);
        }}
        onLayout={event => {
          const {height: group_height} = event.nativeEvent.layout;
          setGroupHeight(group_height);
        }}>
        <View>
          <FlatList
            data={alphabetList}
            keyExtractor={(item, index) => item + index}
            renderItem={({item, index}) => (
              <View
                width={20}
                height={20}
                br40
                center
                backgroundColor={
                  index === pressIndex ? Colors.primary : Colors.transparent
                }>
                <Text
                  text90L
                  style={{
                    color: index === pressIndex ? Colors.white : Colors.grey30,
                  }}>
                  {item}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
      <Dialog
        visible={hintVisible}
        overlayBackgroundColor={Colors.transparent}
        onDismiss={() => setHintVisible(false)}
        panDirection={PanningProvider.Directions.RIGHT}>
        <View flexG center>
          <View
            padding-8
            flexS
            center
            width={80}
            backgroundColor={Colors.black3}
            br40>
            <Text white text20>
              {alphabetList[pressIndex]}
            </Text>
          </View>
        </View>
      </Dialog>
    </>
  );
};

export default MateList;
