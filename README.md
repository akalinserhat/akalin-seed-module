# @akalin/seed_module

Webakus SaaS ve ERP ekosistemi için bağımsız Sektörel Tohumlama (Seed), Faaliyet Alanları ve Şablon Yönetim paketi.

## Özellikler

- **Depolar ve Şubeler Tohumlama (Seed)**: Yeni firma kurulumunda açılacak varsayılan şube ve depo lokasyonlarını yönetir.
- **Faaliyet Alanları ve Sektör Ağacı**: 2 seviyeli (Ana Sektör -> Alt Faaliyet Alanları) hiyerarşik ağaç görünümü.
- **Sektörel Özellik Profilleri**: Varyant, Seri No, SKT, Parti/Lot, Reçete vb. akıllı form alanlarını sektöre göre dinamik etkinleştirir.
- **Sektörel Seed Yapılandırması**: Para birimleri, KDV grupları, ölçü birimleri ve modül varsayılan ayarlarının sektöre özel tohumlanması.
- **Modüler Adapter Mimarisi**: `ISeedModuleAdapter` arayüzü ile HTTP istemcisi ve API çağrıları tamamen soyutlanmıştır.

## Kurulum

```bash
npm install @akalin/seed_module
```

## Kullanım

```tsx
import { ModuleRegistry } from '@akalin/module_core';
import { createSeedModule } from '@akalin/seed_module';

const seedModule = createSeedModule({
  title: 'Seed Yönetimi',
  order: 55
});

ModuleRegistry.register(seedModule);
```

## Lisans

ISC - Akalin Software
