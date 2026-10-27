const V="bpc-v7",SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"],
LIBS=["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
// Install: always download fresh copies (bypass the host's HTTP cache) so an update can never save stale files.
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(async c=>{
 await Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:"reload"}))));
 await Promise.all(LIBS.map(u=>c.add(new Request(u,{mode:"no-cors"})).catch(()=>{})))}));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
// Opening the app: use the newest page when online (falls back to the saved copy after 3 seconds or when offline).
// Everything else: saved copy first.
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 if(r.mode==="navigate"){
  const net=fetch(r,{cache:"no-cache"}).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res});
  const wait=new Promise((_,rej)=>setTimeout(rej,3000));
  e.respondWith(Promise.race([net,wait]).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match("index.html")||caches.match("./"))));
  return}
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match("index.html"))))});
