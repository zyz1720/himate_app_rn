import React, {useState, useEffect} from 'react';
import {View, Colors, Text, Button} from 'react-native-ui-lib';
import {getMateList} from '@api/mate';
import {useToast} from '@components/common/useToast';
import {useInfiniteScroll} from '@utils/hooks/useInfiniteScroll';
import {addGroup} from '@api/group';
import {addGroupMember} from '@api/group_member';
import {useTranslation} from 'react-i18next';
import MateList from '@components/mate/MateList';

const CreateGroup = ({navigation, route}) => {
  const {
    groupId,
    excludeIds = [],
    initialSelectIds = [],
    isCreate,
  } = route.params || {};

  const {showToast} = useToast();
  const {t} = useTranslation();

  const {list, loading, onEndReached, refreshData} =
    useInfiniteScroll(getMateList);

  /* 创建群聊 */
  const [selectIds, setSelectIds] = useState(initialSelectIds);
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
        const res = await addGroupMember(groupId, {
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

  useEffect(() => {
    refreshData();
  }, []);

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
        loading={loading}
        allowSelect={true}
        initialSelectIds={initialSelectIds}
        excludeIds={excludeIds}
        onSelectChange={value => {
          console.log('onSelectChange', value);
          setSelectIds(value);
        }}
        onEndReached={onEndReached}
      />
    </View>
  );
};

export default CreateGroup;
