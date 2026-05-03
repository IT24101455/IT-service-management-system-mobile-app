import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const { user } = useAuth();
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user) {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
                setIsConnected(false);
            }
            return;
        }

        const client = new Client({
            brokerURL: 'ws://localhost:8081/ws',
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            debug: (str) => {
                console.log(str);
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [user?.userId]);

    const subscribe = (destination, callback) => {
        if (!stompClient || !isConnected) return null;

        const sub = stompClient.subscribe(destination, (message) => {
            callback(JSON.parse(message.body));
        });
        return sub;
    };

    return (
        <WebSocketContext.Provider value={{ stompClient, isConnected, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => useContext(WebSocketContext);
