import React, {useState, useEffect} from 'react';
import {View, Colors, Button} from 'react-native-ui-lib';
import {useToast} from '@utils/hooks/useToast';
import {useRealm} from '@realm/react';
import {useTranslation} from 'react-i18next';
import BaseDialog from '@components/common/BaseDialog';
import MusicList from '@components/music/MusicList';

const LatelyMusic = () => {
  const {showToast} = useToast();
  const {t} = useTranslation();
  const realm = useRealm();
  const [localMusic, setLocalMusic] = useState([]);

  // 获取最近播放的音乐记录
  const getLocalMusic = async () => {
    const music = realm.objects('music_info').sorted('updated_at', true).toJSON();
    setLocalMusic(music);
  };

  /* 删除本地音乐记录 */
  const [delVisible, setDelVisible] = useState(false);
  const delLocalMusic = () => {
    const toDelete = realm.objects('music_info').filtered('id == $0', 303);
    realm.write(() => {
      realm.delete(toDelete);
    });
    showToast(t('music.clear_success'), 'success');
    getLocalMusic();
  };

  useEffect(() => {
    if (realm) {
      getLocalMusic();
    }
  }, [realm]);

  return (
    <View padding-12>
      <MusicList
        list={localMusic}
        heightScale={0.92}
        rightBut={
          <View paddingR-12>
            <Button
              label={t('music.clear_label')}
              size="small"
              link
              linkColor={Colors.red40}
              onPress={() => {
                setDelVisible(true);
              }}
            />
          </View>
        }
      />
      <BaseDialog
        title={true}
        onConfirm={() => {
          delLocalMusic();
          setDelVisible(false);
        }}
        visible={delVisible}
        setVisible={setDelVisible}
        description={t('music.clear_confirm')}
      />
    </View>
  );
};

export default LatelyMusic;
