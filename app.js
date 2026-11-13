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
var ITEM_CATEGORIES=[
{id:'',label:'（未分類）'},
{id:'okashi',label:'お菓子'},
{id:'shokuhin',label:'食品'},
{id:'nomimono',label:'飲み物'},
{id:'chomiryo',label:'調味料'},
{id:'kogei',label:'工芸品/雑貨'},
{id:'other',label:'その他'}
];
var ITEM_FOR_WHOM=['','家用','妻の実家用','職場','自分用','その他'];
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
function esc(s){return String(s||'').replace(/&/g,'\u0026amp;').replace(/</g,'\u0026lt;').replace(/>/g,'\u0026gt;').replace(/"/g,'\u0026quot;');}
function findPlace(id){for(var i=0;i<db.places.length;i++)if(db.places[i].id===id)return db.places[i];return null;}
function findItem(id){for(var i=0;i<db.items.length;i++)if(db.items[i].id===id)return db.items[i];return null;}
function itemCatLabel(id){for(var i=0;i<ITEM_CATEGORIES.length;i++)if(ITEM_CATEGORIES[i].id===id)return ITEM_CATEGORIES[i].label;return'（未分類）';}
function isMetalItem(it){return !!it&&it.treasure&&(it.stars||0)>=3;}
function isMetalPlace(p){return !!p&&p.wantAgain&&(p.stars||0)>=3;}
function metalBadgeHtml(){return '<span class="metal-badge">🩶 メタルスライム級</span>';}
function priceHtml(v){var n=parseInt(v,10);if(isNaN(n)||n<=0)return'';return '¥'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
function newItem(name,place,treasure){return{id:uid(),name:name,placeId:place.id,placeName:place.name,treasure:!!treasure,cat:'',price:'',forWhom:'',stars:0,note:'',createdAt:Date.now()};}
function tripName(id){for(var i=0;i<db.trips.length;i++)if(db.trips[i].id===id)return db.trips[i].name;return'(なし)';}

function refreshHome(){
  document.getElementById('st-lv').textContent=levelFromExp(db.exp);
  document.getElementById('st-places').textContent=db.places.length;
  var treasures=db.items.filter(function(it){return it.treasure;}).length;
  document.getElementById('st-treasure').textContent=treasures;
  var towns=db.places.length;
  document.getElementById('st-towns').textContent=towns;
  document.getElementById('st-towns2').textContent=towns;
  var pct=expInLevel(db.exp);
  document.getElementById('st-expbar').style.width=pct+'%';
  document.getElementById('st-exptext').textContent='次のレベルまで '+pct+' / 100';
  var msg=document.getElementById('slime-msg');
  if(!db.places.length)msg.innerHTML='ようこそ！ここは「旅の冒険の書」だよ。<br>まだ記録がないようだね。<br>右下の「＋」から、教会できろくしてみよう！';
  else msg.innerHTML='記録が <b>'+db.places.length+'</b> 件あるよ！<br>制覇した場所は '+towns+'、たからものは '+treasures+' 個だね。';
  var ht=document.getElementById('home-trips');
  if(!db.trips.length)ht.innerHTML='<div class="quest-card dummy"><div>（まだ旅がありません）</div><div class="quest-meta">旅タブから作成できます</div></div>';
  else {
    ht.innerHTML=db.trips.slice(0,3).map(function(t){
      var n=db.places.filter(function(p){return p.tripId===t.id;}).length;
      return '<div class="quest-card tap" data-trip-id="'+t.id+'"><div class="name">'+esc(t.name)+'</div><div class="quest-meta">'+(t.date||'')+' · 場所 '+n+' 件</div></div>';
    }).join('');
    document.querySelectorAll('#home-trips [data-trip-id]').forEach(function(el){
      el.onclick=function(){
        document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
        document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
        var qbtn=document.querySelector('.tab-btn[data-tab="quest"]');
        if(qbtn)qbtn.classList.add('active');
        document.getElementById('tab-quest').classList.add('active');
        openTripDetail(el.getAttribute('data-trip-id'));
      };
    });
  }
  var hr=document.getElementById('home-recent');
  var recent=db.places.slice().reverse().slice(0,5);
  if(!recent.length)hr.innerHTML='<div class="empty-message">まだ記録がありません</div>';
  else{hr.innerHTML=recent.map(function(p){return'<div class="record-card tap" data-place-id="'+p.id+'"><div class="name">'+esc(p.name)+'</div><div class="meta">'+catLabel(p.cat)+' · '+starsHtml(p.stars)+(p.wantAgain?' · また行きたい':'')+'</div></div>';}).join('');bindPlaceTaps();}
  document.getElementById('pref-progress').innerHTML='<div class="pref-row"><span>記録した場所</span><span>'+db.places.length+'</span></div>';
}
function formatDate(ts){
  if(!ts)return '';
  var d=new Date(ts);
  if(isNaN(d.getTime()))return '';
  return (d.getMonth()+1)+'/'+d.getDate();
}
function findTrip(id){for(var i=0;i<db.trips.length;i++)if(db.trips[i].id===id)return db.trips[i];return null;}
var currentTripId=null;
var routeTripId=null;
var routeLine=null;
function refreshQuests(){
  currentTripId=null;
  var titleEl=document.getElementById('quest-section-title');
  if(titleEl)titleEl.textContent='冒険の一覧';
  var el=document.getElementById('quest-list');
  if(!db.trips.length){el.innerHTML='<div class="empty-message">まだ旅がありません</div>';return;}
  el.innerHTML=db.trips.map(function(t){
    var places=db.places.filter(function(p){return p.tripId===t.id;});
    return '<div class="list-item tap trip-card" data-trip-id="'+t.id+'">'+ 
      '<div class="t">'+esc(t.name)+'</div>'+
      '<div class="m">'+(t.date||'日付なし')+' · 場所 '+places.length+' 件</div>'+
      '<div class="trip-arrow">›</div></div>';
  }).join('');
  bindTripTaps();
}
function bindTripTaps(){
  document.querySelectorAll('[data-trip-id]').forEach(function(el){
    el.onclick=function(){openTripDetail(el.getAttribute('data-trip-id'));};
  });
}
function openTripDetail(tripId){
  var t=findTrip(tripId);
  if(!t){toast('旅が見つかりません');return;}
  currentTripId=tripId;
  var titleEl=document.getElementById('quest-section-title');
  if(titleEl)titleEl.textContent='旅のタイムライン';
  var places=db.places.filter(function(p){return p.tripId===tripId;})
    .slice().sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);});
  var el=document.getElementById('quest-list');
  var header='<div class="timeline-header">'+
    '<button type="button" class="back-btn" id="btn-trip-back">‹ 一覧に戻る</button>'+
    '<div class="timeline-title">'+esc(t.name)+'</div>'+
    '<div class="timeline-meta">'+(t.date||'日付なし')+' · 場所 '+places.length+' 件</div>'+
    (places.length?'<button type="button" class="dq-button secondary route-map-btn" id="btn-show-route">🗺️ 地図でルートを見る</button>':'')+
    '</div>';
  if(!places.length){
    el.innerHTML=header+'<div class="empty-message">この旅にはまだ場所がありません<br>右下の「＋」から記録してみよう</div>';
  }else{
    var tl='<div class="timeline">';
    places.forEach(function(p,i){
      var num=i+1;
      var dateStr=formatDate(p.createdAt);
      tl+='<div class="timeline-item tap" data-place-id="'+p.id+'">'+ 
        '<div class="tl-rail"><div class="tl-num">'+num+'</div>'+(i<places.length-1?'<div class="tl-line"></div>':'')+'</div>'+
        '<div class="tl-card">'+
          '<div class="tl-name">'+esc(p.name)+'</div>'+
          '<div class="tl-meta">'+catLabel(p.cat)+' · '+starsHtml(p.stars)+(p.wantAgain?' · また行きたい':'')+(dateStr?' · '+dateStr:'')+'</div>'+
          (p.note?'<div class="tl-note">'+esc(p.note)+'</div>':'')+
        '</div></div>';
    });
    tl+='</div>';
    el.innerHTML=header+tl;
    bindPlaceTaps();
  }
  var back=document.getElementById('btn-trip-back');
  if(back)back.onclick=function(){refreshQuests();};
  var rb=document.getElementById('btn-show-route');
  if(rb)rb.onclick=function(){showTripRoute(tripId);};
}
var zukanFilter='all';
function itemMetaLine(it){
  var parts=[];
  if(it.cat)parts.push(itemCatLabel(it.cat));
  var pr=priceHtml(it.price);if(pr)parts.push(pr);
  if(it.forWhom)parts.push(esc(it.forWhom));
  if(it.stars)parts.push(starsHtml(it.stars));
  return parts.join(' · ');
}
function refreshZukan(){
  var el=document.getElementById('zukan-list');
  var cnt=document.getElementById('zukan-count');
  var treasures=db.items.filter(function(it){return it.treasure;}).length;
  var metals=db.items.filter(function(it){return isMetalItem(it);}).length;
  if(cnt)cnt.textContent=db.items.length?('全 '+db.items.length+' 個 · たからもの '+treasures+' 個'+(metals?' · メタル級 '+metals+' 個':'')):'';
  document.querySelectorAll('#zukan-filters .chip').forEach(function(c){c.classList.toggle('active',c.dataset.zfilter===zukanFilter);});
  if(!db.items.length){el.innerHTML='<div class="empty-message">まだお土産がありません</div>';return;}
  var list=db.items.slice().reverse().filter(function(it){
    if(zukanFilter==='treasure')return !!it.treasure;
    if(zukanFilter==='metal')return isMetalItem(it);
    return true;
  });
  if(!list.length){el.innerHTML='<div class="empty-message">この条件のお土産はまだありません</div>';return;}
  el.innerHTML=list.map(function(it){
    var meta=itemMetaLine(it);
    return '<div class="list-item tap" data-item-id="'+it.id+'"><div class="t">'+(it.treasure?'💎 ':'')+esc(it.name)+(isMetalItem(it)?' '+metalBadgeHtml():'')+'</div><div class="m">'+esc(it.placeName||'')+(it.treasure?' · たからもの':'')+(meta?' · '+meta:'')+'</div></div>';
  }).join('');
  bindItemTaps();
}
function bindItemTaps(){
  document.querySelectorAll('[data-item-id]').forEach(function(el){
    el.onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();openItemDetail(el.getAttribute('data-item-id'));};
  });
}
function bindZukanFilters(){
  document.querySelectorAll('#zukan-filters .chip').forEach(function(c){
    c.onclick=function(){zukanFilter=c.dataset.zfilter;refreshZukan();};
  });
}
function openItemDetail(id){
  var it=findItem(id);if(!it){toast('お土産が見つかりません');return;}
  document.getElementById('detail-title').textContent=it.name;
  var meta=itemMetaLine(it);
  document.getElementById('detail-body').innerHTML=
    (isMetalItem(it)?'<div class="detail-block">'+metalBadgeHtml()+'<div class="mini-map-hint">★3つ＋たからもの＝伝説級の印だよ</div></div>':'')+
    '<div class="detail-block"><div class="detail-label">買った場所</div><div class="detail-value">'+esc(it.placeName||'（なし）')+'</div></div>'+
    (it.cat?'<div class="detail-block"><div class="detail-label">カテゴリ</div><div class="detail-value">'+esc(itemCatLabel(it.cat))+'</div></div>':'')+
    '<div class="detail-block"><div class="detail-label">評価</div><div class="detail-value">'+(it.stars?'<span class="detail-stars">'+starsHtml(it.stars)+'</span>':'未評価')+'</div></div>'+
    (it.treasure?'<div class="detail-block"><div class="detail-value">💎 たからもの（また買う）</div></div>':'')+
    (priceHtml(it.price)?'<div class="detail-block"><div class="detail-label">金額（参考）</div><div class="detail-value">'+priceHtml(it.price)+'</div></div>':'')+
    (it.forWhom?'<div class="detail-block"><div class="detail-label">誰用か</div><div class="detail-value">'+esc(it.forWhom)+'</div></div>':'')+
    (it.note?'<div class="detail-block"><div class="detail-label">メモ</div><div class="detail-value">'+esc(it.note)+'</div></div>':'')+
    (!it.cat&&!it.stars&&!it.price&&!it.forWhom&&!it.note?'<div class="detail-block"><div class="detail-value" style="font-size:.85rem;color:var(--sub)">カテゴリや評価は「編集」から足せます'+(meta?'':'')+'</div></div>':'')+
    '<div class="detail-actions"><button class="dq-button secondary" type="button" id="btn-item-edit">編集</button><button class="dq-button danger" type="button" id="btn-item-delete">削除</button></div>';
  modalD.classList.remove('hidden');
  document.getElementById('btn-item-edit').onclick=function(){openEditItem(it.id);};
  document.getElementById('btn-item-delete').onclick=function(){deleteItem(it.id);};
}
function deleteItem(id){
  if(!confirm('このお土産を図鑑から削除しますか？'))return;
  db.items=db.items.filter(function(it){return it.id!==id;});
  save();refreshAll();modalD.classList.add('hidden');toast('削除しました');
}
var modalI=null,editingItemId=null,itemStarValue=0;
function openEditItem(id){
  var it=findItem(id);if(!it)return;
  if(!modalI)modalI=document.getElementById('modal-item');
  editingItemId=id;itemStarValue=it.stars||0;
  document.getElementById('i-place').textContent=it.placeName||'（なし）';
  document.getElementById('i-name').value=it.name||'';
  var cat=document.getElementById('i-cat');
  cat.innerHTML=ITEM_CATEGORIES.map(function(c){return '<option value="'+c.id+'">'+c.label+'</option>';}).join('');
  cat.value=it.cat||'';
  document.getElementById('i-price').value=it.price||'';
  var fw=document.getElementById('i-for');
  fw.innerHTML=ITEM_FOR_WHOM.map(function(v){return '<option value="'+esc(v)+'">'+(v||'（未設定）')+'</option>';}).join('');
  fw.value=it.forWhom||'';
  document.getElementById('i-treasure').checked=!!it.treasure;
  document.getElementById('i-note').value=it.note||'';
  document.querySelectorAll('#i-stars .star-btn').forEach(function(x){x.classList.toggle('on',+x.dataset.s===itemStarValue);});
  modalD.classList.add('hidden');
  modalI.classList.remove('hidden');
}
function initItemModal(){
  modalI=document.getElementById('modal-item');
  if(!modalI)return;
  document.getElementById('btn-close-item').onclick=function(){modalI.classList.add('hidden');};
  modalI.onclick=function(e){if(e.target===modalI)modalI.classList.add('hidden');};
  document.querySelectorAll('#i-stars .star-btn').forEach(function(b){
    b.onclick=function(){itemStarValue=+b.dataset.s;document.querySelectorAll('#i-stars .star-btn').forEach(function(x){x.classList.toggle('on',+x.dataset.s===itemStarValue);});};
  });
  document.getElementById('btn-save-item').onclick=function(){
    var it=findItem(editingItemId);if(!it){modalI.classList.add('hidden');return;}
    var name=document.getElementById('i-name').value.trim();
    if(!name){toast('品名を入れてね');return;}
    it.name=name;
    it.cat=document.getElementById('i-cat').value;
    var pv=document.getElementById('i-price').value;
    it.price=pv===''? '':Math.max(0,parseInt(pv,10)||0);
    it.forWhom=document.getElementById('i-for').value;
    it.stars=itemStarValue;
    it.treasure=document.getElementById('i-treasure').checked;
    it.note=document.getElementById('i-note').value.trim();
    save();refreshAll();modalI.classList.add('hidden');editingItemId=null;
    toast(isMetalItem(it)?'メタルスライム級に記録しました！':'変更を保存しました');
  };
}
function refreshAll(){
  refreshHome();
  var keepTrip=currentTripId;
  refreshQuests();
  if(keepTrip&&findTrip(keepTrip))openTripDetail(keepTrip);
  refreshZukan();
  if(mapReady)renderMarkers();
}

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
  var ih=items.length?items.map(function(it){var m=itemMetaLine(it);return'<div class="list-item tap" data-item-id="'+it.id+'" style="margin-top:6px"><div class="t">'+(it.treasure?'💎 ':'')+esc(it.name)+(isMetalItem(it)?' '+metalBadgeHtml():'')+'</div>'+(m?'<div class="m">'+m+'</div>':'')+'</div>';}).join(''):'';
  document.getElementById('detail-body').innerHTML=
    (isMetalPlace(p)?'<div class="detail-block">'+metalBadgeHtml()+'<div class="mini-map-hint">★3つ＋また行きたい＝伝説級の印だよ</div></div>':'')+
    '<div class="detail-block"><div class="detail-label">カテゴリ</div><div class="detail-value">'+esc(catLabel(p.cat))+'</div></div>'+
    '<div class="detail-block"><div class="detail-label">評価</div><div class="detail-stars">'+starsHtml(p.stars)+'</div></div>'+
    (p.wantAgain?'<div class="detail-block"><div class="detail-value">✨ また行きたい</div></div>':'')+
    (p.note?'<div class="detail-block"><div class="detail-label">メモ</div><div class="detail-value">'+esc(p.note)+'</div></div>':'')+
    '<div class="detail-block"><div class="detail-label">旅</div><div class="detail-value">'+esc(tripName(p.tripId))+'</div></div>'+
    '<div class="detail-block"><div class="detail-label">座標</div><div class="detail-value" style="font-size:.85rem">'+p.lat.toFixed(5)+', '+p.lng.toFixed(5)+'</div></div>'+
    (ih?'<div class="detail-block"><div class="detail-label">お土産</div>'+ih+'</div>':'')+
    '<div class="detail-actions"><button class="dq-button secondary" type="button" id="btn-detail-edit">編集</button><button class="dq-button danger" type="button" id="btn-detail-delete">削除</button></div>';
  modalD.classList.remove('hidden');
  bindItemTaps();
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
    if(iname){db.items.push(newItem(iname,{id:editingPlaceId,name:name},document.getElementById('f-treasure').checked));db.exp+=document.getElementById('f-treasure').checked?20:8;}
    save();refreshAll();modalR.classList.add('hidden');editingPlaceId=null;
    document.querySelector('#modal-record .modal-header span').textContent='⛪ 教会で きろくする';
    document.getElementById('btn-save-record').textContent='冒険の書に記録する';
    toast('変更を保存しました');return;
  }
  var place={id:uid(),tripId:tripId,name:name,cat:document.getElementById('f-cat').value,lat:lat,lng:lng,stars:starValue,wantAgain:document.getElementById('f-want').checked,note:document.getElementById('f-note').value.trim(),createdAt:Date.now()};
  db.places.push(place);db.exp+=15+(place.wantAgain?5:0);
  var iname2=document.getElementById('f-item').value.trim();
  if(iname2){db.items.push(newItem(iname2,place,document.getElementById('f-treasure').checked));db.exp+=document.getElementById('f-treasure').checked?20:8;}
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
function numIcon(n){return L.divIcon({className:'',html:'<div class="route-num">'+n+'</div>',iconSize:[26,26],iconAnchor:[13,13],popupAnchor:[0,-14]});}
function popup(spot){return'<div class="pin-popup-name">'+esc(spot.name)+'</div><div class="pin-popup-meta">'+catLabel(spot.cat)+(spot.wantAgain?' · また行きたい':'')+'</div><div class="pin-popup-stars">'+starsHtml(spot.stars)+'</div>'+(spot.note?'<div class="pin-popup-meta">'+esc(spot.note)+'</div>':'')+(isMetalPlace(spot)?'<div style="margin-top:4px">'+metalBadgeHtml()+'</div>':'')+'<button type="button" class="pin-detail-btn" data-place-detail="'+spot.id+'">詳細を見る</button>';}
function match(spot){var any=false,ok=false;for(var k in filters.categories){if(filters.categories[k]){any=true;if(spot.cat===k)ok=true;}}if(any&&!ok)return false;if(filters.wantAgain&&!spot.wantAgain)return false;if(filters.treasure){var has=db.items.some(function(it){return it.placeId===spot.id&&it.treasure;});if(!has)return false;}return true;}
function updateRouteBanner(){
  var el=document.getElementById('route-banner');
  if(!el)return;
  if(!routeTripId){el.classList.add('hidden');el.innerHTML='';return;}
  var t=findTrip(routeTripId);
  el.classList.remove('hidden');
  el.innerHTML='<span>🗺️ ルート: '+(t?esc(t.name):'')+'</span><button type="button" id="btn-clear-route" class="route-clear">× 解除</button>';
  var b=document.getElementById('btn-clear-route');
  if(b)b.onclick=function(){clearRoute();};
}
function clearRoute(){
  routeTripId=null;
  if(routeLine&&map){try{map.removeLayer(routeLine);}catch(e){}}
  routeLine=null;
  updateRouteBanner();
  if(mapReady)renderMarkers();
}
function showTripRoute(tripId){
  var places=db.places.filter(function(p){return p.tripId===tripId;});
  if(places.length<1){toast('この旅には場所がありません');return;}
  routeTripId=tripId;
  document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
  var mbtn=document.querySelector('.tab-btn[data-tab="map"]');
  if(mbtn)mbtn.classList.add('active');
  document.getElementById('tab-map').classList.add('active');
  ensureMap();
  var tryFit=function(){
    if(!mapReady||!map){setTimeout(tryFit,200);return;}
    renderMarkers();
    updateRouteBanner();
    var pts=places.map(function(p){return [p.lat,p.lng];});
    try{
      if(pts.length===1)map.setView(pts[0],14);
      else map.fitBounds(pts,{padding:[40,40],maxZoom:15});
    }catch(e){}
  };
  setTimeout(tryFit,150);
}
function renderMarkers(){
  if(!map||!markerLayer)return;
  markerLayer.clearLayers();
  if(routeLine){try{map.removeLayer(routeLine);}catch(e){}routeLine=null;}
  if(routeTripId){
    var places=db.places.filter(function(p){return p.tripId===routeTripId;})
      .slice().sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);});
    var latlngs=[];
    places.forEach(function(spot,i){
      latlngs.push([spot.lat,spot.lng]);
      var m=L.marker([spot.lat,spot.lng],{icon:numIcon(i+1)});
      m.bindPopup(popup(spot)+'<div class="pin-popup-meta">#'+(i+1)+'</div>');
      m.addTo(markerLayer);
    });
    if(latlngs.length>=2){
      routeLine=L.polyline(latlngs,{
        color:'#c9a227',
        weight:3,
        opacity:0.85,
        dashArray:'8 8',
        lineJoin:'round'
      }).addTo(map);
    }
    return;
  }
  db.places.forEach(function(spot){
    if(!match(spot))return;
    var m=L.marker([spot.lat,spot.lng],{icon:icon(spot)});
    m.bindPopup(popup(spot));
    m.addTo(markerLayer);
  });
}
function ensureMap(){if(mapReady){try{map.invalidateSize(true);}catch(e){}renderMarkers();return;}setMapStatus('地図ライブラリを読み込み中…');ensureLeaflet().then(function(){initMap();}).catch(function(){setMapStatus('地図ライブラリの読み込みに失敗しました');});}
function initMap(){if(mapReady){map.invalidateSize(true);return;}try{map=L.map('map',{zoomControl:true}).setView([DEFAULT_LAT,DEFAULT_LNG],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OSM'}).addTo(map);markerLayer=L.layerGroup().addTo(map);map.on('popupopen',function(e){try{var node=e.popup&&e.popup._contentNode;if(!node)return;var b=node.querySelector('[data-place-detail]');if(b)b.onclick=function(){var pid=b.getAttribute('data-place-detail');try{map.closePopup();}catch(x){}openPlaceDetail(pid);};}catch(x){}});renderMarkers();mapReady=true;setTimeout(function(){map.invalidateSize(true);setMapStatus('',true);},120);setTimeout(function(){map.invalidateSize(true);},500);}catch(err){setMapStatus('初期化失敗: '+err.message);}}
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

load();initItemModal();bindZukanFilters();refreshAll();
})();
