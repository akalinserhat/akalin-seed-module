/**
 * @akalin/seed_module - Tohumlama (Seed) & Faaliyet Alanları REST Servisi
 */

import { getSeedHttpClient } from './httpClient';
import type { IFaaliyetAlani, IDepoSubelerSeedData } from '../types';

export const DEFAULT_SEED_DATA: IDepoSubelerSeedData = {
  depolarVeSubeler: [
    { id: 1, kod: 'DEP-01', ad: 'Merkez Depo', tur: 1, seriTakibiYapilirMi: true, aktifMi: true, adres: '', acikAdres: '', adresIlId: null, ilId: null, adresIlceId: null, ilceId: null },
    { id: 2, kod: 'SUB-01', ad: 'Merkez Şube', tur: 3, telefon: '0212 111 22 33', aktifMi: true, adres: '', acikAdres: '', adresIlId: null, ilId: null, adresIlceId: null, ilceId: null }
  ]
};

const SEED_STORAGE_KEY = 'webakus_admin_genel_seed_data';

export const seedService = {
  async getFaaliyetAlanlari(): Promise<IFaaliyetAlani[]> {
    const client = getSeedHttpClient();
    const res = await client.get('/api/FaaliyetAlani/admin');
    return Array.isArray(res.data) ? res.data : [];
  },

  async getFaaliyetAlani(id: number): Promise<IFaaliyetAlani> {
    const client = getSeedHttpClient();
    const res = await client.get(`/api/FaaliyetAlani/${id}`);
    return res.data;
  },

  async createFaaliyetAlani(data: Partial<IFaaliyetAlani>): Promise<IFaaliyetAlani> {
    const client = getSeedHttpClient();
    const res = await client.post('/api/FaaliyetAlani', data);
    return res.data;
  },

  async updateFaaliyetAlani(id: number, data: Partial<IFaaliyetAlani>): Promise<IFaaliyetAlani> {
    const client = getSeedHttpClient();
    const res = await client.put(`/api/FaaliyetAlani/${id}`, data);
    return res.data;
  },

  async deleteFaaliyetAlani(id: number): Promise<any> {
    const client = getSeedHttpClient();
    const res = await client.delete(`/api/FaaliyetAlani/${id}`);
    return res.data;
  },

  async getModuller(): Promise<any[]> {
    const client = getSeedHttpClient();
    try {
      const res = await client.get('/api/Moduller');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }

    try {
      const kesfetRes = await client.get('/api/moduller/kesfet', { params: { kapsam: 'ERP' } });
      return Array.isArray(kesfetRes.data) ? kesfetRes.data : [];
    } catch (err) {
      return [];
    }
  },

  async getSeedData(): Promise<IDepoSubelerSeedData> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(SEED_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Seed Data storage parse hatası:', e);
        }
      }
    }
    return DEFAULT_SEED_DATA;
  },

  async saveSeedData(data: IDepoSubelerSeedData): Promise<any> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  }
};
