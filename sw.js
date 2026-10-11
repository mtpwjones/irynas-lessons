// Offline cache for Iryna's lessons. Network-first: when online you always get the latest files; offline falls back to the cache.
// Bump VERSION whenever any file changes.
const VERSION='irynas-lessons-v5';
const FILES=['./','./index.html','./styles.css','./app.js','./data.js','./lessons-full.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./img/L01-1.jpg','./img/L01-2.jpg','./img/L01-3.jpg','./img/L01-4.jpg','./img/L02-1.jpg','./img/L03-1.jpg','./img/L03-2.jpg','./img/L04-1.jpg','./img/L04-2.jpg','./img/L04-3.jpg','./img/L05-1.jpg','./img/L05-2.jpg','./img/L05-3.jpg','./img/L06-1.jpg','./img/L07-1.jpg','./img/L08-1.jpg','./img/L08-2.jpg','./img/L08-3.jpg','./img/L09-1.jpg','./img/L10-1.jpg','./img/L10-2.jpg','./img/L10-3.jpg','./img/L11-1.jpg','./img/L11-2.jpg','./img/L12-1.jpg','./img/L12-2.jpg','./img/L13-1.jpg','./img/L14-1.jpg','./img/L14-2.jpg','./img/L15-1.jpg','./img/L15-2.jpg','./img/L15-3.jpg','./img/L16-1.jpg','./img/L16-2.jpg','./img/L16-3.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(VERSION).then(ch=>ch.put(e.request,c));return res}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
});
