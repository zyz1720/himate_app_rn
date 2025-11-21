import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Colors,
  Image,
  Switch,
  Card,
  TextField,
  Button,
} from 'react-native-ui-lib';
import {StyleSheet, ScrollView} from 'react-native';
import {useToast} from '@utils/hooks/useToast';
import {getFavoritesDetail, updateFavorites} from '@api/favorites';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import {uploadFile} from '@utils/system/file_utils';
import FullScreenLoading from '@components/common/FullScreenLoading';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AvatarPicker from '@components/form/AvatarPicker';

const EditFavorites = ({route}) => {
  const {favoritesId} = route.params || {};
  const {showToast} = useToast();
  const {envConfig} = useConfigStore();
  const {t} = useTranslation();

  /* 获取收藏夹详情 */
  const [loading, setLoading] = useState(false);
  const [favoritesForm, setFavoritesForm] = useState({});
  const [coverUri, setCoverUri] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  const [isPublic, setIsPublic] = useState(false);
  const getFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavoritesDetail({
        id: favoritesId,
        current: 1,
        pageSize: 0,
      });
      if (res.code === 0) {
        setFavoritesForm(res.data);
        const {favorites_cover, is_public} = res.data;
        setCoverUri(envConfig.THUMBNAIL_URL + favorites_cover);
        setIsPublic(is_public === 'yes');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [showPicker, setShowPicker] = useState(false);

  // 是否需要保存
  const [allowSave, setAllowSave] = useState(false);
  const updateNeedSave = () => {
    setAllowSave(true);
  };

  // 处理数据
  const [isCleanCache, setIsCleanCache] = useState(false);
  const handleData = async () => {
    favoritesForm.is_public = isPublic ? 'yes' : 'no';

    const keys = Object.keys(favoritesForm);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const element = favoritesForm[key];
      if (element === null || element === '') {
        showToast(t('empty.input'), 'error');
        return false;
      }
    }

    if (coverFile) {
      try {
        const res = await uploadFile(coverFile, () => {}, {
          file_type: 'image',
          use_type: 'music',
        });
        const uploadRes = JSON.parse(res.text());
        if (uploadRes.code === 0) {
          const cover = uploadRes.data.file_key;
          setFavoritesForm({...favoritesForm, favorites_cover: cover});
          return true;
        }
        showToast(uploadRes.message, 'error');
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setIsCleanCache(true);
      }
    }
    return true;
  };

  // 提交编辑
  const submitForm = async () => {
    try {
      setLoading(true);
      const valid = await handleData();
      if (!valid) {
        return;
      }
      const res = await updateFavorites(favoritesId, favoritesForm);
      showToast(res.message, res.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (favoritesId) {
      getFavorites();
    }
  }, [favoritesId]);

  return (
    <ScrollView>
      <View padding-16>
        <Card
          flexS
          left
          row
          center
          padding-16
          onPress={() => setShowPicker(true)}>
          <View flex>
            <Text grey40 text70>
              {t('music.favorites_cover')}
            </Text>
          </View>
          <View marginR-12>
            <Image source={{uri: coverUri}} style={styles.image} />
          </View>
          <FontAwesome name="angle-right" color={Colors.grey50} size={26} />
        </Card>
        <Card marginT-12 padding-16>
          <TextField
            labelColor={Colors.grey10}
            text70
            enableErrors
            placeholder={t('music.favorites_name')}
            floatingPlaceholder
            color={Colors.grey10}
            placeholderTextColor={Colors.grey50}
            validate={[value => value.length !== 0]}
            validationMessage={[t('music.favorites_name_empty')]}
            maxLength={20}
            showCharCounter
            value={favoritesForm.favorites_name}
            validateOnChange={true}
            onChangeText={value => {
              setFavoritesForm(prev => ({...prev, favorites_name: value}));
              updateNeedSave();
            }}
          />
          <View marginT-10>
            <TextField
              labelColor={Colors.grey10}
              text70
              enableErrors
              floatingPlaceholder
              placeholder={t('music.favorites_remarks')}
              color={Colors.grey10}
              placeholderTextColor={Colors.grey50}
              multiline
              numberOfLines={3}
              maxLength={1000}
              showCharCounter
              value={favoritesForm.favorites_remarks}
              validateOnChange={true}
              onChangeText={value => {
                setFavoritesForm(prev => ({...prev, favorites_remarks: value}));
                updateNeedSave();
              }}
            />
          </View>
          <View marginT-10 row centerV>
            <Text grey40>{t('music.is_public')}</Text>
            <View marginL-12>
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={isPublic}
                onValueChange={value => {
                  setIsPublic(value);
                  updateNeedSave();
                }}
              />
            </View>
          </View>
        </Card>
        {allowSave && (
          <Button
            marginT-16
            bg-primary
            text70
            white
            label={t('common.save')}
            borderRadius={12}
            onPress={() => {
              submitForm();
            }}
          />
        )}
      </View>
      <AvatarPicker
        visible={showPicker}
        setVisible={setShowPicker}
        isCleanCache={isCleanCache}
        onSelected={fileInfo => {
          setCoverUri(fileInfo.uri);
          setCoverFile(fileInfo);
          updateNeedSave();
        }}
      />
      {loading ? <FullScreenLoading /> : null}
      <View height={120} />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  button: {
    width: '100%',
    height: 42,
  },
});
export default EditFavorites;
