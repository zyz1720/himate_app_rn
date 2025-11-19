import instance from '@utils/request';

// 音乐列表
export const getMusic = params => instance.get('app/music', {params});

// 音乐详情
export const getMusicDetail = id => instance.get(`app/music/detail/${id}`);

// 收藏音乐
export const likeMusic = data => instance.get('app/music/default', data);

// 添加音乐到收藏夹
export const favoritesMusic = data => instance.get('app/music/favorites', data);

// 移除音乐收藏
export const removeFavoritesMusic = data =>
  instance.delete('app/music/favorites', data);

// 第三方歌单导入
export const importFavorites = url => instance.get(`music-api/sync/${url}`);
