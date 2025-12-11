import {useState, useRef} from 'react';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import {useChatMsgStore} from '@store/chatMsgStore';
import {setLocalSession} from '@utils/realm/useSessionInfo';
import {batchDisplayMsgNotifications} from '@utils/system/notification';
import EventSource from 'react-native-sse';

export const useSse = path => {
  const {token_type, access_token} = useUserStore();
  const {envConfig} = useConfigStore();
  const [isConnected, setIsConnected] = useState(false);
  const {setCloudSessions, setUpdateKey} = useChatMsgStore();
  let sseInstanceRef = useRef(null);
  let sseTimer = useRef(null);

  const sseInit = () => {
    // 如果已经有sse实例，先断开连接
    if (sseInstanceRef.current) {
      sseInstanceRef.current.close();
      sseInstanceRef.current.removeAllEventListeners();
      sseInstanceRef.current = null;
    }

    const sseUrl = envConfig.BASE_URL + path;

    sseInstanceRef.current = new EventSource(sseUrl, {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    /* 监听连接 */
    sseInstanceRef.current.addEventListener('open', event => {
      clearInterval(sseTimer.current);
      setIsConnected(true);
      sseTimer.current = null;

      console.log('sse connected', event);
    });

    /* 断线重连 */
    sseInstanceRef.current.addEventListener('error', event => {
      console.log('sse error', event);

      setIsConnected(false);
      sseInstanceRef.current.close();
      sseTimer.current = setInterval(() => {
        sseInstanceRef.current.open();
      }, 30000);
    });

    /* 监听消息 */
    sseInstanceRef.current.addEventListener('message', event => {
      try {
        const result = JSON.parse(event.data);
        console.log('SSE message', result.data);

        if (Array.isArray(result?.data)) {
          const list = result.data;
          setUpdateKey();
          setCloudSessions(list);
          setLocalSession(list);
          batchDisplayMsgNotifications(list);
        }
      } catch (error) {
        console.log('SSE message parse error', error);
      }
    });
  };

  const sseDisconnect = () => {
    if (sseInstanceRef.current) {
      sseInstanceRef.current.close();
      sseInstanceRef.current.removeAllEventListeners();
      sseInstanceRef.current = null;
    }
    if (sseTimer.current) {
      clearInterval(sseTimer.current);
      sseTimer.current = null;
    }
  };

  return {
    isConnected,
    sseInit,
    sseDisconnect,
  };
};
