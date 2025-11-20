import React, {useState} from 'react';
import {View, Colors, Text, Button} from 'react-native-ui-lib';
import {getMateList} from '@api/mate';
import {useToast} from '@utils/hooks/useToast';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {addGroup} from '@api/group';
import {addGroupMember} from '@api/group_member';
import {useTranslation} from 'react-i18next';
import MateList from '@components/mate/MateList';

const CreateGroup = ({navigation, route}) => {
  const {showToast} = useToast();
  const {t} = useTranslation();
  const {groupId, excludeIds, isCreate} = route.params || {};

  const {list, onEndReached} = useInfiniteScroll(getMateList);

  /* 创建群聊 */
  const [selectIds, setSelectIds] = useState([]);
  const handleCreateGroup = async () => {
    if (isCreate && selectIds.length < 2) {
      showToast(t('group.at_least_two'), 'warning');
      return;
    }
    try {
      if (isCreate) {
        const res = await addGroup({ids: selectIds});
        if (res.code === 0) {
          showToast(t('group.create_group_success'), 'success');
          navigation.goBack();
          return;
        }
        showToast(res.message, 'error');
      } else {
        const res = await addGroupMember({
          groupId: groupId,
          ids: selectIds,
        });
        if (res.code === 0) {
          showToast(t('group.invite_success'), 'success');
          navigation.navigate('GroupList');
          return;
        }
        showToast(res.message, 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <View flexS row spread centerH padding-12 backgroundColor={Colors.white}>
        <View center>
          <Text text70 grey20 center>
            {t('group.selected')}
            <Text color={Colors.primary}> {selectIds.length} </Text>
            {t('group.mate')}
          </Text>
        </View>
        {selectIds.length > 0 ? (
          <Button
            label={t('common.complete')}
            size={Button.sizes.small}
            borderRadius={8}
            backgroundColor={Colors.primary}
            onPress={handleCreateGroup}
          />
        ) : null}
      </View>
      <MateList
        originalList={list}
        height={'92%'}
        allowSelect={true}
        excludeIds={excludeIds}
        onSelectChange={value => {
          setSelectIds(value);
        }}
        onEndReached={onEndReached}
      />
    </View>
  );
};

export default CreateGroup;
