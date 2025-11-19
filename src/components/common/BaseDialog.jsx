import React from 'react';
import {
  View,
  Text,
  Card,
  Colors,
  Dialog,
  Button,
  PanningProvider,
} from 'react-native-ui-lib';
import {useTranslation} from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const BaseDialog = props => {
  const {t} = useTranslation();
  const {
    onConfirm = () => {},
    onCancel = () => {},
    visible = false,
    setVisible = () => {},
    title = '',
    showWarning = true,
    description = '',
    renderBody = null,
    showButton = true,
    width = '90%',
  } = props;

  return (
    <Dialog
      visible={visible}
      useSafeArea={true}
      onDismiss={() => setVisible(false)}
      width={width}
      panDirection={PanningProvider.Directions.DOWN}>
      <Card flexS padding-16>
        {title ? (
          <View row>
            <FontAwesome name={'warning'} color={Colors.error} size={22} />
            <Text
              text60
              color={showWarning ? Colors.error : ''}
              marginB-16
              marginL-8>
              {t('common.warning')}
            </Text>
          </View>
        ) : null}
        <Text text70BL>{description}</Text>
        {renderBody}
        {showButton ? (
          <View marginT-16 flexS row right>
            <Button
              label={t('common.cancel')}
              size={Button.sizes.medium}
              outline={true}
              borderRadius={8}
              marginR-16
              outlineColor={Colors.primary}
              onPress={() => {
                setVisible(false);
                onCancel();
              }}
            />
            <Button
              label={t('common.confirm')}
              size={Button.sizes.medium}
              borderRadius={8}
              backgroundColor={Colors.primary}
              onPress={() => {
                setVisible(false);
                onConfirm();
              }}
            />
          </View>
        ) : null}
      </Card>
    </Dialog>
  );
};

export default BaseDialog;
