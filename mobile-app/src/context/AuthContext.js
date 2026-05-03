import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin } from '../services/api';
import API from '../services/api';
import { io } from 'socket.io-client';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userData && userToken) {
      fetchUnreadCount();
      // Initialize socket when user is logged in
      const newSocket = io('http://10.71.226.205:8081', {
        transports: ['websocket'],
        query: { token: userToken }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', userData.id);
      });

      newSocket.on('notification', (notif) => {
        console.log('New notification received:', notif);
        setUnreadCount(prev => prev + 1);
        // Show an immediate alert for important notifications
        Alert.alert(notif.title, notif.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userData, userToken]);

  const fetchUnreadCount = async () => {
    try {
      const id = userData?.role === 'ADMIN' ? 'ADMIN' : userData?.id;
      if (!id) return;
      const response = await API.get(`/notifications/user/${id}`);
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { token, ...user } = response.data;
      
      setUserToken(token);
      setUserData(user);
      
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUserData(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let user = await SecureStore.getItemAsync('userData');
      
      if (token && user) {
        setUserToken(token);
        setUserData(JSON.parse(user));
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      login, 
      logout, 
      isLoading, 
      userToken, 
      userData, 
      unreadCount, 
      setUnreadCount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
