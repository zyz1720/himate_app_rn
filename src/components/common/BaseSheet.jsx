import React from 'react';
import {ActionSheet, Button, Colors} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
  dialogStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionsStyle: {
    width: '100%',
    paddingHorizontal: 16,
  },
  buttonStyle: {
    marginTop: 6,
    backgroundColor: Colors.white,
    borderBottomColor: Colors.grey80,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
});

const BaseSheet = React.memo(props => {
  const {t} = useTranslation();
  const {
    visible = false,
    setVisible = () => {},
    title = '',
    description = '',
    actions = [],
  } = props;

  return (
    <ActionSheet
      dialogStyle={styles.dialogStyle}
      optionsStyle={styles.optionsStyle}
      visible={visible}
      onDismiss={() => setVisible(false)}
      title={title}
      message={description}
      renderAction={(butProps, index) => (
        <Button
          {...butProps}
          key={index}
          style={[
            styles.buttonStyle,
            index === actions.length ? styles.noBorder : styles.borderBottom,
          ]}
        />
      )}
      cancelButtonIndex={actions.length + 1}
      options={[
        ...actions,
        {
          label: t('common.cancel'),
          color: Colors.grey30,
          onPress: () => setVisible(false),
        },
      ]}
    />
  );
});

export default BaseSheet;
