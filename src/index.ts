/**
 * @akalin/seed_module - Tohumlama (Seed) ve Faaliyet Alanları Paketi Ana Giriş Noktası
 */

import './styles/seedModule.css';

export * from './types';
export * from './services/httpClient';
export * from './services/seedService';
export * from './adapters/SeedModuleServiceContext';
export * from './pages/SeedYonetimi';
export * from './pages/FaaliyetAlanlari';
export * from './pages/FaaliyetForm';
export * from './createSeedModule';

import { SeedModuleDefinition, createSeedModule } from './createSeedModule';

export const SeedModule = SeedModuleDefinition;
export { createSeedModule };
export default SeedModuleDefinition;
