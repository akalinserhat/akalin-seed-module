/**
 * @akalin/seed_module - Adapter ve Context Altyapısı
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ISeedModuleAdapter, IFaaliyetAlani, IDepoSubelerSeedData } from '../types';
import { seedService } from '../services/seedService';
import { setSeedHttpClient } from '../services/httpClient';

export function createRestSeedModuleAdapter(customHttpClient?: any): ISeedModuleAdapter {
  if (customHttpClient) {
    setSeedHttpClient(customHttpClient);
  }

  return {
    getFaaliyetAlanlari: () => seedService.getFaaliyetAlanlari(),
    getFaaliyetAlani: (id: number) => seedService.getFaaliyetAlani(id),
    createFaaliyetAlani: (data: Partial<IFaaliyetAlani>) => seedService.createFaaliyetAlani(data),
    updateFaaliyetAlani: (id: number, data: Partial<IFaaliyetAlani>) => seedService.updateFaaliyetAlani(id, data),
    deleteFaaliyetAlani: (id: number) => seedService.deleteFaaliyetAlani(id),
    getModuller: () => seedService.getModuller(),
    getSeedData: () => seedService.getSeedData(),
    saveSeedData: (data: IDepoSubelerSeedData) => seedService.saveSeedData(data)
  };
}

export const defaultSeedModuleAdapter = createRestSeedModuleAdapter();

export const SeedModuleServiceContext = createContext<ISeedModuleAdapter>(defaultSeedModuleAdapter);

export interface SeedModuleServiceProviderProps {
  adapter?: ISeedModuleAdapter;
  children?: ReactNode;
}

export const SeedModuleServiceProvider: React.FC<SeedModuleServiceProviderProps> = ({
  adapter,
  children
}) => {
  const activeAdapter = useMemo(() => adapter || defaultSeedModuleAdapter, [adapter]);

  return (
    <SeedModuleServiceContext.Provider value={activeAdapter}>
      {children}
    </SeedModuleServiceContext.Provider>
  );
};

export function useSeedModuleService(): ISeedModuleAdapter {
  const context = useContext(SeedModuleServiceContext);
  if (!context) {
    return defaultSeedModuleAdapter;
  }
  return context;
}
