import api from './api';

export interface Store {
  id: number;
  name: string;
  storeCode: string;
  address: string;
}

export const createStore = async (name: string, address: string): Promise<Store> => {
  const response = await api.post<Store>('/stores', { name, address });
  return response.data;
};

export const joinStore = async (code: string): Promise<Store> => {
  const response = await api.post<Store>(`/stores/join?code=${code}`);
  return response.data;
};

export const getStoreByCode = async (code: string): Promise<Store> => {
  const response = await api.get<Store>(`/stores/${code}`);
  return response.data;
};
