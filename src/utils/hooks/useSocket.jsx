import React, {createContext, useContext, useState, useEffect} from 'react';
import {useConfigStore} from '@store/configStore';
import {useUserStore} from '@store/userStore';
import {io} from 'socket.io-client';

export const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

let timer = null;

const SocketProvider = props => {
  const {children} = props;
  const {access_token, token_type} = useUserStore();
  const {envConfig} = useConfigStore();

  const [socket, setSocket] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const socketInit = (socketUrl, Token) => {
    const Socket = io(socketUrl, {
      auth: {
        Authorization: Token,
      },
    });
    /*  监听连接 */
    Socket?.on('connect', () => {
      setSocket(Socket);
      clearInterval(timer);
      setIsConnected(true);
      console.log('socket已连接', Socket.id);
    });
    /* 断线重连 */
    Socket?.on('connect_error', res => {
      setIsConnected(false);
      setSocket({});
      console.log('Socket error', res);
      timer = setInterval(() => {
        Socket.connect();
      }, 5000);
    });
  };

  useEffect(() => {
    if (access_token && token_type && envConfig?.SOCKET_URL) {
      const token = token_type + ' ' + access_token;
      socketInit(envConfig?.SOCKET_URL, token);
    }
  }, [access_token, token_type, envConfig?.SOCKET_URL]);

  return (
    <SocketContext.Provider value={{socket, isConnected}}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
