import React, {useState} from 'react';
import {
  View,
  Text,
  Card,
  Colors,
  Switch,
  Slider,
  SegmentedControl,
  ColorPicker,
  Button,
} from 'react-native-ui-lib';
import {ScrollView} from 'react-native';
import {useSettingStore} from '@store/settingStore';
import {useTranslation} from 'react-i18next';
import {LYRIC_COLORS} from '@const/custom_colors';
import {usePermissionStore} from '@store/permissionStore';
import {useToast} from '@components/common/useToast';
import Animated, {FadeInUp} from 'react-native-reanimated';
import ListItem from '@components/common/ListItem';
import BaseDialog from '@components/common/BaseDialog';

const LYRIC_TYPE = ['lrc', 'trans', 'roma'];

const LyricController = () => {
  const {t} = useTranslation();
  const {
    isShowStatusBarLyric,
    setIsShowStatusBarLyric,
    isShowDesktopLyric,
    setIsShowDesktopLyric,
    statusBarLyricType,
    setStatusBarLyricType,
    desktopLyricFontSize,
    desktopTransFontSize,
    setDesktopLyricFontSize,
    setDesktopTransFontSize,
    desktopLyricColor,
    setDesktopLyricColor,
    desktopTransColor,
    setDesktopTransColor,
    resetDesktopLyric,
  } = useSettingStore();

  const {showToast} = useToast();

  const {accessOverlay, setAccessOverlay} = usePermissionStore();

  const [isResetVisible, setResetVisible] = useState(false);

  return (
    <ScrollView>
      <View padding-16>
        <Card flexS>
          <ListItem
            itemName={t('music.desktop_lyric')}
            renderRight={
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={isShowDesktopLyric}
                onValueChange={async value => {
                  if (value) {
                    if (!accessOverlay) {
                      showToast(t('permissions.overlay_please'));
                      setAccessOverlay();
                      return;
                    }
                  }
                  setIsShowDesktopLyric(value);
                }}
              />
            }
          />
          {isShowDesktopLyric ? (
            <Animated.View entering={FadeInUp}>
              <View paddingH-16 marginT-8>
                <View>
                  <Text text90L grey30 marginV-4>
                    {t('music.desktop_lyric_font_size')}&nbsp;
                    {desktopLyricFontSize}
                  </Text>
                  <Slider
                    thumbTintColor={Colors.primary}
                    minimumTrackTintColor={Colors.primary}
                    minimumValue={6}
                    maximumValue={48}
                    value={desktopLyricFontSize}
                    step={1}
                    onValueChange={value => {
                      setDesktopLyricFontSize(value);
                    }}
                  />
                  <Text text90L grey30 marginV-4>
                    {t('music.desktop_lyric_color')}
                  </Text>
                  <ColorPicker
                    colors={[desktopLyricColor, ...LYRIC_COLORS]}
                    initialColor={desktopLyricColor}
                    value={desktopLyricColor}
                    showCloseButton={true}
                    onValueChange={color => {
                      setDesktopLyricColor(color);
                    }}
                    onSubmit={color => {
                      setDesktopLyricColor(color);
                    }}
                  />
                </View>
                <View>
                  <Text text90L grey30 marginV-4>
                    {t('music.desktop_trans_font_size')}&nbsp;
                    {desktopTransFontSize}
                  </Text>
                  <Slider
                    thumbTintColor={Colors.primary}
                    minimumTrackTintColor={Colors.primary}
                    minimumValue={6}
                    maximumValue={36}
                    value={desktopTransFontSize}
                    step={1}
                    onValueChange={value => {
                      setDesktopTransFontSize(value);
                    }}
                  />
                  <Text text90L grey30 marginV-4>
                    {t('music.desktop_trans_color')}
                  </Text>
                  <ColorPicker
                    colors={[desktopTransColor, ...LYRIC_COLORS]}
                    initialColor={desktopTransColor}
                    value={desktopTransColor}
                    showCloseButton={true}
                    onValueChange={color => {
                      setDesktopTransColor(color);
                    }}
                    onSubmit={color => {
                      setDesktopTransColor(color);
                    }}
                  />
                </View>
                <Button
                  marginB-16
                  text70
                  outline
                  size="medium"
                  outlineColor={Colors.error}
                  color={Colors.error}
                  borderRadius={12}
                  label={t('music.reset')}
                  onPress={() => {
                    setResetVisible(true);
                  }}
                />
              </View>
            </Animated.View>
          ) : null}
        </Card>
        <Card flexS marginT-16>
          <ListItem
            itemName={t('music.statusBar_lyric')}
            renderRight={
              <Switch
                onColor={Colors.primary}
                offColor={Colors.grey50}
                value={isShowStatusBarLyric}
                onValueChange={value => setIsShowStatusBarLyric(value)}
              />
            }
          />
          {isShowStatusBarLyric ? (
            <Animated.View entering={FadeInUp}>
              <ListItem
                renderRight={
                  <SegmentedControl
                    segments={[
                      {label: t('music.lrc')},
                      {label: t('music.trans')},
                      {label: t('music.roma')},
                    ]}
                    initialIndex={LYRIC_TYPE.indexOf(statusBarLyricType)}
                    borderRadius={12}
                    outlineColor={Colors.primary}
                    outlineWidth={2}
                    activeColor={Colors.primary}
                    onChangeIndex={value => {
                      setStatusBarLyricType(LYRIC_TYPE[value]);
                    }}
                  />
                }
              />
            </Animated.View>
          ) : null}
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('music.lyric_tips')}
            </Text>
          </View>
        </Card>
        <BaseDialog
          title={true}
          onConfirm={() => {
            resetDesktopLyric();
            setResetVisible(false);
          }}
          visible={isResetVisible}
          setVisible={setResetVisible}
          description={t('music.reset_confirm')}
        />
      </View>
    </ScrollView>
  );
};

export default LyricController;
