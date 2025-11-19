import instance from '@utils/request';

// 添加歌单
export const addFavorities = data => instance.post('app/favorites', data);

// 获取所有歌单
export const getFavorites = params => instance.get('/app/favorites', {params});

// 获取自己的所有歌单
export const getOneselfFavorites = params =>
  instance.get('app/favorites/oneself', {params});

// 获取默认收藏
export const getDefaultFavorites = params =>
  instance.get('app/favorites/default', {params});

// 歌单详情
export const getFavoritesDetail = params =>
  instance.get('app/favorites/detail', {params});

// 修改歌单
export const updateFavorites = (id, data) =>
  instance.put(`app/favorites/${id}`, data);

// 删除歌单
export const deleteFavorites = data =>
  instance.delete('app/favorites/batch', data);
