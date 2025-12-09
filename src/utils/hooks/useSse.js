import {useState, useRef} from 'react';
import {useUserStore} from '@store/userStore';
import {useConfigStore} from '@store/configStore';
import EventSource from 'react-native-sse';

export const useSse = path => {
  const {token_type, access_token} = useUserStore();
  const {envConfig} = useConfigStore();
  const [isConnected, setIsConnected] = useState(false);
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
      console.log('sse message', event);
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
