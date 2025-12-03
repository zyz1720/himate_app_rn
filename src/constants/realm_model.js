import Realm from 'realm';

export class ChatMsg extends Realm.Object {
  static schema = {
    name: 'chat_msg',
    primaryKey: 'client_msg_id',
    properties: {
      id: 'int?',
      session_id: {type: 'string', indexed: true},
      session_primary_id: 'int?',
      client_msg_id: 'string',
      sender_id: 'int?',
      sender_ip: 'string?',
      content: 'string',
      msg_type: 'string',
      chat_type: 'string',
      msg_secret: 'string?',
      create_time: 'string',
      status: 'string',
    },
  };
}

export class UsersInfo extends Realm.Object {
  static schema = {
    name: 'users_info',
    primaryKey: '_id',
    properties: {
      _id: 'string',
      userId: {type: 'int', indexed: true},
      remarks: 'string',
      avatar: 'string?',
      session_primary_id: {type: 'int', indexed: true},
      session_id: {type: 'string', indexed: true},
      session_name: 'string',
      session_avatar: 'string?',
      created_at: 'date',
      updated_at: 'date',
    },
  };
}

export class MusicInfo extends Realm.Object {
  static schema = {
    name: 'music_info',
    primaryKey: 'id',
    properties: {
      id: 'int',
      title: 'string',
      artist: 'string?',
      artists: 'string?[]',
      album: 'string?',
      file_key: 'string',
      created_at: 'date',
      updated_at: 'date',
    },
  };
}

export class LocalMusic extends Realm.Object {
  static schema = {
    name: 'local_music',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      file_key: 'string',
      created_at: 'date',
    },
  };
}
