export const LAT=12.9628018,LON=77.5758862,TZ='Asia/Kolkata',TTL=600000,DEADLINE=4500;
export const weatherUrl='https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:String(LAT),longitude:String(LON),current:'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',timezone:TZ,forecast_days:'7'});
export function validateWeather(d,now=Date.now()){
 const n=(v,lo,hi)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
 const today=new Date(now+19800000).toISOString().slice(0,10),c=d?.current,x=d?.daily;
 if(d?.timezone!==TZ||d?.utc_offset_seconds!==19800||!c||!x||typeof c.time!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(c.time))throw Error('Incomplete weather');
 if(Number(c.time.slice(11,13))>23||Number(c.time.slice(14,16))>59)throw Error('Invalid clock');
 const age=now-Date.parse(c.time+'+05:30');if(!Number.isFinite(age)||age>10800000||age< -900000||c.time.slice(0,10)!==today)throw Error('Stale weather');
 for(const [key,lo,hi]of [['temperature_2m',-90,65],['apparent_temperature',-100,90],['relative_humidity_2m',0,100],['precipitation',0,1000],['wind_speed_10m',0,500]])if(!n(c[key],lo,hi))throw Error('Invalid weather number');
 if(typeof c.weather_code!=='number'||!Object.hasOwn(WMO,c.weather_code))throw Error('Invalid code');
 for(const key of ['time','weather_code','temperature_2m_max','temperature_2m_min','precipitation_probability_max','uv_index_max'])if(!Array.isArray(x[key])||x[key].length!==7)throw Error('Incomplete days');
 for(let i=0;i<7;i++){
  const day=new Date(Date.parse(today+'T00:00Z')+i*86400000).toISOString().slice(0,10);if(x.time[i]!==day||typeof x.weather_code[i]!=='number'||!Object.hasOwn(WMO,x.weather_code[i]))throw Error('Invalid daily date/code');
  if(!n(x.temperature_2m_max[i],-90,65)||!n(x.temperature_2m_min[i],-90,65)||x.temperature_2m_max[i]<x.temperature_2m_min[i])throw Error('Invalid temperature');
  if(x.precipitation_probability_max[i]!==null&&!n(x.precipitation_probability_max[i],0,100))throw Error('Invalid probability');
  if(x.uv_index_max[i]!==null&&!n(x.uv_index_max[i],0,30))throw Error('Invalid UV');
 }
 return d;
}

const WMO=Object.fromEntries([0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99].map(x=>[x,true]));
