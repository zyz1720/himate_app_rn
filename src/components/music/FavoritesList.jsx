import React from 'react';
import {StyleSheet} from 'react-native';
import {
  View,
  Text,
  Colors,
  Avatar,
  TouchableOpacity,
  GridList,
  Card,
  Image,
} from 'react-native-ui-lib';
import {useConfigStore} from '@store/configStore';
import {fullHeight, fullWidth} from '@style/index';
import {useTranslation} from 'react-i18next';

const FavoritesList = props => {
  const {list = [], onEndReached = () => {}, onPress = () => {}} = props;

  const {t} = useTranslation();

  const {envConfig} = useConfigStore();

  return (
    <View height={fullHeight * 0.9}>
      <GridList
        data={list}
        numColumns={2}
        containerWidth={fullWidth - 24}
        keyExtractor={(item, index) => item + index}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          onEndReached();
        }}
        renderItem={({item}) => (
          <Card flexS centerV enableShadow={true} padding-12>
            <TouchableOpacity
              onPress={() => {
                onPress(item);
              }}>
              <View row>
                <Image
                  source={{uri: envConfig.THUMBNAIL_URL + item.favorites_cover}}
                  style={styles.image}
                />
                <View bottom>
                  <Text
                    style={styles.italicText}
                    text100BO
                    grey60
                    marginL-6
                    marginB-4>
                    songs
                  </Text>
                  <Text text40BO grey60 marginL-4>
                    {item.musicCount}
                  </Text>
                </View>
              </View>
              <View marginT-6>
                <Text text80BO numberOfLines={1} grey10>
                  {item.favorites_name}
                </Text>
              </View>
              <View marginT-6 row bottom spread>
                <View row centerV>
                  <Text text90L grey30 style={styles.userName}>
                    {item.creator_name}
                  </Text>
                  <View marginL-6>
                    <Avatar
                      size={26}
                      source={{
                        uri: envConfig.STATIC_URL + item.creator_avatar,
                      }}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <View marginT-16 center>
            <Text text90L grey40>
              {t('empty.favorites')}
            </Text>
          </View>
        }
        ListFooterComponent={
          list.length > 8 ? (
            <View marginB-80 padding-12 center>
              <Text text90L grey40>
                {t('common.footer')}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};
const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  userName: {
    maxWidth: 90,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  italicText: {
    fontStyle: 'italic',
  },
});
export default FavoritesList;
