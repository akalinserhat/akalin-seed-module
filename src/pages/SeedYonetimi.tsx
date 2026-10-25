/**
 * @akalin/seed_module - Genel Seed Yönetim Sayfası (SeedYonetimi.tsx)
 * 
 * Başlıca Görevleri:
 * - Firma oluşturulurken veya veritabanı sıfırlanırken (seed/re-seed) kullanılacak genel tohumlama şablonlarını yönetir.
 * - @akalin/system_settings_module altındaki DepolarVeSubeler ve DepoForm bileşenlerini inMemoryMode ile çağırarak
 *   UI tarafındaki tasarımın ve görünümün birebir aynısını sunar.
 * - Sektörden bağımsız olan ve veritabanında Firmalar.SektorelAyarlarJson yapısını besleyen seed verilerini okur ve yazar.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import { DepolarVeSubeler, DepoForm } from '@akalin/system_settings_module';
import { useSeedModuleService } from '../adapters/SeedModuleServiceContext';
import { DEFAULT_SEED_DATA } from '../services/seedService';
import type { IDepoSubelerItem, IDepoSubelerSeedData } from '../types';
import '../styles/seedModule.css';

export { DEFAULT_SEED_DATA };

export function SeedYonetimi() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const service = useSeedModuleService();

  // /seed çağrıldığında standart URL olan /seed/depolar-subeler rotasına yönlendir
  if (location.pathname === '/seed' || location.pathname === '/seed/') {
    return <Navigate to="/seed/depolar-subeler" replace />;
  }

  const [selectedDepo, setSelectedDepo] = useState<IDepoSubelerItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Seed Veri State'i
  const [seedData, setSeedData] = useState<IDepoSubelerSeedData>(DEFAULT_SEED_DATA);

  useEffect(() => {
    service.getSeedData().then((data) => {
      if (data) setSeedData(data);
    });
  }, [service]);

  const depolarList = seedData.depolarVeSubeler || DEFAULT_SEED_DATA.depolarVeSubeler;

  // Dinamik Rota / Form Modu Kontrolü
  const isYeni = location.pathname.includes('/yeni');
  const routeId = params.id ? parseInt(params.id, 10) : null;
  const isDuzenle = !!routeId && !isYeni;
  const isFormMode = isYeni || isDuzenle;

  // Form modundan çıkıldığında geçici seçim statelerini temizle
  useEffect(() => {
    if (!isFormMode) {
      if (selectedDepo) setSelectedDepo(null);
      if (isAdding) setIsAdding(false);
    }
  }, [isFormMode, selectedDepo, isAdding]);

  // Hedef Depo Kaydı
  const targetItem = isYeni ? null : (selectedDepo || depolarList.find(d => d.id === routeId) || (location.state as any)?.item);

  // DepolarVeSubeler Memory Güncelleme Handleri
  const handleSaveDepolarMemory = (updatedItems: IDepoSubelerItem[]) => {
    const nextSeedData: IDepoSubelerSeedData = {
      ...seedData,
      depolarVeSubeler: updatedItems
    };
    setSeedData(nextSeedData);
    service.saveSeedData(nextSeedData);
  };

  const handleSaveSingleDepo = (formData: any) => {
    const currentList = [...depolarList];
    let updatedList: IDepoSubelerItem[];
    if (targetItem?.id) {
      updatedList = currentList.map(item => item.id === targetItem.id ? { ...item, ...formData, id: targetItem.id } : item);
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(i => i.id || 0)) + 1 : 1;
      updatedList = [...currentList, { ...formData, id: newId }];
    }
    handleSaveDepolarMemory(updatedList);
    setSelectedDepo(null);
    setIsAdding(false);
    navigate('/seed/depolar-subeler');
  };

  const handleCloseForm = () => {
    setSelectedDepo(null);
    setIsAdding(false);
    navigate('/seed/depolar-subeler');
  };

  if (isFormMode) {
    return (
      <DepoForm
        initialData={targetItem}
        inMemoryMode={true}
        returnTo="/seed/depolar-subeler"
        onSaveMemory={handleSaveSingleDepo}
        onCancel={handleCloseForm}
        onSuccess={handleCloseForm}
      />
    );
  }

  return (
    <DepolarVeSubeler
      inMemoryMode={true}
      initialItems={depolarList}
      onSaveMemory={handleSaveDepolarMemory}
      showTopHeader={true}
      showBackButton={true}
      backRoute="/"
      onEditItem={(item: any) => {
        setSelectedDepo(item);
        navigate(`/seed/depolar-subeler/${item.id}`, { state: { item } });
      }}
      onAddNewItem={() => {
        setIsAdding(true);
        navigate('/seed/depolar-subeler/yeni');
      }}
    />
  );
}

export default SeedYonetimi;
