# Talep Yönetim Sistemi — Case Study

İki ayrı panelden oluşan bir **talep (request) oluşturma ve onaylama** uygulaması:

- **User Panel** — Son kullanıcılar talep oluşturur, kendi taleplerini ve durumlarını (bekliyor / onaylandı / reddedildi) takip eder.
- **Admin Panel** — Yöneticiler bekleyen talepleri inceler, onaylar/reddeder, tüm talepleri filtreler ve (rolüne göre) kullanıcı yönetimi yapar.

Backend olarak [`json-server`](https://github.com/typicode/json-server) ile `db.json` üzerinden çalışan bir **mock REST API** kullanılır.

---

## İçindekiler
- [Proje Yapısı](#proje-yapısı)
- [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Test Kullanıcıları](#test-kullanıcıları)
- [Mimari Kararlar](#mimari-kararlar)
- [Bilinen Eksikler ve Notlar](#bilinen-eksikler-ve-notlar)

---

## Proje Yapısı

```
case-study/
├── db.json                # json-server mock veritabanı (users, adminUsers, tasks)
├── package.json           # kök: json-server + concurrently script'leri
├── user-panel/            # Son kullanıcı uygulaması (CRA)
│   └── src/
│       ├── app/           # App.tsx, AppProviders (kompozisyon kökü)
│       ├── components/    # Paylaşılan UI (ColoredSelect, LanguageSwitcher, ThemeToggle)
│       ├── layouts/       # AppLayout (sidebar + Outlet)
│       ├── pages/         # Route başına sayfa + co-located .module.scss
│       ├── routes/        # paths.ts (route sabitleri)
│       ├── services/      # Domain bazlı API katmanı (auth, task, dashboard)
│       ├── store/         # Redux store + slices
│       ├── context/       # ThemeContext
│       ├── constants/ types/ i18n/ styles/
│       └── ...
└── admin-panel/           # Yönetici uygulaması (CRA) — aynı yapı
    └── src/
        └── routes/RoleGuard.tsx   # Rol bazlı route koruması (RBAC)
```

Her iki panel de **bağımsız Create React App** projesidir; kendi `package.json`'ı ve `.env`'i vardır.

---

## Kullanılan Teknolojiler

| Alan | Teknoloji |
|------|-----------|
| Çatı | React 19 + TypeScript (Create React App) |
| State yönetimi | Redux Toolkit + React-Redux (slice + `createAsyncThunk`) |
| Routing | React Router v7 (`BrowserRouter`, nested/layout routes, `React.lazy`) |
| UI kütüphanesi | Ant Design 5 |
| Form & validasyon | Ant Design Form (user) + React Hook Form + Zod (admin – kullanıcı ekleme) |
| Çoklu dil | i18next + react-i18next (TR / EN) |
| Stil | SCSS Modules + Ant Design tema algoritması (light/dark) |
| HTTP | Axios (ortak instance + interceptor'lar) |
| Animasyon | Motion (Framer Motion) |
| Bildirim | React Toastify + Ant Design `message` |
| Mock backend | json-server |

---

## Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js 18+** ve npm

### 1) Bağımlılıkları kurun
Üç ayrı `package.json` olduğu için üç kurulum gerekir:

```bash
# Proje kökünde (json-server + concurrently)
npm install

# User panel
npm install --prefix user-panel

# Admin panel
npm install --prefix admin-panel
```

### 2) Ortam değişkenleri
Her iki panelde API adresini `.env` belirler. Örnek dosyadan kopyalayın:

```bash
cp user-panel/.env.example user-panel/.env
cp admin-panel/.env.example admin-panel/.env
```

İçeriği:
```
REACT_APP_BASE_API_URL=http://localhost:3001
```

### 3) Tek komutla çalıştırma (önerilen)
Proje kökünden:

```bash
npm run dev
```

Bu komut `concurrently` ile üçünü aynı anda başlatır:

| Servis | URL | Açıklama |
|--------|-----|----------|
| Mock API (json-server) | http://localhost:3001 | `db.json` |
| User Panel | http://localhost:3000 | |
| Admin Panel | http://localhost:3002 | |

> İki CRA uygulaması da varsayılan olarak 3000 portunu ister; çakışmayı önlemek için admin panel `PORT=3002` ile başlatılır.

### Ayrı ayrı çalıştırma
```bash
npm run api      # sadece json-server (3001)
npm run user     # sadece user panel (3000)
npm run admin    # sadece admin panel (3002)
```

> **Not:** `npm run dev` ve `npm run admin` script'leri `PORT=3002` ön ekini kullanır (POSIX/zsh/bash). Windows `cmd` üzerinde çalıştıracaksanız `cross-env` ile sarmalamanız ya da admin paneli ayrı bir terminalde `set PORT=3002` ile başlatmanız gerekir.

---

## Test Kullanıcıları

Şifreler mock ortam için `db.json`'da düz metin tutulur (bkz. [Bilinen Eksikler](#bilinen-eksikler-ve-notlar)).

### Admin Panel (`http://localhost:3002`)
Roller, görebilecekleri sayfaları belirler (RBAC):

| E-posta | Şifre | Rol | Yetkiler |
|---------|-------|-----|----------|
| `admin@test.com` | `admin123` | **Admin** | Tüm sayfalar + kullanıcı yönetimi |
| `moderator@test.com` | `mod123` | **Moderator** | Talepleri onay/ret + tüm talepler |
| `viewer@test.com` | `viewer123` | **Viewer** | Sadece görüntüleme (onay/ret yok) |

### User Panel (`http://localhost:3000`)

| E-posta | Şifre | Ad |
|---------|-------|-----|
| `user1@test.com` | `123456` | Ayşe Yılmaz |
| `user2@test.com` | `123456` | Mehmet Kaya |
| `user3@test.com` | `123456` | Zeynep Demir |

---

## Mimari Kararlar

**İki ayrı uygulama.** User ve admin panelleri ayrı kullanıcı kitlelerine, ayrı yetki modeline ve ayrı dağıtım ihtiyacına sahip olduğundan iki bağımsız SPA olarak kurgulandı. Gerçek bir üründe ortak kod (`api`, `types`, `auth`, `theme`) bir **monorepo + paylaşılan paket** ile tekilleştirilirdi; burada basitlik için her panel kendi içinde tutuldu.

**Katmanlı yapı.** UI (`pages`/`components`) → state (`store`) → veri erişimi (`services`) net biçimde ayrıldı. Component'ler doğrudan `axios` çağırmaz; her zaman `services/*.service.ts` üzerinden gider. Bu, API'yi tek noktadan değiştirmeyi ve test etmeyi kolaylaştırır.

**Ortak Axios instance + interceptor'lar (`services/api.ts`).** Tek bir instance, `baseURL`'i `.env`'den okur, her isteğe `localStorage`'daki token'ı `Authorization: Bearer ...` olarak ekler ve `401` yanıtında oturumu temizleyip login'e yönlendirir.

**State yönetimi tercihi.** Auth durumu (her iki panel) ve admin tarafındaki paylaşılan sunucu verisi (kullanıcılar, bekleyen talepler) Redux Toolkit slice + `createAsyncThunk` ile yönetilir. Sayfaya özel, kısa ömürlü veriler (talep detayı, dashboard) bilinçli olarak local `useState` ile tutulur. (Gerçek projede sunucu verisi için **React Query / RTK Query** daha doğru tercih olurdu — bkz. eksikler.)

**RBAC — rol bazlı yetki.** Admin panelde route koruması `routes/RoleGuard.tsx` ile yapılır; `<RoleGuard allowedRoles={[...]} />` bir layout-route gibi çalışıp `<Outlet />` render eder. Yetkisiz kullanıcı `Unauthorized` sayfasını görür. Menü öğeleri de role göre filtrelenir.

**Route sabitleri ve lazy loading.** Tüm yollar `routes/paths.ts` içindeki `ROUTES` sabitinden okunur (tek kaynak, typo yok). Sayfalar `React.lazy` + `Suspense` ile route bazlı **code-splitting** yapılır; bu, ilk yüklenen paket boyutunu belirgin şekilde küçültür.

**i18n ve tema.** Tüm metinler `i18next` (TR/EN) üzerinden gelir; dil tercihi `localStorage`'a yazılır ve sayfa yenilense de korunur. Tema (light/dark) `ThemeContext` + Ant Design tema algoritması ile yönetilir, tercih yine `localStorage`'da saklanır.

---

## Bilinen Eksikler ve Notlar

Bu bölüm, case kapsamı gereği bilinçli olarak basitleştirilen veya zaman nedeniyle tamamlanmayan noktaları **şeffaf biçimde** listeler.

**1. Kimlik doğrulama tamamen mock.**
`loginService`, `db.json`'daki kullanıcı listesini çekip e-posta/şifreyi **istemci tarafında** karşılaştırır ve `mock-token-<id>` formatında sahte bir token üretir. Oturum, `user` ve `token` olarak `localStorage`'da tutulur.
→ *Gerçek bir uygulamada kimlik doğrulama sunucuda yapılır, sunucu imzalı bir **JWT** döndürür ve yetki asla istemci state'inden türetilmez — rol gibi bilgiler JWT claim'lerinden okunur ve her korunan endpoint'te sunucu tarafında doğrulanır.* Şu anki modelde kullanıcı `localStorage`'daki `role` alanını elle değiştirerek guard'ları aşabilir; bu kabul edilebilir çünkü ortam tamamen mock'tur, ancak prod'a taşınırken kritik bir noktadır.

**2. `api.ts`'teki 401 interceptor pratikte tetiklenmez.**
Interceptor yapısı doğru (token ekleme + `401`'de oturumu temizleyip `/login`'e atma). Ancak `json-server` korumasız bir mock olduğu ve **hiçbir zaman `401` dönmediği** için bu dal şu an çalışmaz. Kod, gerçek bir kimlik doğrulamalı backend'e bağlandığında **olduğu gibi devreye girecek** şekilde bilerek hazır bırakıldı.

**3. Admin panel tabloları sunucu taraflı filtreleme ve sayfalamaya geçirildi.**
`RequestsList` ve `PendingRequests` sayfalarında filtreler (durum, öncelik, kategori, tarih aralığı) ve arama (`q`) artık doğrudan servis parametrelerine (`status=`, `priority=`, `_page=`, `_per_page=`, `q=`) yansıtılıyor; Ant Design Table kontrollü mod (`filteredValue`) ile sunucu state'ini takip ediyor. Kullanıcı panelindeki `getTasks` ise hâlâ `GET /tasks` ile tüm talepleri çekip istemcide filtreler — mock veri küçük olduğu için sorun olmaz; gerçek projede bu da sunucu taraflı yapılmalıdır.

**4. Sunucu verisi için React Query kullanılmadı.**
Sunucudan gelen veri Redux/`useState` ile yönetiliyor; bu, manuel `loading`/`error` ve yeniden-fetch kodu doğuruyor. **RTK Query veya React Query**, cache ve invalidation'ı hazır vererek bu tekrarın çoğunu ortadan kaldırırdı.

**5. Otomatik testler — Jest + React Testing Library.**
Her iki panel için temel sayfa testleri yazıldı. **Admin panel:** `Login`, `Dashboard`, `RequestsList`, `UserManagement`, `PendingRequests` (toplam 19 test). **User panel:** `Login`, `Dashboard`, `Tasks`, `TaskCreation` (toplam 16 test). Testler servis katmanını mock'layarak bağımsız çalışır; Redux store `preloadedState` ile hazırlanır, asenkron güncellemeler `waitFor` ile beklenir. Ant Design bileşenleri JSDOM uyumlu sade HTML mock'larıyla değiştirilmiştir.

→ *Unit testler, kapsamlı test yazma konusunda henüz yeterli deneyime sahip olmadığım için yapay zeka desteğiyle oluşturulmuştur. Ancak oluşturulan testlerin tamamı tarafımdan incelenmiş, doğrulanmış ve gerektiğinde düzenlenerek uygulamanın davranışını doğru şekilde test etmesi sağlanmıştır.*

**6. Şifreler `db.json`'da düz metin.**
Yalnızca mock ortam için; gerçek sistemde şifreler asla istemciye inmez ve sunucuda hash'lenerek (bcrypt vb.) saklanır.
