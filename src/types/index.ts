/**
 * @akalin/seed_module - Tohumlama (Seed) ve Faaliyet Alanları Tip Tanımları
 */

import type { ReactNode } from 'react';

export interface IFaaliyetAlani {
  id: number;
  ustFaaliyetAlaniId?: number | null;
  kod: string;
  ad: string;
  naceKodu?: string;
  ikon?: string;
  aciklama?: string;
  sira?: number;
  aktifMi?: boolean;
  ozellikProfiliJson?: string;
  sektorelAyarlarJson?: string;
  cocukSayisi?: number;
  altFaaliyetAlanlari?: IFaaliyetAlani[];
  [key: string]: any;
}

export interface IDepoSubelerItem {
  id: number;
  kod: string;
  ad: string;
  tur: number;
  telefon?: string;
  seriTakibiYapilirMi?: boolean;
  aktifMi?: boolean;
  adres?: string;
  acikAdres?: string;
  adresIlId?: number | null;
  ilId?: number | null;
  adresIlceId?: number | null;
  ilceId?: number | null;
  [key: string]: any;
}

export interface IDepoSubelerSeedData {
  depolarVeSubeler: IDepoSubelerItem[];
  [key: string]: any;
}

export interface ISeedModuleAdapter {
  getFaaliyetAlanlari(): Promise<IFaaliyetAlani[]>;
  getFaaliyetAlani(id: number): Promise<IFaaliyetAlani>;
  createFaaliyetAlani(data: Partial<IFaaliyetAlani>): Promise<IFaaliyetAlani>;
  updateFaaliyetAlani(id: number, data: Partial<IFaaliyetAlani>): Promise<IFaaliyetAlani>;
  deleteFaaliyetAlani(id: number): Promise<any>;
  getModuller(): Promise<any[]>;
  getSeedData(): Promise<IDepoSubelerSeedData>;
  saveSeedData(data: IDepoSubelerSeedData): Promise<any>;
}

export interface SeedModuleOptions {
  id?: string;
  title?: string;
  icon?: ReactNode;
  order?: number;
  adapter?: ISeedModuleAdapter;
  baseRoute?: string;
}
