(function(){
'use strict';
var STORAGE_KEY='tabiBoukenNoSho_v1';
var CATEGORIES=[
{id:'michi',label:'道の駅',color:'#5cb85c'},
{id:'omiyage',label:'お土産店',color:'#d9534f'},
{id:'cafe',label:'食堂/カフェ',color:'#f0ad4e'},
{id:'kanko',label:'観光/景色',color:'#5bc0de'},
{id:'onsen',label:'温泉',color:'#9b59b6'},
{id:'shukuhaku',label:'宿泊',color:'#4a90d9'},
{id:'other',label:'その他',color:'#95a5a6'}
];
var PREFS=[
{name:'北海道',lat:43.06,lng:141.35,zoom:8},{name:'東京都',lat:35.68,lng:139.76,zoom:11},
{name:'神奈川県',lat:35.45,lng:139.64,zoom:11},{name:'静岡県',lat:34.98,lng:138.38,zoom:10},
{name:'長野県',lat:36.65,lng:138.18,zoom:10},{name:'京都府',lat:35.01,lng:135.77,zoom:12},
{name:'大阪府',lat:34.69,lng:135.50,zoom:12},{name:'福岡県',lat:33.59,lng:130.40,zoom:11},
{name:'沖縄県',lat:26.21,lng:127.68,zoom:10}
];
var DEFAULT_LAT=35.45, DEFAULT_LNG=139.64;
var map=null,mapReady=false,markerLayer=null;
var filters={categories:{},wantAgain:false,treasure:false};
var starValue=3;
var db={trips:[],places:[],items:[],exp:0};

function uid(){return 'id_'+Date.now()+'_'+Math.floor(Math.random()*10000);}
function load(){
  try{var raw=localStorage.getItem(STORAGE_KEY);if(raw){var o=JSON.parse(raw);db.trips=o.trips||[];db.places=o.places||[];db.items=o.items||[];db.exp=o.exp||0;}}
  catch(e){console.error(e);}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(db));}
function levelFromExp(e){return Math.floor(e/100)+1;}
function expInLevel(e){return e%100;}
function catColor(id){for(var i=0;i<CATEGORIES.length;i++)if(CATEGORIES[i].id===id)return CATEGORIES[i].color;return'#95a5a6';}
function catLabel(id){for(var i=0;i<CATEGORIES.length;i++)if(CATEGORIES[i].id===id)return CATEGORIES[i].label;return id;}
function starsHtml(n){var s='';for(var i=0;i<3;i++)s+=i<n?'\u2605':'\u2606';return s;}
function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}
function ensureDefaultTrip(){
  if(db.trips.length)return db.trips[0];
  var t={id:uid(),name:'\u306f\u3058\u3081\u3066\u306e\u65c5',date:new Date().toISOString().slice(0,10)};
  db.trips.push(t);save();return t;
}

function refreshHome(){
  var lv=levelFromExp(db.exp),ein=expInLevel(db.exp);
  document.getElementById('st-lv').textContent=lv;
  document.getElementById('st-places').textContent=db.places.length;
  var treasures=db.items.filter(function(x){return x.treasure;}).length;
  document.getElementById('st-treasure').textContent=treasures;
  var towns=db.places.length;
  document.getElementById('st-towns').textContent=towns;
  document.getElementById('st-towns2').textContent=towns;
  document.getElementById('st-expbar').style.width=ein+'%';
  document.getElementById('st-exptext').textContent='\u6b21\u306e\u30ec\u30d9\u30eb\u307e\u3067 '+ein+' / 100';
  var msg=document.getElementById('slime-msg');
  if(!db.places.length)msg.innerHTML='\u3088\u3046\u3053\u305d\uff01\u3053\u3053\u306f\u300c\u65c5\u306e\u5192\u967a\u306e\u66f8\u300d\u3060\u3088\u3002<br>\u307e\u3060\u8a18\u9332\u304c\u306a\u3044\u3088\u3046\u3060\u306d\u3002<br>\u53f3\u4e0b\u306e\u300c\uff0b\u300d\u304b\u3089\u3001\u6559\u4f1a\u3067\u304d\u308d\u304f\u3057\u3066\u307f\u3088\u3046\uff01';
  else msg.innerHTML='\u8a18\u9332\u304c <b>'+db.places.length+'</b> \u4ef6\u3042\u308b\u3088\uff01<br>\u5236\u8987\u3057\u305f\u5834\u6240\u306f '+towns+'\u3001\u305f\u304b\u3089\u3082\u306e\u306f '+treasures+' \u500b\u3060\u306d\u3002';

  var ht=document.getElementById('home-trips');
  if(!db.trips.length)ht.innerHTML='<div class="quest-card dummy"><div>\uff08\u307e\u3060\u65c5\u304c\u3042\u308a\u307e\u305b\u3093\uff09</div><div class="quest-meta">\u65c5\u30bf\u30d6\u304b\u3089\u4f5c\u6210\u3067\u304d\u307e\u3059</div></div>';
  else ht.innerHTML=db.trips.slice(0,3).map(function(t){
    var n=db.places.filter(function(p){return p.tripId===t.id;}).length;
    return '<div class="quest-card"><div class="name">'+esc(t.name)+'</div><div class="quest-meta">'+(t.date||'')+' \u00b7 \u5834\u6240 '+n+' \u4ef6</div></div>';
  }).join('');

  var hr=document.getElementById('home-recent');
  var recent=db.places.slice().reverse().slice(0,5);
  if(!recent.length)hr.innerHTML='<div class="empty-message">\u307e\u3060\u8a18\u9332\u304c\u3042\u308a\u307e\u305b\u3093</div>';
  else hr.innerHTML=recent.map(function(p){
    return '<div class="record-card"><div class="name">'+esc(p.name)+'</div><div class="meta">'+catLabel(p.cat)+' \u00b7 '+starsHtml(p.stars)+(p.wantAgain?' \u00b7 \u307e\u305f\u884c\u304d\u305f\u3044':'')+'</div></div>';
  }).join('');

  document.getElementById('pref-progress').innerHTML='<div class="pref-row"><span>\u8a18\u9332\u3057\u305f\u5834\u6240</span><span>'+db.places.length+'</span></div>';
}
function refreshQuests(){
  var el=document.getElementById('quest-list');
  if(!db.trips.length)el.innerHTML='<div class="empty-message">\u307e\u3060\u65c5\u304c\u3042\u308a\u307e\u305b\u3093</div>';
  else el.innerHTML=db.trips.map(function(t){
    var n=db.places.filter(function(p){return p.tripId===t.id;}).length;
    return '<div class="list-item"><div class="t">'+esc(t.name)+'</div><div class="m">'+(t.date||'')+' \u00b7 \u5834\u6240 '+n+' \u4ef6</div></div>';
  }).join('');
}
function refreshZukan(){
  var el=document.getElementById('zukan-list');
  if(!db.items.length)el.innerHTML='<div class="empty-message">\u307e\u3060\u304a\u571f\u7523\u304c\u3042\u308a\u307e\u305b\u3093</div>';
  else el.innerHTML=db.items.slice().reverse().map(function(it){
    return '<div class="list-item"><div class="t">'+(it.treasure?'\ud83d\udc8e ':'')+esc(it.name)+'</div><div class="m">'+esc(it.placeName||'')+(it.treasure?' \u00b7 \u305f\u304b\u3089\u3082\u306e':'')+'</div></div>';
  }).join('');
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function refreshAll(){refreshHome();refreshQuests();refreshZukan();if(mapReady)renderMarkers();}

document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    var name=btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.toggle('active',b.dataset.tab===name);});
    document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.toggle('active',p.id==='tab-'+name);});
    closePanels();
    if(name==='map')setTimeout(ensureMap,100);
    if(name==='quests')refreshQuests();
    if(name==='zukan')refreshZukan();
    if(name==='home')refreshHome();
  });
});

var modalR=document.getElementById('modal-record');
var modalT=document.getElementById('modal-trip');
document.getElementById('btn-record').onclick=function(){openRecordForm();};
document.getElementById('btn-close-record').onclick=function(){modalR.classList.add('hidden');};
document.getElementById('btn-new-trip').onclick=function(){openTripForm();};
document.getElementById('btn-close-trip').onclick=function(){modalT.classList.add('hidden');};
modalR.onclick=function(e){if(e.target===modalR)modalR.classList.add('hidden');};
modalT.onclick=function(e){if(e.target===modalT)modalT.classList.add('hidden');};

function openRecordForm(){
  ensureDefaultTrip();
  var sel=document.getElementById('f-trip');
  sel.innerHTML=db.trips.map(function(t){return '<option value="'+t.id+'">'+esc(t.name)+'</option>';}).join('');
  var cat=document.getElementById('f-cat');
  cat.innerHTML=CATEGORIES.map(function(c){return '<option value="'+c.id+'">'+c.label+'</option>';}).join('');
  document.getElementById('f-name').value='';
  document.getElementById('f-lat').value='';
  document.getElementById('f-lng').value='';
  document.getElementById('f-note').value='';
  document.getElementById('f-item').value='';
  document.getElementById('f-want').checked=false;
  document.getElementById('f-treasure').checked=false;
  starValue=3;
  document.querySelectorAll('#f-stars .star-btn').forEach(function(b){b.classList.toggle('on',+b.dataset.s===3);});
  modalR.classList.remove('hidden');
}
function openTripForm(){
  document.getElementById('t-name').value='';
  document.getElementById('t-date').value=new Date().toISOString().slice(0,10);
  modalT.classList.remove('hidden');
}
document.querySelectorAll('#f-stars .star-btn').forEach(function(b){
  b.onclick=function(){starValue=+b.dataset.s;document.querySelectorAll('#f-stars .star-btn').forEach(function(x){x.classList.toggle('on',+x.dataset.s===starValue);});};
});
document.getElementById('btn-save-trip').onclick=function(){
  var name=document.getElementById('t-name').value.trim();
  if(!name){toast('\u65c5\u306e\u540d\u524d\u3092\u5165\u308c\u3066\u306d');return;}
  db.trips.push({id:uid(),name:name,date:document.getElementById('t-date').value||''});
  save();refreshAll();modalT.classList.add('hidden');toast('\u65c5\u3092\u4f5c\u3063\u305f\u3088\uff01');
};
document.getElementById('btn-save-record').onclick=function(){
  var name=document.getElementById('f-name').value.trim();
  if(!name){toast('\u5834\u6240\u306e\u540d\u524d\u3092\u5165\u308c\u3066\u306d');return;}
  var tripId=document.getElementById('f-trip').value||ensureDefaultTrip().id;
  var lat=parseFloat(document.getElementById('f-lat').value);
  var lng=parseFloat(document.getElementById('f-lng').value);
  if(isNaN(lat)||isNaN(lng)){lat=DEFAULT_LAT+(Math.random()-0.5)*0.04;lng=DEFAULT_LNG+(Math.random()-0.5)*0.04;}
  var place={id:uid(),tripId:tripId,name:name,cat:document.getElementById('f-cat').value,lat:lat,lng:lng,stars:starValue,wantAgain:document.getElementById('f-want').checked,note:document.getElementById('f-note').value.trim(),createdAt:Date.now()};
  db.places.push(place);
  db.exp+=15+(place.wantAgain?5:0);
  var itemName=document.getElementById('f-item').value.trim();
  if(itemName){
    var treasure=document.getElementById('f-treasure').checked;
    db.items.push({id:uid(),name:itemName,placeId:place.id,placeName:place.name,treasure:treasure,createdAt:Date.now()});
    db.exp+=treasure?20:8;
  }
  save();refreshAll();modalR.classList.add('hidden');
  toast('\u5192\u967a\u306e\u66f8\u306b\u8a18\u9332\u3057\u307e\u3057\u305f\uff01');
};

var mapStatus=document.getElementById('map-status');
function setMapStatus(msg,hide){if(hide)mapStatus.classList.add('hidden');else{mapStatus.textContent=msg;mapStatus.classList.remove('hidden');}}
var CSS_URLS=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'];
var JS_URLS=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'];
var leafletPromise=null;
function loadCss(url){return new Promise(function(res){var l=document.createElement('link');l.rel='stylesheet';l.href=url;l.onload=res;l.onerror=res;document.head.appendChild(l);setTimeout(res,1200);});}
function loadJs(url){return new Promise(function(res,rej){var s=document.createElement('script');s.src=url;s.async=true;s.onload=res;s.onerror=function(){rej(new Error(url));};document.head.appendChild(s);});}
function ensureLeaflet(){if(typeof L!=='undefined')return Promise.resolve('cached');if(leafletPromise)return leafletPromise;leafletPromise=(async function(){var last=null;for(var i=0;i<JS_URLS.length;i++){try{await loadCss(CSS_URLS[i]);await loadJs(JS_URLS[i]);if(typeof L!=='undefined')return JS_URLS[i];}catch(e){last=e;}}throw last||new Error('fail');})();return leafletPromise;}
function icon(spot){var bg=spot.wantAgain?'#e8c547':catColor(spot.cat);var g=spot.wantAgain?' gold':'';return L.divIcon({className:'',html:'<div class="pin-dot'+g+'" style="background:'+bg+'"></div>',iconSize:[18,18],iconAnchor:[9,9],popupAnchor:[0,-10]});}
function popup(spot){return'<div class="pin-popup-name">'+esc(spot.name)+'</div><div class="pin-popup-meta">'+catLabel(spot.cat)+(spot.wantAgain?' \u00b7 \u307e\u305f\u884c\u304d\u305f\u3044':'')+'</div><div class="pin-popup-stars">'+starsHtml(spot.stars)+'</div>'+(spot.note?'<div class="pin-popup-meta">'+esc(spot.note)+'</div>':'');}
function match(spot){var any=false,ok=false;for(var k in filters.categories){if(filters.categories[k]){any=true;if(spot.cat===k)ok=true;}}if(any&&!ok)return false;if(filters.wantAgain&&!spot.wantAgain)return false;if(filters.treasure){var has=db.items.some(function(it){return it.placeId===spot.id&&it.treasure;});if(!has)return false;}return true;}
function renderMarkers(){
  if(!map||!markerLayer)return;markerLayer.clearLayers();
  db.places.forEach(function(spot){if(!match(spot))return;var m=L.marker([spot.lat,spot.lng],{icon:icon(spot)});m.bindPopup(popup(spot));m.addTo(markerLayer);});
}
function ensureMap(){if(mapReady){try{map.invalidateSize(true);}catch(e){}renderMarkers();return;}setMapStatus('\u5730\u56f3\u30e9\u30a4\u30d6\u30e9\u30ea\u3092\u8aad\u307f\u8fbc\u307f\u4e2d\u2026');ensureLeaflet().then(function(){initMap();}).catch(function(){setMapStatus('\u5730\u56f3\u30e9\u30a4\u30d6\u30e9\u30ea\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f');});}
function initMap(){if(mapReady){map.invalidateSize(true);return;}try{map=L.map('map',{zoomControl:true}).setView([DEFAULT_LAT,DEFAULT_LNG],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'\u00a9 OSM'}).addTo(map);markerLayer=L.layerGroup().addTo(map);renderMarkers();mapReady=true;setTimeout(function(){map.invalidateSize(true);setMapStatus('',true);},120);setTimeout(function(){map.invalidateSize(true);},500);}catch(err){setMapStatus('\u521d\u671f\u5316\u5931\u6557: '+err.message);}}
var panelR=document.getElementById('panel-rulora'),panelS=document.getElementById('panel-sakusen');
var btnR=document.getElementById('btn-rulora'),btnS=document.getElementById('btn-sakusen');
var grid=document.getElementById('pref-grid');
PREFS.forEach(function(p){var b=document.createElement('button');b.type='button';b.className='pref-btn';b.textContent=p.name;b.onclick=function(){if(map)map.setView([p.lat,p.lng],p.zoom);closePanels();};grid.appendChild(b);});
function closePanels(){panelR.classList.add('hidden');panelS.classList.add('hidden');btnR.classList.remove('active');btnS.classList.remove('active');}
btnR.onclick=function(){var o=panelR.classList.contains('hidden');closePanels();if(o){panelR.classList.remove('hidden');btnR.classList.add('active');}};
btnS.onclick=function(){var o=panelS.classList.contains('hidden');closePanels();if(o){panelS.classList.remove('hidden');btnS.classList.add('active');}};
document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=closePanels;});
var catEl=document.getElementById('filter-categories');
CATEGORIES.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=c.label;b.onclick=function(){b.classList.toggle('active');filters.categories[c.id]=b.classList.contains('active');};catEl.appendChild(b);});
document.querySelectorAll('[data-filter]').forEach(function(b){b.onclick=function(){b.classList.toggle('active');filters[b.dataset.filter]=b.classList.contains('active');};});
document.getElementById('btn-filter-apply').onclick=function(){renderMarkers();closePanels();};
document.getElementById('btn-filter-reset').onclick=function(){filters={categories:{},wantAgain:false,treasure:false};document.querySelectorAll('#panel-sakusen .chip').forEach(function(c){c.classList.remove('active');});renderMarkers();};

load();refreshAll();
})();
