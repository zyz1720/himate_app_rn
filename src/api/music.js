import instance from '@utils/request';

// 搜索音乐
export const getMusic = params => instance.get('app/music', {params});

// 音乐详情
export const getMusicDetail = id => instance.get(`app/music/detail/${id}`);

// 收藏音乐
export const likeMusic = data => instance.get('app/music/default', data);

// 获取默认收藏的音乐
export const getMusicFromDefaultFavorites = params =>
  instance.get('app/music/favorites/default', {params});

// 获取收藏夹音乐列表
export const getMusicFromFavorites = (favoritesId, params) =>
  instance.get(`app/music/favorites/${favoritesId}`, {params});

// 添加音乐到收藏夹
export const appendMusicToFavorites = data =>
  instance.post('app/music/favorites', data);

// 从收藏夹移除音乐
export const removeMusicToFavorites = (favoritesId, data) =>
  instance.delete(`app/music/favorites/${favoritesId}`, data);


