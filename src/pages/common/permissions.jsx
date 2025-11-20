import React, {useEffect} from 'react';
import {View, Card, Colors, Text} from 'react-native-ui-lib';
import {openSettings} from 'react-native-permissions';
import {useToast} from '@utils/hooks/useToast';
import {useTranslation} from 'react-i18next';
import {usePermissionStore} from '@store/permissionStore';
import ListItem from '@components/common/ListItem';

const Permissions = () => {
  const {
    accessCamera,
    accessMicrophone,
    accessFolder,
    accessNotify,
    setAllPermissions,
    setAccessNotify,
    setAccessCamera,
    setAccessMicrophone,
    setAccessFolder,
  } = usePermissionStore();

  const {showToast} = useToast();
  const {t} = useTranslation();

  useEffect(() => {
    setAllPermissions();
  }, []);

  return (
    <View flexG paddingH-16 paddingT-18>
      <Card enableShadow={false}>
        <View>
          <ListItem
            itemName={t('camera')}
            iconName={'camera'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessCamera ? t('authorized') : t('unauthorized')}
            onConfirm={() => {
              if (!accessCamera) {
                showToast(t('camera_please'), 'warning');
                setAccessCamera();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('camera_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('notify')}
            iconName={'bell'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessNotify ? t('authorized') : t('unauthorized')}
            onConfirm={() => {
              if (!accessNotify) {
                showToast(t('notify_please'), 'warning');
                setAccessNotify();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('notify_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('microphone')}
            iconName={'microphone'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessMicrophone ? t('authorized') : t('unauthorized')}
            onConfirm={() => {
              if (!accessMicrophone) {
                showToast(t('microphone_please'), 'warning');
                setAccessMicrophone();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('microphone_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('folder')}
            iconName={'folder'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessFolder ? t('authorized') : t('unauthorized')}
            onConfirm={() => {
              if (!accessFolder) {
                showToast(t('folder_please'), 'warning');
                setAccessFolder();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('folder_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('other_permissions')}
            iconName={'gears'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={t('go_settings')}
            onConfirm={() => {
              openSettings().catch(() =>
                showToast(t('settings_error'), 'warning'),
              );
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('settings_desc')}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default Permissions;
