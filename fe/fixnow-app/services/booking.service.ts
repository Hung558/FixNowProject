import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface Booking {
  id: number;
  customerId: number;
  technicianId?: number;
  serviceId: number;
  description: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  storeCode?: string;
}

export interface BookingCreateRequest {
  serviceId: number;
  description: string;
  imageUrl?: string;
  storeCode?: string;
}

export const createBooking = async (req: BookingCreateRequest): Promise<Booking> => {
  const response = await api.post<Booking>('/bookings', req);
  return response.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/bookings/me');
  return response.data;
};

export const getAvailableBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/bookings/available');
  return response.data;
};

export const acceptBooking = async (id: number): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}/accept`);
  return response.data;
};

export const updateBookingStatus = async (id: number, status: string): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}/status`, { status });
  return response.data;
};

export const uploadImage = async (imageUri: string): Promise<string> => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  if (Platform.OS === 'web') {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    formData.append('file', blob, filename);
  } else {
    // @ts-ignore
    formData.append('file', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      name: filename,
      type,
    });
  }

  const token = await AsyncStorage.getItem('userToken');
  const response = await fetch(`${api.defaults.baseURL}/files/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Upload error details:", errText);
    throw new Error('Upload failed: ' + response.status);
  }
  
  const data = await response.json();
  return data.url;
};
