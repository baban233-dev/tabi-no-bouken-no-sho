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
{name:'北海道',lat:43.06,lng:141.35,zoom:8},{name:'青森県',lat:40.82,lng:140.75,zoom:10},{name:'岩手県',lat:39.70,lng:141.15,zoom:10},{name:'宮城県',lat:38.27,lng:140.87,zoom:10},{name:'秋田県',lat:39.72,lng:140.10,zoom:10},{name:'山形県',lat:38.24,lng:140.36,zoom:10},{name:'福島県',lat:37.75,lng:140.47,zoom:10},
{name:'茨城県',lat:36.34,lng:140.45,zoom:10},{name:'栃木県',lat:36.57,lng:139.88,zoom:10},{name:'群馬県',lat:36.39,lng:139.06,zoom:10},{name:'埼玉県',lat:35.86,lng:139.65,zoom:11},{name:'千葉県',lat:35.61,lng:140.12,zoom:11},{name:'東京都',lat:35.68,lng:139.76,zoom:11},{name:'神奈川県',lat:35.45,lng:139.64,zoom:11},
{name:'新潟県',lat:37.90,lng:139.06,zoom:10},{name:'富山県',lat:36.70,lng:137.21,zoom:10},{name:'石川県',lat:36.59,lng:136.63,zoom:10},{name:'福井県',lat:36.07,lng:136.22,zoom:10},{name:'山梨県',lat:35.66,lng:138.57,zoom:10},{name:'長野県',lat:36.65,lng:138.18,zoom:10},{name:'岐阜県',lat:35.39,lng:136.72,zoom:10},{name:'静岡県',lat:34.98,lng:138.38,zoom:10},{name:'愛知県',lat:35.18,lng:136.91,zoom:11},{name:'三重県',lat:34.73,lng:136.51,zoom:10},
{name:'滋賀県',lat:35.00,lng:135.87,zoom:10},{name:'京都府',lat:35.01,lng:135.77,zoom:11},{name:'大阪府',lat:34.69,lng:135.50,zoom:11},{name:'兵庫県',lat:34.69,lng:135.20,zoom:11},{name:'奈良県',lat:34.69,lng:135.83,zoom:11},{name:'和歌山県',lat:34.23,lng:135.17,zoom:10},
{name:'鳥取県',lat:35.50,lng:134.24,zoom:10},{name:'島根県',lat:35.47,lng:133.05,zoom:10},{name:'岡山県',lat:34.66,lng:133.92,zoom:10},{name:'広島県',lat:34.40,lng:132.46,zoom:11},{name:'山口県',lat:34.19,lng:131.47,zoom:10},
{name:'徳島県',lat:34.07,lng:134.56,zoom:10},{name:'香川県',lat:34.34,lng:134.04,zoom:10},{name:'愛媛県',lat:33.84,lng:132.77,zoom:10},{name:'高知県',lat:33.55,lng:133.53,zoom:10},
{name:'福岡県',lat:33.59,lng:130.40,zoom:11},{name:'佐賀県',lat:33.25,lng:130.30,zoom:10},{name:'長崎県',lat:32.75,lng:129.87,zoom:10},{name:'熊本県',lat:32.79,lng:130.74,zoom:10},{name:'大分県',lat:33.24,lng:131.61,zoom:10},{name:'宮崎県',lat:31.91,lng:131.42,zoom:10},{name:'鹿児島県',lat:31.56,lng:130.56,zoom:10},{name:'沖縄県',lat:26.21,lng:127.68,zoom:10}
];
var PREF_TOTALS={'北海道':179,'青森県':40,'岩手県':33,'宮城県':35,'秋田県':25,'山形県':35,'福島県':59,'茨城県':44,'栃木県':25,'群馬県':35,'埼玉県':63,'千葉県':54,'東京都':62,'神奈川県':33,'新潟県':30,'富山県':15,'石川県':19,'福井県':17,'山梨県':27,'長野県':77,'岐阜県':42,'静岡県':35,'愛知県':54,'三重県':29,'滋賀県':19,'京都府':26,'大阪府':43,'兵庫県':41,'奈良県':39,'和歌山県':30,'鳥取県':19,'島根県':19,'岡山県':27,'広島県':23,'山口県':19,'徳島県':24,'香川県':17,'愛媛県':20,'高知県':34,'福岡県':60,'佐賀県':20,'長崎県':21,'熊本県':45,'大分県':18,'宮崎県':26,'鹿児島県':43,'沖縄県':41};
var TILE_POS={'北海道':[10,0],'青森県':[10,1],'秋田県':[9,2],'岩手県':[10,2],'山形県':[9,3],'宮城県':[10,3],'福島県':[10,4],'茨城県':[10,5],'栃木県':[9,5],'群馬県':[8,5],'新潟県':[8,4],'埼玉県':[9,6],'千葉県':[10,6],'東京都':[9,7],'神奈川県':[8,7],'富山県':[7,4],'石川県':[6,4],'福井県':[6,5],'長野県':[7,5],'山梨県':[8,6],'岐阜県':[6,6],'静岡県':[7,6],'愛知県':[6,7],'三重県':[6,8],'滋賀県':[5,6],'京都府':[5,7],'大阪府':[5,8],'兵庫県':[4,7],'奈良県':[4,8],'和歌山県':[5,9],'鳥取県':[3,6],'島根県':[2,6],'岡山県':[3,7],'広島県':[2,7],'山口県':[1,7],'香川県':[3,9],'徳島県':[4,9],'愛媛県':[2,9],'高知県':[3,10],'福岡県':[1,8],'佐賀県':[0,8],'長崎県':[0,9],'熊本県':[1,9],'大分県':[2,8],'宮崎県':[2,10],'鹿児島県':[1,10],'沖縄県':[0,11]};
var PARTY_MEMBERS=['かずや','ひとみ','れん','あやみ'];
var MILESTONES=[10,50,100];
var DEFAULT_LAT=35.45, DEFAULT_LNG=139.64;
var map=null,mapReady=false,markerLayer=null;
var filters={categories:{},wantAgain:false,treasure:false,tripId:'',q:''};
var starValue=3;
var db={trips:[],places:[],items:[],exp:0,milestone:0};

function uid(){return 'id_'+Date.now()+'_'+Math.floor(Math.random()*10000);}
function load(){
  try{var raw=localStorage.getItem(STORAGE_KEY);if(raw){var o=JSON.parse(raw);db.trips=o.trips||[];db.places=o.places||[];db.items=o.items||[];db.exp=o.exp||0;db.milestone=o.milestone||0;}}
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
function metalBadgeHtml(){return '<span class="metal-badge"><img class="metal-ico" src="assets/metal_slime.png" alt="" onerror="this.remove()"> メタルスライム級</span>';}
function priceHtml(v){var n=parseInt(v,10);if(isNaN(n)||n<=0)return'';return '¥'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
function newItem(name,place,treasure){return{id:uid(),name:name,placeId:place.id,placeName:place.name,treasure:!!treasure,cat:'',price:'',forWhom:'',stars:0,note:'',photos:[],createdAt:Date.now()};}
function parsePhotos(text){return String(text||'').split(/\n/).map(function(s){return s.trim();}).filter(function(s){return !!s;});}
function photosHtml(photos,cls){if(!photos||!photos.length)return'';return '<div class="photo-gallery">'+photos.map(function(u){return '<img class="'+(cls||'photo-img')+'" src="'+esc(u)+'" loading="lazy" onerror="this.style.display=\'none\'">';}).join('')+'</div>';}
function townsMap(){var m={};db.places.forEach(function(p){var c=(p.city||'').trim();if(c)m[c]={city:c,pref:p.pref||''};});return m;}
function townsCount(){return Object.keys(townsMap()).length;}
function conquestByPref(){var out={};var seen={};db.places.forEach(function(p){var c=(p.city||'').trim();if(!c||seen[c])return;seen[c]=1;var pref=p.pref||'（未設定）';if(!out[pref])out[pref]=[];out[pref].push(c);});return out;}
function cmpPlace(a,b){var da=a.date||'',dbb=b.date||'';if(da&&dbb&&da!==dbb)return da<dbb?-1:1;if(da&&!dbb)return -1;if(!da&&dbb)return 1;return (a.createdAt||0)-(b.createdAt||0);}
function sortedTripPlaces(tripId){return db.places.filter(function(p){return p.tripId===tripId;}).slice().sort(cmpPlace);}
function tripPeriod(t){if(!t)return'';if(t.date&&t.endDate&&t.endDate!==t.date)return t.date+' 〜 '+t.endDate;return t.date||'';}
function tripMetaLine(t){var parts=[];if(t.type)parts.push(t.type);var per=tripPeriod(t);if(per)parts.push(per);if(t.party&&t.party.length)parts.push('👥 '+t.party.join('・'));return parts.join(' · ');}
function checkMilestone(){var t=townsCount();for(var i=0;i<MILESTONES.length;i++){var m=MILESTONES[i];if(t>=m&&(db.milestone||0)<m){db.milestone=m;save();showCelebration(m);return;}}}
function showCelebration(m){var cm=document.getElementById('modal-celebration');if(!cm)return;document.getElementById('celeb-msg').innerHTML='制覇した町が <b>'+m+'町</b> に届いたよ！<br>キングスライムが お祝いに来てくれた！';cm.classList.remove('hidden');}
function tripName(id){for(var i=0;i<db.trips.length;i++)if(db.trips[i].id===id)return db.trips[i].name;return'(なし)';}

function refreshHome(){
  document.getElementById('st-lv').textContent=levelFromExp(db.exp);
  document.getElementById('st-places').textContent=db.places.length;
  var treasures=db.items.filter(function(it){return it.treasure;}).length;
  document.getElementById('st-treasure').textContent=treasures;
  var towns=townsCount();
  document.getElementById('st-towns').textContent=towns;
  document.getElementById('st-towns2').textContent=towns;
  var pct=expInLevel(db.exp);
  document.getElementById('st-expbar').style.width=pct+'%';
  document.getElementById('st-exptext').textContent=pct+' / 100';
  var msg=document.getElementById('slime-msg');
  if(!db.places.length)msg.innerHTML='ようこそ！ここは「旅の冒険の書」だよ。<br>まだ記録がないようだね。<br>右下の「＋」から、教会できろくしてみよう！';
  else msg.innerHTML='記録が <b>'+db.places.length+'</b> 件、制覇した町は <b>'+towns+'</b> 町、たからものは '+treasures+' 個だよ！'+(towns<db.places.length?'<br>場所に「市区町村」を入れると町に数えるよ。':'');
  var ht=document.getElementById('home-trips');
  if(!db.trips.length)ht.innerHTML='<div class="quest-card dummy"><div>（まだ旅がありません）</div><div class="quest-meta">旅タブから作成できます</div></div>';
  else {
    ht.innerHTML=db.trips.slice(0,3).map(function(t){
      var n=db.places.filter(function(p){return p.tripId===t.id;}).length;
      var meta=tripMetaLine(t);
      return '<div class="quest-card tap" data-trip-id="'+t.id+'"><div class="name">'+esc(t.name)+'</div><div class="quest-meta">'+(meta?esc(meta)+' · ':'')+'場所 '+n+' 件</div></div>';
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
  var byPref=conquestByPref();
  var prefNames=Object.keys(byPref);
  if(!prefNames.length)document.getElementById('pref-progress').innerHTML='<div class="pref-row"><span>まだ制覇した町がありません</span><span></span></div>';
  else document.getElementById('pref-progress').innerHTML=prefNames.slice(0,5).map(function(pn){var total=PREF_TOTALS[pn];return '<div class="pref-row"><span>'+esc(pn)+'</span><span>'+byPref[pn].length+(total?' / '+total:'')+'</span></div>';}).join('');
  var ft=document.getElementById('filter-trip');
  if(ft){var cur=ft.value;ft.innerHTML='<option value="">すべての旅</option>'+db.trips.map(function(t){return '<option value="'+t.id+'">'+esc(t.name)+'</option>';}).join('');ft.value=cur;if(ft.value!==cur)filters.tripId='';}
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
    var meta=tripMetaLine(t);
    return '<div class="list-item tap trip-card" data-trip-id="'+t.id+'">'+ 
      '<div class="t">'+esc(t.name)+'</div>'+
      '<div class="m">'+(meta?esc(meta)+' · ':'')+'場所 '+places.length+' 件</div>'+
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
  var places=sortedTripPlaces(tripId);
  var el=document.getElementById('quest-list');
  var meta=tripMetaLine(t);
  var header='<div class="timeline-header">'+
    '<button type="button" class="back-btn" id="btn-trip-back">‹ 一覧に戻る</button>'+
    '<div class="timeline-title">'+esc(t.name)+'</div>'+
    '<div class="timeline-meta">'+(meta?esc(meta)+' · ':'')+'場所 '+places.length+' 件</div>'+
    (t.note?'<div class="timeline-meta" style="margin-top:4px">'+esc(t.note)+'</div>':'')+
    (t.album?'<div style="margin-top:6px"><a class="album-link" href="'+esc(t.album)+'" target="_blank" rel="noopener">📷 Googleフォトのアルバムを開く</a></div>':'')+
    '<div class="detail-actions" style="margin-top:10px"><button type="button" class="dq-button secondary" id="btn-trip-edit">旅を編集</button></div>'+
    (places.length?'<button type="button" class="dq-button secondary route-map-btn" id="btn-show-route">🗺️ 地図でルートを見る</button>':'')+
    '</div>';
  if(!places.length){
    el.innerHTML=header+'<div class="empty-message">この旅にはまだ場所がありません<br>右下の「＋」から記録してみよう</div>';
  }else{
    var tl='<div class="timeline">';
    places.forEach(function(p,i){
      var num=i+1;
      var dateStr=p.date?formatDate(Date.parse(p.date)):formatDate(p.createdAt);
      tl+='<div class="timeline-item tap" data-place-id="'+p.id+'">'+ 
        '<div class="tl-rail"><div class="tl-num">'+num+'</div>'+(i<places.length-1?'<div class="tl-line"></div>':'')+'</div>'+
        '<div class="tl-card">'+
          ((p.photos&&p.photos.length)?'<img class="tl-thumb" src="'+esc(p.photos[0])+'" loading="lazy" onerror="this.style.display=\'none\'">':'')+
          '<div class="tl-name">'+esc(p.name)+'</div>'+
          '<div class="tl-meta">'+catLabel(p.cat)+' · '+starsHtml(p.stars)+(p.wantAgain?' · また行きたい':'')+(p.city?' · '+esc(p.city):'')+(dateStr?' · '+dateStr:'')+'</div>'+
          (p.note?'<div class="tl-note">'+esc(p.note)+'</div>':'')+
        '</div></div>';
    });
    tl+='</div>';
    el.innerHTML=header+tl;
    bindPlaceTaps();
  }
  var back=document.getElementById('btn-trip-back');
  if(back)back.onclick=function(){refreshQuests();};
  var te=document.getElementById('btn-trip-edit');
  if(te)te.onclick=function(){openTripForm(tripId);};
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
    ((it.photos&&it.photos.length)?'<div class="detail-block"><div class="detail-label">写真</div>'+photosHtml(it.photos)+'</div>':'')+
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
  document.getElementById('i-photos').value=(it.photos||[]).join('\n');
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
    it.photos=parsePhotos(document.getElementById('i-photos').value);
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
var editingTripId=null;
function fillPartyChecks(selected){
  var box=document.getElementById('t-party');
  box.innerHTML=PARTY_MEMBERS.map(function(m){return '<label class="check-row party-check"><input type="checkbox" value="'+m+'"'+(selected&&selected.indexOf(m)>=0?' checked':'')+'> '+m+'</label>';}).join('');
}
function openTripForm(tripId){
  editingTripId=tripId||null;
  var t=tripId?findTrip(tripId):null;
  document.getElementById('trip-modal-title').textContent=t?'🍺 旅を編集':'🍺 新しい旅';
  document.getElementById('btn-save-trip').textContent=t?'変更を保存する':'旅を作る';
  document.getElementById('btn-delete-trip').classList.toggle('hidden',!t);
  document.getElementById('t-name').value=t?t.name:'';
  document.getElementById('t-type').value=t?(t.type||'家族旅行'):'家族旅行';
  document.getElementById('t-date').value=t?(t.date||''):'';
  document.getElementById('t-end').value=t?(t.endDate||''):'';
  document.getElementById('t-album').value=t?(t.album||''):'';
  document.getElementById('t-note').value=t?(t.note||''):'';
  fillPartyChecks(t?t.party:null);
  modalT.classList.remove('hidden');
}
document.getElementById('btn-new-trip').onclick=function(){openTripForm(null);};
function fillPrefSelect(sel,value){
  sel.innerHTML='<option value="">（未選択）</option>'+PREFS.map(function(p){return '<option value="'+p.name+'">'+p.name+'</option>';}).join('');
  sel.value=value||'';
}
function openRecordForm(){
  ensureDefaultTrip();
  var sel=document.getElementById('f-trip');
  sel.innerHTML=db.trips.map(function(t){return '<option value="'+t.id+'">'+esc(t.name)+'</option>';}).join('');
  var cat=document.getElementById('f-cat');
  cat.innerHTML=CATEGORIES.map(function(c){return '<option value="'+c.id+'">'+c.label+'</option>';}).join('');
  document.getElementById('f-name').value='';
  document.getElementById('f-lat').value='';
  document.getElementById('f-lng').value='';
  document.getElementById('f-date').value='';
  fillPrefSelect(document.getElementById('f-pref'),'');
  document.getElementById('f-city').value='';
  document.getElementById('f-address').value='';
  document.getElementById('f-url').value='';
  document.getElementById('f-photos').value='';
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
  var party=[];
  document.querySelectorAll('#t-party input[type="checkbox"]').forEach(function(c){if(c.checked)party.push(c.value);});
  var data={name:name,type:document.getElementById('t-type').value,date:document.getElementById('t-date').value||'',endDate:document.getElementById('t-end').value||'',party:party,album:document.getElementById('t-album').value.trim(),note:document.getElementById('t-note').value.trim()};
  if(data.endDate&&data.date&&data.endDate<data.date){toast('終了日が開始日より前になっています');return;}
  if(editingTripId){
    var t=findTrip(editingTripId);
    if(t){for(var k in data)t[k]=data[k];}
    save();refreshAll();modalT.classList.add('hidden');editingTripId=null;toast('旅を変更しました');return;
  }
  data.id=uid();
  db.trips.push(data);
  save();refreshAll();modalT.classList.add('hidden');toast('旅を作ったよ！');
};
document.getElementById('btn-delete-trip').onclick=function(){
  if(!editingTripId)return;
  var t=findTrip(editingTripId);if(!t)return;
  var places=db.places.filter(function(p){return p.tripId===t.id;});
  var pids=places.map(function(p){return p.id;});
  var items=db.items.filter(function(it){return pids.indexOf(it.placeId)>=0;});
  if(!confirm('旅「'+t.name+'」を削除しますか？\n場所 '+places.length+' 件とお土産 '+items.length+' 件も一緒に消えます。'))return;
  db.items=db.items.filter(function(it){return pids.indexOf(it.placeId)<0;});
  db.places=db.places.filter(function(p){return p.tripId!==t.id;});
  db.trips=db.trips.filter(function(x){return x.id!==t.id;});
  if(routeTripId===t.id)routeTripId=null;
  currentTripId=null;
  save();refreshAll();modalT.classList.add('hidden');editingTripId=null;toast('旅を削除しました');
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
    (p.date?'<div class="detail-block"><div class="detail-label">行った日</div><div class="detail-value">'+esc(p.date)+'</div></div>':'')+
    ((p.pref||p.city)?'<div class="detail-block"><div class="detail-label">市区町村</div><div class="detail-value">'+esc((p.pref||'')+' '+(p.city||''))+'</div></div>':'')+
    (p.address?'<div class="detail-block"><div class="detail-label">住所</div><div class="detail-value">'+esc(p.address)+'</div></div>':'')+
    (p.url?'<div class="detail-block"><div class="detail-label">紹介URL</div><div class="detail-value" style="font-size:.85rem"><a class="album-link" href="'+esc(p.url)+'" target="_blank" rel="noopener">'+esc(p.url)+'</a></div></div>':'')+
    ((p.photos&&p.photos.length)?'<div class="detail-block"><div class="detail-label">写真</div>'+photosHtml(p.photos)+'</div>':'')+
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
  document.getElementById('f-date').value=p.date||'';
  fillPrefSelect(document.getElementById('f-pref'),p.pref||'');
  document.getElementById('f-city').value=p.city||'';
  document.getElementById('f-address').value=p.address||'';
  document.getElementById('f-url').value=p.url||'';
  document.getElementById('f-photos').value=(p.photos||[]).join('\n');
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
    if(p){p.tripId=tripId;p.name=name;p.cat=document.getElementById('f-cat').value;p.lat=lat;p.lng=lng;p.stars=starValue;p.wantAgain=document.getElementById('f-want').checked;p.note=document.getElementById('f-note').value.trim();p.date=document.getElementById('f-date').value||'';p.pref=document.getElementById('f-pref').value;p.city=document.getElementById('f-city').value.trim();p.address=document.getElementById('f-address').value.trim();p.url=document.getElementById('f-url').value.trim();p.photos=parsePhotos(document.getElementById('f-photos').value);}
    var iname=document.getElementById('f-item').value.trim();
    if(iname){db.items.push(newItem(iname,{id:editingPlaceId,name:name},document.getElementById('f-treasure').checked));db.exp+=document.getElementById('f-treasure').checked?20:8;}
    save();refreshAll();modalR.classList.add('hidden');editingPlaceId=null;
    document.querySelector('#modal-record .modal-header span').textContent='⛪ 教会で きろくする';
    document.getElementById('btn-save-record').textContent='冒険の書に記録する';
    toast('変更を保存しました');checkMilestone();return;
  }
  var cityVal=document.getElementById('f-city').value.trim();
  var isNewTown=!!cityVal&&!db.places.some(function(x){return (x.city||'').trim()===cityVal;});
  var place={id:uid(),tripId:tripId,name:name,cat:document.getElementById('f-cat').value,lat:lat,lng:lng,stars:starValue,wantAgain:document.getElementById('f-want').checked,note:document.getElementById('f-note').value.trim(),date:document.getElementById('f-date').value||'',pref:document.getElementById('f-pref').value,city:cityVal,address:document.getElementById('f-address').value.trim(),url:document.getElementById('f-url').value.trim(),photos:parsePhotos(document.getElementById('f-photos').value),createdAt:Date.now()};
  db.places.push(place);db.exp+=15+(place.wantAgain?5:0)+(isNewTown?30:0);
  var iname2=document.getElementById('f-item').value.trim();
  if(iname2){db.items.push(newItem(iname2,place,document.getElementById('f-treasure').checked));db.exp+=document.getElementById('f-treasure').checked?20:8;}
  save();refreshAll();modalR.classList.add('hidden');toast(isNewTown?'新しい町を制覇！（+30 EXP）':'冒険の書に記録しました！');checkMilestone();
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
function popup(spot){return((spot.photos&&spot.photos.length)?'<img class="pin-popup-img" src="'+esc(spot.photos[0])+'" onerror="this.style.display=\'none\'">':'')+'<div class="pin-popup-name">'+esc(spot.name)+'</div><div class="pin-popup-meta">'+catLabel(spot.cat)+(spot.wantAgain?' · また行きたい':'')+'</div><div class="pin-popup-stars">'+starsHtml(spot.stars)+'</div>'+(spot.note?'<div class="pin-popup-meta">'+esc(spot.note)+'</div>':'')+(isMetalPlace(spot)?'<div style="margin-top:4px">'+metalBadgeHtml()+'</div>':'')+'<button type="button" class="pin-detail-btn" data-place-detail="'+spot.id+'">詳細を見る</button>';}
function match(spot){var any=false,ok=false;for(var k in filters.categories){if(filters.categories[k]){any=true;if(spot.cat===k)ok=true;}}if(any&&!ok)return false;if(filters.wantAgain&&!spot.wantAgain)return false;if(filters.tripId&&spot.tripId!==filters.tripId)return false;if(filters.q&&(spot.name||'').indexOf(filters.q)<0)return false;if(filters.treasure){var has=db.items.some(function(it){return it.placeId===spot.id&&it.treasure;});if(!has)return false;}return true;}
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
    var places=sortedTripPlaces(routeTripId);
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
document.getElementById('btn-filter-apply').onclick=function(){filters.tripId=document.getElementById('filter-trip').value||'';filters.q=document.getElementById('filter-q').value.trim();renderMarkers();closePanels();};
document.getElementById('btn-filter-reset').onclick=function(){filters={categories:{},wantAgain:false,treasure:false,tripId:'',q:''};document.querySelectorAll('#panel-sakusen .chip').forEach(function(c){c.classList.remove('active');});document.getElementById('filter-trip').value='';document.getElementById('filter-q').value='';renderMarkers();};

function renderConquest(){
  var towns=townsCount();
  document.getElementById('cq-towns').textContent=towns;
  var byPref=conquestByPref();
  var names=Object.keys(byPref);
  document.getElementById('cq-summary').innerHTML=names.length?names.map(function(pn){var total=PREF_TOTALS[pn];return '<div class="pref-row"><span>'+esc(pn)+'</span><span>'+byPref[pn].length+(total?' / '+total:'')+'</span></div>';}).join(''):'<div class="pref-row"><span>まだ制覇した町がありません</span><span></span></div>';
  var tm=document.getElementById('tile-map');
  tm.innerHTML=PREFS.map(function(p){
    var pos=TILE_POS[p.name]||[0,0];
    var cnt=byPref[p.name]?byPref[p.name].length:0;
    var total=PREF_TOTALS[p.name]||0;
    var lv=!cnt?0:(total&&cnt/total>=0.5?3:(cnt>=3?2:1));
    return '<button type="button" class="tile lv'+lv+'" data-pref="'+p.name+'" style="grid-column:'+(pos[0]+1)+';grid-row:'+(pos[1]+1)+'" title="'+p.name+'">'+p.name.replace(/県|府/,'').slice(0,3)+'<span class="tile-num">'+(cnt?cnt:'')+'</span></button>';
  }).join('');
  document.getElementById('cq-detail').innerHTML='';
  tm.querySelectorAll('[data-pref]').forEach(function(b){
    b.onclick=function(){
      var pn=b.getAttribute('data-pref');
      var list=byPref[pn]||[];
      document.getElementById('cq-detail').innerHTML='<div class="detail-block" style="margin-top:12px"><div class="detail-label">'+esc(pn)+'（'+list.length+'町）</div><div class="detail-value">'+(list.length?list.map(function(c){return esc(c);}).join('、'):'まだ制覇した町はありません')+'</div></div>';
    };
  });
}
function initConquest(){
  var cm=document.getElementById('modal-conquest');
  document.getElementById('btn-conquest-open').onclick=function(){renderConquest();cm.classList.remove('hidden');};
  document.getElementById('btn-close-conquest').onclick=function(){cm.classList.add('hidden');};
  cm.onclick=function(e){if(e.target===cm)cm.classList.add('hidden');};
  var cel=document.getElementById('modal-celebration');
  document.getElementById('btn-celeb-close').onclick=function(){cel.classList.add('hidden');};
  cel.onclick=function(e){if(e.target===cel)cel.classList.add('hidden');};
}
function initDataTools(){
  document.getElementById('btn-export').onclick=function(){
    try{
      var blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='tabi-bouken-backup.json';
      document.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);
      toast('書き出しました');
    }catch(e){toast('書き出しに失敗しました');}
  };
  var fi=document.getElementById('file-import');
  document.getElementById('btn-import').onclick=function(){fi.value='';fi.click();};
  fi.onchange=function(){
    var f=fi.files&&fi.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(){
      try{
        var o=JSON.parse(r.result);
        if(!o||!Array.isArray(o.trips)||!Array.isArray(o.places)||!Array.isArray(o.items))throw new Error('bad');
        if(!confirm('今のデータを、読み込んだデータで上書きしますか？'))return;
        db.trips=o.trips;db.places=o.places;db.items=o.items;db.exp=o.exp||0;db.milestone=o.milestone||0;
        routeTripId=null;currentTripId=null;
        save();refreshAll();toast('読み込みました');checkMilestone();
      }catch(e){toast('読み込めませんでした（ファイル形式が違います）');}
    };
    r.readAsText(f);
  };
  document.getElementById('btn-wipe').onclick=function(){
    if(!confirm('全データを消しますか？\n旅・場所・お土産がすべて消えます。'))return;
    if(!confirm('本当に消しますか？（元に戻せません。先に書き出しをおすすめします）'))return;
    db={trips:[],places:[],items:[],exp:0,milestone:0};
    routeTripId=null;currentTripId=null;
    try{localStorage.removeItem(STORAGE_KEY);}catch(e){}
    save();refreshAll();toast('全データを消しました');
  };
}

load();initItemModal();bindZukanFilters();initConquest();initDataTools();refreshAll();
})();
