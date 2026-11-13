(function(){
var T=window.__tabi;if(!T){console.error('tabi core missing');return;}
var modalD=document.getElementById('modal-detail');
if(!modalD)return;
var editingPlaceId=null;
function tripName(id){var db=T.db;for(var i=0;i<db.trips.length;i++)if(db.trips[i].id===id)return db.trips[i].name;return'(none)';}
function findPlace(id){var db=T.db;for(var i=0;i<db.places.length;i++)if(db.places[i].id===id)return db.places[i];return null;}
document.getElementById('btn-close-detail').onclick=function(){modalD.classList.add('hidden');};
modalD.onclick=function(e){if(e.target===modalD)modalD.classList.add('hidden');};
function openPlaceDetail(id){
  var p=findPlace(id);if(!p){T.toast('\u8a18\u9332\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093');return;}
  editingPlaceId=null;
  document.getElementById('detail-title').textContent=p.name;
  var items=T.db.items.filter(function(it){return it.placeId===p.id;});
  var ih=items.map(function(it){return'<div class="list-item" style="margin-top:6px"><div class="t">'+(it.treasure?'\ud83d\udc8e ':'')+T.esc(it.name)+'</div></div>';}).join('');
  document.getElementById('detail-body').innerHTML=
    '<div class="detail-block"><div class="detail-label">\u30ab\u30c6\u30b4\u30ea</div><div class="detail-value">'+T.esc(T.catLabel(p.cat))+'</div></div>'+
    '<div class="detail-block"><div class="detail-label">\u8a55\u4fa1</div><div class="detail-stars">'+T.starsHtml(p.stars)+'</div></div>'+
    (p.wantAgain?'<div class="detail-block"><div class="detail-value">\u2728 \u307e\u305f\u884c\u304d\u305f\u3044</div></div>':'')+
    (p.note?'<div class="detail-block"><div class="detail-label">\u30e1\u30e2</div><div class="detail-value">'+T.esc(p.note)+'</div></div>':'')+
    '<div class="detail-block"><div class="detail-label">\u65c5</div><div class="detail-value">'+T.esc(tripName(p.tripId))+'</div></div>'+
    '<div class="detail-block"><div class="detail-label">\u5ea7\u6a19</div><div class="detail-value" style="font-size:.85rem">'+p.lat.toFixed(5)+', '+p.lng.toFixed(5)+'</div></div>'+
    (ih?'<div class="detail-block"><div class="detail-label">\u304a\u571f\u7523</div>'+ih+'</div>':'')+
    '<div class="detail-actions"><button class="dq-button secondary" type="button" id="btn-detail-edit">\u7de8\u96c6</button><button class="dq-button danger" type="button" id="btn-detail-delete">\u524a\u9664</button></div>';
  modalD.classList.remove('hidden');
  document.getElementById('btn-detail-edit').onclick=function(){openEditPlace(p.id);};
  document.getElementById('btn-detail-delete').onclick=function(){deletePlace(p.id);};
}
function deletePlace(id){
  if(!confirm('\u3053\u306e\u8a18\u9332\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f\n\uff08\u7d10\u3065\u304f\u304a\u571f\u7523\u3082\u6d88\u3048\u307e\u3059\uff09'))return;
  T.db.places=T.db.places.filter(function(p){return p.id!==id;});
  T.db.items=T.db.items.filter(function(it){return it.placeId!==id;});
  T.save();T.refreshAll();modalD.classList.add('hidden');T.toast('\u524a\u9664\u3057\u307e\u3057\u305f');
}
function openEditPlace(id){
  var p=findPlace(id);if(!p)return;editingPlaceId=id;T.ensureDefaultTrip();
  document.getElementById('f-trip').innerHTML=T.db.trips.map(function(t){return'<option value="'+t.id+'"'+(t.id===p.tripId?' selected':'')+'>'+T.esc(t.name)+'</option>';}).join('');
  document.getElementById('f-cat').innerHTML=T.CATEGORIES.map(function(c){return'<option value="'+c.id+'"'+(c.id===p.cat?' selected':'')+'>'+c.label+'</option>';}).join('');
  document.getElementById('f-name').value=p.name;
  document.getElementById('f-lat').value=String(p.lat);
  document.getElementById('f-lng').value=String(p.lng);
  document.getElementById('f-note').value=p.note||'';
  document.getElementById('f-item').value='';
  document.getElementById('f-want').checked=!!p.wantAgain;
  document.getElementById('f-treasure').checked=false;
  T.starValue(p.stars||3);
  document.querySelectorAll('#f-stars .star-btn').forEach(function(b){b.classList.toggle('on',+b.dataset.s===T.starValue());});
  modalD.classList.add('hidden');T.modalR().classList.remove('hidden');
  document.querySelector('#modal-record .modal-header span').textContent='\u26ea \u8a18\u9332\u3092\u7de8\u96c6';
  document.getElementById('btn-save-record').textContent='\u5909\u66f4\u3092\u4fdd\u5b58\u3059\u308b';
}
function bindPlaceTaps(){
  document.querySelectorAll('[data-place-id]').forEach(function(el){
    el.onclick=function(){openPlaceDetail(el.getAttribute('data-place-id'));};
  });
}
var _origRefresh=T.refreshAll;
T.refreshAll=function(){
  _origRefresh();
  setTimeout(function(){
    var hr=document.getElementById('home-recent');
    var recent=T.db.places.slice().reverse().slice(0,5);
    if(recent.length&&hr){
      hr.innerHTML=recent.map(function(p){
        return'<div class="record-card tap" data-place-id="'+p.id+'"><div class="name">'+T.esc(p.name)+'</div><div class="meta">'+T.catLabel(p.cat)+' \u00b7 '+T.starsHtml(p.stars)+(p.wantAgain?' \u00b7 \u307e\u305f\u884c\u304d\u305f\u3044':'')+'</div></div>';
      }).join('');
      bindPlaceTaps();
    }
    var el=document.getElementById('quest-list');
    if(el&&T.db.trips.length){
      el.innerHTML=T.db.trips.map(function(t){
        var ps=T.db.places.filter(function(p){return p.tripId===t.id;});
        var ph=ps.length?ps.map(function(p){return'<div class="record-card tap" data-place-id="'+p.id+'" style="margin-top:6px"><div class="name">'+T.esc(p.name)+'</div><div class="meta">'+T.catLabel(p.cat)+' \u00b7 '+T.starsHtml(p.stars)+'</div></div>';}).join(''):'<div class="quest-meta" style="margin-top:6px">\u307e\u3060\u5834\u6240\u304c\u3042\u308a\u307e\u305b\u3093</div>';
        return'<div class="list-item"><div class="t">'+T.esc(t.name)+'</div><div class="m">'+(t.date||'')+' \u00b7 \u5834\u6240 '+ps.length+' \u4ef6</div>'+ph+'</div>';
      }).join('');
      bindPlaceTaps();
    }
  },0);
};
document.getElementById('btn-save-record').addEventListener('click',function(e){
  if(!editingPlaceId)return;
  e.stopImmediatePropagation();
  var name=document.getElementById('f-name').value.trim();
  if(!name){T.toast('\u5834\u6240\u306e\u540d\u524d\u3092\u5165\u308c\u3066\u306d');return;}
  var p=findPlace(editingPlaceId);if(!p)return;
  p.tripId=document.getElementById('f-trip').value||T.ensureDefaultTrip().id;
  p.name=name;p.cat=document.getElementById('f-cat').value;
  var lat=parseFloat(document.getElementById('f-lat').value),lng=parseFloat(document.getElementById('f-lng').value);
  if(!isNaN(lat))p.lat=lat;if(!isNaN(lng))p.lng=lng;
  p.stars=T.starValue();p.wantAgain=document.getElementById('f-want').checked;
  p.note=document.getElementById('f-note').value.trim();
  var iname=document.getElementById('f-item').value.trim();
  if(iname){T.db.items.push({id:T.uid(),name:iname,placeId:editingPlaceId,placeName:name,treasure:document.getElementById('f-treasure').checked,createdAt:Date.now()});T.db.exp+=document.getElementById('f-treasure').checked?20:8;}
  T.save();T.refreshAll();T.modalR().classList.add('hidden');editingPlaceId=null;
  document.querySelector('#modal-record .modal-header span').textContent='\u26ea \u6559\u4f1a\u3067 \u304d\u308d\u304f\u3059\u308b';
  document.getElementById('btn-save-record').textContent='\u5192\u967a\u306e\u66f8\u306b\u8a18\u9332\u3059\u308b';
  T.toast('\u5909\u66f4\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f');
},true);
T.refreshAll();
})();
