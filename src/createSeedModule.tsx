/**
 * @akalin/seed_module - Tohumlama (Seed) Modülü Fabrikası
 */

import React, { lazy, Suspense } from 'react';
import { Database, Warehouse, Briefcase } from 'lucide-react';
import type { IModuleDefinition } from '@akalin/module_core';
import type { SeedModuleOptions } from './types';
import {
  SeedModuleServiceProvider,
  defaultSeedModuleAdapter
} from './adapters/SeedModuleServiceContext';

const LazySeedYonetimi = lazy(() => import('./pages/SeedYonetimi'));
const LazyFaaliyetAlanlari = lazy(() => import('./pages/FaaliyetAlanlari'));

export function createSeedModule(
  options: SeedModuleOptions = {}
): IModuleDefinition & { components: any } {
  const adapter = options.adapter || defaultSeedModuleAdapter;

  const withProvider = (Component: React.ComponentType<any>, props: any = {}) => {
    return React.createElement(
      SeedModuleServiceProvider,
      { adapter },
      React.createElement(
        Suspense,
        { fallback: React.createElement('div', { className: 'p-16 text-muted' }, 'Yükleniyor...') },
        React.createElement(Component, props)
      )
    );
  };

  const moduleDef: IModuleDefinition & { components: any } = {
    id: options.id || 'seed_yonetimi',
    title: options.title || 'Seed Yönetimi',
    icon: options.icon || React.createElement(Database, { size: 20 }),
    iconName: 'Database',
    order: options.order ?? 55,
    routes: [
      {
        path: '/seed/depolar-subeler',
        element: withProvider(LazySeedYonetimi),
        title: 'Depolar ve Şubeler'
      },
      {
        path: '/seed/depolar-subeler/yeni',
        element: withProvider(LazySeedYonetimi),
        title: 'Yeni Depo / Lokasyon Kartı'
      },
      {
        path: '/seed/depolar-subeler/:id',
        element: withProvider(LazySeedYonetimi),
        title: 'Depo / Lokasyon Kartı'
      },
      {
        path: '/seed',
        element: withProvider(LazySeedYonetimi),
        title: 'Depolar ve Şubeler'
      },
      {
        path: '/seed/depolar',
        element: withProvider(LazySeedYonetimi),
        title: 'Depolar ve Şubeler'
      },
      {
        path: '/seed/depolar/yeni',
        element: withProvider(LazySeedYonetimi),
        title: 'Yeni Depo / Lokasyon Kartı'
      },
      {
        path: '/seed/depolar/:id',
        element: withProvider(LazySeedYonetimi),
        title: 'Depo / Lokasyon Kartı'
      },
      {
        path: '/seed/yeni',
        element: withProvider(LazySeedYonetimi),
        title: 'Yeni Depo / Lokasyon Kartı'
      },
      {
        path: '/seed/:id',
        element: withProvider(LazySeedYonetimi),
        title: 'Depo / Lokasyon Kartı'
      },
      {
        path: '/seed/subeler',
        element: withProvider(LazySeedYonetimi),
        title: 'Depolar ve Şubeler'
      },
      // Faaliyet Alanları ve Sektör Ağacı Rotaları
      {
        path: '/faaliyetalanlari',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Faaliyet Alanları'
      },
      {
        path: '/faaliyetalanlari/yeni',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Yeni Faaliyet Alanı'
      },
      {
        path: '/faaliyetalanlari/yeni/para-birimleri',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Para Birimleri Yapılandırması'
      },
      {
        path: '/faaliyetalanlari/yeni/vergi-kdv',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Vergi ve KDV Ayarları'
      },
      {
        path: '/faaliyetalanlari/yeni/birimler',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Ölçü Birimleri Yapılandırması'
      },
      {
        path: '/faaliyetalanlari/duzenle/:id',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Faaliyet Alanı Düzenle'
      },
      {
        path: '/faaliyetalanlari/duzenle/:id/para-birimleri',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Para Birimleri Yapılandırması'
      },
      {
        path: '/faaliyetalanlari/duzenle/:id/vergi-kdv',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Vergi ve KDV Ayarları'
      },
      {
        path: '/faaliyetalanlari/duzenle/:id/birimler',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Ölçü Birimleri Yapılandırması'
      },
      {
        path: '/faaliyetalanlari/:id/para-birimleri',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Para Birimleri Yapılandırması'
      },
      {
        path: '/faaliyetalanlari/:id/vergi-kdv',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Vergi ve KDV Ayarları'
      },
      {
        path: '/faaliyetalanlari/:id/birimler',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Ölçü Birimleri Yapılandırması'
      },
      {
        path: '/faaliyetalanlari/yeni/modul-ayarlari/:modulKod',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Modül Ayarları'
      },
      {
        path: '/faaliyetalanlari/duzenle/:id/modul-ayarlari/:modulKod',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Modül Ayarları'
      },
      {
        path: '/faaliyetalanlari/:id/modul-ayarlari/:modulKod',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Modül Ayarları'
      },
      {
        path: '/seed/faaliyet-alanlari',
        element: withProvider(LazyFaaliyetAlanlari),
        title: 'Faaliyet Alanları'
      }
    ],
    menuItems: [
      {
        id: 'menu_seed_yonetimi',
        label: options.title || 'Seed Yönetimi',
        icon: options.icon || React.createElement(Database, { size: 20 }),
        isDropdown: true,
        order: options.order ?? 55
      },
      {
        id: 'menu_seed_depolar_subeler',
        parentId: 'menu_seed_yonetimi',
        label: 'Depolar ve Şubeler',
        path: '/seed/depolar-subeler',
        icon: React.createElement(Warehouse, { size: 16 }),
        order: 10
      },
      {
        id: 'menu_seed_faaliyet_alanlari',
        parentId: 'menu_seed_yonetimi',
        label: 'Faaliyet Alanları',
        path: '/faaliyetalanlari',
        icon: React.createElement(Briefcase, { size: 16 }),
        order: 20
      }
    ],
    components: {
      SeedYonetimi: LazySeedYonetimi,
      FaaliyetAlanlari: LazyFaaliyetAlanlari
    }
  };

  return moduleDef;
}

export const SeedModuleDefinition = createSeedModule();
export default SeedModuleDefinition;
