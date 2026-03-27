import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Change this to your Railway/Production URL after deploying
const PRODUCTION_API_URL = 'https://fixnowproject-production.up.railway.app/api';

// Retrieve the dynamic LAN IP from Expo (e.g., 192.168.x.x)
const hostUri = Constants.expoConfig?.hostUri;
const localIp = hostUri ? hostUri.split(':')[0] : '192.168.0.102';

const BASE_URL = __DEV__ 
  ? (Platform.OS === 'web' ? 'http://localhost:8080/api' : `http://${localIp}:8080/api`)
  : PRODUCTION_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Interceptor error', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we get a 403 (Forbidden) or 401 (Unauthorized), it might mean token expired or is invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Avoid infinite loop if we are already on login page
      console.warn('Auth error detected, clearing state...');
      // We can't directly useAuth here because this is outside of React components
      // But we can clear storage and the app's global state will eventually catch up or handle it on reload
      // A better way is to emit an event or use a callback if we had one
    }
    return Promise.reject(error);
  }
);

export default api;
