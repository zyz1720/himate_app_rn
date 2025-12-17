import {create} from 'zustand';
import {useConfigStore} from './configStore';
import {useUserStore} from './userStore';
import {io} from 'socket.io-client';

let socketTimer = null;
let socketInstance = null;

export const useSocketStore = create(set => ({
  socket: null,
  isConnected: false,

  socketInit: () => {
    const {access_token} = useUserStore.getState();
    const {envConfig} = useConfigStore.getState();

    console.log('socketInit ', socketInstance);
    // 如果已经有socket实例，先断开连接
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    const socketUrl = envConfig.SOCKET_URL;

    socketInstance = io(socketUrl, {
      auth: {
        Authorization: access_token,
      },
    });

    /* 监听连接 */
    socketInstance.on('connect', () => {
      console.log('socket connected', socketInstance.id);

      clearInterval(socketTimer);
      set({socket: socketInstance, isConnected: true});
    });

    /* 断线重连 */
    socketInstance.on('connect_error', res => {
      console.log('socket error', res);

      set({isConnected: false, socket: null});
      socketInstance.disconnect();
      socketTimer = setInterval(() => {
        socketInstance.connect();
      }, 30000);
    });

    /* 监听断开连接 */
    socketInstance.on('disconnect', () => {
      console.log('socket disconnected');

      set({isConnected: false, socket: null});
    });

    /* 监听错误 */
    socketInstance.on('error', error => {
      console.log('socket error', error);
    });
  },

  socketDisconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    if (socketTimer) {
      clearInterval(socketTimer);
      socketTimer = null;
    }
    set({socket: null, isConnected: false});
  },
}));
