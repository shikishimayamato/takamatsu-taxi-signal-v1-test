/* 高松タクシー・シグナル v1.0 単一HTML試験版専用。
 * 旧版とは別スコープ /takamatsu-taxi-signal-v1-test/ のみ制御する。
 * 外部の気象/交通APIやイベントデータはキャッシュしない。
 */
const CACHE = 'takamatsu-signal-v1-test-pwa-20261107-5';
const CORE = ['./','./index.html','./manifest.webmanifest','./signal-192.png','./signal-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('takamatsu-signal-v1-test-pwa-') && key!==CACHE)
        .map(key=>caches.delete(key))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(!url.pathname.startsWith('/takamatsu-taxi-signal-v1-test/'))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(res=>{
      if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',clone)));}
      return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
