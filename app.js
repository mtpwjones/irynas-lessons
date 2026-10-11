(function(){
'use strict';
var D=window.DATA,view=document.getElementById('view');
var coll=new Intl.Collator('uk');
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
var dict=D.dict.slice().sort(function(a,b){return coll.compare(a.ua.replace(/[^\p{L}\p{N} ]/gu,''),b.ua.replace(/[^\p{L}\p{N} ]/gu,''))});
function firstLetter(s){var m=s.replace(/^[^\p{L}]+/u,'');return (m[0]||'#').toUpperCase()}
function say(t){try{if(!('speechSynthesis' in window))return;var u=new SpeechSynthesisUtterance(t);u.lang='uk-UA';u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function sayBtn(t){return '<button class="say" type="button" data-say="'+esc(t)+'" aria-label="Listen">&#128266;</button>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-say]');if(b){e.preventDefault();e.stopPropagation();say(b.getAttribute('data-say'))}});
function lessonChips(ls){return '<div class="ls">'+ls.map(function(n){return '<a href="#/lesson/'+n+'">Lesson '+n+'</a>'}).join('')+'</div>'}

function viewLessons(){
  var h='<h1>Lessons</h1><p class="sub">'+D.lessons.length+' lessons with Iryna: summary, key vocabulary and discussion questions.</p>';
  h+='<div class="note">Lesson numbers follow the order the files were downloaded. If any are in the wrong order, they can be renumbered.</div>';
  D.lessons.forEach(function(l){
    h+='<a class="card" href="#/lesson/'+l.n+'"><div class="lrow"><span class="num">'+l.n+'</span><div><div class="ltitle">'+esc(l.title_en)+'</div><div class="lua">'+esc(l.title_ua)+'</div></div></div><div class="chips">'+l.topics.slice(0,3).map(function(t){return '<span class="chip">'+esc(t.length>46?t.slice(0,44)+'…':t)+'</span>'}).join('')+'</div><div class="meta">'+l.key.length+' key words &middot; '+l.words.length+' more words</div></a>';
  });
  return h;
}
function viewLesson(n){
  var l=D.lessons.filter(function(x){return x.n===n})[0];if(!l)return '<p>Lesson not found. <a href="#/lessons">Back</a></p>';
  var h='<a class="back" href="#/lessons">&larr; All lessons</a><div class="lrow"><span class="num">'+l.n+'</span><div><h1 style="margin-top:0">'+esc(l.title_en)+'</h1><div class="lua">'+esc(l.title_ua)+'</div></div></div>';
  h+='<div class="chips" style="margin-bottom:6px">'+l.topics.map(function(t){return '<span class="chip">'+esc(t)+'</span>'}).join('')+'</div>';
  h+='<h2>Короткий зміст · Summary</h2><div class="card"><p class="sum-ua" lang="uk">'+esc(l.summary_ua)+sayBtn(l.summary_ua)+'</p><p class="sum-en">'+esc(l.summary)+'</p></div>';
  h+='<h2>Key vocabulary</h2><div class="card">'+l.key.map(function(k){return '<div class="v"><div class="ua">'+esc(k.ua)+sayBtn(k.ua)+'</div><div class="en">'+esc(k.en)+'</div>'+(k.ex?'<div class="ex">'+esc(k.ex)+sayBtn(k.ex)+'</div>':'')+'</div>'}).join('')+'</div>';
  h+='<h2>More words and phrases</h2><div class="card">'+l.words.map(function(k){return '<div class="v"><div class="ua">'+esc(k.ua)+sayBtn(k.ua)+'</div><div class="en">'+esc(k.en)+'</div></div>'}).join('')+'</div>';
  if(l.questions.length)h+='<h2>Discussion questions</h2><div class="card"><ul class="q">'+l.questions.map(function(q){return '<li>'+esc(q)+'</li>'}).join('')+'</ul></div>';
  h+='<div class="btns"><a class="btn ghost" style="text-align:center;text-decoration:none" href="#/dictionary?lesson='+l.n+'">Words in dictionary</a><a class="btn" style="text-align:center;text-decoration:none" href="#/practice?lesson='+l.n+'">Practise this lesson</a></div>';
  h+='<div class="pn"><a class="'+(n<=1?'off':'')+'" href="#/lesson/'+(n-1)+'">&larr; Lesson '+(n-1)+'</a><a class="'+(n>=D.lessons.length?'off':'')+'" href="#/lesson/'+(n+1)+'">Lesson '+(n+1)+' &rarr;</a></div>';
  return h;
}
var dq='',dl='',dkey=false;
function viewDictionary(params){
  if(params.lesson)dl=params.lesson;
  var h='<h1>Dictionary</h1><p class="sub">'+dict.length+' words and phrases from all '+D.lessons.length+' lessons, A&ndash;Я.</p>';
  h+='<div class="search"><input id="q" type="search" placeholder="Search Ukrainian or English" autocomplete="off" value="'+esc(dq)+'"><div class="row2"><select id="ls"><option value="">All lessons</option>'+D.lessons.map(function(l){return '<option value="'+l.n+'"'+(String(l.n)===String(dl)?' selected':'')+'>Lesson '+l.n+'</option>'}).join('')+'</select><select id="kf"><option value="">Words &amp; phrases</option><option value="1"'+(dkey?' selected':'')+'>Key words only</option></select></div></div><div class="count" id="cnt"></div><div id="list"></div><div class="rail" id="rail"></div>';
  return h;
}
function drawDict(){
  var q=dq.trim().toLowerCase(),res=dict.filter(function(e){
    if(dl&&e.lessons.indexOf(+dl)<0)return false;if(dkey&&!e.key)return false;
    return !q||e.ua.toLowerCase().indexOf(q)>=0||e.en.toLowerCase().indexOf(q)>=0;});
  var list=document.getElementById('list'),h='',cur='',letters=[];
  res.forEach(function(e){var L=firstLetter(e.ua);if(L!==cur){cur=L;letters.push(L);h+='<div class="letter" id="L-'+L+'">'+L+'</div>'}
    h+='<div class="entry"><div class="ua">'+esc(e.ua)+(e.key?'<span class="tag">key</span>':'')+sayBtn(e.ua)+'</div><div class="en">'+esc(e.en)+'</div>'+(e.ex?'<div class="ex">'+esc(e.ex)+'</div>':'')+lessonChips(e.lessons)+'</div>'});
  list.innerHTML=h||'<p class="sub">No matches.</p>';
  document.getElementById('cnt').textContent=res.length+' entr'+(res.length===1?'y':'ies');
  document.getElementById('rail').innerHTML=q?'':letters.map(function(L){return '<a href="#" data-l="'+L+'">'+L+'</a>'}).join('');
}
function bindDict(){
  var q=document.getElementById('q');q.addEventListener('input',function(){dq=q.value;drawDict()});
  document.getElementById('ls').addEventListener('change',function(e){dl=e.target.value;drawDict()});
  document.getElementById('kf').addEventListener('change',function(e){dkey=!!e.target.value;drawDict()});
  document.getElementById('rail').addEventListener('click',function(e){var a=e.target.closest('a[data-l]');if(!a)return;e.preventDefault();var t=document.getElementById('L-'+a.getAttribute('data-l'));if(t)t.scrollIntoView({block:'start'})});
  drawDict();
}
var P={deck:[],i:0,flip:false,dir:'ua',set:'all',known:store('known')||{}};
function buildDeck(){
  var set=P.set,pool=dict.filter(function(e){return set==='all'||(set==='key'?e.key:e.lessons.indexOf(+set)>=0)});
  var unseen=pool.filter(function(e){return !P.known[e.ua]});
  var d=(unseen.length?unseen:pool).slice();
  for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=d[i];d[i]=d[j];d[j]=t}
  P.deck=d.slice(0,25);P.i=0;P.flip=false;P.total=pool.length;
}
function viewPractice(params){
  if(params.lesson){P.set=params.lesson;buildDeck()}else if(!P.deck.length)buildDeck();
  return '<h1>Practice</h1><p class="sub">Flashcards from the dictionary. Tap the card to flip.</p><div class="opts"><select id="ps"><option value="all">All words</option><option value="key"'+(P.set==='key'?' selected':'')+'>Key words only</option>'+D.lessons.map(function(l){return '<option value="'+l.n+'"'+(String(P.set)===String(l.n)?' selected':'')+'>Lesson '+l.n+'</option>'}).join('')+'</select><select id="pd"><option value="ua">Ukrainian &rarr; English</option><option value="en"'+(P.dir==='en'?' selected':'')+'>English &rarr; Ukrainian</option></select></div><div id="fc"></div>';
}
function drawCard(){
  var el=document.getElementById('fc');if(!el)return;
  var c=P.deck[P.i];
  var kc=Object.keys(P.known).filter(function(k){return P.known[k]}).length;
  if(!c){el.innerHTML='<div class="card"><b>Round finished.</b><p>You marked '+kc+' of '+dict.length+' words as known so far.</p><div class="btns"><button class="btn" id="again" type="button">New round</button><button class="btn ghost" id="reset" type="button">Reset progress</button></div></div>';
    document.getElementById('again').onclick=function(){buildDeck();drawCard()};document.getElementById('reset').onclick=function(){P.known={};store('known',P.known);buildDeck();drawCard()};return}
  var front=P.dir==='ua'?c.ua:c.en,back=P.dir==='ua'?c.en:c.ua;
  el.innerHTML='<div class="prog"><i style="width:'+Math.round(P.i/P.deck.length*100)+'%"></i></div><div class="count">Card '+(P.i+1)+' of '+P.deck.length+' &middot; '+kc+' known overall</div><div class="fc"><div class="fcard" id="card" role="button" tabindex="0"><div><div class="big">'+esc(P.flip?back:front)+'</div>'+(P.flip&&c.ex?'<div class="ex" style="margin-top:12px">'+esc(c.ex)+'</div>':'')+'<div class="hint">'+(P.flip?'':'tap to flip')+(P.dir==='ua'||P.flip?' '+sayBtn(c.ua):'')+'</div></div></div></div><div class="btns"><button class="btn again" id="no" type="button">Again</button><button class="btn know" id="yes" type="button">Know it</button></div>';
  var flip=function(){P.flip=!P.flip;drawCard()};
  document.getElementById('card').onclick=function(e){if(e.target.closest('[data-say]'))return;flip()};
  document.getElementById('card').onkeydown=function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();flip()}};
  var next=function(k){P.known[c.ua]=k;store('known',P.known);P.i++;P.flip=false;drawCard()};
  document.getElementById('yes').onclick=function(){next(true)};document.getElementById('no').onclick=function(){next(false)};
}
function bindPractice(){
  document.getElementById('ps').addEventListener('change',function(e){P.set=e.target.value;buildDeck();drawCard()});
  document.getElementById('pd').addEventListener('change',function(e){P.dir=e.target.value;drawCard()});
  drawCard();
}
function route(){
  var hash=location.hash.replace(/^#/,'')||'/lessons',parts=hash.split('?'),path=parts[0],params={};
  (parts[1]||'').split('&').forEach(function(kv){if(!kv)return;var a=kv.split('=');params[a[0]]=decodeURIComponent(a[1]||'')});
  var tab='lessons',html='',post=null,m;
  if((m=path.match(/^\/lesson\/(\d+)$/))){html=viewLesson(+m[1])}
  else if(path==='/dictionary'){tab='dictionary';html=viewDictionary(params);post=bindDict}
  else if(path==='/practice'){tab='practice';html=viewPractice(params);post=bindPractice}
  else html=viewLessons();
  view.innerHTML=html;document.title=(tab==='lessons'?'Lessons':tab==='dictionary'?'Dictionary':'Practice')+" · Iryna's lessons";
  document.querySelectorAll('.tabs a').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-tab')===tab)});
  if(post)post();window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);route();
// install + offline
var deferred=null,ib=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;ib.hidden=false});
ib.addEventListener('click',function(){if(!deferred)return;deferred.prompt();deferred.userChoice.then(function(){deferred=null;ib.hidden=true})});
window.addEventListener('appinstalled',function(){ib.hidden=true});
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){navigator.serviceWorker.register('sw.js').catch(function(){})}
})();
