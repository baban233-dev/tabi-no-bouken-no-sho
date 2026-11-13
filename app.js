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
  var t={id:uid(),name:'はじめての旅',date:new Date().toISOString().slice(0,10)};
  db.trips.push(t);save();return t;
}
function esc(s){return String(s||'').replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');}
function findPlace(id){for(var i=0;i<db.places.length;i++)if(db.places[i].id===id)return db.places[i];return null;}
function tripName(id){for(var i=0;i<db.trips.length;i++)if(db.trips[i].id===id)return db.trips[i].name;return'(なし)';}

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
  document.getElementById('st-exptext').textContent='次のレベルまで '+ein+' / 100';
  var msg=document.getElementById('slime-msg');
  if(!db.places.length)msg.innerHTML='ようこそ！ここは「旅の冒険の書」だよ。<br>まだ記録がないようだね。<br>右下の「＋」から、教会できろくしてみよう！';
  else msg.innerHTML='記録が <b>'+db.places.length+'</b> 件あるよ！<br>制覇した場所は '+towns+'、たからものは '+treasures+' 個だね。';
  var ht=document.getElementById('home-trips');
  if(!db.trips.length)ht.innerHTML='<div class="quest-card dummy"><div>（まだ旅がありません）</div><div class="quest-meta">旅タブから作成できます</div></div>';
  else ht.innerHTML=db.trips.slice(0,3).map(function(t){
    var n=db.places.filter(function(p){return p.tripId===t.id;}).length;
    return '<div class="quest-card"><div class="name">'+esc(t.name)+'</div><div class="quest-meta">'+(t.date||'')+' · 場所 '+n+' 件</div></div>';
  }).join('');
  var hr=document.getElementById('home-recent');
  var recent=db.places.slice().reverse().slice(0,5);
  if(!recent.length)hr.innerHTML='<div class="empty-message">まだ記録がありません</div>';
  else{hr.innerHTML=recent.map(function(p){return'<div class="record-card tap" data-place-id="'+p.id+'"><div class="name">'+esc(p.name)+'</div><div class="meta">'+catLabel(p.cat)+' · '+starsHtml(p.stars)+(p.wantAgain?' · また行きたい':'')+'</div></div>';}).join('');bindPlaceTaps();}
  document.getElementById('pref-progress').innerHTML='<div class="pref-row"><span>記録した場所</span><span>'+db.places.length+'</span></div>';
}
function refreshQuests(){
  var el=document.getElementById('quest-list');
  if(!db.trips.length)el.innerHTML='<div class="empty-message">まだ旅がありません</div>';
  else{
    el.innerHTML=db.trips.map(function(t){
      var places=db.places.filter(function(p){return p.tripId===t.id;});
      var ph=places.length?places.map(function(p){return'<div class="record-card tap" data-place-id="'+p.id+'" style="margin-top:6px"><div class="name">'+esc(p.name)+'</div><div class="meta">'+catLabel(p.cat)+' · '+starsHtml(p.stars)+'</div></div>';}).join(''):'<div class="quest-meta" style="margin-top:6px">まだ場所がありません</div>';
      return'<div class="list-item"><div class="t">'+esc(t.name)+'</div><div class="m">'+(t.date||'')+' · 場所 '+places.length+' 件</div>'+ph+'</div>';
    }).join('');
    bindPlaceTaps();
  }
}
function refreshZukan(){
  var el=document.getElementById('zukan-list');
  if(!db.items.length)el.innerHTML='<div class="empty-message">まだお土産がありません</div>';
  else el.innerHTML=db.items.slice().reverse().map(function(it){
    return '<div class="list-item"><div class="t">'+(it.treasure?'💎 ':'')+esc(it.name)+'</div><div class="m">'+esc(it.placeName||'')+(it.treasure?' · たからもの':'')+'</div></div>';
  }).join('');
}
function refreshAll(){refreshHome();refreshQuests();refreshZukan();if(mapReady)renderMarkers();}

/* tabs */
document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.onclick=function(){
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
    btn.classList.add('active');
    var id='tab-'+btn.dataset.tab;
    document.getElementById(id).classList.add('active');
    if(btn.dataset.tab==='map')ensureMap();
  };
});

/* record form */
var modalR=document.getElementById('modal-record');
var modalT=document.getElementById('modal-trip');
document.getElementById('btn-record').onclick=function(){openRecordForm();};
document.getElementById('btn-close-record').onclick=function(){modalR.classList.add('hidden');};
document.getElementById('btn-close-trip').onclick=function(){modalT.classList.add('hidden');};
modalR.onclick=function(e){if(e.target===modalR)modalR.classList.add('hidden');};
modalT.onclick=function(e){if(e.target===modalT)modalT.classList.add('hidden');};
document.getElementById('btn-new-trip').onclick=function(){document.getElementById('t-name').value='';document.getElementById('t-date').value='';modalT.classList.remove('hidden');};
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
  document.querySelectorAll('#f-stars .star-btn').forEach(function(x){x.classList.toggle('on',+x.dataset.s===3);});
  modalR.classList.remove('hidden');
}
document.querySelectorAll('#f-stars .star-btn').forEach(function(b){
  b.onclick=function(){starValue=+b.dataset.s;document.querySelectorAll('#f-stars .star-btn').forEach(function(x){x.classList.toggle('on',+x.dataset.s===starValue);});};
});
document.getElementById('btn-save-trip').onclick=function(){
  var name=document.getElementById('t-name').value.trim();
  if(!name){toast('旅の名前を入れてね');return;}
  db.trips.push({id:uid(),name:name,date:document.getElementById('t-date').value||''});
  save();refreshAll();modalT.classList.add('hidden');toast('旅を作ったよ！');
};

var modalD=document.getElementById('modal-detail'),editingPlaceId=null;
document.getElementById('btn-close-detail').onclick=function(){modalD.classList.add('hidden');};
modalD.onclick=function(e){if(e.target===modalD)modalD.classList.add('hidden');};

function openPlaceDetail(id){
  var p=findPlace(id);if(!p){toast('記録が見つかりません');return;}
  editingPlaceId=null;
  document.getElementById('detail-title').textContent=p.name;
  var items=db.items.filter(function(it){return it.placeId===p.id;});
  var ih=items.length?items.map(function(it){return'<div class="list-item" style="margin-top:6px"><div class="t">'+(it.treasure?'💎 ':'')+esc(it.name)+'</div></div>';}).join(''):'';
  document.getElementById('detail-body').innerHTML=
    '<div class="detail-block"><div class="detail-label">カテゴリ</div><div class="detail-value">'+esc(catLabel(p.cat))+'</div></div>'+
    '<div class="detail-block"><div class="detail-label">評価</div><div class="detail-stars">'+starsHtml(p.stars)+'</div></div>'+
    (p.wantAgain?'<div class="detail-block"><div class="detail-value">✨ また行きたい</div></div>':'')+
    (p.note?'<div class="detail-block"><div class="detail-label">メモ</div><div class="detail-value">'+esc(p.note)+'</div></div>':'')+
    '<div class="detail-block"><div class="detail-label">旅</div><div class="detail-value">'+esc(tripName(p.tripId))+'</div></div>'+
    '<div class="detail-block"><div class="detail-label">座標</div><div class="detail-value" style="font-size:.85rem">'+p.lat.toFixed(5)+', '+p.lng.toFixed(5)+'</div></div>'+
    (ih?'<div class="detail-block"><div class="detail-label">お土産</div>'+ih+'</div>':'')+
    '<div class="detail-actions"><button class="dq-button secondary" type="button" id="btn-detail-edit">編集</button><button class="dq-button danger" type="button" id="btn-detail-delete">削除</button></div>';
  modalD.classList.remove('hidden');
  document.getElementById('btn-detail-edit').onclick=function(){openEditPlace(p.id);};
  document.getElementById('btn-detail-delete').onclick=function(){deletePlace(p.id);};
}
function deletePlace(id){
  if(!confirm('この記録を削除しますか？\n紐づくお土産も消えます。'))return;
  db.places=db.places.filter(function(p){return p.id!==id;});
  db.items=db.items.filter(function(it){return it.placeId!==id;});
  save();refreshAll();modalD.classList.add('hidden');toast('削除しました');
}
function openEditPlace(id){
  var p=findPlace(id);if(!p)return;editingPlaceId=id;ensureDefaultTrip();
  var sel=document.getElementById('f-trip');
  sel.innerHTML=db.trips.map(function(t){return '<option value="'+t.id+'">'+esc(t.name)+'</option>';}).join('');
  sel.value=p.tripId;
  var cat=document.getElementById('f-cat');
  cat.innerHTML=CATEGORIES.map(function(c){return '<option value="'+c.id+'">'+c.label+'</option>';}).join('');
  cat.value=p.cat;
  document.getElementById('f-name').value=p.name;
  document.getElementById('f-lat').value=p.lat;
  document.getElementById('f-lng').value=p.lng;
  document.getElementById('f-note').value=p.note||'';
  document.getElementById('f-item').value='';
  document.getElementById('f-want').checked=!!p.wantAgain;
  document.getElementById('f-treasure').checked=false;
  starValue=p.stars||3;
  document.querySelectorAll('#f-stars .star-btn').forEach(function(x){x.classList.toggle('on',+x.dataset.s===starValue);});
  document.querySelector('#modal-record .modal-header span').textContent='⛪ 記録を編集';
  document.getElementById('btn-save-record').textContent='変更を保存する';
  modalD.classList.add('hidden');
  modalR.classList.remove('hidden');
}
function bindPlaceTaps(){
  document.querySelectorAll('[data-place-id]').forEach(function(el){
    el.onclick=function(){openPlaceDetail(el.getAttribute('data-place-id'));};
  });
}

document.getElementById('btn-save-record').onclick=function(){
  var name=document.getElementById('f-name').value.trim();
  if(!name){toast('場所の名前を入れてね');return;}
  var tripId=document.getElementById('f-trip').value||ensureDefaultTrip().id;
  var lat=parseFloat(document.getElementById('f-lat').value),lng=parseFloat(document.getElementById('f-lng').value);
  if(isNaN(lat)||isNaN(lng)){lat=DEFAULT_LAT+(Math.random()-0.5)*0.04;lng=DEFAULT_LNG+(Math.random()-0.5)*0.04;}
  if(editingPlaceId){
    var p=findPlace(editingPlaceId);
    if(p){p.tripId=tripId;p.name=name;p.cat=document.getElementById('f-cat').value;p.lat=lat;p.lng=lng;p.stars=starValue;p.wantAgain=document.getElementById('f-want').checked;p.note=document.getElementById('f-note').value.trim();}
    var iname=document.getElementById('f-item').value.trim();
    if(iname){db.items.push({id:uid(),name:iname,placeId:editingPlaceId,placeName:name,treasure:document.getElementById('f-treasure').checked,createdAt:Date.now()});db.exp+=document.getElementById('f-treasure').checked?20:8;}
    save();refreshAll();modalR.classList.add('hidden');editingPlaceId=null;
    document.querySelector('#modal-record .modal-header span').textContent='⛪ 教会で きろくする';
    document.getElementById('btn-save-record').textContent='冒険の書に記録する';
    toast('変更を保存しました');return;
  }
  var place={id:uid(),tripId:tripId,name:name,cat:document.getElementById('f-cat').value,lat:lat,lng:lng,stars:starValue,wantAgain:document.getElementById('f-want').checked,note:document.getElementById('f-note').value.trim(),createdAt:Date.now()};
  db.places.push(place);db.exp+=15+(place.wantAgain?5:0);
  var iname2=document.getElementById('f-item').value.trim();
  if(iname2){db.items.push({id:uid(),name:iname2,placeId:place.id,placeName:place.name,treasure:document.getElementById('f-treasure').checked,createdAt:Date.now()});db.exp+=document.getElementById('f-treasure').checked?20:8;}
  save();refreshAll();modalR.classList.add('hidden');toast('冒険の書に記録しました！');
};

/* map */
var CSS_URLS=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'];
var JS_URLS=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'];
var leafletPromise=null;
function loadCss(url){return new Promise(function(res){var l=document.createElement('link');l.rel='stylesheet';l.href=url;l.onload=res;l.onerror=res;document.head.appendChild(l);setTimeout(res,1200);});}
function loadJs(url){return new Promise(function(res,rej){var s=document.createElement('script');s.src=url;s.async=true;s.onload=res;s.onerror=function(){rej(new Error(url));};document.head.appendChild(s);});}
function ensureLeaflet(){if(typeof L!=='undefined')return Promise.resolve('cached');if(leafletPromise)return leafletPromise;leafletPromise=(async function(){var last=null;for(var i=0;i<JS_URLS.length;i++){try{await loadCss(CSS_URLS[i]);await loadJs(JS_URLS[i]);if(typeof L!=='undefined')return JS_URLS[i];}catch(e){last=e;}}throw last||new Error('fail');})();return leafletPromise;}
function setMapStatus(msg,hide){var el=document.getElementById('map-status');if(hide){el.classList.add('hidden');return;}el.textContent=msg;el.classList.remove('hidden');}
function icon(spot){var bg=spot.wantAgain?'#e8c547':catColor(spot.cat);var g=spot.wantAgain?' gold':'';return L.divIcon({className:'',html:'<div class="pin-dot'+g+'" style="background:'+bg+'"></div>',iconSize:[18,18],iconAnchor:[9,9],popupAnchor:[0,-10]});}
function popup(spot){return'<div class="pin-popup-name">'+esc(spot.name)+'</div><div class="pin-popup-meta">'+catLabel(spot.cat)+(spot.wantAgain?' · また行きたい':'')+'</div><div class="pin-popup-stars">'+starsHtml(spot.stars)+'</div>'+(spot.note?'<div class="pin-popup-meta">'+esc(spot.note)+'</div>':'');}
function match(spot){var any=false,ok=false;for(var k in filters.categories){if(filters.categories[k]){any=true;if(spot.cat===k)ok=true;}}if(any&&!ok)return false;if(filters.wantAgain&&!spot.wantAgain)return false;if(filters.treasure){var has=db.items.some(function(it){return it.placeId===spot.id&&it.treasure;});if(!has)return false;}return true;}
function renderMarkers(){
  if(!map||!markerLayer)return;markerLayer.clearLayers();
  db.places.forEach(function(spot){
    if(!match(spot))return;
    var m=L.marker([spot.lat,spot.lng],{icon:icon(spot)});
    m.bindPopup(popup(spot)+'<div style="margin-top:8px"><button type="button" class="dq-button secondary" style="padding:6px;font-size:.8rem" data-open-place="'+spot.id+'">詳細を見る</button></div>');
    m.on('popupopen',function(){var b=document.querySelector('[data-open-place="'+spot.id+'"]');if(b)b.onclick=function(){map.closePopup();openPlaceDetail(spot.id);};});
    m.addTo(markerLayer);
  });
}
function ensureMap(){if(mapReady){try{map.invalidateSize(true);}catch(e){}renderMarkers();return;}setMapStatus('地図ライブラリを読み込み中…');ensureLeaflet().then(function(){initMap();}).catch(function(){setMapStatus('地図ライブラリの読み込みに失敗しました');});}
function initMap(){if(mapReady){map.invalidateSize(true);return;}try{map=L.map('map',{zoomControl:true}).setView([DEFAULT_LAT,DEFAULT_LNG],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OSM'}).addTo(map);markerLayer=L.layerGroup().addTo(map);renderMarkers();mapReady=true;setTimeout(function(){map.invalidateSize(true);setMapStatus('',true);},120);setTimeout(function(){map.invalidateSize(true);},500);}catch(err){setMapStatus('初期化失敗: '+err.message);}}
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

var _orf=openRecordForm;openRecordForm=function(){
  editingPlaceId=null;
  document.querySelector('#modal-record .modal-header span').textContent='⛪ 教会で きろくする';
  document.getElementById('btn-save-record').textContent='冒険の書に記録する';
  _orf();
};

load();refreshAll();
})();
