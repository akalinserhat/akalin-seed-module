/**
 * Webakus AdminUI - Faaliyet Alanı ve Sektör Tanımlama / Düzenleme Formu (FaaliyetForm)
 * 
 * Başlıca Görevleri:
 * - Ana Sektör (1. Seviye) veya Alt Faaliyet Alanı (2. Seviye) tanımlama ve güncelleme işlemlerini yönetir.
 * - CariForm mimarisini takip ederek @BaseCardPage üzerinde sekmeli (Genel Bilgiler, Görsel İkon, Sektörel Özellikler, Sektörel Ayarlar) yapı sunar.
 * - Sektör/NACE kodu, görsel ikon kütüphanesi (25+ zengin ikon), görüntülenme sırası ve aktiflik durumunu yapılandırır.
 * - Alt sektörler için akıllı arayüz şablonu (Seri No, Garanti, Varyant, SKT, Reçete, Desi vb.) özellik profillerini yönetir.
 * - "Sektörel Ayarlar" sekmesi altında "Cari Türü Sıralaması" ve genişletilebilir "Sektörel Seed Yapılandırması" (Para Birimleri vb.) araçlarını barındırır.
 * - Yapılandır butonuna tıklandığında ParaBirimleri.tsx modül bileşenini inMemoryMode ile açar.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Tag,
  FolderPlus,
  Layers,
  ShoppingBag,
  Utensils,
  UtensilsCrossed,
  Store,
  Croissant,
  Beef,
  Factory,
  Briefcase,
  Building2,
  Globe,
  Truck,
  HeartPulse,
  Car,
  Wrench,
  Tv,
  Shirt,
  BookOpen,
  Gamepad2,
  Home,
  Sparkles,
  Calculator,
  Scale,
  Code,
  Compass,
  Sliders,
  CheckCircle2,
  Circle,
  Users,
  Settings2,
  FileText,
  Package,
  Coins,
  Percent,
  ArrowLeft,
  CheckSquare,
  Square,
  Boxes,
  Type
} from 'lucide-react';
import { BaseCardPage, BackButton, Breadcrumb, BaseSwitch, useHeaderApi, ModuleSettingsRegistry, ModulCardBasit } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { ParaBirimleri, KdvAyarlari, Birimler } from '@akalin/system_settings_module';
import { useSeedModuleService } from '../adapters/SeedModuleServiceContext';
import '../styles/seedModule.css';

// Desteklenen görsel ikonlar kütüphanesi
export const AVAILABLE_ICONS = [
  { name: 'ShoppingBag', label: 'Mağaza/Alışveriş', component: ShoppingBag },
  { name: 'Utensils', label: 'Gıda/Çatal-Bıçak', component: Utensils },
  { name: 'UtensilsCrossed', label: 'Restoran', component: UtensilsCrossed },
  { name: 'Store', label: 'Market/Bakkal', component: Store },
  { name: 'Croissant', label: 'Fırın/Pastane', component: Croissant },
  { name: 'Beef', label: 'Kasap/Şarküteri', component: Beef },
  { name: 'Factory', label: 'Üretim/Fabrika', component: Factory },
  { name: 'Briefcase', label: 'Hizmet/İş', component: Briefcase },
  { name: 'Building2', label: 'İnşaat/Bina', component: Building2 },
  { name: 'Globe', label: 'E-Ticaret/Web', component: Globe },
  { name: 'Truck', label: 'Lojistik/Dağıtım', component: Truck },
  { name: 'HeartPulse', label: 'Sağlık/Medikal', component: HeartPulse },
  { name: 'Car', label: 'Otomotiv', component: Car },
  { name: 'Wrench', label: 'Tamir/Servis', component: Wrench },
  { name: 'Tv', label: 'Elektronik/TV', component: Tv },
  { name: 'Shirt', label: 'Tekstil/Giyim', component: Shirt },
  { name: 'BookOpen', label: 'Kırtasiye/Kitap', component: BookOpen },
  { name: 'Gamepad2', label: 'Oyuncak/Hobi', component: Gamepad2 },
  { name: 'Home', label: 'Ev/Züccaciye', component: Home },
  { name: 'Sparkles', label: 'Kozmetik/Kuyumcu', component: Sparkles },
  { name: 'Calculator', label: 'Muhasebe/Maliye', component: Calculator },
  { name: 'Scale', label: 'Hukuk/Adalet', component: Scale },
  { name: 'Code', label: 'Yazılım/Bilişim', component: Code },
  { name: 'Compass', label: 'Mühendislik/Mimarlık', component: Compass },
  { name: 'Tag', label: 'Genel Etiket', component: Tag }
];

// Sektörel varsayılan özellik seçenekleri
export const FEATURE_PRESET_OPTIONS = [
  { key: 'seriNo', label: 'Seri No & IMEI Takibi', desc: 'Elektronik ve beyaz eşya ürünleri' },
  { key: 'garanti', label: 'Garanti Süresi & Takibi', desc: 'Cihaz garanti bitiş süreleri' },
  { key: 'varyant', label: 'Beden & Renk Varyantı', desc: 'Tekstil, giyim ve ayakkabı' },
  { key: 'skt', label: 'Son Kullanma Tarihi (SKT)', desc: 'Gıda, market ve kozmetik' },
  { key: 'partiLot', label: 'Parti & Lot Numarası', desc: 'Üretim ve sevkiyat partileri' },
  { key: 'recete', label: 'Üretim Reçeteleri', desc: 'Restoran menüleri ve imalat' },
  { key: 'desi', label: 'Kargo Desi & Paketleme', desc: 'E-Ticaret kargo hesaplamaları' },
  { key: 'tevkifat', label: 'Tevkifat & Stopaj', desc: 'Hizmet ve danışmanlık faturaları' },
  { key: 'oemKodu', label: 'OEM / Muadil Parça Kodu', desc: 'Otomotiv yedek parça' },
  { key: 'isEmri', label: 'Servis İş Emri / Plaka', desc: 'Oto servis ve teknik servisler' }
];

// Cari Türü Varsayılan Şablon Yapısı
export const DEFAULT_CARI_TURU_CONFIG = {
  kokSiralama: 'kurumsal_once', // 'kurumsal_once' | 'bireysel_once'
  bireyselUnvanSablonu: 2
};

// Sektörel Modüler Seed Varsayılan Yapısı (Veritabanında kayıt yoksa kullanılan fallback şablon)
export const DEFAULT_SEKTOREL_SEED_DATA = {
  paraBirimleri: [
    { kod: 'TRY', ad: 'Türk Lirası', sembol: '₺', varsayilanMi: true, aktifMi: true },
    { kod: 'EUR', ad: 'Euro', sembol: '€', varsayilanMi: false, aktifMi: false },
    { kod: 'USD', ad: 'Amerikan Doları', sembol: '$', varsayilanMi: false, aktifMi: false }
  ],
  kdvGruplari: [
    { kod: 'KDV-20', ad: 'Genel KDV (%20)', varsayilanMi: true, aktifMi: true, oran: 20, oranlar: [{ oran: 20, baslangicTarihi: '2023-07-10' }] },
    { kod: 'KDV-10', ad: 'Gıda & Temel İhtiyaç KDV (%10)', varsayilanMi: false, aktifMi: true, oran: 10, oranlar: [{ oran: 10, baslangicTarihi: '2023-07-10' }] },
    { kod: 'KDV-01', ad: 'Temel Tarım & Tohum KDV (%1)', varsayilanMi: false, aktifMi: true, oran: 1, oranlar: [{ oran: 1, baslangicTarihi: '2022-02-14' }] },
    { kod: 'KDV-00', ad: 'İhracat & İstisna KDV (%0)', varsayilanMi: false, aktifMi: true, oran: 0, oranlar: [{ oran: 0, baslangicTarihi: '2020-01-01' }] }
  ],
  birimler: [
    { id: 1, ad: 'Adet', sembol: 'ad', tip: 1, carpan: 1, anaBirimMi: true, aktifMi: true },
    { id: 2, ad: 'Kilogram', sembol: 'kg', tip: 2, carpan: 1, anaBirimMi: true, aktifMi: true },
    { id: 3, ad: 'Gram', sembol: 'gr', tip: 2, carpan: 0.001, anaBirimMi: false, aktifMi: true },
    { id: 4, ad: 'Metre', sembol: 'm', tip: 4, carpan: 1, anaBirimMi: true, aktifMi: true },
    { id: 5, ad: 'Litre', sembol: 'lt', tip: 3, carpan: 1, anaBirimMi: true, aktifMi: true },
    { id: 6, ad: 'Koli', sembol: 'kl', tip: 1, carpan: 12, anaBirimMi: false, aktifMi: true },
    { id: 7, ad: 'Paket', sembol: 'pkt', tip: 1, carpan: 1, anaBirimMi: false, aktifMi: true }
  ],
  moduller: [],
  modulAyarlari: {
    MOD_CARI: {
      kokSiralama: 'kurumsal_once',
      bireyselUnvanSablonu: 2
    },
    MOD_URUN_YONETIMI: {
      ureticiKoduMetinTercihi: 'hepsiBuyuk'
    }
  },
  genelAyarlar: {
    metinHarfDonusumu: 'basHarflerBuyuk',
    varsayilanDil: 'tr'
  },
  metinHarfDonusumu: 'basHarflerBuyuk',
  varsayilanDil: 'tr'
};


const DEFAULT_FORM_STATE = {
  id: 0,
  ustFaaliyetAlaniId: null,
  kod: '',
  ad: '',
  ikon: 'Tag',
  sira: 0,
  aciklama: '',
  aktifMi: true,
  varsayilanOzellikler: {},
  cariTuruYapilandirma: DEFAULT_CARI_TURU_CONFIG,
  sektorelSeedData: DEFAULT_SEKTOREL_SEED_DATA
};

export function FaaliyetForm({
  initialData = null,
  isChildCategory: initialIsChild = false,
  anaSektorler = [],
  onClose,
  onSuccess
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const service = useSeedModuleService();

  // URL'deki sekmeyi, Para Birimleri, Vergi/KDV, Ölçü Birimleri ve Modül Ayarları alt sayfa durumunu kontrol et
  const isCurrencySubPage = location.pathname.includes('/para-birimleri');
  const isKdvSubPage = location.pathname.includes('/vergi-kdv');
  const isBirimSubPage = location.pathname.includes('/birimler');
  const isModulSettingsSubPage = location.pathname.includes('/modul-ayarlari/');
  const isSubPage = isCurrencySubPage || isKdvSubPage || isBirimSubPage || isModulSettingsSubPage;

  let activeModulKod = null;
  if (isModulSettingsSubPage) {
    const parts = location.pathname.split('/modul-ayarlari/');
    if (parts.length > 1) {
      activeModulKod = decodeURIComponent(parts[1].split('/')[0].split('?')[0]);
    }
  }
  const activeSettingsDef = activeModulKod ? ModuleSettingsRegistry.get(activeModulKod) : null;

  const urlTab = searchParams.get('tab');
  const [activeTabId, setActiveTabId] = useState(
    (urlTab === 'sektorel' ? 'ayarlar' : urlTab) || (isSubPage ? (isModulSettingsSubPage ? 'moduller' : 'ayarlar') : 'genel')
  );

  useEffect(() => {
    if (urlTab && urlTab !== activeTabId) {
      setActiveTabId(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (newTabId) => {
    setActiveTabId(newTabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', newTabId);
      return next;
    }, { replace: true });
  };

  const [formData, setFormData] = useState<any>(DEFAULT_FORM_STATE);
  const [isChildCategory, setIsChildCategory] = useState(initialIsChild);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [tumModuller, setTumModuller] = useState<any[]>([]);
  const [modullerLoading, setModullerLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchModuller = async () => {
      try {
        setModullerLoading(true);
        const list = await service.getModuller();

        if (isMounted) {
          setTumModuller(list);
        }
      } catch (err) {
        console.error('Modül listesi alınamadı:', err);
      } finally {
        if (isMounted) {
          setModullerLoading(false);
        }
      }
    };

    fetchModuller();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      let parsedFeatures = {};
      if (initialData.varsayilanOzelliklerJson) {
        try {
          parsedFeatures = JSON.parse(initialData.varsayilanOzelliklerJson);
        } catch (e) {
          console.error('Feature parse hatası:', e);
        }
      } else if (initialData.varsayilanOzellikler) {
        parsedFeatures = initialData.varsayilanOzellikler;
      }

      let parsedCariConfig = DEFAULT_CARI_TURU_CONFIG;
      const rawCariConfig = initialData.cariTuruYapilandirmaJson ?? initialData.CariTuruYapilandirmaJson;
      if (rawCariConfig) {
        try {
          const parsed = typeof rawCariConfig === 'string' ? JSON.parse(rawCariConfig) : rawCariConfig;
          parsedCariConfig = {
            ...DEFAULT_CARI_TURU_CONFIG,
            ...parsed
          };
        } catch (e) {
          console.error('CariTuru parse hatası:', e);
        }
      } else if (initialData.cariTuruYapilandirma) {
        parsedCariConfig = {
          ...DEFAULT_CARI_TURU_CONFIG,
          ...initialData.cariTuruYapilandirma
        };
      }

      let parsedSeedData = DEFAULT_SEKTOREL_SEED_DATA;
      const rawSeedData = initialData.sektorelSeedDataJson ?? initialData.SektorelSeedDataJson;
      if (rawSeedData) {
        try {
          const parsed = typeof rawSeedData === 'string' ? JSON.parse(rawSeedData) : rawSeedData;
          parsedSeedData = {
            ...DEFAULT_SEKTOREL_SEED_DATA,
            ...parsed,
            moduller: Array.isArray(parsed?.moduller) ? parsed.moduller : [],
            modulAyarlari: parsed?.modulAyarlari || {}
          };
        } catch (e) {
          console.error('SeedData parse hatası:', e);
        }
      } else if (initialData.sektorelSeedData) {
        parsedSeedData = {
          ...DEFAULT_SEKTOREL_SEED_DATA,
          ...initialData.sektorelSeedData,
          moduller: Array.isArray(initialData.sektorelSeedData?.moduller) ? initialData.sektorelSeedData.moduller : [],
          modulAyarlari: initialData.sektorelSeedData?.modulAyarlari || {}
        };
      }

      // MOD_CARI ayarını geriye dönük uyumluluk için senkronize et
      if (!parsedSeedData.modulAyarlari?.MOD_CARI && parsedCariConfig) {
        parsedSeedData = {
          ...parsedSeedData,
          modulAyarlari: {
            ...parsedSeedData.modulAyarlari,
            MOD_CARI: {
              kokSiralama: parsedCariConfig.kokSiralama || 'kurumsal_once',
              bireyselUnvanSablonu: parsedCariConfig.bireyselUnvanSablonu || 2
            }
          }
        };
      }

      const isChild = initialData.ustFaaliyetAlaniId !== null && initialData.ustFaaliyetAlaniId !== undefined
        ? true 
        : initialIsChild;

      setIsChildCategory(isChild);
      setFormData({
        id: initialData.id || 0,
        ustFaaliyetAlaniId: initialData.ustFaaliyetAlaniId || (isChild && anaSektorler.length > 0 ? anaSektorler[0].id : null),
        kod: initialData.kod || '',
        ad: initialData.ad || '',
        ikon: initialData.ikon || 'Tag',
        sira: initialData.sira !== undefined ? initialData.sira : 0,
        aciklama: initialData.aciklama || '',
        aktifMi: initialData.aktifMi !== undefined ? initialData.aktifMi : true,
        varsayilanOzellikler: parsedFeatures,
        cariTuruYapilandirma: parsedCariConfig,
        sektorelSeedData: parsedSeedData
      });
      setErrors({});
    } else {
      setIsChildCategory(initialIsChild);
      setFormData({
        ...DEFAULT_FORM_STATE,
        ustFaaliyetAlaniId: initialIsChild && anaSektorler.length > 0 ? anaSektorler[0].id : null,
        sira: (anaSektorler.length + 1) * 10
      });
      setErrors({});
    }
  }, [initialData, initialIsChild, anaSektorler]);

  const validate = () => {
    const errs = {};
    if (!formData.ad?.trim()) {
      errs.ad = t('auto_faaliyet_alani_adi_zorunludur', 'Faaliyet alanı adı zorunludur.');
    }
    if (isChildCategory && !formData.ustFaaliyetAlaniId) {
      errs.ustFaaliyetAlaniId = t('auto_lutfen_bir_ust_ana_sektor_seciniz', 'Lütfen bir üst ana sektör seçiniz.');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      toast.error(t('auto_lutfen_zorunlu_alanlari_doldurunuz', 'Lütfen zorunlu alanları doldurunuz.'));
      return;
    }

    setSaving(true);
    const payload = {
      id: formData.id,
      ustFaaliyetAlaniId: isChildCategory ? formData.ustFaaliyetAlaniId : null,
      kod: formData.kod?.trim() || null,
      ad: formData.ad.trim(),
      ikon: formData.ikon || 'Tag',
      sira: Number(formData.sira) || 0,
      aciklama: formData.aciklama?.trim() || '',
      aktifMi: formData.aktifMi,
      varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler).length > 0
        ? JSON.stringify(formData.varsayilanOzellikler)
        : null,
      cariTuruYapilandirmaJson: formData.cariTuruYapilandirma 
        ? JSON.stringify(formData.cariTuruYapilandirma) 
        : null,
      sektorelSeedDataJson: formData.sektorelSeedData
        ? JSON.stringify(formData.sektorelSeedData)
        : null
    };

    try {
      if (formData.id > 0) {
        await service.updateFaaliyetAlani(formData.id, payload);
        toast.success(isCurrencySubPage 
          ? t('sektorel_para_birimleri_kaydedildi', 'Sektörel para birimleri yapılandırması kaydedildi.')
          : (isKdvSubPage
            ? t('sektorel_vergi_kdv_kaydedildi', 'Sektörel vergi ve KDV yapılandırması kaydedildi.')
            : (isBirimSubPage
              ? t('sektorel_birimler_kaydedildi', 'Sektörel ölçü birimleri yapılandırması kaydedildi.')
              : (isModulSettingsSubPage
                ? t('sektorel_modul_ayarlari_kaydedildi', 'Modül ayarları başarıyla kaydedildi.')
                : t('auto_faaliyet_alani_guncellendi', 'Faaliyet alanı güncellendi.'))))
        );
      } else {
        await service.createFaaliyetAlani(payload);
        toast.success(t('auto_yeni_faaliyet_alani_olusturuldu', 'Yeni faaliyet alanı oluşturuldu.'));
      }
      if (isCurrencySubPage) {
        handleBackFromCurrency();
      } else if (isKdvSubPage) {
        handleBackFromKdv();
      } else if (isBirimSubPage) {
        handleBackFromBirim();
      } else if (isModulSettingsSubPage) {
        handleBackFromModulSettings();
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.mesaj || t('auto_kayit_sirasinda_bir_hata_olustu', 'Kayıt sırasında bir hata oluştu.');
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = formData.id > 0;
  const pageTitle = isChildCategory
    ? t('alt_faaliyet_alani', 'Alt Faaliyet Alanı')
    : t('ana_sektor', 'Ana Sektör');

  const recordTitle = formData.ad?.trim() || pageTitle;

  const handleOpenCurrencySubPage = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}/para-birimleri` 
      : `/faaliyetalanlari/yeni/para-birimleri`;
    navigate(targetPath);
  };

  const handleBackFromCurrency = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}?tab=ayarlar` 
      : `/faaliyetalanlari/yeni?tab=ayarlar`;
    navigate(targetPath);
  };

  const handleCurrencyMemoryUpdate = async (updatedItems) => {
    const updatedSeedData = {
      ...(formData.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
      paraBirimleri: updatedItems
    };

    setFormData(prev => ({
      ...prev,
      sektorelSeedData: updatedSeedData
    }));

    const targetId = formData.id || initialData?.id;
    if (targetId && targetId > 0) {
      const payload = {
        id: targetId,
        ustFaaliyetAlaniId: isChildCategory ? (formData.ustFaaliyetAlaniId ?? initialData?.ustFaaliyetAlaniId) : null,
        kod: formData.kod?.trim() || initialData?.kod?.trim() || null,
        ad: formData.ad?.trim() || initialData?.ad?.trim() || 'Faaliyet Alanı',
        ikon: formData.ikon || initialData?.ikon || 'Tag',
        sira: parseInt(formData.sira !== undefined ? formData.sira : initialData?.sira, 10) || 0,
        aciklama: formData.aciklama?.trim() || initialData?.aciklama?.trim() || '',
        aktifMi: formData.aktifMi !== undefined ? formData.aktifMi : (initialData?.aktifMi ?? true),
        varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler || {}).length > 0
          ? JSON.stringify(formData.varsayilanOzellikler)
          : (initialData?.varsayilanOzelliklerJson || null),
        cariTuruYapilandirmaJson: formData.cariTuruYapilandirma 
          ? JSON.stringify(formData.cariTuruYapilandirma) 
          : (initialData?.cariTuruYapilandirmaJson || null),
        sektorelSeedDataJson: JSON.stringify(updatedSeedData)
      };

      try {
        await service.updateFaaliyetAlani(targetId, payload);
      } catch (err) {
        console.error('Faaliyet alanı para birimleri otomatik kaydedilemedi:', err);
        toast.error(t('auto_kayit_sirasinda_bir_hata_olustu', 'Kayıt sırasında bir hata oluştu.'));
      }
    }
  };

  const handleOpenKdvSubPage = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}/vergi-kdv` 
      : `/faaliyetalanlari/yeni/vergi-kdv`;
    navigate(targetPath);
  };

  const handleBackFromKdv = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}?tab=ayarlar` 
      : `/faaliyetalanlari/yeni?tab=ayarlar`;
    navigate(targetPath);
  };

  const handleKdvMemoryUpdate = async (updatedItems) => {
    const updatedSeedData = {
      ...(formData.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
      kdvGruplari: updatedItems
    };

    setFormData(prev => ({
      ...prev,
      sektorelSeedData: updatedSeedData
    }));

    const targetId = formData.id || initialData?.id;
    if (targetId && targetId > 0) {
      const payload = {
        id: targetId,
        ustFaaliyetAlaniId: isChildCategory ? (formData.ustFaaliyetAlaniId ?? initialData?.ustFaaliyetAlaniId) : null,
        kod: formData.kod?.trim() || initialData?.kod?.trim() || null,
        ad: formData.ad?.trim() || initialData?.ad?.trim() || 'Faaliyet Alanı',
        ikon: formData.ikon || initialData?.ikon || 'Tag',
        sira: parseInt(formData.sira !== undefined ? formData.sira : initialData?.sira, 10) || 0,
        aciklama: formData.aciklama?.trim() || initialData?.aciklama?.trim() || '',
        aktifMi: formData.aktifMi !== undefined ? formData.aktifMi : (initialData?.aktifMi ?? true),
        varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler || {}).length > 0
          ? JSON.stringify(formData.varsayilanOzellikler)
          : (initialData?.varsayilanOzelliklerJson || null),
        cariTuruYapilandirmaJson: formData.cariTuruYapilandirma 
          ? JSON.stringify(formData.cariTuruYapilandirma) 
          : (initialData?.cariTuruYapilandirmaJson || null),
        sektorelSeedDataJson: JSON.stringify(updatedSeedData)
      };

      try {
        await service.updateFaaliyetAlani(targetId, payload);
      } catch (err) {
        console.error('Faaliyet alanı KDV ayarları otomatik kaydedilemedi:', err);
        toast.error(t('auto_kayit_sirasinda_bir_hata_olustu', 'Kayıt sırasında bir hata oluştu.'));
      }
    }
  };

  const handleOpenBirimSubPage = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}/birimler` 
      : `/faaliyetalanlari/yeni/birimler`;
    navigate(targetPath);
  };

  const handleBackFromBirim = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}?tab=ayarlar` 
      : `/faaliyetalanlari/yeni?tab=ayarlar`;
    navigate(targetPath);
  };

  const handleBirimMemoryUpdate = async (updatedItems) => {
    const updatedSeedData = {
      ...(formData.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
      birimler: updatedItems
    };

    setFormData(prev => ({
      ...prev,
      sektorelSeedData: updatedSeedData
    }));

    const targetId = formData.id || initialData?.id;
    if (targetId && targetId > 0) {
      const payload = {
        id: targetId,
        ustFaaliyetAlaniId: isChildCategory ? (formData.ustFaaliyetAlaniId ?? initialData?.ustFaaliyetAlaniId) : null,
        kod: formData.kod?.trim() || initialData?.kod?.trim() || null,
        ad: formData.ad?.trim() || initialData?.ad?.trim() || 'Faaliyet Alanı',
        ikon: formData.ikon || initialData?.ikon || 'Tag',
        sira: parseInt(formData.sira !== undefined ? formData.sira : initialData?.sira, 10) || 0,
        aciklama: formData.aciklama?.trim() || initialData?.aciklama?.trim() || '',
        aktifMi: formData.aktifMi !== undefined ? formData.aktifMi : (initialData?.aktifMi ?? true),
        varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler || {}).length > 0
          ? JSON.stringify(formData.varsayilanOzellikler)
          : (initialData?.varsayilanOzelliklerJson || null),
        cariTuruYapilandirmaJson: formData.cariTuruYapilandirma 
          ? JSON.stringify(formData.cariTuruYapilandirma) 
          : (initialData?.cariTuruYapilandirmaJson || null),
        sektorelSeedDataJson: JSON.stringify(updatedSeedData)
      };

      try {
        await service.updateFaaliyetAlani(targetId, payload);
      } catch (err) {
        console.error('Faaliyet alanı ölçü birimleri otomatik kaydedilemedi:', err);
        toast.error(t('auto_kayit_sirasinda_bir_hata_olustu', 'Kayıt sırasında bir hata oluştu.'));
      }
    }
  };

  const handleOpenModulSettings = (modulKod) => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}/modul-ayarlari/${encodeURIComponent(modulKod)}` 
      : `/faaliyetalanlari/yeni/modul-ayarlari/${encodeURIComponent(modulKod)}`;
    navigate(targetPath);
  };

  const handleBackFromModulSettings = () => {
    const targetPath = formData.id > 0 
      ? `/faaliyetalanlari/duzenle/${formData.id}?tab=moduller` 
      : `/faaliyetalanlari/yeni?tab=moduller`;
    navigate(targetPath);
  };

  const handleModulSettingsMemoryUpdate = async (newVal) => {
    if (!activeModulKod) return;

    const currentModulAyarlari = formData.sektorelSeedData?.modulAyarlari || {};
    const updatedModulAyarlari = {
      ...currentModulAyarlari,
      [activeModulKod]: newVal
    };

    const isUrunModul = activeModulKod.toUpperCase().includes('URUN') || 
                        activeModulKod.toUpperCase().includes('STOK');
    if (isUrunModul) {
      updatedModulAyarlari['MOD_URUN_YONETIMI'] = newVal;
      updatedModulAyarlari['MOD_URUN_HIZMET'] = newVal;
    }

    const updatedSeedData = {
      ...(formData.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
      modulAyarlari: updatedModulAyarlari
    };

    const isCariModul = activeModulKod.toUpperCase() === 'MOD_CARI' || 
                        activeModulKod.toLowerCase() === 'cari-yonetimi' ||
                        activeModulKod.toUpperCase() === 'MOD_CARI_YONETIMI';
    const updatedCariConfig = isCariModul
      ? { 
          ...formData.cariTuruYapilandirma, 
          ...(newVal?.kokSiralama ? { kokSiralama: newVal.kokSiralama } : {}),
          ...(newVal?.bireyselUnvanSablonu !== undefined ? { bireyselUnvanSablonu: Number(newVal.bireyselUnvanSablonu) } : {})
        }
      : formData.cariTuruYapilandirma;

    setFormData(prev => ({
      ...prev,
      sektorelSeedData: updatedSeedData,
      cariTuruYapilandirma: updatedCariConfig
    }));

    const targetId = formData.id || initialData?.id;
    if (targetId && targetId > 0) {
      const payload = {
        id: targetId,
        ustFaaliyetAlaniId: isChildCategory ? (formData.ustFaaliyetAlaniId ?? initialData?.ustFaaliyetAlaniId) : null,
        kod: formData.kod?.trim() || initialData?.kod?.trim() || null,
        ad: formData.ad?.trim() || initialData?.ad?.trim() || 'Faaliyet Alanı',
        ikon: formData.ikon || initialData?.ikon || 'Tag',
        sira: parseInt(formData.sira !== undefined ? formData.sira : initialData?.sira, 10) || 0,
        aciklama: formData.aciklama?.trim() || initialData?.aciklama?.trim() || '',
        aktifMi: formData.aktifMi !== undefined ? formData.aktifMi : (initialData?.aktifMi ?? true),
        varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler || {}).length > 0
          ? JSON.stringify(formData.varsayilanOzellikler)
          : (initialData?.varsayilanOzelliklerJson || null),
        cariTuruYapilandirmaJson: updatedCariConfig 
          ? JSON.stringify(updatedCariConfig) 
          : (initialData?.cariTuruYapilandirmaJson || null),
        sektorelSeedDataJson: JSON.stringify(updatedSeedData)
      };

      try {
        await service.updateFaaliyetAlani(targetId, payload);
      } catch (err) {
        console.error('Faaliyet alanı modül ayarları otomatik kaydedilemedi:', err);
        toast.error(t('auto_kayit_sirasinda_bir_hata_olustu', 'Kayıt sırasında bir hata oluştu.'));
      }
    }
  };

  const { setHeader, clearHeader, setHeaderBreadcrumbOptions } = useHeaderApi();

  useEffect(() => {
    if (setHeaderBreadcrumbOptions) {
      if (isCurrencySubPage) {
        setHeaderBreadcrumbOptions({
          subTrail: [
            { label: recordTitle, onClick: handleBackFromCurrency },
            { label: t('sektorel_para_birimleri_baslik', 'Para Birimleri Yapılandırması') }
          ],
          onBack: handleBackFromCurrency
        });
      } else if (isKdvSubPage) {
        setHeaderBreadcrumbOptions({
          subTrail: [
            { label: recordTitle, onClick: handleBackFromKdv },
            { label: t('sektorel_vergi_kdv_baslik', 'Vergi ve KDV Ayarları') }
          ],
          onBack: handleBackFromKdv
        });
      } else if (isBirimSubPage) {
        setHeaderBreadcrumbOptions({
          subTrail: [
            { label: recordTitle, onClick: handleBackFromBirim },
            { label: t('sektorel_birimler_baslik', 'Ölçü Birimleri Yapılandırması') }
          ],
          onBack: handleBackFromBirim
        });
      } else if (isModulSettingsSubPage && activeSettingsDef) {
        setHeaderBreadcrumbOptions({
          subTrail: [
            { label: recordTitle, onClick: handleBackFromModulSettings },
            { label: activeSettingsDef.title }
          ],
          onBack: handleBackFromModulSettings
        });
      } else {
        setHeaderBreadcrumbOptions({
          recordTitle,
          onBack: onClose
        });
      }
    }
    if (setHeader) {
      const handleBack = isCurrencySubPage 
        ? handleBackFromCurrency 
        : (isKdvSubPage 
          ? handleBackFromKdv 
          : (isBirimSubPage 
            ? handleBackFromBirim 
            : (isModulSettingsSubPage 
              ? handleBackFromModulSettings 
              : onClose)));

      setHeader('faaliyet-form', (
        <BackButton 
          onClick={handleBack} 
          title={t('auto_geri_don', 'Geri Dön')} 
        />
      ));
    }

    return () => {
      if (clearHeader) clearHeader('faaliyet-form');
      if (setHeaderBreadcrumbOptions) setHeaderBreadcrumbOptions(null);
    };
  }, [isCurrencySubPage, isKdvSubPage, isBirimSubPage, isModulSettingsSubPage, activeSettingsDef, pageTitle, recordTitle, onClose, setHeader, clearHeader, setHeaderBreadcrumbOptions, t, formData.id]);

  // Seçili ikonu bul
  const selectedIconObj = AVAILABLE_ICONS.find(i => i.name === formData.ikon) || AVAILABLE_ICONS[AVAILABLE_ICONS.length - 1];
  const SelectedIconComponent = selectedIconObj.component;

  const currentCariConfig = formData.cariTuruYapilandirma || DEFAULT_CARI_TURU_CONFIG;
  const currentSeedParaBirimleri = formData.sektorelSeedData?.paraBirimleri || DEFAULT_SEKTOREL_SEED_DATA.paraBirimleri || [];
  const currentSeedKdvGruplari = formData.sektorelSeedData?.kdvGruplari || DEFAULT_SEKTOREL_SEED_DATA.kdvGruplari || [];
  const currentSeedBirimler = formData.sektorelSeedData?.birimler || DEFAULT_SEKTOREL_SEED_DATA.birimler || [];
  const currentSeedModuller = formData.sektorelSeedData?.moduller || DEFAULT_SEKTOREL_SEED_DATA.moduller || [];
  const currentMetinHarfDonusumu = formData.sektorelSeedData?.genelAyarlar?.metinHarfDonusumu 
    || formData.sektorelSeedData?.metinHarfDonusumu 
    || 'basHarflerBuyuk';

  const currentVarsayilanDil = formData.sektorelSeedData?.genelAyarlar?.varsayilanDil 
    || formData.sektorelSeedData?.varsayilanDil 
    || 'tr';

  const handleMetinHarfDonusumuChange = async (newVal) => {
    const currentGenelAyarlar = formData.sektorelSeedData?.genelAyarlar || {};
    const updatedSeedData = {
      ...(formData.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
      genelAyarlar: {
        ...currentGenelAyarlar,
        metinHarfDonusumu: newVal
      },
      metinHarfDonusumu: newVal
    };

    setFormData(prev => ({
      ...prev,
      sektorelSeedData: updatedSeedData
    }));

    const targetId = formData.id || initialData?.id;
    if (targetId && targetId > 0) {
      const payload = {
        id: targetId,
        ustFaaliyetAlaniId: isChildCategory ? (formData.ustFaaliyetAlaniId ?? initialData?.ustFaaliyetAlaniId) : null,
        kod: formData.kod?.trim() || initialData?.kod?.trim() || null,
        ad: formData.ad?.trim() || initialData?.ad?.trim() || 'Faaliyet Alanı',
        ikon: formData.ikon || initialData?.ikon || 'Tag',
        sira: parseInt(formData.sira !== undefined ? formData.sira : initialData?.sira, 10) || 0,
        aciklama: formData.aciklama?.trim() || initialData?.aciklama?.trim() || '',
        aktifMi: formData.aktifMi !== undefined ? formData.aktifMi : (initialData?.aktifMi ?? true),
        varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler || {}).length > 0
          ? JSON.stringify(formData.varsayilanOzellikler)
          : (initialData?.varsayilanOzelliklerJson || null),
        cariTuruYapilandirmaJson: formData.cariTuruYapilandirma 
          ? JSON.stringify(formData.cariTuruYapilandirma) 
          : (initialData?.cariTuruYapilandirmaJson || null),
        sektorelSeedDataJson: JSON.stringify(updatedSeedData)
      };

      try {
        await service.updateFaaliyetAlani(targetId, payload);
      } catch (err) {
        console.error('Faaliyet alanı metin harf dönüşümü otomatik kaydedilemedi:', err);
      }
    }
  };

  const handleVarsayilanDilChange = async (newVal) => {
    const currentGenelAyarlar = formData.sektorelSeedData?.genelAyarlar || {};
    const updatedSeedData = {
      ...(formData.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
      genelAyarlar: {
        ...currentGenelAyarlar,
        varsayilanDil: newVal
      },
      varsayilanDil: newVal
    };

    setFormData(prev => ({
      ...prev,
      sektorelSeedData: updatedSeedData
    }));

    const targetId = formData.id || initialData?.id;
    if (targetId && targetId > 0) {
      const payload = {
        id: targetId,
        ustFaaliyetAlaniId: isChildCategory ? (formData.ustFaaliyetAlaniId ?? initialData?.ustFaaliyetAlaniId) : null,
        kod: formData.kod?.trim() || initialData?.kod?.trim() || null,
        ad: formData.ad?.trim() || initialData?.ad?.trim() || 'Faaliyet Alanı',
        ikon: formData.ikon || initialData?.ikon || 'Tag',
        sira: parseInt(formData.sira !== undefined ? formData.sira : initialData?.sira, 10) || 0,
        aciklama: formData.aciklama?.trim() || initialData?.aciklama?.trim() || '',
        aktifMi: formData.aktifMi !== undefined ? formData.aktifMi : (initialData?.aktifMi ?? true),
        varsayilanOzelliklerJson: isChildCategory && Object.keys(formData.varsayilanOzellikler || {}).length > 0
          ? JSON.stringify(formData.varsayilanOzellikler)
          : (initialData?.varsayilanOzelliklerJson || null),
        cariTuruYapilandirmaJson: formData.cariTuruYapilandirma 
          ? JSON.stringify(formData.cariTuruYapilandirma) 
          : (initialData?.cariTuruYapilandirmaJson || null),
        sektorelSeedDataJson: JSON.stringify(updatedSeedData)
      };

      try {
        await service.updateFaaliyetAlani(targetId, payload);
      } catch (err) {
        console.error('Faaliyet alanı varsayılan dil otomatik kaydedilemedi:', err);
      }
    }
  };

  const handleCariConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      cariTuruYapilandirma: {
        ...prev.cariTuruYapilandirma,
        [key]: value
      }
    }));
  };

  const isModulSelected = (modul) => {
    const list = currentSeedModuller;
    const code = (modul.kod || '').trim();
    const id = modul.id;
    return list.some(item => {
      if (typeof item === 'string') return item.toLowerCase() === code.toLowerCase();
      if (typeof item === 'number') return item === id;
      if (typeof item === 'object' && item !== null) {
        return (item.kod && item.kod.toLowerCase() === code.toLowerCase()) || item.id === id;
      }
      return false;
    });
  };

  const handleToggleModul = (modul) => {
    const code = modul.kod || `MOD_${modul.id}`;
    setFormData(prev => {
      const currentList = prev.sektorelSeedData?.moduller || [];
      const exists = isModulSelected(modul);
      const nextList = exists
        ? currentList.filter(item => {
            const itemCode = typeof item === 'string' ? item : (item?.kod || '');
            const itemId = typeof item === 'number' ? item : (item?.id || null);
            return itemCode.toLowerCase() !== code.toLowerCase() && itemId !== modul.id;
          })
        : [...currentList, code];

      return {
        ...prev,
        sektorelSeedData: {
          ...(prev.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
          moduller: nextList
        }
      };
    });
  };

  const selectedCount = tumModuller.filter(m => isModulSelected(m)).length;

  const handleSelectAllModuller = () => {
    const allCodes = tumModuller.map(m => m.kod || `MOD_${m.id}`);
    setFormData(prev => ({
      ...prev,
      sektorelSeedData: {
        ...(prev.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
        moduller: allCodes
      }
    }));
  };

  const handleClearAllModuller = () => {
    setFormData(prev => ({
      ...prev,
      sektorelSeedData: {
        ...(prev.sektorelSeedData || DEFAULT_SEKTOREL_SEED_DATA),
        moduller: []
      }
    }));
  };

  // Sekmeli yapı (tabs)
  const tabs = [
    {
      id: 'genel',
      label: t('genel_bilgiler', 'Genel Bilgiler'),
      icon: <Tag size={18} />,
      content: (
        <div className="flex-col gap-16 p-24">
          {/* Kategori Seviyesi Seçici (Yeni Kayıtta) */}
          {!isEdit && (
            <div className="form-field full-width mb-8">
              <label className="form-label">{t('kategori_seviyesi', 'Kategori Seviyesi')}</label>
              <div className="faaliyet-category-type-grid">
                <div
                  className={`faaliyet-category-type-card ${!isChildCategory ? 'active' : ''}`}
                  onClick={() => {
                    setIsChildCategory(false);
                    setFormData({ ...formData, ustFaaliyetAlaniId: null });
                  }}
                >
                  <div className="card-icon">
                    <FolderPlus size={18} />
                  </div>
                  <div className="card-info">
                    <h4>{t('ana_sektor_1_seviye', '1. Seviye Ana Sektör')}</h4>
                    <p>{t('ana_sektor_aciklama', 'Perakende, İmalat, Hizmet, Bilişim gibi üst çatı sektör tanımları.')}</p>
                  </div>
                </div>

                <div
                  className={`faaliyet-category-type-card ${isChildCategory ? 'active' : ''}`}
                  onClick={() => {
                    setIsChildCategory(true);
                    if (!formData.ustFaaliyetAlaniId && anaSektorler.length > 0) {
                      setFormData({ ...formData, ustFaaliyetAlaniId: anaSektorler[0].id });
                    }
                  }}
                >
                  <div className="card-icon">
                    <Layers size={18} />
                  </div>
                  <div className="card-info">
                    <h4>{t('alt_faaliyet_2_seviye', '2. Seviye Alt Faaliyet Alanı')}</h4>
                    <p>{t('alt_faaliyet_aciklama', 'Beyaz Eşya, Restoran, Kırtasiye gibi bir ana sektöre bağlı alt kollar.')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Alanları Grid Yapısı */}
          <div className="form-grid">
            {/* Eğer Alt Faaliyet Alanı ise Üst Sektör Seçimi */}
            {isChildCategory && (
              <div className="form-field full-width">
                <label className="form-label" htmlFor="ustFaaliyetAlaniId">
                  {t('bagli_oldugu_ana_sektor', 'Bağlı Olduğu Ana Sektör')} <span className="required-mark">*</span>
                </label>
                <select
                  id="ustFaaliyetAlaniId"
                  className={`form-input ${errors.ustFaaliyetAlaniId ? 'is-invalid' : ''}`}
                  value={formData.ustFaaliyetAlaniId || ''}
                  onChange={(e) => {
                    const parentId = parseInt(e.target.value, 10) || null;
                    const parent = anaSektorler.find(s => s.id === parentId);
                    let parentCariConfig = DEFAULT_CARI_TURU_CONFIG;
                    if (parent?.cariTuruYapilandirmaJson) {
                      try {
                        parentCariConfig = JSON.parse(parent.cariTuruYapilandirmaJson);
                      } catch (err) {}
                    } else if (parent?.cariTuruYapilandirma) {
                      parentCariConfig = parent.cariTuruYapilandirma;
                    }

                    let parentSeedData = DEFAULT_SEKTOREL_SEED_DATA;
                    if (parent?.sektorelSeedDataJson) {
                      try {
                        const parsed = JSON.parse(parent.sektorelSeedDataJson);
                        parentSeedData = {
                          ...DEFAULT_SEKTOREL_SEED_DATA,
                          ...parsed,
                          moduller: Array.isArray(parsed?.moduller) ? parsed.moduller : []
                        };
                      } catch (err) {}
                    }

                    setFormData(prev => ({
                      ...prev,
                      ustFaaliyetAlaniId: parentId,
                      cariTuruYapilandirma: parentCariConfig,
                      sektorelSeedData: parentSeedData
                    }));
                  }}
                >
                  <option value="">{t('select_ana_sektor_seciniz', '-- Ana Sektör Seçiniz --')}</option>
                  {anaSektorler.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ad} {s.kod ? `(${s.kod})` : ''}
                    </option>
                  ))}
                </select>
                {errors.ustFaaliyetAlaniId && (
                  <span className="faaliyet-field-error">
                    {errors.ustFaaliyetAlaniId}
                  </span>
                )}
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="faaliyetAlaniAd">
                {isChildCategory ? t('alt_faaliyet_adi', 'Alt Faaliyet Adı') : t('ana_sektor_adi', 'Ana Sektör Adı')} <span className="required-mark">*</span>
              </label>
              <input
                id="faaliyetAlaniAd"
                type="text"
                className={`form-input ${errors.ad ? 'is-invalid' : ''}`}
                placeholder={isChildCategory ? t('ph_alt_faaliyet', 'Örn: Kırtasiye & Ofis Malzemeleri') : t('ph_ana_sektor', 'Örn: Perakende & Mağazacılık')}
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                autoFocus
              />
              {errors.ad && (
                <span className="faaliyet-field-error">
                  {errors.ad}
                </span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="faaliyetAlaniKod">
                {t('sektor_nace_kodu', 'Sektör / NACE Kodu')} <span className="form-label-hint">({t('nace_ornek', 'Örn: 47.62 veya RET')})</span>
              </label>
              <input
                id="faaliyetAlaniKod"
                type="text"
                className="form-input"
                placeholder="Örn: 47.62"
                value={formData.kod}
                onChange={(e) => setFormData({ ...formData, kod: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="faaliyetAlaniSira">
                {t('goruntulenme_sirasi', 'Görüntülenme Sırası')}
              </label>
              <input
                id="faaliyetAlaniSira"
                type="number"
                className="form-input"
                value={formData.sira ?? 0}
                onChange={(e) => setFormData({ ...formData, sira: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="faaliyetAlaniAktif">{t('aktiflik_durumu', 'Aktiflik Durumu')}</label>
              <div className="faaliyet-checkbox-box">
                <BaseSwitch
                  id="faaliyetAlaniAktif"
                  checked={formData.aktifMi}
                  onChange={(e) => setFormData({ ...formData, aktifMi: e.target.checked })}
                  label={t('aktif_durumu_aciklama', 'Aktif (Listelerde ve firma açılışında göster)')}
                />
              </div>
            </div>

            <div className="form-field full-width">
              <label className="form-label" htmlFor="faaliyetAlaniAciklama">
                {t('aciklama_sektorel_ipucu', 'Açıklama & Sektörel İpuçları')} <span className="form-label-hint">({t('istege_bagli', 'İsteğe bağlı')})</span>
              </label>
              <textarea
                id="faaliyetAlaniAciklama"
                className="form-input form-textarea"
                rows={3}
                placeholder={t('ph_sektorel_ipucu', 'Firma kayıt esnasında kullanıcıya gösterilecek sektörel ipucu veya açıklama...')}
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ikon',
      label: t('gorsel_ikon', 'Görsel İkon'),
      icon: <ShoppingBag size={18} />,
      content: (
        <div className="flex-col gap-16 p-24">
          <div className="faaliyet-icon-preview-box">
            <div className="flex-row items-center gap-10">
              <div className="faaliyet-icon-preview-badge">
                <SelectedIconComponent size={20} />
              </div>
              <div>
                <span className="font-600 text-13">
                  {t('secili_gorsel_ikon', 'Seçili Görsel İkon')}: {selectedIconObj.label}
                </span>
                <p className="m-0 text-11 text-secondary">
                  {t('gorsel_ikon_aciklama', 'Listede ve firma oluşturma sihirbazında bu sektör için gösterilecek simgedir.')}
                </p>
              </div>
            </div>
          </div>

          <div className="icon-picker-container">
            {AVAILABLE_ICONS.map((iconItem) => {
              const IconComp = iconItem.component;
              const isSelected = formData.ikon === iconItem.name;
              return (
                <button
                  key={iconItem.name}
                  type="button"
                  className={`icon-picker-item ${isSelected ? 'active' : ''}`}
                  title={iconItem.label}
                  onClick={() => setFormData({ ...formData, ikon: iconItem.name })}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>
        </div>
      )
    },
    ...(isChildCategory ? [{
      id: 'ozellikler',
      label: t('sektorel_ozellikler', 'Sektörel Özellikler'),
      icon: <Sliders size={18} />,
      content: (
        <div className="flex-col gap-16 p-24">
          <div className="mb-8">
            <h4 className="m-0 text-14 font-700">
              {t('sektorel_akilli_sablon_baslik', 'Sektörel Akıllı Arayüz Şablonu (Özellik Profili)')}
            </h4>
            <p className="m-0 text-12 text-secondary">
              {t('sektorel_akilli_sablon_aciklama', 'Bu sektör seçildiğinde yeni açılan firmalarda otomatik olarak aktif edilecek modül ve form alanlarını belirleyin.')}
            </p>
          </div>

          <div className="faaliyet-feature-preset-grid">
            {FEATURE_PRESET_OPTIONS.map((feat) => {
              const isChecked = !!formData.varsayilanOzellikler[feat.key];
              return (
                <div
                  key={feat.key}
                  className={`faaliyet-feature-toggle-card ${isChecked ? 'active' : ''}`}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      varsayilanOzellikler: {
                        ...formData.varsayilanOzellikler,
                        [feat.key]: !isChecked
                      }
                    });
                  }}
                >
                  <div className="faaliyet-feature-info">
                    <span className="faaliyet-feature-title">{feat.label}</span>
                    <span className="faaliyet-feature-desc">{feat.desc}</span>
                  </div>
                  <div>
                    {isChecked ? (
                      <CheckCircle2 size={18} color="var(--accent-primary)" />
                    ) : (
                      <Circle size={18} color="var(--text-tertiary, #94a3b8)" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    }] : []),
    {
      id: 'ayarlar',
      label: t('sektorel_ayarlar', 'Sektörel Ayarlar'),
      icon: <Settings2 size={18} />,
      content: (
        <div className="flex-col gap-12 p-16 pb-20">
          <div className="mb-4">
            <h4 className="m-0 text-15 font-700">
              {t('sektorel_is_akisi_baslik', 'Sektörel İş Akışı ve Form Davranış Ayarları')}
            </h4>
            <p className="m-0 text-12 text-secondary">
              {t('sektorel_is_akisi_aciklama', 'Bu sektördeki işletmelerin ERP deneyimini optimize eden modül sıralamalarını, varsayılan form alanlarını ve hiyerarşi kurallarını yapılandırın.')}
            </p>
          </div>

          {/* AYAR KARTI 1: PARA BİRİMLERİ YAPILANDIRMASI */}
          <div className="faaliyet-setting-section">
            <div className="faaliyet-setting-section-header">
              <div className="faaliyet-setting-section-header-left">
                <div className="faaliyet-setting-section-icon faaliyet-setting-icon-blue">
                  <Coins size={20} />
                </div>
                <div>
                  <h5 className="faaliyet-setting-section-title">
                    {t('sektorel_para_birimleri_baslik', 'Para Birimleri Yapılandırması')}
                  </h5>
                  <p className="faaliyet-setting-section-desc">
                    {t('sektorel_para_birimleri_aciklama', 'Bu sektörü seçen firmanın veri tabanı ilk kurulumunda (seed) tanımlanacak varsayılan para birimlerini yapılandırın.')}
                  </p>
                </div>
              </div>

              <div className="faaliyet-setting-action-wrapper">
                <span className="faaliyet-setting-badge faaliyet-setting-badge-blue">
                  {currentSeedParaBirimleri.length} {t('para_birimi_tanimli', 'Para Birimi Tanımlı')}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary faaliyet-setting-btn flex-row items-center gap-8"
                  onClick={handleOpenCurrencySubPage}
                >
                  <Coins size={16} />
                  {t('ayarlar', 'Ayarlar')}
                </button>
              </div>
            </div>
          </div>

          {/* AYAR KARTI 3: VERGİ VE KDV AYARLARI */}
          <div className="faaliyet-setting-section">
            <div className="faaliyet-setting-section-header">
              <div className="faaliyet-setting-section-header-left">
                <div className="faaliyet-setting-section-icon faaliyet-setting-icon-green">
                  <Percent size={20} />
                </div>
                <div>
                  <h5 className="faaliyet-setting-section-title">
                    {t('sektorel_vergi_kdv_baslik', 'Vergi ve KDV Ayarları')}
                  </h5>
                  <p className="faaliyet-setting-section-desc">
                    {t('sektorel_vergi_kdv_aciklama', 'Bu sektörü seçen firmanın veri tabanı ilk kurulumunda (seed) tanımlanacak varsayılan vergi ve KDV oranlarını yapılandırın.')}
                  </p>
                </div>
              </div>

              <div className="faaliyet-setting-action-wrapper">
                <span className="faaliyet-setting-badge faaliyet-setting-badge-green">
                  {currentSeedKdvGruplari.length} {t('kdv_grubu_tanimli', 'KDV Grubu Tanımlı')}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary faaliyet-setting-btn flex-row items-center gap-8"
                  onClick={handleOpenKdvSubPage}
                >
                  <Percent size={16} />
                  {t('ayarlar', 'Ayarlar')}
                </button>
              </div>
            </div>
          </div>

          {/* AYAR KARTI 4: ÖLÇÜ BİRİMLERİ AYARLARI */}
          <div className="faaliyet-setting-section">
            <div className="faaliyet-setting-section-header">
              <div className="faaliyet-setting-section-header-left">
                <div className="faaliyet-setting-section-icon faaliyet-setting-icon-purple">
                  <Scale size={20} />
                </div>
                <div>
                  <h5 className="faaliyet-setting-section-title">
                    {t('sektorel_birimler_baslik', 'Ölçü Birimleri Yapılandırması')}
                  </h5>
                  <p className="faaliyet-setting-section-desc">
                    {t('sektorel_birimler_aciklama', 'Bu sektörü seçen firmanın veri tabanı ilk kurulumunda (seed) tanımlanacak varsayılan ölçü birimlerini (Adet, Kg, Litre vb.) yapılandırın.')}
                  </p>
                </div>
              </div>

              <div className="faaliyet-setting-action-wrapper">
                <span className="faaliyet-setting-badge faaliyet-setting-badge-purple">
                  {currentSeedBirimler.length} {t('birim_tanimli', 'Birim Tanımlı')}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary faaliyet-setting-btn flex-row items-center gap-8"
                  onClick={handleOpenBirimSubPage}
                >
                  <Scale size={16} />
                  {t('ayarlar', 'Ayarlar')}
                </button>
              </div>
            </div>
          </div>

          {/* AYAR KARTI 4: METİN HARF DÖNÜŞÜMÜ */}
          <div className="faaliyet-setting-section">
            <div className="faaliyet-setting-section-header">
              <div className="faaliyet-setting-section-header-left">
                <div className="faaliyet-setting-section-icon faaliyet-setting-icon-indigo">
                  <Type size={20} />
                </div>
                <div>
                  <h5 className="faaliyet-setting-section-title">
                    {t('sektorel_metin_harf_donusumu_baslik', 'Metin Harf Dönüşüm Tercihi')}
                  </h5>
                  <p className="faaliyet-setting-section-desc">
                    {t('sektorel_metin_harf_donusumu_aciklama', 'Bu sektörü seçen firmalarda form girişlerinde metinlerin otomatik nasıl dönüştürüleceğini (Tümü Büyük, İlk Harfleri Büyük vb.) belirleyin.')}
                  </p>
                </div>
              </div>

              <div className="faaliyet-setting-action-wrapper">
                <span className="faaliyet-setting-badge faaliyet-setting-badge-indigo">
                  {currentMetinHarfDonusumu === 'hepsiBuyuk'
                    ? t('harf_donusumu_buyuk_baslik', 'Tümü Büyük Harf')
                    : currentMetinHarfDonusumu === 'basHarflerBuyuk'
                      ? t('harf_donusumu_basharfler_baslik', 'İlk Harfleri Büyük')
                      : currentMetinHarfDonusumu === 'hepsiKucuk'
                        ? t('harf_donusumu_kucuk_baslik', 'Tümü Küçük Harf')
                        : t('harf_donusumu_serbest_baslik', 'Serbest (Dönüşüm Yok)')}
                </span>
                <div className="faaliyet-setting-select-container">
                  <select
                    className="form-select faaliyet-setting-select"
                    value={currentMetinHarfDonusumu}
                    onChange={(e) => handleMetinHarfDonusumuChange(e.target.value)}
                  >
                    <option value="none">{t('harf_donusumu_serbest_baslik', 'Serbest (Dönüşüm Yok)')}</option>
                    <option value="hepsiBuyuk">{t('harf_donusumu_buyuk_baslik', 'Tümü Büyük Harf')}</option>
                    <option value="basHarflerBuyuk">{t('harf_donusumu_basharfler_baslik', 'İlk Harfleri Büyük')}</option>
                    <option value="hepsiKucuk">{t('harf_donusumu_kucuk_baslik', 'Tümü Küçük Harf')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* AYAR KARTI 5: VARSAYILAN SİSTEM DİLİ */}
          <div className="faaliyet-setting-section">
            <div className="faaliyet-setting-section-header">
              <div className="faaliyet-setting-section-header-left">
                <div className="faaliyet-setting-section-icon faaliyet-setting-icon-blue">
                  <Globe size={20} />
                </div>
                <div>
                  <h5 className="faaliyet-setting-section-title">
                    {t('sektorel_varsayilan_dil_baslik', 'Varsayılan Sistem Dili')}
                  </h5>
                  <p className="faaliyet-setting-section-desc">
                    {t('sektorel_varsayilan_dil_aciklama', 'Bu sektörü seçen firmalarda ERP kullanıcı arayüzünde varsayılan olarak kullanılacak dili belirleyin.')}
                  </p>
                </div>
              </div>

              <div className="faaliyet-setting-action-wrapper">
                <span className="faaliyet-setting-badge faaliyet-setting-badge-blue">
                  {currentVarsayilanDil === 'en'
                    ? t('dil_ingilizce', 'English (EN)')
                    : t('dil_turkce', 'Türkçe (TR)')}
                </span>
                <div className="faaliyet-setting-select-container">
                  <select
                    className="form-select faaliyet-setting-select"
                    value={currentVarsayilanDil}
                    onChange={(e) => handleVarsayilanDilChange(e.target.value)}
                  >
                    <option value="tr">{t('dil_turkce', 'Türkçe (TR)')}</option>
                    <option value="en">{t('dil_ingilizce', 'English (EN)')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* AYAR KARTI 6: SEKTÖREL MODÜLLER */}
          <div className="faaliyet-setting-section">
            <div className="faaliyet-setting-section-header">
              <div className="faaliyet-setting-section-header-left">
                <div className="faaliyet-setting-section-icon faaliyet-setting-icon-amber">
                  <Package size={20} />
                </div>
                <div>
                  <h5 className="faaliyet-setting-section-title">
                    {t('sektorel_moduller_kart_baslik', 'Sektörel Modül Dağılımı')}
                  </h5>
                  <p className="faaliyet-setting-section-desc">
                    {t('sektorel_moduller_kart_aciklama', 'Bu faaliyet alanı için varsayılan olarak aktif edilecek modülleri belirleyin.')}
                  </p>
                </div>
              </div>
              <div className="faaliyet-setting-action-wrapper">
                <span className="faaliyet-setting-badge faaliyet-setting-badge-amber">
                  {selectedCount} {t('tanimli_modul_sayisi', 'Modül Seçili')}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary faaliyet-setting-btn flex-row items-center gap-8"
                  onClick={() => handleTabChange('moduller')}
                >
                  <Package size={16} />
                  {t('ayarlar', 'Ayarlar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'moduller',
      label: t('moduller', 'Modüller'),
      icon: <Package size={18} />,
      content: (
        <div className="flex-col gap-16 p-16 pb-24">
          {/* Üst Bilgi ve Aksiyon Çubuğu */}
          <div className="flex-row items-center justify-between flex-wrap gap-12">
            <div>
              <h4 className="m-0 text-15 font-700">
                {t('sektorel_moduller_baslik', 'Faaliyet Alanı Modül Yapılandırması')}
              </h4>
              <p className="m-0 text-12 text-secondary">
                {t('sektorel_moduller_aciklama', 'Bu faaliyet alanını seçen firmalarda varsayılan olarak aktif edilecek ERP modüllerini belirleyin.')}
              </p>
            </div>

            <div className="flex-row items-center gap-10 flex-wrap">
              <span className="faaliyet-setting-badge faaliyet-setting-badge-blue">
                {t('secili_modul_sayisi', '{{selected}} / {{total}} Modül Seçili', {
                  selected: selectedCount,
                  total: tumModuller.length
                })}
              </span>
              <button
                type="button"
                className="btn btn-secondary firma-action-btn-sm flex-row items-center gap-6"
                onClick={handleSelectAllModuller}
              >
                <CheckSquare size={14} /> {t('tumunu_sec', 'Tümünü Seç')}
              </button>
              <button
                type="button"
                className="btn btn-secondary firma-action-btn-sm flex-row items-center gap-6"
                onClick={handleClearAllModuller}
              >
                <Square size={14} /> {t('temizle', 'Temizle')}
              </button>
            </div>
          </div>

          {/* Modül Kartları Listesi (Sayfaya Yayılan Alt Alta Kartlar) */}
          {modullerLoading ? (
            <div className="page-loading-state p-32 text-center text-secondary">
              {t('moduller_yukleniyor', 'Modüller yükleniyor...')}
            </div>
          ) : tumModuller.length === 0 ? (
            <div className="user-card-empty-state p-32">
              <Package size={40} className="user-card-empty-icon mb-8" />
              <div className="user-card-empty-title">{t('modul_bulunamadi', 'Kayıtlı modül bulunamadı.')}</div>
            </div>
          ) : (
            <div className="firma-moduller-list">
              {tumModuller.map((modul) => {
                const isSelected = isModulSelected(modul);
                const hasSettings = ModuleSettingsRegistry.has(modul.kod || '');
                return (
                  <ModulCardBasit
                    key={modul.id || modul.kod}
                    modul={modul}
                    isSelected={isSelected}
                    onToggle={() => handleToggleModul(modul)}
                    hasSettings={hasSettings}
                    onSettingsClick={() => handleOpenModulSettings(modul.kod)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )
    }
  ];

  if (isCurrencySubPage) {
    return (
      <BaseCardPage
        id="faaliyetParaBirimleriPage"
        title={t('sektorel_para_birimleri_baslik', 'Para Birimleri Yapılandırması')}
        icon={<Coins size={20} />}
        subtitleLeft={t('sektorel_para_birimleri_aciklama', 'Bu sektörü seçen firmanın veri tabanı ilk kurulumunda (seed) tanımlanacak varsayılan para birimlerini yapılandırın.')}
        asForm={true}
        onSave={handleSave}
        isSaving={saving}
        onClose={handleBackFromCurrency}
      >
        <div className="pt-8">
          <ParaBirimleri
            showTopHeader={false}
            inMemoryMode={true}
            hideOtherTabs={true}
            initialItems={formData.sektorelSeedData?.paraBirimleri || []}
            onSaveMemory={handleCurrencyMemoryUpdate}
          />
        </div>
      </BaseCardPage>
    );
  }

  if (isKdvSubPage) {
    return (
      <BaseCardPage
        id="faaliyetKdvPage"
        title={t('sektorel_vergi_kdv_baslik', 'Vergi ve KDV Ayarları')}
        icon={<Percent size={20} />}
        subtitleLeft={t('sektorel_vergi_kdv_aciklama', 'Bu sektörü seçen firmanın veri tabanı ilk kurulumunda (seed) tanımlanacak varsayılan vergi ve KDV oranlarını yapılandırın.')}
        asForm={true}
        onSave={handleSave}
        isSaving={saving}
        onClose={handleBackFromKdv}
      >
        <div className="pt-8">
          <KdvAyarlari
            showTopHeader={false}
            inMemoryMode={true}
            initialItems={currentSeedKdvGruplari}
            onSaveMemory={handleKdvMemoryUpdate}
          />
        </div>
      </BaseCardPage>
    );
  }

  if (isBirimSubPage) {
    return (
      <BaseCardPage
        id="faaliyetBirimlerPage"
        title={t('sektorel_birimler_baslik', 'Ölçü Birimleri Yapılandırması')}
        icon={<Scale size={20} />}
        subtitleLeft={t('sektorel_birimler_aciklama', 'Bu sektörü seçen firmanın veri tabanı ilk kurulumunda (seed) tanımlanacak varsayılan ölçü birimlerini (Adet, Kg, Litre vb.) yapılandırın.')}
        asForm={true}
        onSave={handleSave}
        isSaving={saving}
        onClose={handleBackFromBirim}
      >
        <div className="pt-8">
          <Birimler
            showTopHeader={false}
            inMemoryMode={true}
            initialItems={currentSeedBirimler}
            onSaveMemory={handleBirimMemoryUpdate}
          />
        </div>
      </BaseCardPage>
    );
  }

  if (isModulSettingsSubPage && activeSettingsDef) {
    const SettingsComp = activeSettingsDef.component;
    const isCari = activeModulKod?.toUpperCase().includes('CARI');
    const isUrun = activeModulKod?.toUpperCase().includes('URUN') || activeModulKod?.toUpperCase().includes('STOK');
    const currentVal = formData.sektorelSeedData?.modulAyarlari?.[activeModulKod] 
      || (isCari ? formData.sektorelSeedData?.modulAyarlari?.['MOD_CARI'] : null)
      || (isCari ? formData.cariTuruYapilandirma : null)
      || (isUrun ? (formData.sektorelSeedData?.modulAyarlari?.['MOD_URUN_YONETIMI'] || formData.sektorelSeedData?.modulAyarlari?.['MOD_URUN_HIZMET']) : null)
      || activeSettingsDef.defaultValues 
      || {};

    return (
      <SettingsComp
        value={currentVal}
        onChange={handleModulSettingsMemoryUpdate}
        faaliyetAlaniId={formData.id}
        onSave={handleSave}
        isSaving={saving}
        onClose={handleBackFromModulSettings}
      />
    );
  }

  const subtitleText = formData.ad?.trim() || undefined;

  return (
    <BaseCardPage
      id="faaliyetCardForm"
      title={pageTitle}
      icon={<SelectedIconComponent size={20} />}
      onSubmit={handleSave}
      isSaving={saving}
      onSave={handleSave}
      onClose={onClose}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={handleTabChange}
      subtitleLeft={subtitleText}
    />
  );
}

export default FaaliyetForm;