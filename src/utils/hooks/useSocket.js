import {useState} from 'react';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {io} from 'socket.io-client';

let socketTimer = null;

export const useSocket = () => {
  const {access_token, token_type} = useUserStore();
  const {envConfig} = useConfigStore();

  const [socket, setSocket] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  const socketInit = () => {
    const token = token_type + ' ' + access_token;
    const socketUrl = envConfig?.SOCKET_URL;

    const Socket = io(socketUrl, {
      auth: {
        Authorization: token,
      },
    });

    /*  监听连接 */
    Socket.on('connect', () => {
      setSocket(Socket);
      clearInterval(socketTimer);
      setIsConnected(true);
      console.log('socket connected', Socket.id);
    });

    /* 断线重连 */
    Socket.on('connect_error', res => {
      setIsConnected(false);
      setSocket({});
      console.log('socket error', res);
      socketTimer = setInterval(() => {
        Socket.connect();
      }, 5000);
    });
  };

  return {
    socketInit,
    socket,
    isConnected,
  };
};
