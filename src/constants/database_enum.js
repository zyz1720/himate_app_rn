export const GroupRoleEnum = Object.freeze({
  owner: 'owner',
  admin: 'admin',
  member: 'member',
});

export const MemberStatusEnum = Object.freeze({
  forbidden: 'forbidden',
  normal: 'normal',
});

export const ChatTypeEnum = Object.freeze({
  private: 'private',
  group: 'group',
});

export const UserRoleEnum = Object.freeze({
  default: 'default',
  admin: 'admin',
  vip: 'vip',
});

export const MsgTypeEnum = Object.freeze({
  text: 'text',
  image: 'image',
  video: 'video',
  audio: 'audio',
  file: 'file',
  other: 'other',
});

export const FileTypeEnum = Object.freeze({
  image: 'image',
  video: 'video',
  audio: 'audio',
  document: 'document',
  other: 'other',
});

export const FileUseTypeEnum = Object.freeze({
  user: 'user',
  chat: 'chat',
  group: 'group',
  system: 'system',
  music: 'music',
  upload: 'upload',
  unknown: 'unknown',
});
