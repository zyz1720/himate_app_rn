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
      clearInterval(socketTimer);
      set({socket: socketInstance, isConnected: true});
      console.log('socket connected', socketInstance.id);
    });

    /* 断线重连 */
    socketInstance.on('connect_error', res => {
      set({isConnected: false, socket: null});
      console.log('socket error', res);
      socketTimer = setInterval(() => {
        socketInstance.connect();
      }, 30000);
    });

    /* 监听断开连接 */
    socketInstance.on('disconnect', () => {
      set({isConnected: false, socket: null});
      console.log('socket disconnected');
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
