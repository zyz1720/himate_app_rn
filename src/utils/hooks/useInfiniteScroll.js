import {useState, useCallback} from 'react';

const useInfiniteScroll = (fetchData, params = {}) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      if ((isLoadMore && loadingMore) || (!isLoadMore && loading)) {
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await fetchData({
          ...params,
          current: pageNum,
          pageSize: 20,
        });
        if (result.code === 0) {
          const newList = result.data.list || [];
          setTotal(result.data.total || 0);
          if (pageNum === 1) {
            setList(newList);
          } else {
            setList(prev => [...prev, ...newList]);
          }
          if (newList.length < 20) {
            setHasMore(false);
          }
        }
        setPage(pageNum);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchData, loading, loadingMore],
  );

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadData(1, false);
  }, [loadData]);

  const onEndReached = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      loadData(page + 1, true);
    }
  }, [loading, loadingMore, hasMore, page, loadData]);

  return {
    total,
    list,
    loading,
    loadingMore,
    hasMore,
    page,
    onRefresh,
    onEndReached,
    refreshData: onRefresh,
  };
};

export default useInfiniteScroll;
