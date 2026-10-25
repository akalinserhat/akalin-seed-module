/**
 * @akalin/seed_module - HTTP Client Altyapısı
 */

import axios, { type AxiosInstance } from 'axios';

let customClient: AxiosInstance | null = null;

export function setSeedHttpClient(client: AxiosInstance) {
  customClient = client;
}

export function getSeedHttpClient(): AxiosInstance {
  if (customClient) {
    return customClient;
  }
  return axios;
}
