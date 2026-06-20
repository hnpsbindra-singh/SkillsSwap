import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import { WS_URL } from '../config/api';

const WebSocketContext = createContext(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export function WebSocketProvider({ children }) {
  const { token, user } = useAuth();
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef({});
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!token || !user) return;
    if (stompClientRef.current?.connected) return;

    // Dynamically import SockJS and Stomp
    import('sockjs-client/dist/sockjs').then((SockJSModule) => {
      import('stompjs').then((StompModule) => {
        const SockJS = SockJSModule.default || SockJSModule;
        const Stomp = StompModule.default || StompModule;

        const socket = new SockJS(WS_URL);
        const client = Stomp.over(socket);

        // Disable debug logging in production
        client.debug = () => {};

        const headers = {
          Authorization: 'Bearer ' + token,
        };

        client.connect(
          headers,
          () => {
            console.log('WebSocket connected');
            stompClientRef.current = client;
            setConnected(true);

            // Re-subscribe to any active subscriptions
            Object.entries(subscriptionsRef.current).forEach(([roomKey, entries]) => {
              const destination = `/topic/chat/${roomKey}`;
              entries.forEach((entry) => {
                if (entry.stompSub) {
                  try {
                    entry.stompSub.unsubscribe();
                  } catch (e) {}
                }
                entry.stompSub = client.subscribe(destination, (message) => {
                  try {
                    const body = JSON.parse(message.body);
                    entry.callback(body);
                  } catch (e) {
                    console.error('Failed to parse WS message:', e);
                  }
                });
              });
            });
          },
          (error) => {
            console.error('WebSocket error:', error);
            setConnected(false);
            stompClientRef.current = null;

            // Reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 5000);
          }
        );
      });
    }).catch((err) => {
      console.error('Failed to load WebSocket libraries:', err);
    });
  }, [token, user]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (stompClientRef.current?.connected) {
      stompClientRef.current.disconnect(() => {
        console.log('WebSocket disconnected');
      });
    }
    stompClientRef.current = null;
    setConnected(false);
    subscriptionsRef.current = {};
  }, []);

  useEffect(() => {
    if (token && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  const subscribe = useCallback((roomKey, callback) => {
    if (!subscriptionsRef.current[roomKey]) {
      subscriptionsRef.current[roomKey] = [];
    }
    const entry = { callback, stompSub: null };
    subscriptionsRef.current[roomKey].push(entry);

    // If already connected, subscribe immediately
    if (stompClientRef.current?.connected) {
      const destination = `/topic/chat/${roomKey}`;
      entry.stompSub = stompClientRef.current.subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body);
          callback(body);
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      });
    }

    // Return unsubscribe function
    return () => {
      if (entry.stompSub) {
        try {
          entry.stompSub.unsubscribe();
        } catch (e) {}
      }
      subscriptionsRef.current[roomKey] = subscriptionsRef.current[roomKey]?.filter(
        (e) => e !== entry
      );
      if (subscriptionsRef.current[roomKey]?.length === 0) {
        delete subscriptionsRef.current[roomKey];
      }
    };
  }, []);

  const sendMessage = useCallback((targetUserId, content) => {
    if (!stompClientRef.current?.connected) {
      console.error('WebSocket not connected');
      return;
    }
    stompClientRef.current.send(
      `/app/chat/send/${targetUserId}`,
      {},
      JSON.stringify({ 
        content,
        senderId: user?.id,
      })
    );
  }, [user]);

  const value = {
    connected,
    subscribe,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
