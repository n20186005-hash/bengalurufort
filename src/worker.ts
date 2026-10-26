import {weatherUrl,validateWeather,LAT,LON,TTL,DEADLINE} from './lib/weather.js';
interface Env {ASSETS:{fetch:(r:Request)=>Promise<Response>}}
interface Context {waitUntil:(p:Promise<unknown>)=>void}
const errors=new Set(['/404','/404/','/404.html','/en/404','/en/404/','/en/404.html']);
async function errorPage(request:Request,env:Env){const url=new URL(request.url);let path=url.pathname.startsWith('/en/')?'/en/404/':'/404',response:Response|undefined;for(let i=0;i<3;i++){response=await env.ASSETS.fetch(new Request(new URL(path,url.origin)));if(![301,302,307,308].includes(response.status))break;const next=new URL(response.headers.get('location')||path,url.origin);if(next.origin!==url.origin||!errors.has(next.pathname))break;path=next.pathname+next.search;}const headers=new Headers(response?.headers);headers.delete('location');headers.delete('content-length');headers.delete('content-encoding');headers.set('x-robots-tag','noindex');headers.set('cache-control','no-store');headers.set('content-type','text/html; charset=utf-8');const body=response&&!([301,302,307,308].includes(response.status))?await response.text():'';return new Response(request.method==='HEAD'?null:body||'<!doctype html><title>404</title><h1>Page not found / ಪುಟ ಸಿಗಲಿಲ್ಲ</h1><a href="/">Bengaluru Fort</a>',{status:404,headers});}
function json(d:unknown,status=200,headers:Record<string,string>={}){return new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});}
async function weather(request:Request,ctx:Context){
 const u=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method))return json({error:'method_not_allowed'},405,{allow:'GET, HEAD'});
 if(u.searchParams.has('latitude')!==u.searchParams.has('longitude'))return json({error:'unsupported_location'},400);
 for(const key of u.searchParams.keys())if(!['latitude','longitude','forecast_days'].includes(key)||u.searchParams.getAll(key).length!==1)return json({error:'unsupported_location'},400);
 for(const [key,value]of [['latitude',LAT],['longitude',LON],['forecast_days',7]] as const)if(u.searchParams.has(key)&&(u.searchParams.get(key)===''||Number(u.searchParams.get(key))!==value))return json({error:'unsupported_location'},400);
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([(async()=>{
  const cache=(globalThis.caches as CacheStorage&{default?:Cache})?.default,key=new Request(weatherUrl);let hit:Response|undefined;
  try{hit=await cache?.match(key);}catch{}
  if(controller.signal.aborted)throw Error('Deadline');
  if(hit)try{const at=Number(hit.headers.get('x-cached-at')),d=validateWeather(await hit.json()),age=Date.now()-at;if(!controller.signal.aborted&&Number.isFinite(at)&&at>0&&age>=0&&age<TTL)return json(d,200,{'cache-control':'public, max-age='+Math.max(0,Math.floor((TTL-age)/1000)),'x-cache':'HIT','x-cached-at':String(at)});}catch{}
  if(controller.signal.aborted)throw Error('Deadline');
  const response=await fetch(weatherUrl,{signal:controller.signal});if(!response.ok)throw Error('Provider HTTP');const d=validateWeather(await response.json());if(controller.signal.aborted)throw Error('Deadline');
  const fresh=json(d,200,{'cache-control':'public, max-age=600','x-cache':'MISS','x-cached-at':String(Date.now())});if(cache)ctx.waitUntil(cache.put(key,fresh.clone()).catch(()=>{}));return fresh;
 })(),new Promise<Response>(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(json({error:'weather_unavailable'},502));},DEADLINE);})]);}catch{return json({error:'weather_unavailable'},502);}finally{clearTimeout(timer);}
}
export default {async fetch(request:Request,env:Env,ctx:Context){const u=new URL(request.url);if(u.hostname==='www.bengalurufort.com'||(u.hostname==='bengalurufort.com'&&u.protocol==='http:')){u.protocol='https:';u.hostname='bengalurufort.com';return new Response(null,{status:308,headers:{location:u.href}});}let response:Response;if(u.pathname==='/api/weather')response=await weather(request,ctx);else if(errors.has(u.pathname))response=await errorPage(request,env);else{response=await env.ASSETS.fetch(request);if(response.status===404)response=await errorPage(request,env);}return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;}};
