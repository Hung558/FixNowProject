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
