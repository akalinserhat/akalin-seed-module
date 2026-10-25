/**
 * @akalin/seed_module - Faaliyet Alanları ve Sektör Ağacı Yönetimi (FaaliyetAlanlari.tsx)
 * 
 * Müşterilerin kayıt olurken seçebileceği ve sistemin sektöre göre arayüzünü
 * sadeleştirmesini sağlayan 2 seviyeli faaliyet alanlarını (Ana Sektör -> Alt Faaliyet Alanları)
 * TreeView mimarisiyle yönetir.
 * 
 * Başlıca Görevleri:
 * - Ana sektörleri ve alt faaliyet alanlarını hiyerarşik ağaç tablosunda listeler.
 * - NACE kodları, görsel ikonlar, sıralama ve açıklama alanlarını yönetir.
 * - Her alt sektöre özel varsayılan özellik profillerini (Varyant, Seri No, SKT, Reçete vb.) yapılandırır.
 * - Hızlı canlı arama ve tümünü aç/kapat kontrolleri sunar.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  FolderPlus, 
  ChevronsUpDown,
  FolderTree
} from 'lucide-react';
import { BaseCardPage, useAlertDialog, TreeTableView } from '@akalin/ui';
import { useSeedModuleService } from '../adapters/SeedModuleServiceContext';
import type { IFaaliyetAlani } from '../types';
import FaaliyetForm from './FaaliyetForm';
import '../styles/seedModule.css';

export function FaaliyetAlanlari() {
  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const service = useSeedModuleService();

  const [items, setItems] = useState<IFaaliyetAlani[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isChildCategory, setIsChildCategory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const list = await service.getFaaliyetAlanlari();
      setItems(list || []);
      // İlk yüklemede tüm ana sektörleri açık getir
      const parentIds = (list || []).filter(i => !i.ustFaaliyetAlaniId).map(i => i.id);
      setExpandedParents(new Set(parentIds));
    } catch (err) {
      toast.error(t('faaliyet_alanlari_yuklenirken_hata', 'Faaliyet alanları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  // 1. Seviye Ana Sektörler
  const anaSektorler = useMemo(() => {
    return items
      .filter(i => !i.ustFaaliyetAlaniId)
      .sort((a, b) => (a.sira || 0) - (b.sira || 0) || a.ad.localeCompare(b.ad, 'tr'));
  }, [items]);

  const handleToggleExpand = (parentId: number) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const parentIds = anaSektorler.map(i => i.id);
    setExpandedParents(new Set(parentIds));
  };

  const handleCollapseAll = () => {
    setExpandedParents(new Set());
  };

  const handleAddNewParent = () => {
    setIsChildCategory(false);
    setSelectedItem(null);
    navigate('/faaliyetalanlari/yeni');
  };

  const handleAddNewChild = (parentId: number) => {
    setIsChildCategory(true);
    setSelectedItem({ ustFaaliyetAlaniId: parentId });
    navigate(`/faaliyetalanlari/yeni?ustId=${parentId}`);
  };

  const handleEdit = (item: IFaaliyetAlani) => {
    setIsChildCategory(!!item.ustFaaliyetAlaniId);
    setSelectedItem(item);
    navigate(`/faaliyetalanlari/duzenle/${item.id}`);
  };

  const handleDelete = (item: IFaaliyetAlani) => {
    const isParent = !item.ustFaaliyetAlaniId;
    const subCount = items.filter(i => i.ustFaaliyetAlaniId === item.id).length;

    if (isParent && subCount > 0) {
      showAlert(
        'warning',
        t('silme_engellendi', 'Silme Engellendi'),
        t('silme_engellendi_detay', '"{ad}" ana sektörünün altında {count} adet alt faaliyet alanı bulunmaktadır. Önce alt alanları silmeli veya taşımalısınız.', { ad: item.ad, count: subCount })
      );
      return;
    }

    showAlert(
      'confirm',
      t('faaliyet_alanini_sil', 'Faaliyet Alanını Sil'),
      t('faaliyet_alani_sil_onay', '"{ad}" {tur} silmek istediğinize emin misiniz?', { ad: item.ad, tur: isParent ? t('ana_sektorunu', 'ana sektörünü') : t('faaliyet_alanini', 'faaliyet alanını') }),
      async () => {
        try {
          await service.deleteFaaliyetAlani(item.id);
          toast.success(t('faaliyet_alani_silindi', 'Faaliyet alanı silindi.'));
          fetchData();
        } catch (err: any) {
          showAlert('error', t('silme_basarisiz', 'Silme Başarısız'), err?.response?.data?.mesaj || t('kayit_silinemedi', 'Kayıt silinemedi.'));
        }
      },
      t('evet_sil', 'Evet, Sil'),
      t('İptal', 'İptal')
    );
  };

  // Dinamik Rota ve URL Yönetimi
  const isYeni = location.pathname.includes('/faaliyetalanlari/yeni');
  const isParaBirimleri = location.pathname.includes('/para-birimleri');
  const isVergiKdv = location.pathname.includes('/vergi-kdv');
  const isBirimler = location.pathname.includes('/birimler');
  const isModulAyarlari = location.pathname.includes('/modul-ayarlari/');
  const matchId = location.pathname.match(/\/(?:duzenle|faaliyetalanlari)\/(\d+)/);
  const activeEditId = params.id ? parseInt(params.id, 10) : (matchId ? parseInt(matchId[1], 10) : null);
  const isDuzenle = location.pathname.includes('/duzenle/') || (Boolean(activeEditId) && !isYeni && !location.pathname.endsWith('/faaliyetalanlari'));
  const isFormActive = isYeni || isDuzenle || isParaBirimleri || isVergiKdv || isBirimler || isModulAyarlari;

  const editItem = activeEditId ? items.find(i => i.id === activeEditId) || selectedItem : selectedItem;

  const queryParams = new URLSearchParams(location.search);
  const queryUstId = queryParams.get('ustId') ? parseInt(queryParams.get('ustId')!, 10) : null;

  const isChild = editItem ? !!editItem.ustFaaliyetAlaniId : (queryUstId !== null || isChildCategory);
  const formInitialData = editItem || (queryUstId ? { ustFaaliyetAlaniId: queryUstId } : selectedItem);

  // Form modundan çıkıldığında geçici seçim statelerini temizle
  useEffect(() => {
    if (!isFormActive) {
      if (selectedItem) setSelectedItem(null);
      if (isChildCategory) setIsChildCategory(false);
    }
  }, [isFormActive, selectedItem, isChildCategory]);

  const handleCloseForm = () => {
    setSelectedItem(null);
    setIsChildCategory(false);
    fetchData();
    navigate('/faaliyetalanlari');
  };

  const handleSuccessForm = () => {
    setSelectedItem(null);
    setIsChildCategory(false);
    fetchData();
    navigate('/faaliyetalanlari');
  };

  if (isFormActive) {
    if (activeEditId && loading && !editItem) {
      return (
        <div className="page-loading-state">
          {t('faaliyet_alanlari_yukleniyor', 'Faaliyet alanları yükleniyor...')}
        </div>
      );
    }

    return (
      <FaaliyetForm
        initialData={formInitialData}
        isChildCategory={isChild}
        anaSektorler={anaSektorler}
        onClose={handleCloseForm}
        onSuccess={handleSuccessForm}
      />
    );
  }

  return (
    <BaseCardPage
      title={t('faaliyet_alanlari_sektor_agaci', 'Faaliyet Alanları ve Sektör Ağacı')}
      icon={<FolderTree size={20} />}
      subtitleLeft={t('faaliyet_alanlari_sektor_agaci_aciklama', 'Müşterilerin kayıt olurken seçeceği 2 seviyeli sektörel faaliyet alanlarını ve varsayılan özellik profillerini yönetin.')}
      asForm={false}
      hideSaveButton={true}
      headerExtra={
        <div className="flex-row items-center gap-8">
          <button
            type="button"
            className="btn btn-secondary flex-row items-center gap-6"
            onClick={handleExpandAll}
            title={t('tumunu_genislet', 'Tümünü Genişlet')}
          >
            <ChevronsUpDown size={16} /> {t('tumunu_ac', 'Tümünü Aç')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCollapseAll}
            title={t('tumunu_daralt', 'Tümünü Daralt')}
          >
            {t('tumunu_kapat', 'Tümünü Kapat')}
          </button>
          <button
            type="button"
            className="btn btn-primary flex-row items-center gap-8"
            onClick={handleAddNewParent}
          >
            <FolderPlus size={16} /> {t('yeni_ana_sektor_ekle', 'Yeni Ana Sektör Ekle')}
          </button>
        </div>
      }
    >
      <TreeTableView
        items={items}
        loading={loading}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        expandedParents={expandedParents}
        onToggleExpand={handleToggleExpand}
        onAddChild={(parent: any) => handleAddNewChild(parent.id)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </BaseCardPage>
  );
}

export default FaaliyetAlanlari;
