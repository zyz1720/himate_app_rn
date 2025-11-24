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
            itemName={t('permissions.camera')}
            iconName={'camera'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessCamera ? t('permissions.authorized') : t('permissions.unauthorized')}
            onConfirm={() => {
              if (!accessCamera) {
                showToast(t('permissions.camera_please'), 'warning');
                setAccessCamera();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('permissions.camera_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('permissions.notify')}
            iconName={'bell'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessNotify ? t('permissions.authorized') : t('permissions.unauthorized')}
            onConfirm={() => {
              if (!accessNotify) {
                showToast(t('permissions.notify_please'), 'warning');
                setAccessNotify();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('permissions.notify_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('permissions.microphone')}
            iconName={'microphone'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessMicrophone ? t('permissions.authorized') : t('permissions.unauthorized')}
            onConfirm={() => {
              if (!accessMicrophone) {
                showToast(t('permissions.microphone_please'), 'warning');
                setAccessMicrophone();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('permissions.microphone_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('permissions.folder')}
            iconName={'folder'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={accessFolder ? t('permissions.authorized') : t('permissions.unauthorized')}
            onConfirm={() => {
              if (!accessFolder) {
                showToast(t('permissions.folder_please'), 'warning');
                setAccessFolder();
              }
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('permissions.folder_desc')}
            </Text>
          </View>
        </View>
        <View>
          <ListItem
            itemName={t('permissions.other_permissions')}
            iconName={'gears'}
            iconColor={Colors.grey10}
            iconSize={20}
            rightText={t('permissions.go_settings')}
            onConfirm={() => {
              openSettings().catch(() =>
                showToast(t('permissions.settings_error'), 'warning'),
              );
            }}
          />
          <View paddingH-16 paddingB-16>
            <Text grey30 text90L>
              {t('permissions.settings_desc')}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default Permissions;
