import {useState, useCallback, useRef, useEffect} from 'react';

export const useInfiniteScroll = fetchData => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const paramsRef = useRef({});

  // 当列表数据变化时，检查是否是首次加载完成
  useEffect(() => {
    if (list.length > 0 && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [list, isFirstLoad]);

  const loadData = useCallback(
    async (pageNum = 1, isLoadMore = false, params = {}) => {
      if ((isLoadMore && loadingMore) || (!isLoadMore && loading)) {
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      paramsRef.current = params;

      try {
        const result = await fetchData({
          ...paramsRef.current,
          current: pageNum,
          pageSize: 20,
        });
        if (result.code === 0) {
          console.log('加载数据成功:', result.data.list);

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

  const onRefresh = useCallback(
    (params = {}) => {
      setPage(1);
      setHasMore(true);
      setIsFirstLoad(true);
      loadData(1, false, params);
    },
    [loadData],
  );

  const onEndReached = useCallback(() => {
    if (!loading && !loadingMore && hasMore && !isFirstLoad) {
      loadData(page + 1, true);
    }
  }, [loading, loadingMore, hasMore, page, loadData, isFirstLoad]);

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
