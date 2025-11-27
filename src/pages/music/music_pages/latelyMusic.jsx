import React, {useState, useEffect} from 'react';
import {View, Colors, Button} from 'react-native-ui-lib';
import {useToast} from '@utils/hooks/useToast';
import {useTranslation} from 'react-i18next';
import {getPlayHistory, clearPlayHistory} from '@utils/realm/useMusicInfo';
import BaseDialog from '@components/common/BaseDialog';
import MusicList from '@components/music/MusicList';

const LatelyMusic = () => {
  const {showToast} = useToast();
  const {t} = useTranslation();
  const [localMusic, setLocalMusic] = useState([]);

  // 获取最近播放的音乐记录
  const getPlayHistoryFunc = () => {
    const music = getPlayHistory();
    setLocalMusic(music);
  };

  /* 删除本地音乐记录 */
  const [delVisible, setDelVisible] = useState(false);
  const delPlayHistory = () => {
    clearPlayHistory();
    showToast(t('music.clear_success'), 'success');
    getPlayHistoryFunc();
  };

  useEffect(() => {
    getPlayHistoryFunc();
  }, []);

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
          delPlayHistory();
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
