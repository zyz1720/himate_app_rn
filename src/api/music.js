import instance from '@utils/request';

// 搜索音乐
export const getMusic = params => instance.get('app/music', {params});

// 音乐详情
export const getMusicDetail = id => instance.get(`app/music/${id}/detail`);

// 音乐是否收藏
export const getMusicIsLiked = id => instance.get(`app/music/${id}/isLiked`);

// 收藏音乐
export const likeMusic = data => instance.post('app/music/like', data);

// 取消收藏音乐
export const dislikeMusic = data =>
  instance.delete('app/music/dislike', {data});

// 获取默认收藏的音乐
export const getMusicFromDefaultFavorites = params =>
  instance.get('app/music/favorites/liked', {params});

// 获取收藏夹音乐列表
export const getMusicFromFavorites = (favoritesId, params) =>
  instance.get(`app/music/${favoritesId}/favorites`, {params});

// 添加音乐到收藏夹
export const appendMusicToFavorites = data =>
  instance.post('app/music/favorites', data);

// 从收藏夹移除音乐
export const removeMusicToFavorites = (favoritesId, data) =>
  instance.delete(`app/music/${favoritesId}/favorites`, {data});
