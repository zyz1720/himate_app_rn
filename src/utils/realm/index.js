import { Realm } from '@realm/react';
import {
  ChatMsg,
  SessionInfo,
  MusicInfo,
  LocalMusic,
  MateInfo,
} from '@const/realm_model';

export const realm = new Realm({
  schema: [SessionInfo, ChatMsg, MusicInfo, LocalMusic, MateInfo],
});
