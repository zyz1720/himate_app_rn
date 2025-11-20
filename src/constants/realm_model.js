import Realm from 'realm';

export class ChatMsg extends Realm.Object {
  static schema = {
    name: 'chat_msg',
    primaryKey: 'client_msg_id',
    properties: {
      _id: 'int',
      client_msg_id: 'string',
      session_id: {type: 'string', indexed: true},
      session_primary_id: 'int',
      sender_id: 'int',
      content: 'string',
      chat_type: 'string',
      msg_type: 'string',
      msg_secret: 'string',
      create_time: 'string',
      created_at: 'date',
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
      uid: {type: 'int', indexed: true},
      remarks: 'string',
      avatar: 'string',
      session_id: {type: 'string', indexed: true},
      session_name: 'string?',
    },
  };
}

export class MusicInfo extends Realm.Object {
  static schema = {
    name: 'music_info',
    primaryKey: 'id',
    properties: {
      id: 'int',
      file_key: 'string',
      sample_rate: 'int?',
      bitrate: 'int?',
      title: 'string',
      artist: 'string',
      artists: 'string?[]',
      album: 'string?',
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
    },
  };
}
