// Service Worker — 趣味点菜 PWA
const CACHE_NAME = 'cute-menu-v11';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/manifest.json',
  '/js/app.js',
  '/js/utils.js',
  '/js/supabase.js',
  '/js/data/preset-dishes.js',
  '/js/data/illustrations.js',
  '/js/pages/home.js',
  '/js/pages/menu.js',
  '/js/pages/all-dishes.js',
  '/js/pages/dish-detail.js',
  '/js/pages/fridge.js',
  '/js/pages/profile.js',
  // 图片资源
  '/img/xiaomao.png',
  '/img/maozhua.png',
  '/img/paw.svg',
  '/img/hero-cat.svg',
  '/img/empty/menu-empty.png',
  '/img/empty/fridge-empty.png',
  '/img/dishes/default.svg',
  '/img/dishes/default-meat.svg',
  '/img/dishes/default-veggie.svg',
  '/img/dishes/default-soup.svg',
  '/img/dishes/default-staple.svg',
  '/img/fridge/default.svg',
  // 字体（Google Fonts）
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// 安装事件：预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', (event) => {
  // 跳过 Supabase API 请求（不缓存）
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Google Fonts 静态资源（字体文件），缓存优先
  if (event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 缓存命中：返回缓存，后台更新
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });

      return cached || fetchPromise;
    })
  );
});
