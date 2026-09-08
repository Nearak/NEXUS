'use strict';
/* ============================================================
   NEXUS-7 — engine.js v12 (نظام FACTS محصّن)
   إصلاحات هذه النسخة:
   1) كتابة الحقائق لا تضيع أبداً — buffer مؤجل إن لم يكن جاهزاً
   2) فحص مزدوج: فوري بعد كل كتابة + دوري 400ms
   3) جسر قصة موحد على ST_TEXT بنقاط استدعاء صريحة بعد كل نجاح
   4) كل الحالة موحدة على World (لا S.old)
   5) NET-3D مطوّر: نجوم، جزيئات بيانات، هالات، نبض
   ============================================================ */

const IMG={camCar:'assests/car1p.png',driver:'assests/person1p.png'};

/* ============ أدوات ============ */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=(a,b)=>a+Math.random()*(b-a);
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ============ نواة FACTS المحصّنة ============ */
const Facts={
  data:{},
  ready:false,          // يصير true بعد أول bootSeq
  pending:[],           // حقائق كُتبت قبل الجاهزية — تُعاد كتابتها
  set(name,val){
    this.data[name]=val;
    if(!this.ready){this.pending.push([name,val]);return false;}
    return true;
  },
  flush(){              // إعادة كتابة الحقائق المعلّقة بعد الجاهزية
    this.ready=true;
    const p=this.pending;this.pending=[];
    p.forEach(([k,v])=>{this.data[k]=v;});
    this.checkAll();
  },
  get(name){return this.data[name];},
  checkAll(){
    const d=(typeof NIGHTS!=='undefined')?null:NIGHTS['n'+World.night];
    if(!d||!d.goals)return;
    let changed=false;
    d.goals.forEach(g=>{
      if(g.done||!g.need)return;
      let ok=true;
      for(const fact in g.need){
        const want=g.need[fact],got=this.data[fact];
        if(g.min===true){ if((got||0)<want){ok=false;break;} }
        else if(got!==want){ok=false;break;}
      }
      if(ok){
        g.done=true;changed=true;
        const li=$('#obj-'+g.id);if(li)li.classList.add('done');
        tone(740,.07,'triangle',.045);
        const dn=d.goals.filter(x=>x.done).length;
        toast('هدف مكتمل','سجل المهمة: '+dn+'/'+d.goals.length,'good');
        if(g.clues)g.clues.forEach(cid=>addClue(cid));
        storyTrigger(g.id);
      }
    });
    if(changed){persist();refreshQuick();}
  },
  reset(){this.data={};this.pending=[];}
};
/* الفحص الدوري — شبكة الأمان */
setInterval(()=>{try{Facts.checkAll();}catch(e){console.error('[Facts]',e);}},400);

/* ============ قراءة النظام ============ */
function nightDef(){return (typeof NIGHTS!=='undefined')&&NIGHTS['n'+World.night];}
function goalById(id){const d=nightDef();return d&&d.goals?d.goals.find(g=>g.id===id):null;}
function goalDone(id){const g=goalById(id);return !!(g&&g.done);}
function canSendNow(){const d=nightDef();return d&&d.goals?d.goals.every(g=>g.done):false;}
function missingForSend(){
  const d=nightDef();if(!d)return'—';
  const m=(d.goals||[]).filter(g=>!g.done).map(g=>(d.hints&&d.hints[g.id])?d.hints[g.id].split('—')[0].split('.')[0]:g.id);
  return m.length?m.join(' · '):'—';
}
function storyHint(){
  const d=nightDef();if(!d||!World.flags.live)return;
  const o=(d.goals||[]).find(g=>!g.done);
  if(!o)return;
  say('توجيه: '+((d.hints&&d.hints[o.id])||'اتبع سجل المهمة.'));
}
function renderObj(){
  const d=nightDef();
  const pool=(d&&d.goals)?d.goals:[];
  $('#phObj').innerHTML=pool.length
    ?pool.map(o=>'<li id="obj-'+o.id+'" class="'+(o.done?'done':'')+'"><span class="tick"></span><span>'+o.t+'</span></li>').join('')
    :'<li style="color:var(--muted)"><span class="tick"></span><span>لا مهمة نشطة — بانتظار اتصال المشرف…</span></li>';
}

/* ============ جسر القصة — نقاط استدعاء صريحة بعد كل نجاح ============ */
function storyTrigger(goalId){
  const key='n'+World.night;
  const T=ST_TEXT[key];if(!T)return;
  const map={
    n1:{g_hydra:null,g_conn:null,g_log:null,g_plate:null,g_root:null,g_enc:null,g_key:null,g_board:null},
    n2:{g_mrq1:'grab1',g_mrq2:'grab2'},
    n3:{g_lynx1:'dossiers',g_social:null,g_router:'router',g_crack:'cookies',g_login:'login'}
  };
  const m=map[key];if(!m)return;
  const textKey=m[goalId];
  if(textKey&&T[textKey]){
    sayLines(T[textKey]).catch(e=>console.error('[STORY:'+key+'/'+textKey+']',e));
  }
}
function beat(name){
  const key='n'+World.night;
  const T=ST_TEXT[key];if(!T)return;
  if(name==='start'){
    World.flags.live=true;
    renderObj();refreshQuick();setPhoneView('chat');
    return sayLines(T.start).catch(e=>console.error('[STORY:start]',e));
  }
  if(T[name]&&World.flags.live)return sayLines(T[name]).catch(e=>console.error('[STORY:'+key+'/'+name+']',e));
}
async function sayLines(lines,who){for(const L of lines||[])await say(L,who);}

/* ============ العالم ============ */
const World={
  night:1,
  gSec:2*3600+58*60,
  files:['README.txt'],
  trash:[],
  scanDone:false,
  host:null,
  board:{},
  flags:{live:false,sessionStarted:0,nightDone:0,shipmentShown:0,n3ring:0,camShown:0,driverShown:0,declined:0,routerCracked:0,hash:0,hydraDone:0,rootDone:false,caseDecrypted:false,cookiesDecrypted:false}
};
function clockStr(){const p=n=>String(n).padStart(2,'0');const g=World.gSec;return p(Math.floor(g/3600)%24)+':'+p(Math.floor(g/60)%60)+':'+p(g%60);}

/* ============ الصوت ============ */
let AC=null,gMaster=null,muted=false;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();gMaster=AC.createGain();gMaster.gain.value=.55;gMaster.connect(AC.destination);}catch(e){}}
function tone(f=880,dur=.07,type='square',vol=.05,delay=0,slideTo=0){
  if(!AC||muted)return;const t=AC.currentTime+delay;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);
  if(slideTo)o.frequency.exponentialRampToValueAtTime(Math.max(40,slideTo),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(gMaster);o.start(t);o.stop(t+dur+.02);
}
const sfx={
  key(){tone(1250+Math.random()*650,.016,'square',.011);},
  ok(){[523,659,880].forEach((f,i)=>tone(f,.1,'triangle',.05,i*.09));},
  msg(){tone(620,.09,'sine',.05);tone(930,.12,'sine',.05,.1);},
  ring(){for(let i=0;i<3;i++){tone(1200,.1,'sine',.055,i*.24);tone(950,.1,'sine',.055,i*.24+.12);}},
  err(){tone(180,.22,'sawtooth',.06);tone(130,.3,'sawtooth',.05,.09);},
  tick(){tone(1800+Math.random()*300,.02,'square',.012);},
  conn(){[440,660,880].forEach((f,i)=>tone(f,.11,'sine',.05,i*.1));},
  unlock(){[880,1175,1568,2093].forEach((f,i)=>tone(f,.12,'triangle',.055,i*.09));},
  warn(){tone(220,.16,'square',.045);},
  pop(){tone(700,.05,'sine',.035);tone(940,.06,'sine',.03,.05);},
  shutter(){tone(1600,.04,'square',.05);tone(600,.08,'sine',.05,.06);},
  shutdown(){tone(660,.5,'sine',.06,0,80);tone(330,.7,'triangle',.05,.15,50);}
};
 $('#tbSound').onclick=()=>{muted=!muted;$('#tbSound').classList.toggle('off',muted);if(!muted)tone(880,.06,'sine',.05);};

/* ============ التوست + Glitch ============ */
function toast(title,msg,kind='info'){
  const t=document.createElement('div');t.className='toast '+kind;
  t.innerHTML='<b>'+esc(title)+'</b><span>'+esc(msg)+'</span>';
  $('#toasts').appendChild(t);requestAnimationFrame(()=>t.classList.add('on'));
  setTimeout(()=>{t.classList.remove('on');setTimeout(()=>t.remove(),350);},5200);
}
function glitch(strength=1,red=false){
  const os=$('#desktop');
  os.classList.remove('glitching');void os.offsetWidth;os.classList.add('glitching');
  if(red){const f=$('#flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');}
  setTimeout(()=>os.classList.remove('glitching'),460*strength);
}

/* ============ مدير النوافذ ============ */
let zTop=50,spawn=0,focusId=null;
const wins={},bodies={};
function focusWin(id){
  const w=wins[id];if(!w)return;
  focusId=id;w.style.zIndex=++zTop;
  $$('.win').forEach(x=>x.classList.remove('focus'));
  w.classList.add('focus');syncTaskWindows();
}
function openApp(id){
  const a=APPS[id];if(!a)return;
  sfx.pop();
  if(wins[id]){wins[id].style.display='flex';focusWin(id);a.onOpen&&a.onOpen();syncTaskWindows();return;}
  const win=document.createElement('section');
  win.className='win';win.dataset.app=id;
  win.style.width=a.w+'px';win.style.height=a.h+'px';
  const x=Math.max(8,Math.min(Math.max(8,innerWidth-a.w-130),90+(spawn%6)*30));
  const y=Math.max(8,Math.min(Math.max(8,innerHeight-a.h-70),26+(spawn%6)*26));spawn++;
  win.style.left=x+'px';win.style.top=y+'px';
  win.innerHTML='<header class="win-h"><span style="display:flex">'+a.icon+'</span><b>'+a.title+'</b><span class="win-btns"><button data-a="min" title="تصغير">–</button><button data-a="max" title="تكبير">▢</button><button data-a="close" title="إغلاق">×</button></span></header><div class="win-b"></div><div class="win-rz" title="تغيير الحجم"></div>';
  $('#winLayer').appendChild(win);wins[id]=win;
  const host=win.querySelector('.win-b');
  let body=bodies[id];
  if(!body){body=bodies[id]=document.createElement('div');body.style.cssText='display:flex;flex-direction:column;flex:1;min-height:0';}
  host.appendChild(body);
  if(!body.dataset.built){body.dataset.built='1';a.build(body);}
  const h=win.querySelector('.win-h');
  h.addEventListener('pointerdown',e=>{
    if(e.target.closest('button')||win.classList.contains('max'))return;
    focusWin(id);
    const r=win.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;
    const mv=ev=>{win.style.left=Math.max(-40,Math.min(innerWidth-140,ev.clientX-ox))+'px';win.style.top=Math.max(0,Math.min(innerHeight-110,ev.clientY-oy))+'px';};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);
  });
  win.querySelector('.win-rz').addEventListener('pointerdown',e=>{
    e.stopPropagation();focusWin(id);
    const sw=win.offsetWidth,sh=win.offsetHeight,sx=e.clientX,sy=e.clientY;
    win.classList.remove('max');
    const mv=ev=>{
      win.style.width=Math.max(380,Math.min(innerWidth-20,sw+(sx-ev.clientX)))+'px';
      win.style.height=Math.max(240,Math.min(innerHeight-56,sh+(ev.clientY-sy)))+'px';
    };
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);
  });
  win.addEventListener('pointerdown',()=>focusWin(id));
  if(a.headExtra)a.headExtra(win,id);
  focusWin(id);a.onOpen&&a.onOpen();syncTaskWindows();
}
 $('#winLayer').addEventListener('click',e=>{
  const btn=e.target.closest('.win-btns button');if(!btn)return;
  const win=btn.closest('.win');const id=win.dataset.app;
  const a=btn.dataset.a;
  if(a==='close'||a==='min')win.style.display='none';
  else if(a==='max'){win.classList.toggle('max');focusWin(id);}
  syncTaskWindows();
});
function syncTaskWindows(){
  const c=$('#tbWins');if(!c)return;
  c.innerHTML='';
  Object.entries(wins).forEach(([id,w])=>{
    const b=document.createElement('button');
    const vis=w.style.display!=='none';
    b.className='tb-btn tbwin'+(vis&&id===focusId?' on':'');
    b.title=APPS[id].title;
    b.innerHTML=APPS[id].icon+'<span>'+APPS[id].title.split('—')[0].trim()+'</span>';
    b.onclick=()=>{
      if(w.style.display==='none'){w.style.display='flex';focusWin(id);}
      else if(id===focusId){w.style.display='none';syncTaskWindows();}
      else focusWin(id);
    };
    c.appendChild(b);
  });
}
function closeAllWins(){
  for(const k of Object.keys(wins)){wins[k].remove();delete wins[k];}
  for(const k of Object.keys(bodies)){delete bodies[k];}
  Object.keys(APPS).filter(k=>/^terminal\d+$/.test(k)).forEach(k=>delete APPS[k]);
  TERMS.length=0;termActive=null;termCounter=0;
}

/* ============ الطرفية — نوافذ متعددة + Tab ============ */
let termCounter=0,termActive=null;
const TERMS=[];
const CMD_LIST=['help','ls','cat','open','download','dl','rm','nmap','hydra','hashcat','john','connect','ssh','msfconsole','db','decrypt','notes','evidence','board','mirqab','mrq','lynx','osint','disconnect','exit','trace','send','clear','cls','whoami','date','pwd','echo','history','ping','ifconfig','netstat','ps','browser'];
function tabComplete(T){
  if(!T||!T.input)return;
  const cur=T.input.value;
  if(/\s/.test(cur))return;
  const matches=CMD_LIST.filter(c=>c.startsWith(cur.toLowerCase())&&c!==cur.toLowerCase());
  if(!matches.length)return;
  if(matches.length===1){T.input.value=matches[0]+' ';return;}
  let prefix=matches[0];
  for(const m of matches){while(!m.startsWith(prefix))prefix=prefix.slice(0,-1);}
  T.input.value=prefix;
  tprintTo(T,matches.join('  '),'dim');
}
function mkTermSession(container,label){
  const wrap=document.createElement('div');wrap.className='t-term';
  const out=document.createElement('div');out.className='t-out';
  const row=document.createElement('div');row.className='t-in';
  const pr=document.createElement('span');pr.className='prompt';pr.textContent=ID.name+'@nexus-7:~$';
  const inp=document.createElement('input');
  inp.autocomplete='off';inp.spellcheck=false;
  row.append(pr,inp);wrap.append(out,row);container.appendChild(wrap);
  const t={label:label,out:out,input:inp,prompt:pr,busy:false,hist:[],hi:0,msf:false};
  inp.addEventListener('keydown',async e=>{
    if(e.key==='Enter'){
      const v=inp.value;inp.value='';
      if(!v.trim())return;
      t.hist.push(v);t.hi=t.hist.length;
      tprintTo(t,'<span class="usr">'+(t.msf?'msf6 >':ID.name+'@nexus-7:~$')+'</span> '+esc(v),'echo');
      if(t.busy){tprintTo(t,'…busy','dim');return;}
      termActive=t;await runCmd(v,t);
    }else if(e.key==='ArrowUp'){if(t.hi>0){t.hi--;inp.value=t.hist[t.hi];}}
    else if(e.key==='ArrowDown'){if(t.hi<t.hist.length-1){t.hi++;inp.value=t.hist[t.hi];}else{t.hi=t.hist.length;inp.value='';}}
    else if(e.key==='Tab'){e.preventDefault();tabComplete(t);}
  });
  out.addEventListener('click',()=>{if(!getSelection().toString())inp.focus();});
  return t;
}
function tprintTo(t,html,cls=''){
  if(!t||!t.out)return null;
  const d=document.createElement('div');d.className='tl '+cls;d.innerHTML=html;
  t.out.appendChild(d);t.out.scrollTop=t.out.scrollHeight;return d;
}
function tprint(html='',cls=''){return tprintTo(termActive,html,cls);}
async function ttype(text,cls='',spd=7){
  const t=termActive;if(!t)return;
  const d=tprintTo(t,'',cls);if(!d)return;
  for(const ch of text){d.textContent+=ch;if(Math.random()<.3)sfx.key();t.out.scrollTop=t.out.scrollHeight;await sleep(spd);}
}
async function tprogress(label,dur=1400){
  const t=termActive;if(!t)return;
  const d=tprintTo(t,'');if(!d)return;
  for(let p=0;p<=100;p+=4){
    const fill=Math.floor(p/5);
    d.textContent=label+' ['+'█'.repeat(fill)+'░'.repeat(20-fill)+'] '+String(p).padStart(3)+'%';
    if(p%12===0)sfx.tick();
    t.out.scrollTop=t.out.scrollHeight;await sleep(dur/25);
  }
  d.innerHTML=esc(label)+' ['+'█'.repeat(20)+'] 100% <span class="gr">OK</span>';
}
function buildTerm(host){
  const t=mkTermSession(host,'sh-1');
  TERMS.push(t);termActive=t;
  tprintTo(t,'NEXUS-7 secure shell — build 12.0','dim');
  tprintTo(t,'أهلاً <span class="am">'+esc(ID.name)+'</span> — رمزك «راصد». اكتب <span class="am">help</span>.','dim');
  tprintTo(t,'<span class="am">tip:</span> «+ نافذة» طرفية مستقلة · Tab يكمل الأوامر.','dim');
}
function newTerminalWindow(){
  termCounter++;
  const id='terminal'+termCounter;
  APPS[id]={title:'TERM — الطرفية #'+termCounter,w:730,h:470,icon:IC.term2,
    build:function(host){
      const t=mkTermSession(host,'sh-'+termCounter);
      TERMS.push(t);termActive=t;
      tprintTo(t,'NEXUS-7 secure shell — جلسة '+t.label,'dim');
      tprintTo(t,'اكتب <span class="am">help</span> لعرض الأوامر.','dim');
    }};
  delete iconPos[id];
  openApp(id);renderIcons();persistIcons();
}

/* ============ الأوامر — كل نجاح يكتب حقائق ============ */
async function runCmd(raw,t){
  const T=t||termActive;if(!T)return;
  const line=raw.trim();if(!line)return;
  if(T.msf)return runMsf(line,T);
  const parts=line.split(/\s+/);
  const cmd=parts[0].toLowerCase(),arg=parts.slice(1).join(' ');
  T.busy=true;
  try{
    switch(cmd){
      case 'help':cmdHelp();Facts.set('helpUsed',true);break;
      case 'ls':cmdLs();break;
      case 'cat':case 'open':cmdCat(parts[1]||'');break;
      case 'download':case 'dl':await cmdDownload(parts[1]||'');break;
      case 'rm':cmdRm(parts[1]||'');break;
      case 'nmap':await cmdNmap();break;
      case 'hydra':await cmdHydra(arg);break;
      case 'hashcat':await cmdHashcat('hashcat');break;
      case 'john':await cmdHashcat('john');break;
      case 'connect':case 'ssh':await cmdConnect(parts[1]||'',parts[2],parts[3]);break;
      case 'msfconsole':cmdMsfStart(T);break;
      case 'db':openApp('db');tprint('opening CIVIC RECORDS mirror…','dim');break;
      case 'decrypt':openApp('decrypt');break;
      case 'notes':openApp('notes');break;
      case 'evidence':case 'board':openApp('board');break;
      case 'mirqab':case 'mrq':
        if(World.night<2){tprint('mirqab: command not found','err-lite');sfx.err();break;}
        openApp('mirqab');break;
      case 'lynx':case 'osint':
        if(World.night<3){tprint('lynx: command not found','err-lite');sfx.err();break;}
        openApp('lynx');break;
      case 'disconnect':case 'exit':cmdDisconnect();break;
      case 'trace':cmdTrace();break;
      case 'send':await cmdSend();break;
      case 'clear':case 'cls':T.out.innerHTML='';break;
      case 'whoami':tprint('<span class="am">'+esc(ID.name)+'</span> — codename: <span class="am">RASED</span>');break;
      case 'date':tprint(clockStr()+' — الليلة '+String(World.night).padStart(2,'0'));break;
      case 'pwd':tprint('/operator/nexus-7');break;
      case 'echo':tprint(esc(arg)||'');break;
      case 'history':T.hist.forEach((h,i)=>tprint('  '+String(i+1).padStart(3)+'  '+esc(h),'dim'));break;
      case 'ping':await cmdPing(parts[1]||'');break;
      case 'ifconfig':tprint('eth0: flags=4163<UP,BROADCAST,RUNNING>\n    inet <span class="am">10.0.44.9</span>  netmask 255.255.255.0','dim');break;
      case 'netstat':if(World.host)tprint('tcp  0  0  10.0.44.9:4471  '+World.host+':22  <span class="gr">ESTABLISHED</span>','dim');else tprint('no active tunnels','dim');break;
      case 'ps':tprint('  PID TTY      STAT   TIME COMMAND\n    1 ?        Ss     0:02 /sbin/init\n  217 ?        S      0:44 ch07-daemon\n  402 pts/0    Ss     0:00 -bash','dim');break;
      case 'browser':openApp('browser');break;
      default:tprint(esc(cmd)+': command not found — اكتب <span class="am">help</span>','err-lite');sfx.err();penalizeTrace();
    }
  }finally{T.busy=false;}
}
function cmdHelp(){
  const rows=[['── استطلاع ──',''],['nmap','مسح الشبكة'],['ping &lt;ip&gt;','اختبار وصول'],['── اختراق ──',''],['hydra -l admin -P rockyou.txt ssh://ip','كسر كلمة مرور SSH/HTTP'],['connect &lt;ip&gt; [user pass]','فتح نفق'],['msfconsole','إطار استغلال الثغرات'],['── ملفات ──',''],['ls · cat &lt;f&gt; · download &lt;f&gt; · rm &lt;f&gt;','استعراض ونسخ وحذف'],['── أدوات المشغّل ──',''],['db · decrypt · evidence · mirqab · lynx · notes · send · trace','—'],['── أخرى ──',''],['ifconfig · netstat · ps · history · clear','—']];
  tprint('<span class="am">── NEXUS-7 shell — الأوامر المتاحة ──</span>');
  rows.forEach(([c,d])=>{if(!d)tprint('<span class="am">'+c+'</span>');else tprint('<div style="display:flex;gap:14px"><span style="min-width:250px;color:var(--amber)">'+c+'</span><span class="dim">'+d+'</span></div>');});
}
function cmdLs(){
  if(World.host){
    tprint('host: <span class="am">'+NET.data[World.host].label+'</span>','dim');
    NET.data[World.host].files.forEach(n=>{
      const f=FILES[n];
      const tag=f.root?'<span class="rd">[root]</span>':(f.kind==='enc'?'<span class="rd">[enc]</span>':(f.kind==='photo'?'<span class="am">[photo]</span>':'<span class="dim">['+f.kind+']</span>'));
      tprint(n.padEnd(20)+' '+String(f.kb).padStart(3)+' KB  '+tag);
    });
  }
  tprint('vault: <span class="gr">local</span>','dim');
  World.files.forEach(n=>{const f=FILES[n];if(f)tprint(n.padEnd(20)+' '+String(f.kb).padStart(3)+' KB  <span class="gr">['+f.kind+']</span>');});
}
function cmdCat(name){
  name=(name||'').trim();
  const f=FILES[name];
  if(!f){tprint('cat: '+esc(name||'?')+': no such file','err-lite');sfx.err();return;}
  const can=f.got||f.where==='local'||(World.host&&f.where===World.host);
  if(!can){tprint('file not reachable — اتصل بعقدته أولاً','err-lite');sfx.err();return;}
  openApp('files');openFile(name);
}
async function cmdDownload(name){
  name=(name||'').trim();
  if(!World.host){tprint('download: not connected — لا مضيف نشط','err-lite');sfx.err();penalizeTrace();return;}
  const f=FILES[name];
  if(!f||f.where!==World.host){tprint('download: '+esc(name)+': no such file on host — استخدم ls','err-lite');sfx.err();return;}
  if(f.got){tprint(name+': already in vault','dim');return;}
  if(f.root&&!World.flags.rootDone){tprint('download: '+esc(name)+': <span class="rd">permission denied</span> — الملف للجذر root فقط','err-lite');tprint('hint: <span class="am">msfconsole</span> — ثغرة HWY-CAM 2.1','dim');sfx.err();return;}
  await ttype('downloading '+name+' ('+f.kb+' KB)','ok');
  const pulse=setInterval(()=>netPulse(World.host),260);
  await tprogress('transfer',1500);
  clearInterval(pulse);
  f.got=true;
  if(!World.files.includes(name))World.files.push(name);
  persist();renderFiles();
  tprint('<span class="gr">saved → vault/'+esc(name)+'</span>');
  toast('الخزنة','وصل ملف جديد: '+name,'good');
  bumpTrace(10);
  if(name==='hwy16_log.log')Facts.set('logDownloaded',true);
  if(name==='case_file.enc')Facts.set('encDownloaded',true);
}
function trashFile(name){
  if(!World.files.includes(name))return false;
  if(name==='README.txt'){tprint('rm: لن تحذف ملاحظاتي يا عزيزي','err-lite');return false;}
  World.files=World.files.filter(x=>x!==name);
  FILES[name].got=false;World.trash.push(name);
  renderFiles();renderTrash();persist();sfx.pop();
  return true;
}
function cmdRm(name){
  name=(name||'').trim();
  if(trashFile(name))tprint('moved → trash/'+esc(name),'dim');
  else if(name){tprint('rm: '+esc(name)+': not in vault','err-lite');sfx.err();}
}
async function cmdNmap(){
  if(World.scanDone){tprint('nmap: scan complete — راجع النتائج أعلاه أو خريطة NET','dim');return;}
  await ttype('Starting Nmap 7.94 ( https://nmap.org )','dim');
  await tprogress('scanning 10.0.44.0/24',1600);
  for(const [ip,label,tag] of [['10.0.44.1','ISP-GATEWAY','carrier'],['10.0.44.23','NET-BRIDGE-23','acl-locked'],['10.0.44.77','HWY16-CAM','secure']]){
    await sleep(rnd(240,460));
    tprint('Nmap scan report for <span class="am">'+ip+'</span>  ('+label+')  <span class="dim">['+tag+']</span>');
    netReveal(ip);sfx.tick();
  }
  await sleep(250);
  tprint('PORT     STATE  SERVICE   VERSION\n22/tcp   open   ssh       OpenSSH 7.9 <span class="am">(auth: password — weak)</span>\n80/tcp   open   http      <span class="am">HWY-CAM 2.1</span> <span class="rd">(known CVEs — check msfconsole)</span>','dim');
  tprint('Nmap done: 3 hosts up','ok');
  World.scanDone=true;persist();
  Facts.set('nmapDone',true);
}
async function cmdHydra(arg){
  if(arg.includes('192.168.88.1')){
    if(World.flags.routerCracked){tprint('hydra: الراوتر مكسور مسبقاً — admin : <span class="gr">RT88-default</span>','dim');return;}
    await ttype('Hydra v9.5 — RT-88 admin panel @ 192.168.88.1','dim');
    for(const pw of ['admin','1234','password','rt88','RT88-default']){
      await sleep(rnd(140,300));
      tprint('[ATTEMPT] 192.168.88.1 - "admin" - pass "<span class="dim">'+pw+'</span>"');sfx.tick();
    }
    await sleep(400);
    tprint('[80][http] 192.168.88.1   login: admin   password: <span class="gr">RT88-default</span>');
    tprint('Router admin CRACKED — عد لصفحة الراوتر واضغط hijack.','gr');
    sfx.ok();World.flags.routerCracked=1;persist();
    toast('hydra','كلمة سر الراوتر: RT88-default','good');
    if($('#brBody')&&wins.browser&&wins.browser.style.display!=='none'&&$('#brUrl').value==='mohannad-home.net')brGo('mohannad-home.net',false);
    return;
  }
  if(!arg.includes('10.0.44.77')){
    tprint('hydra: استخدم الهدف الصحيح — مثال:','err-lite');
    tprint('hydra -l admin -P rockyou.txt ssh://10.0.44.77','dim');sfx.err();return;
  }
  if(!World.scanDone){tprint('hydra: no known host — شغّل <span class="am">nmap</span> أولاً','err-lite');sfx.err();return;}
  if(World.flags.hydraDone){tprint('hydra: كُسرت سابقاً — admin : <span class="gr">orion2024</span>','dim');return;}
  await ttype('Hydra v9.5 starting — 1 target, 16 threads','dim');
  const tries=['123456','admin','orion','letmein','qwerty','camera','111111','dragon','orion123'];
  for(const pw of tries){await sleep(rnd(140,320));tprint('[ATTEMPT] target ssh://10.0.44.77 - login "<span class="am">admin</span>" - pass "<span class="dim">'+pw+'</span>"');sfx.tick();}
  await sleep(500);
  tprint('[22][ssh] host: 10.0.44.77   login: admin   password: <span class="gr">orion2024</span>');
  tprint('1 of 1 target successfully completed.','gr');
  sfx.ok();World.flags.hydraDone=1;persist();
  toast('hydra','كلمة المرور: orion2024','good');
  Facts.set('hydraCracked',true);
}
async function cmdHashcat(tool){
  if(!FILES['hwy16_log.log'].got){tprint(tool+': لا بصمة في الخزنة بعد — البصمة التي في السجل مُقفلة على ملف لم يصل إلينا بعد.','err-lite');sfx.err();return;}
  if(World.flags.hash){tprint(tool+': البصمة مكسورة سابقاً → <span class="gr">password</span>','dim');return;}
  await ttype((tool==='hashcat'?'hashcat (v6.2.6) single-hash mode':'john the ripper — Raw MD5'),'dim');
  await tprogress('cracking',1900);
  tprint('<span class="gr">5f4dcc3b5aa765d61d8327deb882cf99:password</span>');
  sfx.ok();World.flags.hash=1;persist();
  toast(tool,'البصمة = password — احتفظ بها، ستحتاجها حين يصل ملفها.','good');
}
async function cmdConnect(ip,user,pass){
  ip=(ip||'').trim();
  if(!ip){tprint('usage: connect &lt;ip&gt; [user pass]','dim');return;}
  if(World.host===ip){tprint('already connected to '+ip,'dim');return;}
  if(!NET.known.has(ip)){tprint('no route to host '+esc(ip)+' — شغّل <span class="am">nmap</span> أولاً','err-lite');sfx.err();penalizeTrace();return;}
  const d=NET.data[ip];
  if(d.locked){tprint(ip+' <span class="am">'+d.label+'</span>: <span class="rd">'+d.reason+'</span>','err-lite');sfx.err();toast('عقدة محصّنة',d.reason,'bad');return;}
  if(!World.flags.hydraDone){
    if(user&&pass&&user.toLowerCase()==='admin'&&pass==='orion2024'){
      World.flags.hydraDone=1;persist();tprint('ssh creds accepted for '+ip,'ok');
    }else{
      tprint(ip+': ssh password required — شغّل <span class="am">hydra</span> أولاً','err-lite');sfx.err();return;
    }
  }
  await ttype('resolving '+ip+' ... ok  (creds: admin)','ok');
  tprint('opening tunnel :: port 4471','dim');
  await tprogress('handshake',1100);
  glitch(1);sfx.conn();
  tprint('<span class="gr">ACCESS GRANTED</span> — node: <span class="am">'+d.label+'</span>');
  World.host=ip;
  const nh=$('#nmHost');if(nh)nh.textContent=ip+' :: '+d.label;
  netSetActive(ip);startTrace();
  tprint('<span class="rd">traceback active</span> — كل خطأ يرفعهم إليك. disconnect للانسحاب.','dim');
  if(!World.flags.camShown){
    World.flags.camShown=1;persist();
    setTimeout(()=>showPhoto('CAM-04 — بث مُعترَض · الطريق 16',camMedia(),'نقطة تفتيش 3 · 2024-05-15 14:32 UTC — سيارة زرقاء، اللوحة HX-4471'),350);
  }
  Facts.set('connected',true);
}
function cmdMsfStart(T){
  if(!World.scanDone){tprint('msfconsole: لا أهداف معروفة — شغّل <span class="am">nmap</span> أولاً','err-lite');sfx.err();return;}
  T.msf=true;
  if(T.prompt)T.prompt.textContent='msf6 >';
  tprint('       =[ metasploit v6.4 — 2418 exploits\n+ -- --=[ 1289 payloads / 47 encoders\n       =[ مستعد — اكتب <span class="am">search hwycam</span>','dim');
  tprint('للخروج: exit أو back','dim');
}
async function runMsf(line,T){
  const p=line.trim().toLowerCase();T.busy=true;
  try{
    if(p==='exit'||p==='back'||p==='quit'){T.msf=false;if(T.prompt)T.prompt.textContent=ID.name+'@nexus-7:~$';tprint('back to bash.','dim');return;}
    if(p.startsWith('search')){tprint('Matching Modules\n================\n   0  exploit/linux/http/hwycam_rce      excellent  Yes\n      <span class="am">HWY-CAM v2.x — Unauthenticated RCE (CVE-2024-1337)</span>');return;}
    if(p==='use 0'||p.includes('hwycam_rce')||p==='use'){tprint('Using exploit/linux/http/hwycam_rce','dim');tprint('الخطوة التالية: <span class="am">set RHOSTS 10.0.44.77</span> ثم <span class="am">exploit</span>','dim');return;}
    if(p.startsWith('set')){
      if(!World.host){tprint('[-] exploit requires an active tunnel — <span class="am">connect 10.0.44.77</span> أولاً','err-lite');sfx.err();return;}
      tprint('RHOSTS => 10.0.44.77 (from active tunnel)','dim');return;
    }
    if(p==='exploit'||p==='run'){
      if(!World.host){tprint('[-] لا نفق نشط — اتصل بالهدف أولاً','err-lite');sfx.err();return;}
      tprint('[*] Started reverse TCP handler on 10.0.44.9:4444','dim');
      await tprogress('sending stage',1600);
      await sleep(400);glitch(1);sfx.unlock();
      tprint('<span class="gr">[+] Meterpreter session 1 opened — uid=0(root)</span>');
      tprint('<span class="gr">[+] root shell obtained — الملفات المحمية متاحة الآن</span>');
      if(!World.flags.rootDone){
        World.flags.rootDone=true;persist();bumpTrace(15);
        toast('metasploit','جلسة root مفتوحة — الجذر لك.','good');
        Facts.set('rootAchieved',true);
      }
      return;
    }
    if(p==='info'){tprint('Name: HWY-CAM Unauthenticated RCE\nCVE: 2024-1337 — HWY-CAM 2.1','dim');return;}
    tprint(esc(p)+': unknown msf command','err-lite');sfx.err();
  }finally{T.busy=false;}
}
function cmdDisconnect(){
  if(!World.host){tprint('no active tunnel','dim');return;}
  tprint('tunnel closed. <span class="gr">traceback cleared.</span>');hostDown();
}
function cmdTrace(){
  if(!S.trace.on){tprint('no active traceback — <span class="gr">you are clean.</span>');return;}
  tprint('traceback: <span class="'+(S.trace.pct>70?'rd':'am')+'">'+Math.round(S.trace.pct)+'%</span> — disconnect لتصفيره.');
}
async function cmdSend(){
  if(goalDone('g_sent')){tprint('report already sent.','dim');return;}
  if(!canSendNow()){
    tprint('حزمة التقرير غير مكتملة. المتبقي: '+missingForSend(),'err-lite');sfx.err();
    if(World.flags.live)storyHint();
    return;
  }
  await doSend('');
}
async function doSend(bundle){
  tprint('encrypting report :: AES-Q','dim');
  await tprogress('upload to CH-07',1300);
  tprint('<span class="gr">REPORT DELIVERED</span>'+(bundle?' — '+bundle:' — case items attached.'));
  Facts.set('reportSent',true);
  if(World.flags.live)finishNight();
}
async function cmdPing(ip){
  ip=(ip||'').trim();
  if(!ip){tprint('usage: ping <ip>','dim');return;}
  if(!NET.known.has(ip)){tprint('ping: '+esc(ip)+': unknown host','err-lite');sfx.err();return;}
  for(let i=0;i<4;i++){await sleep(300);tprint('64 bytes from '+esc(ip)+': icmp_seq='+(i+1)+' ttl=61 time='+(Math.random()*8+1).toFixed(1)+' ms');}
  tprint('--- 4 packets transmitted, 4 received, 0% loss','dim');
}
async function uiCmd(text){
  if(!termActive)openApp('terminal');
  tprint('<span class="usr">'+ID.name+'@nexus-7:~$</span> '+esc(text),'echo');
  if(termActive&&termActive.busy){sfx.err();return;}
  await runCmd(text,termActive);
}

/* ============ الملفات ============ */
const KEY_PLAIN='== UNIT-7 CASE FILE 4471-A ==\nSUSPECT :: HUSSEINI, MOHANNAD K.\nWARRANT :: HOMICIDE - ACTIVE\nLAST PING :: HWY-16 / EXIT 9\nCLEARED BY :: DESK KAMEL';
const KEY_SHIFT=9;
function caesar(t,s){const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';return t.replace(/[A-Z]/g,ch=>A[(A.indexOf(ch)+s+26)%26]);}
const KEY_CIPHER=caesar(KEY_PLAIN,KEY_SHIFT);
const COOKIES_PLAIN='SESSION EXTRACT — social.mohannad\nusername :: m_hussein77\npassword :: @m_hussein77\nautologin :: TRUE';
const CK_SHIFT=13;
const COOKIES_CIPHER=caesar(COOKIES_PLAIN,CK_SHIFT);
const BAD_HASH='5f4dcc3b5aa765d61d8327deb882cf99';
const FILES={
  'README.txt':{where:'local',kb:1,kind:'text',body:'NEXUS-7 :: INTEL WORKSTATION — BUILD 12.0\n----------------------------------------\nمحطة مشغّل في وحدة الاستخبارات.\n\nالأدوات:\n  TERM (نوافذ متعددة + Tab) · NET · NET-3D · FILES · EVIDENCE\n  MIRQAB (ليلة 2+) · LYNX (ليلة 3+) · DECRYPT · DB · BROWSER · NOTES'},
  'admin_note.txt':{where:'10.0.44.77',kb:2,kind:'text',body:'=== NOTE TO SELF — sysop/hwy16 ===\n* rotate the admin password WEEKLY (nobody does)\n* someone pulls checkpoint logs past 03:00. not me.\n* ANPR cameras log EVERYTHING. wipe nothing.\n* unit-7 asked for exit-9 footage. twice. tell no one.\n* DO NOT answer extension 44. ever.'},
  'hwy16_log.log':{where:'10.0.44.77',kb:12,kind:'log',body:'[03:07:44] CHK-3 :: VEHICLE PASS :: HWY-16 NORTH\n[03:11:02] CHK-3 :: PLATE READ :: HX-4471\n[03:12:39] CHK-5 :: SPEED 142 :: LANE 2\n[03:13:01] CHK-5 :: PLATE READ :: HX-4471\n[03:14:02] AUTH-FAIL :: sysop :: md5 :: '+BAD_HASH+'\n[03:16:44] CHK-9 :: VEHICLE PASS :: NO PLATE READ\n[04:59:59] DAILY ARCHIVE :: UPLOAD FAILED :: RETRY'},
  'cam04_frame.jpg':{where:'10.0.44.77',kb:8,kind:'photo',body:''},
  'case_file.enc':{where:'10.0.44.77',kb:48,kind:'enc',root:true,body:KEY_PLAIN},
  'case_file.txt':{where:'local',kb:1,kind:'key',body:KEY_PLAIN,hidden:true},
  'session_cookies.enc':{where:'local',kb:4,kind:'enc',body:COOKIES_PLAIN,hidden:false}
};
function fIcon(kind){
  if(kind==='enc')return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  if(kind==='log')return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>';
  if(kind==='key')return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M11 12L21 2M16 7l3 3"/></svg>';
  if(kind==='photo')return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
}
function fitem(n,f){
  return '<div class="fitem '+(f.kind==='enc'?'enc':'')+'" data-f="'+n+'" draggable="true">'+fIcon(f.kind)+'<div class="fi-t"><b class="ltr">'+n+'</b><i>'+f.kb+' KB · '+f.kind+(f.root?' · root':'')+(f.got?' · vault':'')+'</i></div></div>';
}
function renderFiles(){
  const L=$('#fileList');if(!L)return;
  let h='<div class="fl-sec"><h4>الخزنة المحلية — اسحب ملفاً لسلة المهملات</h4>';
  World.files.forEach(n=>{if(FILES[n])h+=fitem(n,FILES[n]);});
  h+='</div>';
  if(World.host){h+='<div class="fl-sec"><h4>المضيف: '+NET.data[World.host].label+'</h4>';NET.data[World.host].files.forEach(n=>h+=fitem(n,FILES[n]));h+='</div>';}
  L.innerHTML=h;
}
function renderTrash(){
  const L=$('#trashList');if(!L)return;
  if(!World.trash.length){L.innerHTML='<div class="tr-empty">السلة فارغة</div>';return;}
  L.innerHTML=World.trash.map((n,i)=>'<div class="tr-item">'+fIcon(FILES[n]?FILES[n].kind:'text')+'<b>'+n+'</b><button data-i="'+i+'">استعادة</button></div>').join('');
  L.querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{const n=World.trash.splice(+b.dataset.i,1)[0];World.files.push(n);FILES[n].got=true;renderTrash();renderFiles();persist();sfx.pop();};
  });
}
let fvToken=0;
function openFile(name){
  const f=FILES[name];if(!f)return;
  if(f.kind==='photo'){showPhoto(name+' — أرشيف CHK-3',camMedia(),'HWY-16 · 2024-05-15 14:32 UTC · اللوحة HX-4471');return;}
  const tok=++fvToken;
  const v=$('#fileView');if(!v)return;
  v.innerHTML='<div class="fv-head"><b class="ltr">'+name+'</b><span>'+f.kb+' KB · '+f.kind+(f.root?' · root':'')+(f.got?' · vault':'')+'</span></div><pre id="fvBody"></pre>';
  const body=v.querySelector('#fvBody');
  if(f.kind==='enc'){
    const isC=(name==='session_cookies.enc');
    body.innerHTML='<span class="rd">── envelope ──</span>\n'+(isC?COOKIES_CIPHER:KEY_CIPHER)+'\n\n<span class="am">&gt; افتح أداة DECRYPT</span>';
    return;
  }
  (async()=>{
    for(const ln of f.body.split('\n')){
      if(tok!==fvToken)return;
      const d=document.createElement('div');body.appendChild(d);
      for(const ch of ln){if(tok!==fvToken)return;d.textContent+=ch;if(Math.random()<.1)sfx.key();await sleep(4);}
      d.innerHTML=esc(ln).replace(/(PLATE [A-Z]+-\d+|SUSPECT[^\n]*|extension 44|md5 :: [a-f0-9]+)/g,'<span class="am">$1</span>');
      await sleep(22);
    }
  })();
}
function buildFiles(host){
  host.innerHTML='<div class="t-files"><div id="fileList"></div><div id="fileView"><div class="fv-empty">اختر ملفاً من الخزنة لعرضه</div></div></div>';
  const L=host.querySelector('#fileList');
  L.addEventListener('click',e=>{const it=e.target.closest('.fitem');if(it)openFile(it.dataset.f);});
  L.addEventListener('dragstart',e=>{
    const it=e.target.closest('.fitem');
    if(it){e.dataTransfer.setData('text/nexus-file',it.dataset.f);e.dataTransfer.effectAllowed='move';}
  });
  renderFiles();
}
function buildTrash(host){
  host.innerHTML='<div class="t-trash"><div class="tr-head"><b>سلة المهملات</b><button id="trEmpty">إفراغ السلة</button></div><div id="trashList"></div></div>';
  host.querySelector('#trEmpty').onclick=()=>{if(World.trash.length){World.trash=[];renderTrash();sfx.pop();toast('السلة','أُفرغت السلة.','good');}};
  renderTrash();
}

/* ============ الخريطة ============ */
const NET={
  data:{
    'SELF':{x:400,y:452,label:'NEXUS-7',self:true},
    '10.0.44.1':{x:400,y:318,label:'ISP-GATEWAY',locked:true,reason:'carrier node — رفض الوصول'},
    '10.0.44.23':{x:158,y:170,label:'NET-BRIDGE-23',locked:true,reason:'ACL — تصريح صيانة مطلوب'},
    '10.0.44.77':{x:560,y:150,label:'HWY16-CAM',files:['hwy16_log.log','cam04_frame.jpg','admin_note.txt','case_file.enc']}
  },
  known:new Set(['SELF','10.0.44.1']),active:null
};
const NET_ALPHA=new Map();
function netReveal(ip){if(NET.known.has(ip))return;NET.known.add(ip);NET_ALPHA.set(ip,1);renderNet();}
function netSetActive(ip){NET.active=ip;renderNet();}
function renderNet(){
  const svg=$('#netSvg');if(!svg)return;
  let h='<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#121a15" stroke-width="1"/></pattern></defs><rect width="800" height="520" fill="url(#grid)"/>';
  for(const ip of NET.known){if(ip==='SELF')continue;const d=NET.data[ip];h+='<line class="glink '+(NET.active===ip?'on':'')+'" x1="400" y1="452" x2="'+d.x+'" y2="'+d.y+'"/>';}
  for(const ip of NET.known){
    const d=NET.data[ip],on=NET.active===ip;
    h+='<g class="gnode '+(on?'active':'')+'" data-ip="'+ip+'"'+(ip==='SELF'?' style="cursor:default"':'')+'>';
    if(on)h+='<circle class="ring" cx="'+d.x+'" cy="'+d.y+'" r="31"/>';
    h+='<circle class="core" cx="'+d.x+'" cy="'+d.y+'" r="'+(d.self?29:23)+'"/>';
    if(d.locked)h+='<g class="lockic" transform="translate('+d.x+','+(d.y-6)+')"><rect x="-4.5" y="-1" width="9" height="7" rx="1"/><path d="M-2.6 -1 v-2.4 a2.6 2.6 0 0 1 5.2 0 v2.4"/></g>';
    h+='<text class="nm-ip" x="'+d.x+'" y="'+(d.y+4)+'" text-anchor="middle">'+(d.self?'YOU':ip.split('.').slice(2).join('.'))+'</text>';
    h+='<text x="'+d.x+'" y="'+(d.y+(d.self?46:40))+'" text-anchor="middle">'+d.label+'</text></g>';
  }
  svg.innerHTML=h;
  for(const [ip] of NET_ALPHA){
    const g=svg.querySelector('.gnode[data-ip="'+CSS.escape(ip)+'"]');
    if(g){g.style.opacity=0;g.style.transition='opacity .6s';requestAnimationFrame(()=>requestAnimationFrame(()=>g.style.opacity=1));NET_ALPHA.delete(ip);}
  }
  svg.querySelectorAll('.gnode').forEach(g=>{
    g.addEventListener('click',()=>{
      const ip=g.dataset.ip;if(ip==='SELF')return;
      const d=NET.data[ip];
      if(d.locked){toast('عقدة محصّنة',d.reason,'bad');sfx.err();return;}
      uiCmd('connect '+ip);
    });
  });
}
function netPulse(ip){
  const svg=$('#netSvg');const d=NET.data[ip];if(!svg||!d)return;
  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('r','3.5');c.setAttribute('fill','#ffb000');
  const an=document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
  an.setAttribute('dur','.8s');an.setAttribute('repeatCount','1');
  an.setAttribute('path','M400 452 L'+d.x+' '+d.y);
  c.appendChild(an);svg.appendChild(c);setTimeout(()=>c.remove(),950);
}
function buildNet(host){
  host.innerHTML='<div class="t-net"><div class="nm-head"><span>LOCAL SUBNET — 10.0.44.0/24</span><b id="nmHost">—</b></div><svg id="netSvg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet"></svg><div class="nm-foot">جرّب أيضاً NET-3D — الشبكة المجسمة</div></div>';
  renderNet();
}

/* ============ التتبع ============ */
function startTrace(){
  S.trace.on=true;S.trace.pct=0;
  $('#tracePill').hidden=false;updTrace();
  clearInterval(S.trace.timer);
}
function bumpTrace(v){if(!S.trace.on)return;S.trace.pct=Math.min(100,S.trace.pct+v);updTrace();}
function penalizeTrace(){
  if(!S.trace.on)return;
  S.trace.pct=Math.min(100,S.trace.pct+8);updTrace();
  tprint('<span class="rd">[traceback +8%]</span> — ركّز، كل خطأ يقربهم منك.','dim');
  if(S.trace.pct>=100)breach();
}
function updTrace(){
  $('#traceBar').style.width=S.trace.pct+'%';
  $('#tracePct').textContent=Math.round(S.trace.pct)+'%';
  $('#tracePill').classList.toggle('hot',S.trace.pct>70);
}
function stopTrace(){S.trace.on=false;clearInterval(S.trace.timer);$('#tracePill').hidden=true;}
async function breach(){
  if(!S.trace.on)return;
  stopTrace();glitch(2,true);sfx.err();
  toast('تحذير حرج','اكتشفوا الاختراق! قُطع النفق قسراً.','bad');
  tprint('<span class="rd">!! TRACEBACK COMPLETE — connection severed</span>','err-lite');
  hostDown();
  const key='n'+World.night;const T=ST_TEXT[key];
  if(T&&T.breach&&World.flags.live)sayLines(T.breach).catch(()=>{});
}
function hostDown(){
  World.host=null;stopTrace();netSetActive(null);
  const nh=$('#nmHost');if(nh)nh.textContent='—';
  renderFiles();
}

/* ============ فك التشفير — مصدران ============ */
function decSource(){
  const cReady=(typeof NIGHTS!=='undefined')&&World.night>=3&&FILES['session_cookies.enc'].got;
  return cReady?'cookies':'case';
}
function decSrc(){
  const which=decSource();
  return which==='cookies'
    ?{which:which,c:COOKIES_CIPHER,p:COOKIES_PLAIN,s:CK_SHIFT}
    :{which:which,c:KEY_CIPHER,p:KEY_PLAIN,s:KEY_SHIFT};
}
function buildDec(host){
  host.innerHTML='<div class="t-dec">'+
    '<div id="decEmpty" class="fv-empty" style="min-height:200px">لا يوجد ملف مشفر في الخزنة.</div>'+
    '<div id="decWork" hidden>'+
    '<div class="dec-lbl">CIPHERTEXT</div><pre id="decCipher" class="blob"></pre>'+
    '<div class="dec-ctl"><span class="lbl">RING&nbsp;SHIFT</span><input type="range" id="decShift" min="0" max="25" value="0" step="1"><output id="decShiftVal">00</output></div>'+
    '<div class="dec-lbl">PLAINTEXT (LIVE)</div><pre id="decPlain"></pre>'+
    '<div class="dec-meter"><div class="mbar"><i id="decBar"></i></div><b id="decPct">0%</b><span id="decStatus">حرّك الحلقة…</span></div>'+
    '<button id="decLock" disabled>تثبيت</button>'+
    '</div></div>';
  host.querySelector('#decShift').addEventListener('input',onShift);
  host.querySelector('#decLock').addEventListener('click',finalizeDecrypt);
}
function initDecrypt(){
  const e=$('#decEmpty'),w=$('#decWork');if(!e||!w)return;
  const src=decSrc();
  const cookiesReady=src.which==='cookies';
  const caseReady=src.which==='case'&&!goalDone('g_key')&&FILES['case_file.enc'].got;
  const ready=cookiesReady||caseReady;
  e.hidden=ready;w.hidden=!ready;
  if(!ready)return;
  $('#decCipher').textContent=src.c;
  if(src.which==='cookies'&&Facts.get('cookiesDecrypted')){
    const p=$('#decPlain');p.textContent=src.p;p.classList.add('resolved');
    $('#decBar').style.width='100%';$('#decPct').textContent='100%';
    $('#decStatus').textContent='COOKIES DECRYPTED — البيانات أمامك';
    $('#decLock').disabled=true;return;
  }
  if(src.which==='case'&&Facts.get('caseDecrypted')){
    const p=$('#decPlain');p.textContent=src.p;p.classList.add('resolved');
    $('#decBar').style.width='100%';$('#decPct').textContent='100%';
    $('#decStatus').textContent='FILE STABILIZED';
    $('#decLock').disabled=true;return;
  }
  onShift();
}
function onShift(){
  const s=+$('#decShift').value;
  $('#decShiftVal').textContent=String(s).padStart(2,'0');
  const src=decSrc();
  const disp=caesar(src.c,26-s);
  const p=$('#decPlain');
  p.classList.remove('resolved');p.textContent=disp;
  const valid=s===src.s;
  const pct=valid?100:2+([...disp].reduce((a,c)=>a+c.charCodeAt(0),0)%11);
  $('#decBar').style.width=pct+'%';$('#decPct').textContent=pct+'%';
  $('#decBar').style.background=valid?'var(--green)':'var(--amber)';
  $('#decStatus').textContent=valid?'signature match — اضغط تثبيت':'signature drift — واصل المحاولة';
  $('#decLock').disabled=!valid;
}
async function finalizeDecrypt(){
  const src=decSrc();
  const btn=$('#decLock');
  btn.disabled=true;btn.textContent='جارٍ التثبيت…';
  sfx.unlock();glitch(1);
  await resolveText($('#decPlain'),src.p);
  const p=$('#decPlain');p.classList.add('resolved');
  btn.textContent='مُثبّت ✓';
  if(src.which==='cookies'){
    p.innerHTML=esc(src.p).replace(/(m_hussein77|@m_hussein77)/g,'<span class="am" style="color:var(--amber)">$1</span>');
    $('#decStatus').textContent='COOKIES DECRYPTED — بيانات الدخول أمامك';
    toast('فك التشفير','username: m_hussein77 · password: @m_hussein77','good');
    World.flags.cookiesDecrypted=true;persist();
    Facts.set('cookiesDecrypted',true);
  }else{
    p.innerHTML=esc(src.p).replace(/(SUSPECT :: [^\n]+)/,'<span class="am" style="color:var(--amber)">$1</span>');
    $('#decStatus').textContent='FILE STABILIZED — أُضيف case_file.txt إلى الخزنة';
    World.flags.caseDecrypted=true;persist();
    const cf=FILES['case_file.txt'];cf.hidden=false;cf.got=true;
    if(!World.files.includes('case_file.txt'))World.files.push('case_file.txt');
    renderFiles();
    toast('فك التشفير','ملف القضية 4471-A فُتح.','good');
    Facts.set('caseDecrypted',true);
  }
}
async function resolveText(el,final){
  const CH='!<>-_\\/[]{}=+*^?#$%&';const steps=26;
  for(let k=0;k<=steps;k++){
    const cut=Math.floor(final.length*k/steps);
    let out='';
    for(let i=0;i<final.length;i++){
      const c=final[i];
      out+=(i<cut)?c:(c==='\n'?'\n':CH[(Math.random()*CH.length)|0]);
    }
    el.textContent=out;
    if(k%3===0)sfx.key();
    await sleep(38);
  }
  el.textContent=final;
}

/* ============ قاعدة البيانات ============ */
const DB=[
  {plate:'HX-4471',name:'مهند كريم الحسني',phone:'055-2277-491',nid:'2-04-1177-092',job:'محاسب — مجموعة المرصد القابضة',addr:'شارع الملك فيصل، بناية 14 — حي الظاهر',note:'مطلوب للتحقيق — جريمة قتل (ملف 4471-A)',seed:17,hot:true},
  {plate:'JY-9032',name:'سلمى عبد الرحمن',phone:'056-3310-204',nid:'2-05-2204-113',job:'طبيبة أسنان',addr:'طريق المطار، 3 — حي النخيل',note:'—',seed:42,hot:false},
  {plate:'KA-1188',name:'طارق منصور الدالي',phone:'050-9917-330',nid:'2-03-8811-207',job:'سائق توصيل',addr:'الشارع التجاري، 77 — المركز',note:'مخالفات مرورية مفتوحة',seed:8,hot:false},
  {plate:'BR-5561',name:'ليلى حسن مرعي',phone:'059-4402-881',nid:'2-09-1556-440',job:'مهندسة معمارية',addr:'شارع الجامعة، 21 — الغرب',note:'—',seed:71,hot:false},
  {plate:'TC-2049',name:'يوسف الأمين',phone:'054-8890-112',nid:'2-01-9420-889',job:'صاحب مقهى',addr:'ساحة الساعة، 5 — القديمة',note:'—',seed:29,hot:false},
  {plate:'MM-7703',name:'جمانة قاسم',phone:'055-6218-770',nid:'2-06-3077-621',job:'مدرّسة',addr:'شارع الورد، 9 — الشرق',note:'—',seed:55,hot:false},
  {plate:'RD-3310',name:'أنور صالح بدوي',phone:'058-1174-902',nid:'2-02-0331-117',job:'فني كهرباء',addr:'المنطقة الصناعية، مخزن 12',note:'سجل جنائي: نصب (2021)',seed:64,hot:true},
  {plate:'VF-6612',name:'ريما الحاج',phone:'053-7751-208',nid:'2-07-1662-775',job:'صحافية — جريدة المدينة',addr:'شارع الصحافة، 2 — الوسط',note:'طلبت ملفات من الأرشيف العام',seed:33,hot:false},
  {plate:'QN-0912',name:'سامر نعيم عوض',phone:'057-3329-645',nid:'2-04-2190-332',job:'حارس أمن — الطريق 16',addr:'سكن الشركة — محطة التفتيش 5',note:'مناوبة ليلية',seed:88,hot:false},
  {plate:'LX-4482',name:'دينا فؤاد',phone:'052-9084-517',nid:'2-08-2844-908',job:'مصممة جرافيك',addr:'شارع الفن، 18 — الوسط',note:'—',seed:12,hot:false}
];
function genFluxLine(){
  const hx='0123456789ABCDEF';let s='REC ';
  for(let i=0;i<44;i++)s+=Math.random()<.82?hx[(Math.random()*16)|0]:'·';
  return s;
}
function identicon(seed){
  let h=seed;const r=()=>{h=(h*9301+49297)%233280;return h/233280;};
  let cells='';
  for(let y=0;y<7;y++)for(let x=0;x<4;x++){
    if(r()>.5){cells+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';if(x<3)cells+='<rect x="'+(6-x)+'" y="'+y+'" width="1" height="1"/>';}
  }
  return '<svg viewBox="0 0 7 7" class="idicon"><g fill="#ffb000">'+cells+'</g></svg>';
}
let dbBusy=false;
function buildDb(host){
  host.innerHTML='<div class="t-db"><div class="db-head mono ltr">CIVIC RECORDS — CITY-GOV // MIRROR 4.2 // READ-ONLY</div>'+
    '<form id="dbForm"><input id="dbQ" placeholder="لوحة، هاتف، أو اسم… مثال: HX-4471"><button type="submit" id="dbGo">بحث</button></form>'+
    '<pre id="dbFlux" hidden></pre><div id="dbRes"></div><div id="dbCard" hidden></div></div>';
  host.querySelector('#dbForm').addEventListener('submit',e=>{e.preventDefault();doSearch();});
}
async function doSearch(){
  if(dbBusy)return;
  const q=$('#dbQ').value.trim();if(!q)return;
  dbBusy=true;
  try{
    $('#dbRes').innerHTML='';$('#dbCard').hidden=true;
    const flux=$('#dbFlux');
    flux.hidden=false;flux.textContent='';
    const t0=Date.now();let flip=0;
    while(Date.now()-t0<1100){
      flux.textContent+=genFluxLine()+'\n';
      if(flip++%2===0)sfx.tick();
      await sleep(55);
    }
    flux.hidden=true;
    const res=DB.filter(r=>[r.plate,r.name,r.phone,r.nid].some(v=>String(v).toLowerCase().includes(q.toLowerCase())));
    if(!res.length){$('#dbRes').innerHTML='<div class="db-none">لا سجلات مطابقة.</div>';sfx.err();return;}
    tone(700,.07,'triangle',.04);
    if(res.some(r=>r.plate==='HX-4471')&&!goalDone('g_plate'))
      toast('سجلات مدنية','اضغط على صف HX-4471 نفسه لفتح بطاقة المالك.');
    $('#dbRes').innerHTML=res.map(r=>'<div class="db-row" data-p="'+r.plate+'"><span class="ltr">'+r.plate+'</span><span>'+r.name+'</span><span class="ltr">'+r.phone+'</span><span>'+(r.hot?'<i class="hot-flag">مطلوب</i>':'عادي')+'</span></div>').join('');
    $$('#dbRes .db-row').forEach(el=>el.onclick=()=>showCard(el.dataset.p));
  }finally{dbBusy=false;}
}
function showCard(plate){
  const r=DB.find(x=>x.plate===plate);if(!r)return;
  const card=$('#dbCard');
  card.hidden=false;card.classList.toggle('hotcard',r.hot);
  const thumb=(plate==='HX-4471')
    ?'<div class="dc-photo" id="dcPhoto" title="اضغط للتكبير">'+driverMedia()+'</div>'
    :identicon(r.seed);
  card.innerHTML=thumb+
    '<div class="dc-info"><h4>'+r.name+'</h4>'+
    '<div class="dnote"'+(r.hot?'':' style="color:var(--muted)"')+'>'+r.note+'</div>'+
    '<div class="drow"><b>اللوحة</b><span>'+r.plate+'</span></div>'+
    '<div class="drow"><b>الهاتف</b><span>'+r.phone+'</span></div>'+
    '<div class="drow"><b>الرقم الوطني</b><span>'+r.nid+'</span></div>'+
    '<div class="drow"><b>المهنة</b><span style="font-family:var(--ar);direction:rtl">'+r.job+'</span></div>'+
    '<div class="drow"><b>العنوان</b><span style="font-family:var(--ar);direction:rtl">'+r.addr+'</span></div></div>'+
    '<button class="close">✕</button>';
  card.querySelector('.close').onclick=()=>card.hidden=true;
  const ph=card.querySelector('#dcPhoto');
  if(ph)ph.onclick=()=>showPhoto('المشتبه به — اللوحة '+r.plate,driverMedia(),'مهند كريم الحسني');
  if(plate==='HX-4471'){
    if(!World.flags.driverShown){
      World.flags.driverShown=1;persist();
      setTimeout(()=>showPhoto('المشتبه به — اللوحة HX-4471',driverMedia(),'مطابق لبطاقة السجل: مهند كريم الحسني'),300);
    }
    Facts.set('plateIdentified',true);
  }
}

/* ============ لوحة الأدلة — معزولة لكل ليلة ============ */
function clueDefs(){
  const d=nightDef();
  return (d&&d.clues)?d.clues:[];
}
let boardNight=1;
let selClue=null;
function curBoard(){
  if(!World.board[boardNight])World.board[boardNight]={clues:[],pos:{},links:[]};
  return World.board[boardNight];
}
function loadBoard(){boardNight=World.night;selClue=null;}
function persistBoard(){try{localStorage.setItem('nexus7_boards',JSON.stringify(World.board));}catch(e){}}
function addClue(id){
  const cl=clueDefs().find(c=>c.id===id);
  if(!cl)return;
  const B=curBoard();
  const already=B.clues.includes(id);
  B.clues.push(id);
  persistBoard();
  if(!already){
    toast('لوحة الأدلة','دليل جديد: '+cl.t,'good');
    sfx.pop();
    if(wins.board&&wins.board.style.display!=='none')renderBoardCards();
  }
}
function buildBoard(host){
  host.innerHTML='<div class="t-board"><div class="bd-bar"><b>لوحة الأدلة</b><span class="hint">انقر دليلين متتاليين لربطهما — انقر الخيط لحذفه — اسحب البطاقات</span><button id="bdAttach">إرفاق الأدلة وإرسالها</button></div><div id="bdCanvas"><svg id="bdLinks"></svg></div></div>';
  host.querySelector('#bdAttach').onclick=attachEvidence;
  host.querySelector('#bdCanvas').addEventListener('click',e=>{
    if(e.target.id==='bdCanvas'||e.target.id==='bdLinks'){
      selClue=null;
      $$('.clue.sel').forEach(x=>x.classList.remove('sel'));
    }
  });
  renderBoardCards();
}
function renderBoardCards(){
  const c=$('#bdCanvas');if(!c)return;
  c.querySelectorAll('.clue').forEach(x=>x.remove());
  const B=curBoard();
  clueDefs().forEach(cl=>{
    if(!B.clues.includes(cl.id))return;
    if(!B.pos[cl.id]){
      const i=B.clues.indexOf(cl.id);
      B.pos[cl.id]={x:24+(i%4)*170,y:26+Math.floor(i/4)*158};
    }
    const el=document.createElement('div');
    el.className='clue'+(selClue===cl.id?' sel':'');
    el.dataset.c=cl.id;
    el.style.left=B.pos[cl.id].x+'px';
    el.style.top=B.pos[cl.id].y+'px';
    el.innerHTML='<b>'+cl.icon+cl.t+'</b><span>'+cl.sub+'</span>';
    c.appendChild(el);
    bindClueDrag(el);
  });
  renderBoardLinks();
  const btn=$('#bdAttach');
  if(btn)btn.disabled=goalDone('g_sent');
}
function renderBoardLinks(){
  const svg=$('#bdLinks');if(!svg)return;
  const B=curBoard();
  let h='';
  B.links.forEach((lk,i)=>{
    const a=B.pos[lk[0]],b=B.pos[lk[1]];
    if(!a||!b)return;
    const x1=a.x+75,y1=a.y+30,x2=b.x+75,y2=b.y+30;
    const mx=(x1+x2)/2,my=(y1+y2)/2-26;
    const d='M'+x1+' '+y1+' Q'+mx+' '+my+' '+x2+' '+y2;
    h+='<path d="'+d+'" fill="none" stroke="#c0392b" stroke-width="2" opacity=".85"/>';
    h+='<path class="hit" data-i="'+i+'" d="'+d+'"/>';
    h+='<circle cx="'+x1+'" cy="'+y1+'" r="3.5" fill="#c0392b"/><circle cx="'+x2+'" cy="'+y2+'" r="3.5" fill="#c0392b"/>';
  });
  svg.innerHTML=h;
  svg.querySelectorAll('.hit').forEach(p=>{
    p.onclick=()=>{
      B.links.splice(+p.dataset.i,1);
      persistBoard();renderBoardLinks();sfx.pop();
      Facts.set('boardLinks',B.links.length);
    };
  });
}
function bindClueDrag(el){
  let sx,sy,ox,oy,drag=false,pid=null;
  const B=curBoard();
  el.addEventListener('pointerdown',e=>{
    pid=e.pointerId;sx=e.clientX;sy=e.clientY;
    ox=B.pos[el.dataset.c].x;oy=B.pos[el.dataset.c].y;
    drag=false;
    try{el.setPointerCapture(pid);}catch(_){}
  });
  el.addEventListener('pointermove',e=>{
    if(pid===null||e.pointerId!==pid)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!drag&&Math.hypot(dx,dy)>6)drag=true;
    if(drag){
      const cv=$('#bdCanvas');
      const nx=Math.max(2,Math.min(cv.clientWidth-158,ox+dx));
      const ny=Math.max(2,Math.min(cv.clientHeight-86,oy+dy));
      B.pos[el.dataset.c]={x:nx,y:ny};
      el.style.left=nx+'px';el.style.top=ny+'px';
      renderBoardLinks();
    }
  });
  el.addEventListener('pointerup',e=>{
    if(pid===null)return;
    try{el.releasePointerCapture(pid);}catch(_){}
    pid=null;
    if(drag){drag=false;persistBoard();return;}
    const id=el.dataset.c;
    if(!selClue){selClue=id;el.classList.add('sel');sfx.tick();return;}
    if(selClue===id){selClue=null;el.classList.remove('sel');return;}
    const a=selClue;selClue=null;
    $$('.clue.sel').forEach(x=>x.classList.remove('sel'));
    if(!B.links.some(l=>(l[0]===a&&l[1]===id)||(l[0]===id&&l[1]===a))){
      B.links.push([a,id]);
      persistBoard();renderBoardLinks();sfx.pop();
      Facts.set('boardLinks',B.links.length);
    }else{
      toast('لوحة الأدلة','هذا الرابط موجود بالفعل.');
    }
  });
}
async function attachEvidence(){
  if(goalDone('g_sent')){toast('التقرير','أُرسل مسبقاً.','good');return;}
  if(!canSendNow()){
    toast('ناقص للإرسال','متبقٍ: '+missingForSend(),'bad');
    if(World.flags.live)storyHint();
    return;
  }
  const B=curBoard();
  const n=B.clues.length,l=B.links.length;
  meSay('أرفقت لوحة الأدلة يا مشرف: '+n+' أدلة و'+l+' رابط بينها.');
  await doSend('evidence bundle: '+n+' clues / '+l+' links');
}

/* ============ مِرقاب ============ */
const MQ={active:false,tune:0,target:88.4,grabbed:{}};
const MQ_TARGETS={
  mohannad:{freq:88.4,label:'MOHANNAD-H',reveal:'device near HWY-16 / DEAD-ZONE-K9'},
  layth:{freq:104.2,label:'UNKNOWN-DEV',reveal:'contacts ping :: "LAYTH" — 14 hits this week'},
  moh44:{freq:96.8,label:'BROADCAST-44',reveal:'encrypted stream :: LAYTH <-> MOHANNAD — he is a WITNESS. ledgers of AL-MARSAD HOLDING'},
  shadow:{freq:102.3,label:'SHADOW-FREQ',reveal:'mirror channel :: forged arrest warrant exposed'}
};
let mqNsrc=null,mqNgain=null;
function mqAudioStart(){
  audioInit();if(!AC||mqNsrc)return;
  const len=AC.sampleRate*2;
  const buf=AC.createBuffer(1,len,AC.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<len;i++)data[i]=Math.random()*2-1;
  mqNsrc=AC.createBufferSource();
  mqNsrc.buffer=buf;mqNsrc.loop=true;
  const filt=AC.createBiquadFilter();filt.type='bandpass';filt.frequency.value=850;filt.Q.value=.5;
  mqNgain=AC.createGain();mqNgain.gain.value=0;
  mqNsrc.connect(filt);filt.connect(mqNgain);mqNgain.connect(gMaster);
  mqNsrc.start();
}
function mqAudioLevel(v){
  if(mqNgain&&AC){try{mqNgain.gain.linearRampToValueAtTime(muted?0:v,AC.currentTime+.12);}catch(e){}}
}
function mqNoise(x,t){return Math.sin(x*.12+t*.06)*18+Math.sin(x*.031+t*.021)*30;}
function mqTargetForNight(){
  if(World.night===2)return 'mohannad';
  if(World.night>=3)return 'moh44';
  return 'layth';
}
function drawMq(){
  const cv=$('#mqWave');
  const visible=cv&&wins.mirqab&&wins.mirqab.style.display!=='none';
  if(!visible){mqAudioLevel(0);requestAnimationFrame(drawMq);return;}
  const ctx=cv.getContext('2d');
  if(cv.width!==cv.clientWidth)cv.width=cv.clientWidth;
  if(cv.height!==cv.clientHeight)cv.height=cv.clientHeight;
  const w=cv.width,h=cv.height;
  ctx.fillStyle='#060907';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#121a15';ctx.lineWidth=1;
  for(let gx=0;gx<w;gx+=44){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,h);ctx.stroke();}
  const t=Date.now()/1000;
  const dist=Math.abs(MQ.tune-MQ.target);
  const strength=MQ.active?Math.max(0,1-dist/6):0;
  mqAudioLevel(MQ.active?(0.012+strength*0.075):0);
  for(let li=0;li<3;li++){
    ctx.beginPath();
    ctx.strokeStyle=li===0?('rgba(255,176,0,'+(.25+strength*.75)+')'):'rgba(90,110,95,.35)';
    ctx.lineWidth=li===0?2:1.2;
    for(let x=0;x<=w;x+=3){
      const base=h/2;
      let y=base+Math.sin(x*.02+t*(1.5+li)+li*2)*mqNoise(x+li*40,t)*(.25+strength*.9);
      if(li===0&&strength>0)y+=Math.sin(x*.055+t*9)*(6+strength*22);
      if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  const px=(MQ.tune-80)/40*w;
  ctx.strokeStyle='#4fd6c2';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,h);ctx.stroke();
  requestAnimationFrame(drawMq);
}
function onTune(){
  MQ.tune=+$('#mqTune').value;
  $('#mqTuneVal').textContent=MQ.tune.toFixed(1)+' MHz';
  const dist=Math.abs(MQ.tune-MQ.target);
  const pct=Math.max(0,Math.round((1-dist/6)*100));
  $('#mqBar').style.width=pct+'%';
  $('#mqPct').textContent=pct+'%';
  const entry=Object.entries(MQ_TARGETS).find(([k,v])=>v.freq===MQ.target);
  if(pct>=95&&entry){
    $('#mqStatus').innerHTML='<span style="color:var(--green)">LOCK — إشارة ثابتة: '+entry[1].label+'</span>';
    $('#mqGrab').disabled=!MQ.active||!!MQ.grabbed[entry[0]];
  }else{
    $('#mqStatus').textContent='اقترب من التردد… التشويش يعلو كلما دقّت.';
    $('#mqGrab').disabled=true;
  }
}
function buildMirqab(host){
  if(World.night<2){
    host.innerHTML='<div class="t-mrq"><div class="db-none" style="margin:40px 20px">لا يوجد جهاز بهذا الاسم موصولاً بهذه المحطة.<br><span class="mono ltr" style="font-size:10px">PROBE MIRQAB :: connection refused</span></div></div>';
    return;
  }
  host.innerHTML='<div class="t-mrq">'+
    '<div class="mq-head"><b>مِرقاب — اعتراض الإشارات القريبة</b><span class="st" id="mqSt">خامل</span></div>'+
    '<div id="mqEmpty">الجهاز خامل. اضغط <b>تشغيل الماسح</b>.<br><span style="font-size:11px">حوّل التردد حتى تصفو الموجة على هدف، ثم التقط — التشويش يعلو كلما اقتربت.</span></div>'+
    '<div id="mqWork">'+
      '<div class="mq-scope"><canvas id="mqWave"></canvas></div>'+
      '<div class="mq-freq"><span class="lbl">FREQ</span><input type="range" id="mqTune" min="80" max="120" step="0.1" value="92"><output id="mqTuneVal">92.0 MHz</output></div>'+
      '<div class="mq-meter"><div class="bar"><i id="mqBar"></i></div><b id="mqPct">0%</b></div>'+
      '<div id="mqStatus">اقترب من التردد…</div>'+
      '<button id="mqGrab" disabled>التقط الإشارة</button>'+
      '<div class="mq-log" id="mqLog"><span class="dim">— لا شيء مُعترض بعد —</span></div>'+
    '</div>'+
    '<div style="padding:10px 14px;border-top:1px solid var(--line)"><button id="mqPower" style="width:100%;padding:10px;border:1px solid var(--amber);color:var(--amber);border-radius:6px;background:rgba(255,176,0,.05)">تشغيل الماسح</button></div>'+
  '</div>';
  $('#mqPower').onclick=()=>{
    MQ.active=true;
    mqAudioStart();
    $('#mqEmpty').style.display='none';
    $('#mqWork').classList.add('on');
    $('#mqSt').textContent='رصد…';$('#mqSt').classList.add('on');
    sfx.conn();glitch(1);
    mqLog('<span class="sig">[SCAN]</span> spectrum sweep 80–120 MHz … <span class="sig">signals found</span>');
    MQ.target=MQ_TARGETS[mqTargetForNight()].freq;
    onTune();
    Facts.set('mirqabScanned',true);
  };
  $('#mqTune').addEventListener('input',onTune);
  $('#mqGrab').onclick=()=>{
    const entry=Object.entries(MQ_TARGETS).find(([k,v])=>v.freq===MQ.target);
    if(!entry||MQ.grabbed[entry[0]])return;
    const k=entry[0],tgt=entry[1];
    MQ.grabbed[k]=true;
    sfx.unlock();glitch(1,true);
    mqAudioLevel(0.3);setTimeout(()=>mqAudioLevel(0.02),450);
    mqLog('<span class="sig">[GRAB]</span> '+tgt.label+' :: '+tgt.reveal);
    if(k==='mohannad')Facts.set('mqMohannad',true);
    if(k==='layth')Facts.set('mqLayth',true);
    const chain=['mohannad','layth','moh44','shadow'];
    const next=chain[chain.indexOf(k)+1];
    if(next&&MQ_TARGETS[next]){MQ.target=MQ_TARGETS[next].freq;onTune();}
    $('#mqGrab').disabled=true;
    toast('مِرقاب','إشارة مُعترَضة.','good');
  };
}
function mqLog(html){
  const l=$('#mqLog');if(!l)return;
  if(l.firstChild&&l.firstChild.tagName==='SPAN'&&l.textContent.startsWith('— لا شيء'))l.innerHTML='';
  const d=document.createElement('div');d.innerHTML=html;
  l.appendChild(d);l.scrollTop=l.scrollHeight;
}

/* ============ lynx — ليلة 3 ============ */
const LYNX_DB={
  'مهند الحسني':[
    {t:'مهند كريم الحسني',s:'محاسب — مجموعة المرصد القابضة · مطلوب (4471-A) · مزاعم مالية مع الشركة',deep:'social'},
    {t:'HX-4471',s:'اللوحة المسجلة باسمه — قُرئت مرتين على الطريق 16',deep:null},
    {t:'MOHANNAD-HOME',s:'شبكته المنزلية — راوتر RT-88 (ثغرة CVE-2024-8812 معروفة)',deep:'router'}
  ],
  'ليث':[
    {t:'لا نتائج مدنية',s:'الاسم غير موجود في السجلات — إما مستعار أو ممحو',deep:null},
    {t:'@thorn',s:'حساب محذوف منذ 40 يوماً — بصمة صورة رمزية متبقية في الكاش',deep:'thorn'}
  ]
};
function buildLynx(host){
  if(World.night<3){
    host.innerHTML='<div class="t-lynx"><div class="db-none" style="margin:40px 20px">LYNX — لم يُرخص لهذه المحطة بعد.<br><span class="mono ltr" style="font-size:10px">license check :: pending — unit 7</span></div></div>';
    return;
  }
  host.innerHTML='<div class="t-lynx">'+
    '<div class="lx-head"><b>LYNX — تجميع المعلومات المفتوحة</b><span class="mono ltr" style="font-size:9.5px;color:var(--muted)">OSINT v1.2</span></div>'+
    '<form id="lxForm"><input id="lxQ" placeholder="اسم، مستعار، لوحة… مثال: مهند الحسني"><button type="submit">تجميع</button></form>'+
    '<div id="lxRes"></div>'+
  '</div>';
  host.querySelector('#lxForm').addEventListener('submit',e=>{
    e.preventDefault();
    doLynx(host.querySelector('#lxQ').value.trim());
  });
}
async function doLynx(q){
  const res=$('#lxRes');if(!res)return;
  if(!q){res.innerHTML='<div class="db-none">اكتب اسماً للبحث — مثال: «مهند الحسني».</div>';sfx.err();return;}
  res.innerHTML='<div class="lx-scan">جارٍ تجميع البصمة الرقمية… </div>';
  for(let i=0;i<14;i++){
    res.firstChild.textContent+='█';
    sfx.tick();
    await sleep(70);
  }
  const isMohannad=q.includes('مهند')&&q.includes('الحسني');
  const isLayth=q.includes('ليث');
  const hits=isMohannad?LYNX_DB['مهند الحسني']:(isLayth?LYNX_DB['ليث']:null);
  if(!hits){
    let msg='لا بصمة رقمية لهذا الاسم — جرّب: «مهند الحسني» أو «ليث».';
    if(q.includes('مهند')&&!q.includes('الحسني'))msg='اكتب الاسم الكامل: «مهند الحسني» — ليس «مهند» وحدها.';
    res.innerHTML='<div class="db-none">'+esc(msg)+'</div>';sfx.err();
    return;
  }
  res.innerHTML=hits.map((h,i)=>
    '<div class="lx-item" data-i="'+i+'"><b>'+h.t+'</b><span>'+h.s+'</span>'+
    (h.deep?'<em>عمّق ←</em>':'')+'</div>').join('');
  sfx.ok();
  res.querySelectorAll('.lx-item').forEach(el=>{
    el.onclick=()=>{
      const h=hits[+el.dataset.i];
      if(!h.deep)return;
      if(h.deep==='social'){
        Facts.set('socialFound',true);
        brGo('social.mohannad');openApp('browser');
      }
      if(h.deep==='router'){brGo('mohannad-home.net');openApp('browser');}
      if(h.deep==='thorn'){addClue('thorn');brGo('thorn.trace');openApp('browser');}
    };
  });
  if(isMohannad)Facts.set('lynxMohannad',true);
  if(isLayth){Facts.set('lynxLayth',true);addClue('thorn');}
}

/* ============ المتصفح + صفحات الليلة 3 ============ */
const PAGES={
  'nexus://home':()=>'<h1>NEXUS INTERNAL WEB</h1><p>شبكتك الداخلية — بلا رقيب تقريباً.</p>'+
    '<span class="wlink" data-u="0day-souq.onion">0day-souq.onion</span>'+
    '<span class="wlink" data-u="meridian-holdings.com">meridian-holdings.com</span>'+
    '<span class="wlink" data-u="city-gov.gov/civic">city-gov.gov/civic</span>'+
    '<span class="wlink" data-u="nexus://about">nexus://about</span>',
  '0day-souq.onion':()=>'<h1>0DAY SOUQ — سوق الثغرات</h1>'+
    '<div class="post"><div class="pmeta">thread #4471</div><h3>HWY-CAM 2.1 — Unauthenticated RCE</h3>'+
    '<p>CVE-2024-1337. <code>connect</code> أولاً ثم <code>msfconsole → search hwycam → use 0 → set RHOSTS → exploit</code>.</p></div>'+
    '<div class="post"><div class="pmeta">thread #4418</div><h3>RT-88 — CVE-2024-8812</h3>'+
    '<p>راوتر منزلي بثغرة وصول كامل. hydra على الإدارة ثم دخول اللوحة.</p></div>'+
    '<div class="post"><div class="pmeta">thread #4390</div><h3>[RUMOR] «مِرقاب»</h3>'+
    '<p>شحنة أدوات ستوزّع على المشغّلين الوحيدين… من قال إنها حقيقية لم يظهر منذ ذلك اليوم.</p></div>',
  'meridian-holdings.com':()=>'<h1>MERIDIAN HOLDINGS</h1><p>«أمن اللوجستيات الليلية — منذ 1998.»</p>'+
    '<h2>إشعار صيانة</h2><p>الخميس القادم: «توصيل» خارج الجدول على <b>المستودع ب</b> — البوابة 2 ستكون مفتوحة بين 03:00 و04:00. لا تدخّلوا.</p>',
  'city-gov.gov/civic':()=>'<h1>CIVIC RECORDS — MIRROR</h1>'+
    '<p>للبحث استخدم أداة <code>DB</code> مباشرة.</p>'+
    '<span class="wlink" data-u="__open_db">افتح أداة DB الآن</span>',
  'nexus://about':()=>'<h1>NEXUS-7 — ABOUT</h1>'+
    '<p>محطة مشغّل في وحدة الاستخبارات. كل ليلة مهمة واحدة، وكل مهمة تُنسى عند الفجر.</p>'+
    '<p style="color:var(--amberDim);font-size:12px">الليلة '+String(World.night).padStart(2,'0')+'</p>',
  'social.mohannad':()=>'<h1>@m_hussein77 — الحساب الاجتماعي</h1>'+
    '<p>الحساب <b>مجمّد</b> منذ «الوفاة» المعلنة… لكن آخر نشاط: <span style="color:var(--amber)">متابعة جديدة — بعد الوفاة بثلاثة أيام.</span></p>'+
    '<p>الميت لا يتابع. والحساب المجمد لا يستقبل متابعين… إلا من يملك مفاتيحه.</p>'+
    '<span class="wlink" data-u="social.mohannad/login">صفحة تسجيل الدخول</span>',
  'social.mohannad/login':()=>'<h1>تسجيل الدخول — social.mohannad</h1>'+
    '<div class="loginbox" style="max-width:340px;margin:0 auto;border:1px solid var(--line2);border-radius:8px;padding:16px">'+
    '<input id="lgU" placeholder="username" style="width:100%;margin-bottom:8px;background:var(--panel2);border:1px solid var(--line2);border-radius:5px;color:var(--text);padding:9px 12px;outline:none;direction:ltr">'+
    '<input id="lgP" type="password" placeholder="password" style="width:100%;margin-bottom:10px;background:var(--panel2);border:1px solid var(--line2);border-radius:5px;color:var(--text);padding:9px 12px;outline:none;direction:ltr">'+
    '<button id="lgIn" style="width:100%;border:1px solid var(--amber);color:var(--amber);border-radius:5px;padding:9px;background:rgba(255,176,0,.05)">دخول</button>'+
    '<div id="lgErr" style="color:var(--red);font-size:11px;margin-top:8px;min-height:16px"></div></div>',
  'social.mohannad/inbox':()=>'<h1>الرسائل — @m_hussein77</h1>'+
    '<div class="post"><div class="pmeta">DM · حساب محذوف</div><h3>@thorn</h3>'+
    '<p style="direction:rtl">«لا تكتب شيئاً هنا بعد اليوم. الحساب يُراقب. التسليم الأخير حضوري — <b>المستودع ب، الساعة 04:00</b>. أحضر المسيرات كاملة. بعدها نختفي معاً.»</p></div>'+
    '<div class="post"><div class="pmeta">DM · أقدم</div><h3>@thorn</h3>'+
    '<p style="direction:rtl">«المرصد لا يعرف أنك نسخت المسيرات. هذا ما يحميك… وما سيقتلك إن عرفوا. سأسحبك من الحفرة قبل أن يقفلوا عليها.»</p></div>'+
    '<p style="color:var(--amberDim);font-size:12px">المستودع ب… هو نفسه في إشعار «صيانة» ميرديان من أرشيفك الليلة الأولى.</p>',
  'mohannad-home.net':()=>'<h1>RT-88 :: لوحة إدارة الراوتر</h1>'+
    '<p><span style="color:var(--red)">PROBE: RT-88 firmware 2.4 — CVE-2024-8812 (Unauthenticated RCE)</span></p>'+
    '<p>شبكة MOHANNAD-HOME. الثغرة تفتح الباب… لكن الجلسة الكاملة تحتاج كلمة سر الإدارة.</p>'+
    (World.flags.routerCracked
      ?'<span class="wlink" data-u="__hijack">hijack — سيطرة على جهازه وسرقة الجلسة</span>'
      :'<span class="wlink" data-u="__hydra_router">كسر إدارة الراوتر — hydra</span><p style="color:var(--muted);font-size:12px">بعد كسر الإدارة سيظهر خيار hijack هنا.</p>'),
  'thorn.trace':()=>'<h1>@thorn — بصمة متبقية</h1>'+
    '<p>حساب محذوف منذ 40 يوماً. من الكاش تبقّى:</p>'+
    '<div class="post"><div class="pmeta">cached fragment</div>'+
    '<p style="direction:rtl">«…الطريق 16 مجرد ستارة. المستودع ب هو المسرح. من يقرأ هذا: لا تثق بقناة CH-0…» <span style="color:var(--red)">[تالٍ محذوف]</span></p></div>'
};
let brHist=[];
function attachLoginIfPresent(){
  const b=$('#lgIn');if(!b)return;
  b.onclick=()=>{
    const u=$('#lgU'),p=$('#lgP'),err=$('#lgErr');
    if(!Facts.get('cookiesDecrypted')){err.textContent='أدخل بيانات صحيحة.';sfx.err();return;}
    if(u.value.trim()==='m_hussein77'&&p.value==='@m_hussein77'){
      err.style.color='var(--green)';err.textContent='✓ تم الدخول — @m_hussein77';
      sfx.unlock();glitch(1);
      Facts.set('loggedIn',true);
      setTimeout(()=>brGo('social.mohannad/inbox'),1200);
    }else{
      err.style.color='var(--red)';
      err.textContent='بيانات غير صحيحة — الصحيحة أمامك في ما فكّكته من الكوكيز.';
      sfx.err();
    }
  };
}
function pageAction(act){
  if(act==='__open_db'){openApp('db');return;}
  if(act==='__hydra_router'){
    if(World.flags.routerCracked){toast('الراوتر','مخترق مسبقاً — استخدم hijack.');return;}
    uiCmd('hydra -l admin -P rockyou.txt ssh://192.168.88.1');
    return;
  }
  if(act==='__hijack'){
    if(!World.flags.routerCracked){toast('مقفل','اكسر إدارة الراوتر أولاً (hydra).');return;}
    hijackAnim();
    return;
  }
}
function hijackAnim(){
  const ov=document.createElement('div');
  ov.id='hjOv';
  ov.innerHTML='<div class="hj-box"><div class="hj-t">HIJACK SESSION — MOHANNAD-PC</div>'+
    '<div class="hj-scr" id="hjScr"></div><div class="hj-st" id="hjSt">اختراق عبر RT-88…</div></div>';
  document.body.appendChild(ov);
  const scr=ov.querySelector('#hjScr'),st=ov.querySelector('#hjSt');
  const lines=['[+] RT-88 backdoor opened','[+] LAN scan… device MOHANNAD-PC found',
    '[+] session rider injected','[+] browser session cookies located',
    '[+] exfiltrating 4.2 KB … OK','SESSION HIJACKED — cookies saved: session_cookies.enc'];
  let i=0;
  const iv=setInterval(()=>{
    if(i<lines.length){
      const d=document.createElement('div');d.textContent=lines[i];
      d.style.color=i===lines.length-1?'var(--green)':'var(--amberSoft)';
      scr.appendChild(d);scr.scrollTop=scr.scrollHeight;
      sfx.tick();i++;
    }else{
      clearInterval(iv);
      st.textContent='اكتمل — الملف في الخزنة';
      FILES['session_cookies.enc'].got=true;
      if(!World.files.includes('session_cookies.enc'))World.files.push('session_cookies.enc');
      persist();renderFiles();
      toast('hijack','جلسة مهند مسروقة — الكوكيز في الخزنة (مشفرة).','good');
      Facts.set('cookiesStolen',true);
      setTimeout(()=>{ov.classList.add('fade');setTimeout(()=>ov.remove(),600);},1500);
    }
  },620);
}
function brGo(url,push=true){
  const body=$('#brBody');if(!body)return;
  url=(url||'').trim();
  if(url==='__open_db'){openApp('db');return;}
  const fn=PAGES[url];
  if(push&&fn)brHist.push(url);
  $('#brUrl').value=url;
  if(!fn){body.innerHTML='<div class="webpage"><div class="err">ERR_NAME_NOT_RESOLVED — '+esc(url)+'</div></div>';sfx.err();return;}
  body.innerHTML='<div class="webpage">'+fn()+'</div>';
  body.querySelectorAll('.wlink').forEach(l=>l.onclick=()=>{
    const u=l.dataset.u;
    if(u.startsWith('__')){pageAction(u);return;}
    brGo(u);
  });
  attachLoginIfPresent();
  sfx.tick();
}
function buildBrowser(host){
  host.innerHTML='<div class="t-browser"><div class="br-bar"><button id="brBack" title="رجوع">‹</button><input id="brUrl" placeholder="nexus://home"><button id="brGoBtn" title="اذهب">→</button></div><div id="brBody"></div></div>';
  host.querySelector('#brBack').onclick=()=>{if(brHist.length>1){brHist.pop();brGo(brHist[brHist.length-1],false);}};
  host.querySelector('#brGoBtn').onclick=()=>brGo(host.querySelector('#brUrl').value);
  host.querySelector('#brUrl').addEventListener('keydown',e=>{if(e.key==='Enter')brGo(e.target.value);});
  brHist=['nexus://home'];brGo('nexus://home',false);
}

/* ============ المفكرة ============ */
function buildNotes(host){
  host.innerHTML='<div class="t-notes"><div class="nt-head"><b>المفكرة — private_notes.txt</b><span class="mono ltr">autosave</span></div>'+
    '<textarea id="notesTa" placeholder="اكتب ملاحظاتك…&#10;ملاحظاتك تبقى محفوظة دائماً."></textarea>'+
    '<div class="nt-foot"><button id="ntClear">مسح الكل</button><span id="ntCount">0 حرف</span><span class="save" id="ntSaved"></span></div></div>';
  const ta=host.querySelector('#notesTa');
  try{ta.value=localStorage.getItem('nexus7_notes')||'';}catch(e){}
  const cnt=host.querySelector('#ntCount'),sv=host.querySelector('#ntSaved');
  const upd=()=>{cnt.textContent=ta.value.length+' حرف';};
  upd();
  let t=null;
  ta.addEventListener('input',()=>{
    upd();sv.textContent='…يحفظ';
    clearTimeout(t);
    t=setTimeout(()=>{
      try{localStorage.setItem('nexus7_notes',ta.value);}catch(e){}
      sv.textContent='حُفظ ✓';
      setTimeout(()=>{if(sv)sv.textContent='';},1200);
    },500);
  });
  host.querySelector('#ntClear').onclick=()=>{
    ta.value='';upd();
    try{localStorage.removeItem('nexus7_notes');}catch(e){}
    sfx.pop();sv.textContent='مُسحت';
  };
}

/* ============ راديو NEXUS ============ */
const MUSIC={
  tracks:[
    {id:'QI68giYtnXs',title:'MIDNIGHT SIGNAL — راديو الطريق',len:'YouTube'},
    {id:'Nq0IQP-eSV4',title:'PHOSPHOR DREAM — فسفور 02:58',len:'YouTube'}
  ],
  idx:0, players:{}, playing:false, vol:60, apiTried:false
};
function loadYtApi(cb){
  if(window.YT&&window.YT.Player)return cb();
  const prev=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{if(prev)prev();cb();};
  if(!MUSIC.apiTried){
    MUSIC.apiTried=true;
    const s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
}
function muSave(){try{localStorage.setItem('nexus7_music',JSON.stringify({vol:MUSIC.vol,idx:MUSIC.idx}));}catch(e){}}
function muUpd(){
  const tr=MUSIC.tracks[MUSIC.idx];
  const t=$('#muTitle'),st=$('#muState');
  if(t)t.textContent=tr?tr.title:'—';
  if(st)st.textContent=MUSIC.playing?'▶ يعمل الآن':'⏸ متوقف';
  const btn=$('#muPlay');if(btn)btn.textContent=MUSIC.playing?'⏸':'▶';
  $$('.mu-track').forEach((el,i)=>{
    el.classList.toggle('on',i===MUSIC.idx);
    el.classList.toggle('playing',i===MUSIC.idx&&MUSIC.playing);
  });
}
function muEnsure(cb){
  loadYtApi(()=>{
    const mh=document.getElementById('muHost');
    if(!mh)return;
    MUSIC.tracks.forEach((tr,i)=>{
      if(MUSIC.players[i])return;
      const d=document.createElement('div');
      d.id='ytp-'+i;
      mh.appendChild(d);
      MUSIC.players[i]=new YT.Player('ytp-'+i,{
        videoId:tr.id,width:'200',height:'150',
        playerVars:{controls:0,disablekb:1,modestbranding:1,rel:0,playsinline:1,iv_load_policy:3},
        events:{
          onReady:()=>{MUSIC.players[i].setVolume(MUSIC.vol);muUpd();},
          onStateChange:e=>{if(i===MUSIC.idx){MUSIC.playing=(e.data===YT.PlayerState.PLAYING);muUpd();}}
        }
      });
    });
    cb&&cb();
  });
}
function muPlayIdx(i){
  MUSIC.idx=(i+MUSIC.tracks.length)%MUSIC.tracks.length;
  muEnsure(()=>{
    const p=MUSIC.players[MUSIC.idx];
    if(!p||!p.playVideo){muUpd();return;}
    Object.values(MUSIC.players).forEach(pl=>{if(pl!==p&&pl.pauseVideo)pl.pauseVideo();});
    p.playVideo();sfx.pop();muSave();muUpd();
  });
}
function muToggle(){
  muEnsure(()=>{
    const p=MUSIC.players[MUSIC.idx];
    if(!p||!p.playVideo){muUpd();return;}
    if(MUSIC.playing){p.pauseVideo();}
    else{Object.values(MUSIC.players).forEach(pl=>{if(pl!==p&&pl.pauseVideo)pl.pauseVideo();});p.playVideo();}
  });
}
function buildMusic(host){
  try{const sv=JSON.parse(localStorage.getItem('nexus7_music')||'null');if(sv){MUSIC.vol=sv.vol!=null?sv.vol:60;MUSIC.idx=sv.idx||0;}}catch(e){}
  host.innerHTML='<div class="t-music">'+
    '<div class="mu-now"><b id="muTitle">—</b><span id="muState">اختر مساراً واضغط تشغيل</span></div>'+
    '<div class="mu-list" id="muList"></div>'+
    '<div class="mu-ctl">'+
      '<button id="muPrev" title="السابق">⟨</button>'+
      '<button id="muPlay" title="تشغيل/إيقاف">▶</button>'+
      '<button id="muNext" title="التالي">⟩</button>'+
      '<input type="range" id="muVol" min="0" max="100" value="'+MUSIC.vol+'" title="الصوت">'+
    '</div>'+
    '<div id="muHost" style="position:fixed;left:-9999px;top:0;width:200px;height:150px;overflow:hidden"></div>'+
  '</div>';
  const list=host.querySelector('#muList');
  list.innerHTML=MUSIC.tracks.map((tr,i)=>
    '<div class="mu-track" data-i="'+i+'"><span class="eq"><i></i><i></i><i></i></span>'+
    '<span class="ti"><b>'+tr.title+'</b><i>'+tr.len+'</i></span></div>').join('');
  list.querySelectorAll('.mu-track').forEach(el=>el.onclick=()=>muPlayIdx(+el.dataset.i));
  host.querySelector('#muPlay').onclick=muToggle;
  host.querySelector('#muPrev').onclick=()=>muPlayIdx(MUSIC.idx-1);
  host.querySelector('#muNext').onclick=()=>muPlayIdx(MUSIC.idx+1);
  const vol=host.querySelector('#muVol');
  vol.addEventListener('input',()=>{
    MUSIC.vol=+vol.value;
    Object.values(MUSIC.players).forEach(p=>{if(p&&p.setVolume)p.setVolume(MUSIC.vol);});
    muSave();
  });
  muUpd();
}

/* ============ معلومات ============ */
function buildInfo(host){
  host.innerHTML='<div class="t-info"><h3>NEXUS-7 — محطة المشغّل</h3>'+
  '<p><b>المشغّل:</b> <code class="ltr">'+esc(ID.name)+'</code> — الرمز: «راصد» · <b>المشرف:</b> كمال (كامل)</p>'+
  '<p><b>ليلة 1:</b> help ← nmap ← hydra ← connect ← download ← DB (انقر الصف) ← msfconsole ← decrypt ← EVIDENCE ← send</p>'+
  '<p><b>ليلة 2:</b> MIRQAB ← التقط 88.4 ثم 104.2 ← اربط الدليلين ← أرسل</p>'+
  '<p><b>ليلة 3:</b> LYNX (مهند الحسني + ليث) ← عمّق البطاقة ← mohannad-home.net ← hydra الراوتر ← hijack ← decrypt الكوكيز (13) ← دخول social.mohannad ← أرسل</p></div>';
}

/* ============ الأيقونات والتطبيقات ============ */
const IC={
  term:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  term2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/><circle cx="19" cy="6" r="2.4" fill="var(--amber)" stroke="none"/></svg>',
  files:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  browser:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  music:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  net:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/></svg>',
  net3d:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="2.5"/><circle cx="5" cy="14" r="2.5"/><circle cx="19" cy="14" r="2.5"/><circle cx="12" cy="19" r="2.5"/><line x1="10" y1="8" x2="6.5" y2="12"/><line x1="14" y1="8" x2="17.5" y2="12"/><line x1="12" y1="8.5" x2="12" y2="16.5"/></svg>',
  db:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  dec:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  board:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg>',
  mirqab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12a10 10 0 0 1 20 0"/><path d="M5.5 12a6.5 6.5 0 0 1 13 0"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="14.5" x2="12" y2="21"/></svg>',
  lynx:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};
const APPS={
  terminal:{title:'TERM — الطرفية',w:730,h:470,icon:IC.term,build:buildTerm,
    headExtra:function(win){
      const b=document.createElement('button');
      b.textContent='+ نافذة';
      b.title='فتح طرفية جديدة في نافذة مستقلة';
      b.style.cssText='margin-inline-start:auto;font-size:10px;border:1px solid var(--line2);border-radius:4px;padding:3px 8px;color:var(--muted)';
      b.onclick=(e)=>{e.stopPropagation();newTerminalWindow();};
      win.querySelector('.win-h').appendChild(b);
    }},
  files:{title:'FILES — الخزنة',w:700,h:440,icon:IC.files,build:buildFiles,onOpen:renderFiles},
  browser:{title:'NEXUS WEB',w:740,h:500,icon:IC.browser,build:buildBrowser},
  notes:{title:'NOTES — المفكرة',w:560,h:460,icon:IC.notes,build:buildNotes},
  music:{title:'RADIO — راديو NEXUS',w:430,h:470,icon:IC.music,build:buildMusic},
  netmap:{title:'NET — خريطة الشبكة',w:680,h:480,icon:IC.net,build:buildNet,onOpen:renderNet},
  net3d:{title:'NET-3D — شبكة مجسمة',w:760,h:560,icon:IC.net3d,build:buildNet3D},
  db:{title:'DB — السجلات المدنية',w:700,h:520,icon:IC.db,build:buildDb},
  board:{title:'EVIDENCE — لوحة الأدلة',w:740,h:540,icon:IC.board,build:buildBoard,onOpen:renderBoardCards},
  mirqab:{title:'MIRQAB — مِرقاب',w:700,h:520,icon:IC.mirqab,build:buildMirqab},
  lynx:{title:'LYNX — تجميع المعلومات',w:700,h:520,icon:IC.lynx,build:buildLynx},
  decrypt:{title:'DECRYPT — فك الأختام',w:640,h:560,icon:IC.dec,build:buildDec,onOpen:initDecrypt},
  trash:{title:'سلة المهملات',w:480,h:380,icon:IC.trash,build:buildTrash,onOpen:renderTrash},
  info:{title:'عن النظام',w:560,h:420,icon:IC.info,build:buildInfo}
};

/* ============ الهاتف ============ */
function setPhoneView(name){
  $$('.ph-view').forEach(v=>v.classList.remove('on'));
  const el={idle:'phIdle',call:'phCall',chat:'phChat',mission:'phMission'}[name];
  if(el)$('#'+el).classList.add('on');
}
function phoneUnfold(){$('#phone').classList.remove('fold');$('#tbPhone').classList.add('on');}
function resetPhoneIdle(){
  $('#phChatLog').innerHTML='';$('#phChips').innerHTML='';
  $('#phone').classList.remove('ringing');
  $('#tabChat').classList.add('on');$('#tabMission').classList.remove('on');
  setPhoneView('idle');
}
 $('#phFold').onclick=()=>{$('#phone').classList.add('fold');$('#tbPhone').classList.remove('on');};
 $('#tbPhone').onclick=()=>{
  const p=$('#phone');
  p.classList.toggle('fold');
  $('#tbPhone').classList.toggle('on',!p.classList.contains('fold'));
};
 $('#tabChat').onclick=()=>{
  $('#tabChat').classList.add('on');$('#tabMission').classList.remove('on');
  if(ringIv||$('#phone').classList.contains('ringing'))setPhoneView('call');
  else setPhoneView(World.flags.live?'chat':'idle');
};
 $('#tabMission').onclick=()=>{$('#tabMission').classList.add('on');$('#tabChat').classList.remove('on');renderObj();setPhoneView('mission');};
function phScroll(){const c=$('#phChatLog');c.scrollTop=c.scrollHeight;}
async function say(text,who){
  if(!World.flags.live)return;
  setPhoneView('chat');
  $('#tabChat').classList.add('on');$('#tabMission').classList.remove('on');
  const ind=document.createElement('div');
  ind.className='pmsg typing';
  ind.innerHTML='<span style="font-size:10px;color:var(--muted)">'+(who||STORY_META.boss)+'</span><i></i><i></i><i></i>';
  $('#phChatLog').appendChild(ind);phScroll();
  await sleep(450+Math.min(1300,text.length*12));
  ind.remove();
  const m=document.createElement('div');
  m.className='pmsg them';m.textContent=text;
  $('#phChatLog').appendChild(m);sfx.msg();phScroll();
}
async function sayLines(lines,who){for(const L of lines||[])await say(L,who);}
function sysSay(html){
  const m=document.createElement('div');m.className='pmsg sys';m.innerHTML=html;
  $('#phChatLog').appendChild(m);phScroll();
}
function meSay(text){
  const m=document.createElement('div');m.className='pmsg me';m.textContent=text;
  $('#phChatLog').appendChild(m);phScroll();
}
function refreshQuick(){
  const q=$('#phChips');if(!q)return;q.innerHTML='';
  if(!World.flags.live)return;
  const b1=document.createElement('button');
  b1.className='pchip';b1.textContent='أحتاج توجيه';
  b1.onclick=()=>{if(World.flags.live)storyHint();};
  q.appendChild(b1);
  const B=World.board[World.night];
  if(!goalDone('g_sent')&&B&&B.clues.length>=2){
    const b3=document.createElement('button');
    b3.className='pchip';b3.textContent='افتح لوحة الأدلة';
    b3.onclick=()=>openApp('board');
    q.appendChild(b3);
  }
  if(canSendNow()&&!goalDone('g_sent')){
    const b2=document.createElement('button');
    b2.className='pchip send';b2.textContent='أرسل التقرير الآن';
    b2.onclick=()=>{meSay('أرسلت الحزمة كاملة.');uiCmd('send');};
    q.appendChild(b2);
  }
}
let ringIv=null;
function incomingCall(){
  if(World.night===3&&!World.flags.n3ring){
    World.flags.n3ring=1;persist();
    const p=$('#phone');
    p.classList.add('ringing');phoneUnfold();
    setPhoneView('call');sfx.ring();
    setTimeout(()=>{
      stopRing();
      setPhoneView('idle');
      toast('انقطع الاتصال','رنّة واحدة… ثم صمت.');
      setTimeout(async()=>{
        World.flags.live=true;
        World.flags.sessionStarted=1;persist();
        renderObj();refreshQuick();
        sysSay('ليلة 3 — «lynx» · رسالة نصية مجهولة المصدر');
        await sayLines((ST_TEXT.n3&&ST_TEXT.n3.ringMsg)||[]);
        setPhoneView('chat');
      },1500);
    },6000);
    return;
  }
  if(World.flags.nightDone||!(typeof NIGHTS!=='undefined'&&NIGHTS['n'+World.night])){
    if(World.flags.nightDone){
      toast('لا مهمات مجدولة','الليلة '+World.night+' مكتملة — أعد تشغيل الجهاز لليلة التالية، أو ابقَ واستكشف بحرية.');
    }
    return;
  }
  const p=$('#phone');
  p.classList.add('ringing');phoneUnfold();
  setPhoneView('call');sfx.ring();
  ringIv=setInterval(()=>sfx.ring(),2100);
}
function stopRing(){
  clearInterval(ringIv);clearTimeout(ringIv);
  ringIv=null;
  $('#phone').classList.remove('ringing');
}
 $('#phAccept').onclick=()=>{
  stopRing();setPhoneView('chat');sfx.conn();glitch(1);
  sysSay('قبول الاتصال — '+STORY_META.channel);
  World.flags.sessionStarted=1;persist();
  /* إشعال رسائل البداية مباشرة وآمنة */
  const T=ST_TEXT['n'+World.night];
  if(T&&T.start){
    World.flags.live=true;
    renderObj();refreshQuick();setPhoneView('chat');
    sayLines(T.start).catch(e=>console.error('[STORY:start]',e));
  }
};
 $('#phDecline').onclick=()=>{
  stopRing();setPhoneView('idle');
  toast('قناة '+STORY_META.channel,'رفضت اتصال المشرف.');
  World.flags.declined++;
  if(World.flags.declined===1)setTimeout(()=>{if(World.flags.live)storyBeat('n'+World.night,'decline');},1800);
  setTimeout(()=>{toast('قناة '+STORY_META.channel,'اتصال وارد من جديد…');incomingCall();},4200);
};
async function uiCmd(text){
  if(!termActive)openApp('terminal');
  tprint('<span class="usr">'+ID.name+'@nexus-7:~$</span> '+esc(text),'echo');
  if(termActive&&termActive.busy){sfx.err();return;}
  await runCmd(text,termActive);
}
function storyBeat(nightKey,trigger){
  const T=ST_TEXT[nightKey];if(!T)return;
  const map={n1start2:null,n1nmap:null,n1hydra:null,n1conn:null,n1log:null,n1plate:null,n1root:null,n1enc:null,n1key:null,n1board:null,
    n2open:null,n2grab1:'grab1',n2grab2:'grab2',
    n3lynx:'dossiers',n3social:null,n3router:'router',n3crack:'cookies',n3login:'login'};
  const textKey=map[trigger];
  if(textKey&&T[textKey]){
    sayLines(T[textKey]).catch(e=>console.error('[STORY:'+nightKey+'/'+textKey+']',e));
  }
}

/* ============ نهاية الليلة → 24 ساعة → التالية ============ */
async function finishNight(){
  if(World.flags.live){
    const T=ST_TEXT['n'+World.night];
    if(T&&T.finish)await sayLines(T.finish);
    sysSay('المشرف أغلق القناة');
  }
  if(World.host){hostDown();tprint('connection closed by remote host','dim');}
  World.flags.live=false;
  World.flags.nightDone=1;persist();
  refreshQuick();
  toast('المهمة مكتملة','الليلة '+World.night+' — العمل انتهى…','good');
  setTimeout(nightTransitionFlow,3000);
}
async function nightTransition(){
  const ov=document.createElement('div');
  ov.id='nightTrans';
  ov.innerHTML='<div class="nt-line" id="ntLine"></div>';
  document.body.appendChild(ov);
  sfx.shutdown();
  const el=ov.querySelector('#ntLine');
  const line='— بعد مرور 24 ساعة —';
  for(const ch of line){el.textContent+=ch;await sleep(85);}
  await sleep(1500);
  ov.classList.add('fade');
  await sleep(800);
  ov.remove();
}
function shipmentAnim(done){
  const ov=document.createElement('div');
  ov.id='shipOv';
  ov.innerHTML='<div class="sh-box">'+
    '<div class="sh-crate"><span class="sh-glow"></span>'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="1.4"><path d="M2 12a10 10 0 0 1 20 0"/><path d="M5.5 12a6.5 6.5 0 0 1 13 0"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="14.5" x2="12" y2="21"/></svg></div>'+
    '<div class="sh-t1">شحنة واردة · المصدر: ████ · الوجهة: NEXUS-7</div>'+
    '<div class="sh-bar"><i></i></div>'+
    '<div class="sh-t2" id="shTxt"></div></div>';
  document.body.appendChild(ov);
  const steps=['فك تشفير بيانات الشحنة…','التحقق من البصمة…','فتح الصندوق…','MIRQAB UNIT — جاهز للتشغيل'];
  let i=0;const tx=ov.querySelector('#shTxt');
  const iv=setInterval(()=>{tx.textContent=steps[i]||'';i++;if(i<=steps.length)sfx.tick();},950);
  sfx.conn();
  setTimeout(()=>{
    clearInterval(iv);
    ov.classList.add('fade');
    setTimeout(()=>{ov.remove();done&&done();},700);
  },4300);
}
async function nightTransitionFlow(){
  if(World._transitioning)return;World._transitioning=true;
  if(World.flags.nightDone!==1){World._transitioning=false;return;}
  World.flags.nightDone=2;persist();
  await nightTransition();
  resetAll(true);
  const d=$('#desktop');
  d.classList.remove('boot-in');void d.offsetWidth;
  d.classList.add('boot-in');
  sfx.conn();
  const has=(typeof NIGHTS!=='undefined')&&!!NIGHTS['n'+World.night];
  if(has&&World.night===2&&!World.flags.shipmentShown){
    World.flags.shipmentShown=1;persist();
    setTimeout(()=>shipmentAnim(()=>incomingCall()),900);
  }else{
    setTimeout(incomingCall,has?3500:2500);
    if(!has)setTimeout(()=>toast('لا مهمات مجدولة','أنجزت كل الليلات المتاحة — لعب حر حتى تصل ليلة جديدة.'),3200);
  }
  World._transitioning=false;
}

/* ============ الحفظ والاستعادة ============ */
function persist(){
  try{
    const done=[];
    const d=nightDef();
    if(d&&d.goals)d.goals.forEach(g=>{if(g.done)done.push(g.id);});
    localStorage.setItem('nexus7',JSON.stringify({
      night:World.night,
      files:World.files,
      trash:World.trash,
      got:Object.keys(FILES).filter(k=>FILES[k].got),
      scanDone:World.scanDone,
      host:World.host,
      board:World.board,
      facts:Facts.data,
      flags:{live:0,sessionStarted:World.flags.sessionStarted,
             nightDone:World.flags.nightDone,shipmentShown:World.flags.shipmentShown,
             camShown:World.flags.camShown,driverShown:World.flags.driverShown,
             declined:World.flags.declined,routerCracked:World.flags.routerCracked,
             n3ring:World.flags.n3ring,hash:World.flags.hash,
             hydraDone:World.flags.hydraDone,rootDone:World.flags.rootDone,
             caseDecrypted:World.flags.caseDecrypted,cookiesDecrypted:World.flags.cookiesDecrypted},
      done:done
    }));
  }catch(e){console.error('[persist]',e);}
}
function restoreGame(){
  let sv=null;
  try{sv=JSON.parse(localStorage.getItem('nexus7')||'null');}catch(e){}
  if(!sv)return;
  if(sv.night)World.night=sv.night;
  if(sv.files&&sv.files.length)World.files=sv.files.filter(n=>FILES[n]);
  if(sv.trash)World.trash=sv.trash.filter(n=>FILES[n]);
  (sv.got||[]).forEach(n=>{if(FILES[n])FILES[n].got=true;});
  if(sv.scanDone)World.scanDone=true;
  if(sv.host&&NET.known.has(sv.host))World.host=sv.host;
  if(sv.board&&typeof sv.board==='object')World.board=sv.board;
  if(sv.facts&&typeof sv.facts==='object')Facts.data=sv.facts;
  if(sv.flags)Object.keys(World.flags).forEach(k=>{if(sv.flags[k]!==undefined)World.flags[k]=sv.flags[k];});
  World.flags.live=false;
  (sv.done||[]).forEach(id=>{const g=goalById(id);if(g)g.done=true;});
  $('#smNight').textContent='الليلة '+String(World.night).padStart(2,'0');
  World.files=['README.txt'].concat((sv.files||World.files).filter(n=>FILES[n]&&FILES[n].got&&n!=='README.txt'));
  Facts.checkAll();
}
addEventListener('beforeunload',persist);

/* ============ الهوية ============ */
const ID={name:'operator',hash:''};
function hashStr(t){
  let h=5381;
  for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))>>>0;
  return String(h);
}
function idSave(){try{localStorage.setItem('nexus7_id',JSON.stringify({name:ID.name,hash:ID.hash}));}catch(e){}}
function idLoad(){
  try{return JSON.parse(localStorage.getItem('nexus7_id')||'null');}catch(e){return null;}
}
function idWipe(){
  try{
    localStorage.removeItem('nexus7_id');
    localStorage.removeItem('nexus7');
    localStorage.removeItem('nexus7_icons');
    localStorage.removeItem('nexus7_notes');
    localStorage.removeItem('nexus7_music');
    localStorage.removeItem('nexus7_boards');
    sessionStorage.removeItem('nexus7_intro');
  }catch(e){}
}
function setupStart(){
  const scr=$('#setupScreen');
  scr.hidden=false;
  const btn=$('#suGo');
  const go=()=>{
    const n=$('#suName').value.trim();
    const p=$('#suPass').value, p2=$('#suPass2').value;
    const err=$('#suErr');
    if(!/^[a-zA-Z0-9_-]{3,16}$/.test(n)){err.textContent='الاسم: 3-16 حرفاً إنجليزياً/رقماً بلا مسافات.';sfx.err();return;}
    if(p.length<4){err.textContent='كلمة السر: 4 أحرف على الأقل.';sfx.err();return;}
    if(p!==p2){err.textContent='كلمتا السر غير متطابقتين.';sfx.err();return;}
    ID.name=n;ID.hash=hashStr(p);
    idSave();scr.hidden=true;sfx.ok();bootSeq();
  };
  btn.onclick=go;
  $('#suPass2').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  $('#suName').addEventListener('keydown',e=>{if(e.key==='Enter')$('#suPass').focus();});
}
function loginStart(saved){
  const scr=$('#loginScreen');
  scr.hidden=false;
  $('#lgUser').textContent=saved.name;
  const btn=$('#lgGo');
  const go=()=>{
    const p=$('#lgPass').value;
    const err=$('#lgErr');
    if(hashStr(p)!==saved.hash){
      err.textContent='كلمة السر غير صحيحة — محاولة أخرى.';
      sfx.err();
      $('#lgPass').value='';$('#lgPass').focus();
      glitch(1,true);
      return;
    }
    ID.name=saved.name;ID.hash=saved.hash;
    scr.hidden=true;sfx.conn();bootSeq();
  };
  btn.onclick=go;
  $('#lgPass').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  $('#lgReset').onclick=()=>{
    if(confirm('سيُمسح كل شيء: الهوية، التقدم، المفكرة، اللوحات. هل أنت متأكد؟')){
      idWipe();location.reload();
    }
  };
}

/* ============ الطاقة — الاستمرارية ============ */
function resetAll(advanceNight){
  try{localStorage.removeItem('nexus7');}catch(e){}
  stopRing();stopTrace();mqAudioLevel(0);
  World.host=null;World.scanDone=false;
  World.flags={live:false,sessionStarted:0,nightDone:0,shipmentShown:0,n3ring:0,camShown:0,driverShown:0,declined:0,routerCracked:0,hash:0,hydraDone:0,rootDone:false,caseDecrypted:false,cookiesDecrypted:false};
  World.files=['README.txt'];World.trash=[];
  Object.values(FILES).forEach(f=>{f.got=false;});
  FILES['case_file.txt'].hidden=true;
  World.board={};persistBoard();
  Facts.reset();
  NET.known=new Set(['SELF','10.0.44.1']);NET.active=null;NET_ALPHA.clear();
  closeAllWins();
  $('#photoModal').hidden=true;
  const dr=$('#dbRes');if(dr)dr.innerHTML='';
  const dc=$('#dbCard');if(dc)dc.hidden=true;
  brHist=['nexus://home'];
  MQ.grabbed={};MQ.active=false;
  if(advanceNight)World.night++;
  $('#smNight').textContent='الليلة '+String(World.night).padStart(2,'0');
  loadBoard();
  renderObj();resetPhoneIdle();
  renderFiles();renderTrash();refreshQuick();
  renderIcons();renderStart();syncMirqabUI();syncLynxUI();syncNet3dUI();
}
function resetVisualOnly(){
  stopRing();stopTrace();mqAudioLevel(0);
  World.host=null;termActive=null;
  closeAllWins();
  $('#photoModal').hidden=true;
  resetPhoneIdle();
}
async function rebootSeq(){
  const advance=(World.flags.nightDone===1);
  sfx.shutdown();
  const d=$('#desktop');
  d.classList.add('off');
  await sleep(780);
  d.classList.remove('off');
  if(advance){resetAll(true);}
  else{resetVisualOnly();persist();}
  d.classList.remove('boot-in');void d.offsetWidth;
  d.classList.add('boot-in');
  sfx.conn();
  const has=(typeof NIGHTS!=='undefined')&&NIGHTS['n'+World.night];
  setTimeout(()=>toast('الليلة '+String(World.night).padStart(2,'0'),advance?(has?'مهمة جديدة بانتظارك.':'لا مهمات مجدولة — ليلة حرة.'):'مرحباً بعودتك — مهمتك بحالتها المحفوظة.'),600);
  if(advance&&has&&World.night===2&&!World.flags.shipmentShown){
    World.flags.shipmentShown=1;persist();
    setTimeout(()=>shipmentAnim(()=>incomingCall()),900);
  }else{
    setTimeout(incomingCall,advance&&has?5000:4000);
  }
}
 $('#powerOnBtn').onclick=()=>{
  audioInit();
  $('#powerScreen').hidden=true;
  const d=$('#desktop');d.hidden=false;
  if(World.flags.nightDone===1){resetAll(true);}
  else{resetVisualOnly();persist();}
  d.classList.remove('boot-in');void d.offsetWidth;
  d.classList.add('boot-in');
  sfx.conn();
  setTimeout(()=>toast('الليلة '+String(World.night).padStart(2,'0'),'المحطة تعمل.'),800);
  setTimeout(incomingCall,4000);
};
 $('#tbPower').onclick=()=>{$('#powerDlg').hidden=false;};
 $('#pdCancel').onclick=()=>{$('#powerDlg').hidden=true;};
 $('#pdOff').onclick=()=>{$('#powerDlg').hidden=true;shutdownSeq();};
 $('#pdReboot').onclick=()=>{$('#powerDlg').hidden=true;rebootSeq();};
 $('#smShutdown').onclick=()=>{$('#startMenu').hidden=true;$('#powerDlg').hidden=false;};
 $('#smReboot').onclick=()=>{$('#startMenu').hidden=true;rebootSeq();};
function shutdownSeq(){
  persist();persistBoard();sfx.shutdown();
  const d=$('#desktop');
  d.classList.add('off');
  setTimeout(()=>{
    d.classList.remove('off');d.hidden=true;
    $('#powerScreen').hidden=false;
    stopTrace();
  },780);
}

/* ============ سطح المكتب — أيقونات بلا تصادم ============ */
const ICON_BASE=['terminal','files','browser','notes','music','lynx','netmap','net3d','db','board','mirqab','decrypt','trash'];
function iconOrderNow(){
  return ICON_BASE.filter(id=>
    (id!=='mirqab'||World.night>=2)&&(id!=='lynx'||World.night>=3));
}
function clampPos(p){
  return {x:Math.max(4,Math.min(innerWidth-110,p.x)), y:Math.max(4,Math.min(innerHeight-190,p.y))};
}
let iconPos={};
try{iconPos=JSON.parse(localStorage.getItem('nexus7_icons')||'{}');}catch(e){iconPos={};}
function persistIcons(){try{localStorage.setItem('nexus7_icons',JSON.stringify(iconPos));}catch(e){}}
function syncMirqabUI(){
  const b=document.querySelector('#taskbar .launch[data-app="mirqab"]');
  if(b)b.style.display=(World.night>=2)?'':'none';
}
function syncLynxUI(){
  const b=document.querySelector('#taskbar .launch[data-app="lynx"]');
  if(b)b.style.display=(World.night>=3)?'':'none';
}
function syncNet3dUI(){
  const b=document.querySelector('#taskbar .launch[data-app="net3d"]');
  if(b)b.style.display=(World.night>=1)?'':'none';
}
function renderIcons(){
  const order=iconOrderNow();
  $('#icons').innerHTML=order.map(id=>APPS[id]?'<div class="dicon" data-app="'+id+'">'+APPS[id].icon+'<span>'+APPS[id].title.split('—')[0].trim()+'</span></div>':'').join('');
  const rows=Math.max(4,Math.floor((innerHeight-70)/100));
  const placed=[];
  const collides=(x,y)=>placed.some(p=>Math.abs(p.x-x)<104&&Math.abs(p.y-y)<92);
  order.forEach(id=>{
    const el=$('.dicon[data-app="'+id+'"]');if(!el)return;
    let p=null;
    if(id==='trash'&&!iconPos[id]){p={x:24,y:16};}
    else if(iconPos[id]){p=clampPos(iconPos[id]);}
    if(!p||collides(p.x,p.y)){
      p=null;
      outer:
      for(let c=0;c<6;c++){
        for(let r=0;r<rows;r++){
          const cx=innerWidth-116-c*112, cy=16+r*100;
          if(cx<4)break;
          if(!collides(cx,cy)){p={x:cx,y:cy};break outer;}
        }
      }
      if(!p)p={x:innerWidth-116,y:16};
    }
    iconPos[id]=p;placed.push(p);
    el.style.left=p.x+'px';el.style.top=p.y+'px';
    bindIconDrag(el);
  });
  const tEl=$('.dicon[data-app="trash"]');
  if(tEl&&!tEl.dataset.dnd){
    tEl.dataset.dnd='1';
    tEl.addEventListener('dragover',e=>{e.preventDefault();tEl.classList.add('droptarget');});
    tEl.addEventListener('dragleave',()=>tEl.classList.remove('droptarget'));
    tEl.addEventListener('drop',e=>{
      e.preventDefault();tEl.classList.remove('droptarget');
      const name=e.dataTransfer.getData('text/nexus-file');
      if(name&&World.files.includes(name)){
        if(trashFile(name))toast('سلة المهملات','نُقل إلى السلة: '+name);
      }
    });
  }
}
addEventListener('resize',()=>{
  if($('#desktop')&&!$('#desktop').hidden)renderIcons();
});
function bindIconDrag(el){
  let sx,sy,ox,oy,drag=false,pid=null;
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    pid=e.pointerId;sx=e.clientX;sy=e.clientY;
    ox=iconPos[el.dataset.app].x;oy=iconPos[el.dataset.app].y;
    drag=false;
    $$('#icons .dicon').forEach(x=>x.classList.remove('sel'));
    el.classList.add('sel');
    try{el.setPointerCapture(pid);}catch(_){}
  });
  el.addEventListener('pointermove',e=>{
    if(pid===null||e.pointerId!==pid)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!drag&&Math.hypot(dx,dy)>6){drag=true;el.classList.add('dragging');}
    if(drag){
      const nx=Math.max(4,Math.min(innerWidth-104,ox+dx));
      const ny=Math.max(4,Math.min(innerHeight-180,oy+dy));
      iconPos[el.dataset.app]={x:nx,y:ny};
      el.style.left=nx+'px';el.style.top=ny+'px';
    }
  });
  el.addEventListener('pointerup',e=>{
    if(pid===null)return;
    try{el.releasePointerCapture(pid);}catch(_){}
    pid=null;
    if(drag){
      drag=false;el.classList.remove('dragging');
      let p=clampPos(iconPos[el.dataset.app]);
      const others=Object.entries(iconPos).filter(([k,v])=>k!==el.dataset.app);
      const hits=p2=>others.some(([k,v])=>Math.abs(v.x-p2.x)<104&&Math.abs(v.y-p2.y)<92);
      if(hits(p)){
        const rows=Math.max(4,Math.floor((innerHeight-70)/100));
        outer:
        for(let c=0;c<10;c++){
          for(let r=0;r<rows;r++){
            const cx=innerWidth-116-c*112, cy=16+r*100;
            if(cx<4)break;
            if(!hits({x:cx,y:cy})){p={x:cx,y:cy};break outer;}
          }
        }
      }
      iconPos[el.dataset.app]=p;
      el.style.left=p.x+'px';el.style.top=p.y+'px';
      persistIcons();
    }
    else openApp(el.dataset.app);
  });
}
function renderStart(){
  const list=[...iconOrderNow(),'info'];
  $('#smGrid').innerHTML=list.map(id=>APPS[id]?'<div class="sm-app" data-app="'+id+'">'+APPS[id].icon+'<span>'+APPS[id].title.split('—')[0].trim()+'</span></div>':'').join('');
  $$('#smGrid .sm-app').forEach(a=>a.onclick=()=>{$('#startMenu').hidden=true;openApp(a.dataset.app);});
}
 $('#tbStart').onclick=e=>{e.stopPropagation();$('#startMenu').hidden=!$('#startMenu').hidden;};
document.addEventListener('click',e=>{
  if(!e.target.closest('#startMenu,#tbStart'))$('#startMenu').hidden=true;
  if(!e.target.closest('#ctxMenu'))$('#ctxMenu').hidden=true;
  if(!e.target.closest('.dicon'))$$('#icons .dicon').forEach(x=>x.classList.remove('sel'));
});
 $('#wm').addEventListener('contextmenu',e=>{
  if(e.target.closest('.win,#icons,#phone'))return;
  e.preventDefault();
  const m=$('#ctxMenu');
  m.innerHTML='<button id="cxTerm">فتح الطرفية</button><button id="cxTermNew">طرفية جديدة (نافذة مستقلة)</button><button id="cxNotes">المفكرة</button><button id="cxBoard">لوحة الأدلة</button><button id="cxSort">ترتيب الأيقونات</button><button id="cxStart">قائمة التطبيقات</button><hr><button id="cxInfo">معلومات النظام</button><button id="cxOff" class="danger">إيقاف التشغيل</button>';
  m.hidden=false;
  m.style.left=Math.min(e.clientX,innerWidth-200)+'px';
  m.style.top=Math.min(e.clientY,innerHeight-340)+'px';
  $('#cxTerm').onclick=()=>{m.hidden=true;openApp('terminal');};
  $('#cxTermNew').onclick=()=>{m.hidden=true;newTerminalWindow();};
  $('#cxNotes').onclick=()=>{m.hidden=true;openApp('notes');};
  $('#cxBoard').onclick=()=>{m.hidden=true;openApp('board');};
  $('#cxSort').onclick=()=>{m.hidden=true;iconPos={};persistIcons();renderIcons();sfx.pop();};
  $('#cxStart').onclick=()=>{m.hidden=true;$('#startMenu').hidden=false;};
  $('#cxInfo').onclick=()=>{m.hidden=true;openApp('info');};
  $('#cxOff').onclick=()=>{m.hidden=true;$('#powerDlg').hidden=false;};
});
 $$('.launch').forEach(b=>b.onclick=()=>openApp(b.dataset.app));

/* ============ NET-3D — طبقة WebGL مطوّرة ============ */
const TD3={scene:null,cam:null,ren:null,nodes:[],links:[],parts:[],stars:[],ray:null,mouse:new THREE.Vector2(),rotY:0,rotX:0.25,zoom:130,isDown:false,px:0,py:0};
function buildNet3D(host){
  host.innerHTML='<div class="t-3d"><div class="t3d-head"><b>NET-3D — شبكة العقد المجسمة</b><span class="mono ltr" style="font-size:9.5px;color:var(--muted)">drag=rotate · wheel=zoom · click=node</span></div>'+
    '<div class="t3d-frame" id="td3Frame"></div>'+
    '<div class="t3d-foot">انقر عقدة للاتصال — الكرات الداكنة غير مكتشفة بعد · الجزيئات الذهبية = حزم بيانات حية</div></div>';
  if(typeof THREE==='undefined'){
    host.querySelector('#td3Frame').innerHTML='<div class="fv-empty">مكتبة Three.js لم تُحمَّل — تحقق من الاتصال بالإنترنت ثم أعد فتح النافذة</div>';
    return;
  }
  initNet3D(host.querySelector('#td3Frame'));
}
function initNet3D(frame){
  if(TD3.ren&&TD3.ren.domElement.parentElement===frame)return;
  const W=frame.clientWidth||600,H=frame.clientHeight||400;
  TD3.scene=new THREE.Scene();
  TD3.scene.background=new THREE.Color(0x040605);
  TD3.scene.fog=new THREE.Fog(0x040605,130,340);
  TD3.cam=new THREE.PerspectiveCamera(55,W/H,0.1,1000);
  TD3.ren=new THREE.WebGLRenderer({antialias:true});
  TD3.ren.setSize(W,H);
  TD3.ren.setPixelRatio(Math.min(devicePixelRatio,2));
  frame.appendChild(TD3.ren.domElement);
  /* إضاءة نيون ثلاثية */
  TD3.scene.add(new THREE.AmbientLight(0x2a352c,1.4));
  const key=new THREE.PointLight(0xffb000,2.4,320);key.position.set(50,70,70);TD3.scene.add(key);
  const rim=new THREE.PointLight(0x4fd6c2,1.6,320);rim.position.set(-70,-40,-60);TD3.scene.add(rim);
  const back=new THREE.PointLight(0xff5252,0.7,250);back.position.set(0,40,-120);TD3.scene.add(back);
  /* أرضية شبكية */
  const grid=new THREE.GridHelper(420,42,0x1d2822,0x101612);
  grid.position.y=-48;TD3.scene.add(grid);
  /* سماء نجوم — 600 نجمة عشوائية */
  const starGeo=new THREE.BufferGeometry();
  const starPos=[];
  for(let i=0;i<600;i++)starPos.push((Math.random()-0.5)*700,(Math.random()-0.2)*400,-100-Math.random()*300);
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
  TD3.stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x6a7a6f,size:1.1,transparent:true,opacity:.75}));
  TD3.scene.add(TD3.stars);
  /* العقد من بيانات الشبكة الحقيقية */
  TD3.nodes=[];
  const posMap={'SELF':[0,0,0],'10.0.44.1':[0,14,-80],'10.0.44.23':[-62,28,-36],'10.0.44.77':[62,34,-40]};
  Object.keys(NET.data).forEach((ip,i)=>{
    const d=NET.data[ip];
    const known=NET.known.has(ip);
    const p0=posMap[ip]||[(i%2?70:-70)*(1+i*0.25),22+i*13,-65-i*16];
    const p=known?p0:[p0[0]+18,p0[1]+10,p0[2]+22];
    const geo=new THREE.SphereGeometry(d.self?6.5:4.8,28,28);
    const col=known?(d.self?0x4fd6c2:(d.locked?0x8a6f2e:0xffb000)):0x2c3b31;
    const mat=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:d.self?1:0.5,roughness:.3,metalness:.25});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(p[0],p[1],p[2]);
    mesh.userData={ip:ip,label:d.label,known:known,locked:d.locked,self:d.self};
    /* هالة حول كل عقدة مكتشفة */
    if(known){
      const halo=new THREE.Mesh(
        new THREE.SphereGeometry((d.self?8.5:6.2),20,20),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.14,side:THREE.BackSide})
      );
      mesh.add(halo);
      mesh.userData.halo=halo;
    }
    TD3.scene.add(mesh);TD3.nodes.push(mesh);
  });
  /* وصلات + جزيئات بيانات متدفقة */
  const selfN=TD3.nodes.find(n=>n.userData.ip==='SELF');
  TD3.links=[];
  TD3.nodes.forEach(n=>{
    if(n===selfN)return;
    const g=new THREE.BufferGeometry().setFromPoints([selfN.position,n.position]);
    const active=NET.active===n.userData.ip;
    const line=new THREE.Line(g,new THREE.LineBasicMaterial({color:active?0xffb000:0x24332a,transparent:true,opacity:active?.95:.55}));
    TD3.scene.add(line);TD3.links.push(line);
    /* جزيئات بيانات تسرُّ على الوصلات للمكتشفة */
    if(n.userData.known){
      for(let p=0;p<4;p++){
        const dot=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,8),new THREE.MeshBasicMaterial({color:active?0xffd35c:0x4fd6c2}));
        dot.userData={from:selfN.position.clone(),to:n.position.clone(),t:Math.random()};
        TD3.scene.add(dot);TD3.parts.push(dot);
      }
    }
  });
  /* تفاعل */
  const dom=TD3.ren.domElement;
  dom.style.cursor='grab';
  dom.addEventListener('pointerdown',e=>{TD3.isDown=true;TD3.px=e.clientX;TD3.py=e.clientY;dom.style.cursor='grabbing';});
  addEventListener('pointerup',()=>{TD3.isDown=false;dom.style.cursor='grab';});
  addEventListener('pointermove',e=>{
    if(TD3.isDown){
      TD3.rotY+=(e.clientX-TD3.px)*0.005;
      TD3.rotX+=(e.clientY-TD3.py)*0.005;
      TD3.rotX=Math.max(-0.95,Math.min(0.95,TD3.rotX));
      TD3.px=e.clientX;TD3.py=e.clientY;
    }
    const r=dom.getBoundingClientRect();
    if(r.width>0){
      TD3.mouse.x=((e.clientX-r.left)/r.width)*2-1;
      TD3.mouse.y=-((e.clientY-r.top)/r.height)*2+1;
    }
  });
  dom.addEventListener('wheel',e=>{e.preventDefault();TD3.zoom=Math.max(55,Math.min(230,TD3.zoom+e.deltaY*0.16));},{passive:false});
  TD3.ray=new THREE.Raycaster();
  dom.addEventListener('click',()=>{
    TD3.ray.setFromCamera(TD3.mouse,TD3.cam);
    const hits=TD3.ray.intersectObjects(TD3.nodes);
    if(hits.length){
      const n=hits[0].object;
      if(!n.userData.known){toast('NET-3D','عقدة غير مكتشفة — شغّل nmap أولاً.','bad');sfx.err();return;}
      if(n.userData.locked){toast('NET-3D','عقدة محصّنة — اتصال مرفوض.','bad');sfx.err();return;}
      uiCmd('connect '+n.userData.ip);
    }
  });
  /* حلقة الرسم */
  (function loop3d(){
    requestAnimationFrame(loop3d);
    if(!wins.net3d||wins.net3d.style.display==='none')return;
    TD3.cam.position.set(
      Math.sin(TD3.rotY)*TD3.zoom*Math.cos(TD3.rotX),
      10+TD3.zoom*Math.sin(TD3.rotX),
      Math.cos(TD3.rotY)*TD3.zoom*Math.cos(TD3.rotX)
    );
    TD3.cam.lookAt(0,6,-40);
    /* نبض وهالات */
    TD3.nodes.forEach(n=>{
      const act=NET.active===n.userData.ip;
      const s=n.userData.self?1:(act?1.14+Math.sin(Date.now()/170)*0.13:1);
      n.scale.setScalar(s);
      if(n.userData.halo)n.userData.halo.material.opacity=act?0.24+Math.sin(Date.now()/300)*0.1:0.14;
    });
    /* تدفق الجزيئات على الوصلات */
    TD3.parts.forEach(dot=>{
      dot.userData.t+=0.006;
      if(dot.userData.t>1)dot.userData.t=0;
      dot.position.lerpVectors(dot.userData.from,dot.userData.to,dot.userData.t);
    });
    TD3.stars.rotation.y+=0.0002;
    TD3.ren.render(TD3.scene,TD3.cam);
  })();
  addEventListener('resize',()=>{
    const fr=$('#td3Frame');
    if(!fr||!fr.clientWidth)return;
    TD3.cam.aspect=fr.clientWidth/fr.clientHeight;
    TD3.cam.updateProjectionMatrix();
    TD3.ren.setSize(fr.clientWidth,fr.clientHeight);
  });
}
function syncNet3dUI(){
  const b=document.querySelector('#taskbar .launch[data-app="net3d"]');
  if(b)b.style.display='';
}
addEventListener('resize',()=>{
  if($('#desktop')&&!$('#desktop').hidden)renderIcons();
});
function bindIconDrag(el){
  let sx,sy,ox,oy,drag=false,pid=null;
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    pid=e.pointerId;sx=e.clientX;sy=e.clientY;
    ox=iconPos[el.dataset.app].x;oy=iconPos[el.dataset.app].y;
    drag=false;
    $$('#icons .dicon').forEach(x=>x.classList.remove('sel'));
    el.classList.add('sel');
    try{el.setPointerCapture(pid);}catch(_){}
  });
  el.addEventListener('pointermove',e=>{
    if(pid===null||e.pointerId!==pid)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!drag&&Math.hypot(dx,dy)>6){drag=true;el.classList.add('dragging');}
    if(drag){
      const nx=Math.max(4,Math.min(innerWidth-104,ox+dx));
      const ny=Math.max(4,Math.min(innerHeight-180,oy+dy));
      iconPos[el.dataset.app]={x:nx,y:ny};
      el.style.left=nx+'px';el.style.top=ny+'px';
    }
  });
  el.addEventListener('pointerup',e=>{
    if(pid===null)return;
    try{el.releasePointerCapture(pid);}catch(_){}
    pid=null;
    if(drag){
      drag=false;el.classList.remove('dragging');
      let p=clampPos(iconPos[el.dataset.app]);
      const others=Object.entries(iconPos).filter(([k,v])=>k!==el.dataset.app);
      const hits=p2=>others.some(([k,v])=>Math.abs(v.x-p2.x)<104&&Math.abs(v.y-p2.y)<92);
      if(hits(p)){
        const rows=Math.max(4,Math.floor((innerHeight-70)/100));
        outer:
        for(let c=0;c<10;c++){
          for(let r=0;r<rows;r++){
            const cx=innerWidth-116-c*112, cy=16+r*100;
            if(cx<4)break;
            if(!hits({x:cx,y:cy})){p={x:cx,y:cy};break outer;}
          }
        }
      }
      iconPos[el.dataset.app]=p;
      el.style.left=p.x+'px';el.style.top=p.y+'px';
      persistIcons();
    }
    else openApp(el.dataset.app);
  });
}
function renderStart(){
  const list=[...iconOrderNow(),'info'];
  $('#smGrid').innerHTML=list.map(id=>APPS[id]?'<div class="sm-app" data-app="'+id+'">'+APPS[id].icon+'<span>'+APPS[id].title.split('—')[0].trim()+'</span></div>':'').join('');
  $$('#smGrid .sm-app').forEach(a=>a.onclick=()=>{$('#startMenu').hidden=true;openApp(a.dataset.app);});
}
 $('#tbStart').onclick=e=>{e.stopPropagation();$('#startMenu').hidden=!$('#startMenu').hidden;};
document.addEventListener('click',e=>{
  if(!e.target.closest('#startMenu,#tbStart'))$('#startMenu').hidden=true;
  if(!e.target.closest('#ctxMenu'))$('#ctxMenu').hidden=true;
  if(!e.target.closest('.dicon'))$$('#icons .dicon').forEach(x=>x.classList.remove('sel'));
});
 $('#wm').addEventListener('contextmenu',e=>{
  if(e.target.closest('.win,#icons,#phone'))return;
  e.preventDefault();
  const m=$('#ctxMenu');
  m.innerHTML='<button id="cxTerm">فتح الطرفية</button><button id="cxTermNew">طرفية جديدة (نافذة مستقلة)</button><button id="cxNotes">المفكرة</button><button id="cxBoard">لوحة الأدلة</button><button id="cxSort">ترتيب الأيقونات</button><button id="cxStart">قائمة التطبيقات</button><hr><button id="cxInfo">معلومات النظام</button><button id="cxOff" class="danger">إيقاف التشغيل</button>';
  m.hidden=false;
  m.style.left=Math.min(e.clientX,innerWidth-200)+'px';
  m.style.top=Math.min(e.clientY,innerHeight-340)+'px';
  $('#cxTerm').onclick=()=>{m.hidden=true;openApp('terminal');};
  $('#cxTermNew').onclick=()=>{m.hidden=true;newTerminalWindow();};
  $('#cxNotes').onclick=()=>{m.hidden=true;openApp('notes');};
  $('#cxBoard').onclick=()=>{m.hidden=true;openApp('board');};
  $('#cxSort').onclick=()=>{m.hidden=true;iconPos={};persistIcons();renderIcons();sfx.pop();};
  $('#cxStart').onclick=()=>{m.hidden=true;$('#startMenu').hidden=false;};
  $('#cxInfo').onclick=()=>{m.hidden=true;openApp('info');};
  $('#cxOff').onclick=()=>{m.hidden=true;$('#powerDlg').hidden=false;};
});
 $$('.launch').forEach(b=>b.onclick=()=>openApp(b.dataset.app));

/* ============ NET-3D — طبقة WebGL مطوّرة ============ */
const TD3={scene:null,cam:null,ren:null,nodes:[],links:[],parts:[],stars:[],ray:null,mouse:new THREE.Vector2(),rotY:0,rotX:0.25,zoom:130,isDown:false,px:0,py:0};
function buildNet3D(host){
  host.innerHTML='<div class="t-3d"><div class="t3d-head"><b>NET-3D — شبكة العقد المجسمة</b><span class="mono ltr" style="font-size:9.5px;color:var(--muted)">drag=rotate · wheel=zoom · click=node</span></div>'+
    '<div class="t3d-frame" id="td3Frame"></div>'+
    '<div class="t3d-foot">انقر عقدة للاتصال — الكرات الداكنة غير مكتشفة بعد · الجزيئات الذهبية = حزم بيانات حية</div></div>';
  if(typeof THREE==='undefined'){
    host.querySelector('#td3Frame').innerHTML='<div class="fv-empty">مكتبة Three.js لم تُحمَّل — تحقق من الاتصال بالإنترنت ثم أعد فتح النافذة</div>';
    return;
  }
  initNet3D(host.querySelector('#td3Frame'));
}
function initNet3D(frame){
  if(TD3.ren&&TD3.ren.domElement.parentElement===frame)return;
  const W=frame.clientWidth||600,H=frame.clientHeight||400;
  TD3.scene=new THREE.Scene();
  TD3.scene.background=new THREE.Color(0x040605);
  TD3.scene.fog=new THREE.Fog(0x040605,130,340);
  TD3.cam=new THREE.PerspectiveCamera(55,W/H,0.1,1000);
  TD3.ren=new THREE.WebGLRenderer({antialias:true});
  TD3.ren.setSize(W,H);
  TD3.ren.setPixelRatio(Math.min(devicePixelRatio,2));
  frame.appendChild(TD3.ren.domElement);
  const key=new THREE.PointLight(0xffb000,2.4,320);key.position.set(50,70,70);TD3.scene.add(key);
  const rim=new THREE.PointLight(0x4fd6c2,1.6,320);rim.position.set(-70,-40,-60);TD3.scene.add(rim);
  const back=new THREE.PointLight(0xff5252,0.7,250);back.position.set(0,40,-120);TD3.scene.add(back);
  const grid=new THREE.GridHelper(420,42,0x1d2822,0x101612);
  grid.position.y=-48;TD3.scene.add(grid);
  const starGeo=new THREE.BufferGeometry();
  const starPos=[];
  for(let i=0;i<600;i++)starPos.push((Math.random()-0.5)*700,(Math.random()-0.2)*400,-100-Math.random()*300);
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
  TD3.stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x6a7a6f,size:1.1,transparent:true,opacity:.75}));
  TD3.scene.add(TD3.stars);
  TD3.nodes=[];
  const posMap={'SELF':[0,0,0],'10.0.44.1':[0,14,-80],'10.0.44.23':[-62,28,-36],'10.0.44.77':[62,34,-40]};
  Object.keys(NET.data).forEach((ip,i)=>{
    const d=NET.data[ip];
    const known=NET.known.has(ip);
    const p0=posMap[ip]||[(i%2?70:-70)*(1+i*0.25),22+i*13,-65-i*16];
    const p=known?p0:[p0[0]+18,p0[1]+10,p0[2]+22];
    const geo=new THREE.SphereGeometry(d.self?6.5:4.8,28,28);
    const col=known?(d.self?0x4fd6c2:(d.locked?0x8a6f2e:0xffb000)):0x2c3b31;
    const mat=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:d.self?1:0.5,roughness:.3,metalness:.25});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(p[0],p[1],p[2]);
    mesh.userData={ip:ip,label:d.label,known:known,locked:d.locked,self:d.self};
    if(known){
      const halo=new THREE.Mesh(
        new THREE.SphereGeometry((d.self?8.5:6.2),20,20),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.14,side:THREE.BackSide})
      );
      mesh.add(halo);
      mesh.userData.halo=halo;
    }
    TD3.scene.add(mesh);TD3.nodes.push(mesh);
  });
  const selfN=TD3.nodes.find(n=>n.userData.ip==='SELF');
  TD3.links=[];
  TD3.nodes.forEach(n=>{
    if(n===selfN)return;
    const g=new THREE.BufferGeometry().setFromPoints([selfN.position,n.position]);
    const active=NET.active===n.userData.ip;
    const line=new THREE.Line(g,new THREE.LineBasicMaterial({color:active?0xffb000:0x24332a,transparent:true,opacity:active?.95:.55}));
    TD3.scene.add(line);TD3.links.push(line);
    if(n.userData.known){
      for(let p=0;p<4;p++){
        const dot=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,8),new THREE.MeshBasicMaterial({color:active?0xffd35c:0x4fd6c2}));
        dot.userData={from:selfN.position.clone(),to:n.position.clone(),t:Math.random()};
        TD3.scene.add(dot);TD3.parts.push(dot);
      }
    }
  });
  const dom=TD3.ren.domElement;
  dom.style.cursor='grab';
  dom.addEventListener('pointerdown',e=>{TD3.isDown=true;TD3.px=e.clientX;TD3.py=e.clientY;dom.style.cursor='grabbing';});
  addEventListener('pointerup',()=>{TD3.isDown=false;dom.style.cursor='grab';});
  addEventListener('pointermove',e=>{
    if(TD3.isDown){
      TD3.rotY+=(e.clientX-TD3.px)*0.005;
      TD3.rotX+=(e.clientY-TD3.py)*0.005;
      TD3.rotX=Math.max(-0.95,Math.min(0.95,TD3.rotX));
      TD3.px=e.clientX;TD3.py=e.clientY;
    }
    const r=dom.getBoundingClientRect();
    if(r.width>0){
      TD3.mouse.x=((e.clientX-r.left)/r.width)*2-1;
      TD3.mouse.y=-((e.clientY-r.top)/r.height)*2+1;
    }
  });
  dom.addEventListener('wheel',e=>{e.preventDefault();TD3.zoom=Math.max(55,Math.min(230,TD3.zoom+e.deltaY*0.16));},{passive:false});
  TD3.ray=new THREE.Raycaster();
  dom.addEventListener('click',()=>{
    TD3.ray.setFromCamera(TD3.mouse,TD3.cam);
    const hits=TD3.ray.intersectObjects(TD3.nodes);
    if(hits.length){
      const n=hits[0].object;
      if(!n.userData.known){toast('NET-3D','عقدة غير مكتشفة — شغّل nmap أولاً.','bad');sfx.err();return;}
      if(n.userData.locked){toast('NET-3D','عقدة محصّنة — اتصال مرفوض.','bad');sfx.err();return;}
      uiCmd('connect '+n.userData.ip);
    }
  });
  (function loop3d(){
    requestAnimationFrame(loop3d);
    if(!wins.net3d||wins.net3d.style.display==='none')return;
    TD3.cam.position.set(
      Math.sin(TD3.rotY)*TD3.zoom*Math.cos(TD3.rotX),
      10+TD3.zoom*Math.sin(TD3.rotX),
      Math.cos(TD3.rotY)*TD3.zoom*Math.cos(TD3.rotX)
    );
    TD3.cam.lookAt(0,6,-40);
    TD3.nodes.forEach(n=>{
      const act=NET.active===n.userData.ip;
      const s=n.userData.self?1:(act?1.14+Math.sin(Date.now()/170)*0.13:1);
      n.scale.setScalar(s);
      if(n.userData.halo)n.userData.halo.material.opacity=act?0.24+Math.sin(Date.now()/300)*0.1:0.14;
    });
    TD3.parts.forEach(dot=>{
      dot.userData.t+=0.006;
      if(dot.userData.t>1)dot.userData.t=0;
      dot.position.lerpVectors(dot.userData.from,dot.userData.to,dot.userData.t);
    });
    TD3.stars.rotation.y+=0.0002;
    TD3.ren.render(TD3.scene,TD3.cam);
  })();
  addEventListener('resize',()=>{
    const fr=$('#td3Frame');
    if(!fr||!fr.clientWidth)return;
    TD3.cam.aspect=fr.clientWidth/fr.clientHeight;
    TD3.cam.updateProjectionMatrix();
    TD3.ren.setSize(fr.clientWidth,fr.clientHeight);
  });
}
function syncNet3dUI(){
  const b=document.querySelector('#taskbar .launch[data-app="net3d"]');
  if(b)b.style.display='';
}

/* ============ الصور المدمجة ============ */
const CAR_SVG=`<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="c-vig" cx="50%" cy="45%" r="78%"><stop offset="55%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.55)"/></radialGradient><filter id="c-noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .07 0"/></filter></defs><rect width="480" height="300" fill="#c6caca"/><rect x="0" y="144" width="480" height="156" fill="#4c514d"/><ellipse cx="240" cy="268" rx="128" ry="12" fill="rgba(0,0,0,.35)"/><rect x="140" y="192" width="200" height="62" rx="14" fill="#2e4a7a"/><path d="M172 194 L186 160 Q190 154 200 154 L280 154 Q290 154 294 160 L308 194 Z" fill="#27406b"/><path d="M196 166 L284 166 L296 190 L184 190 Z" fill="#1c2937"/><rect x="146" y="196" width="36" height="11" rx="4" fill="#a8282a"/><rect x="298" y="196" width="36" height="11" rx="4" fill="#a8282a"/><rect x="142" y="228" width="196" height="22" rx="9" fill="#263d66"/><rect x="214" y="226" width="52" height="17" rx="3" fill="#e6c437" stroke="#8a7a20"/><text x="240" y="239" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#1c1c14">HX-4471</text><rect x="152" y="248" width="40" height="15" rx="6" fill="#17130f"/><rect x="288" y="248" width="40" height="15" rx="6" fill="#17130f"/><rect width="480" height="300" fill="url(#c-vig)"/><rect width="480" height="300" filter="url(#c-noise)"/><g font-family="monospace" font-size="13" fill="#f1f2ec"><text x="14" y="26">2024-05-15 14:32:01 UTC</text><text x="466" y="26" text-anchor="end">CAM-04/CHK-3 HWY-16</text><text x="14" y="286">CAM-04/CHK-3 HWY-16</text></g><circle cx="430" cy="282" r="5" fill="#ff4136"><animate attributeName="opacity" values="1;.15;1" dur="1.2s" repeatCount="indefinite"/></circle><text x="444" y="287" font-family="monospace" font-size="12" fill="#ff6b60">REC</text></svg>`;
const DRIVER_SVG=`<svg viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdd2d4"/><stop offset="1" stop-color="#aab1b4"/></linearGradient><radialGradient id="d-vig" cx="50%" cy="45%" r="80%"><stop offset="60%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient><filter id="d-noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .06 0"/></filter></defs><rect width="460" height="300" fill="url(#d-sky)"/><rect x="0" y="58" width="460" height="124" fill="#9aa1a5"/><rect x="6" y="10" width="448" height="240" rx="18" fill="none" stroke="#12161a" stroke-width="14"/><path d="M336 70 Q396 66 402 120 L402 300 L330 300 L326 140 Q326 92 336 70 Z" fill="#191d21"/><path d="M110 300 Q118 232 168 214 Q196 202 210 196 L268 196 Q330 214 352 300 Z" fill="#39482f"/><rect x="222" y="168" width="36" height="26" rx="10" fill="#c99a76"/><ellipse cx="240" cy="130" rx="47" ry="55" fill="#d8a884"/><ellipse cx="284" cy="136" rx="9" ry="14" fill="#c99a76"/><path d="M193 118 Q196 70 240 66 Q284 70 287 118 Q288 96 274 84 Q240 74 206 84 Q192 96 193 118 Z" fill="#4a3a2c"/><line x1="212" y1="118" x2="232" y2="116" stroke="#3c2f24" stroke-width="4" stroke-linecap="round"/><line x1="246" y1="116" x2="264" y2="118" stroke="#3c2f24" stroke-width="4" stroke-linecap="round"/><ellipse cx="222" cy="130" rx="7" ry="6" fill="#2c241d"/><ellipse cx="254" cy="130" rx="7" ry="6" fill="#2c241d"/><path d="M236 132 Q232 144 236 150 Q240 153 244 150" fill="none" stroke="#b98a67" stroke-width="3" stroke-linecap="round"/><path d="M203 142 Q206 176 226 186 Q240 192 254 186 Q274 176 277 142 Q276 168 262 178 Q240 190 218 178 Q204 168 203 142 Z" fill="#4e3d2c"/><path d="M206 146 Q210 172 228 181 Q240 186 252 181 Q270 172 274 146 Q272 164 258 173 Q240 182 222 173 Q208 164 206 146 Z" fill="#5b4935"/><path d="M228 166 Q240 172 252 166" stroke="#3a2d20" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="0" y="244" width="460" height="56" fill="#14181c"/><rect x="0" y="240" width="460" height="8" rx="4" fill="#1d2227"/><rect width="460" height="300" fill="url(#d-vig)"/><rect width="460" height="300" filter="url(#d-noise)"/></svg>`;
const camMedia=()=>IMG.camCar?'<img src="'+IMG.camCar+'" alt="CAM-04">':CAR_SVG;
const driverMedia=()=>IMG.driver?'<img src="'+IMG.driver+'" alt="driver">':DRIVER_SVG;
function showPhoto(title,media,meta){
  $('#pmMedia').innerHTML=media;$('#pmTitle').textContent=title;$('#pmMeta').textContent=meta||'';
  $('#photoModal').hidden=false;sfx.shutter();
}
 $('#pmClose').onclick=()=>{$('#photoModal').hidden=true;};
 $('#photoModal').addEventListener('click',e=>{if(e.target.id==='photoModal')$('#photoModal').hidden=true;});

/* ============ الانترو + الدخول ============ */
const INTRO_URL='https://res.cloudinary.com/rr0h5xww/video/upload/v1788782718/intro.mp4';
function initIntro(){
  const scr=$('#introScreen'), vid=$('#introVideo'),
        playBtn=$('#introPlay'), skipBtn=$('#introSkip');
  if(!scr||!vid){ afterIntro(); return; }
  let introDone=false;
  const toBoot=()=>{
    if(introDone)return; introDone=true;
    try{sessionStorage.setItem('nexus7_intro','1');}catch(e){}
    scr.classList.add('fadeout');
    setTimeout(()=>{ scr.remove(); afterIntro(); }, 480);
  };
  vid.addEventListener('error',()=>{ try{scr.remove();}catch(e){} afterIntro(); },{once:true});
  if(sessionStorage.getItem('nexus7_intro')){ try{scr.remove();}catch(e){} afterIntro(); return; }
  scr.hidden=false;
  playBtn.onclick=()=>{
    audioInit();
    vid.src=INTRO_URL;
    playBtn.hidden=true;
    skipBtn.hidden=false;
    vid.play().catch(toBoot);
  };
  skipBtn.onclick=toBoot;
  vid.addEventListener('ended',toBoot);
}
function afterIntro(){
  const saved=idLoad();
  if(saved&&saved.hash)loginStart(saved);
  else setupStart();
}

/* ============ الإقلاع ============ */
const BOOT_LINES=['NEXUS-7 SECURE SHELL — BIOS v4.12','MEM CHECK .................... 64K OK','PHOSPHOR DRIVER .............. OK','CRYPTO MODULE ................ OK','TRACE SPOOFER ................ OK','MOUNTING /dev/vault .......... OK','UPLINK ....................... 10.0.44.1','OPERATOR INTERFACE ........... READY'];
async function bootSeq(){
  restoreGame();
  loadBoard();
  if(typeof NIGHTS==='undefined')console.error('[NEXUS] story.js غير محمّل! الترتيب: story.js ثم engine.js');
  const log=$('#bootLog');
  for(let i=0;i<BOOT_LINES.length;i++){
    log.innerHTML+=BOOT_LINES[i]+'\n';
    $('#bootBar').style.width=((i+1)/BOOT_LINES.length*100)+'%';
    await sleep(rnd(130,340));
  }
  $('#bootBtn').hidden=false;
}
 $('#bootBtn').onclick=()=>{
  audioInit();sfx.conn();
  $('#boot').classList.add('off');
  setTimeout(()=>{
    $('#boot').remove();
    const d=$('#desktop');d.hidden=false;
    d.classList.add('boot-in');
    enterOS();
  },380);
};
function enterOS(){
  setInterval(()=>{
    World.gSec=(World.gSec+1)%86400;
    const c=clockStr();
    $('#tbClock').textContent=c;
    $('#phClock').textContent=c.slice(0,5);
  },1000);
  $('#tbClock').textContent=clockStr();
  $('#phClock').textContent=clockStr().slice(0,5);
  renderIcons();renderStart();renderObj();syncMirqabUI();syncLynxUI();syncNet3dUI();
  requestAnimationFrame(drawMq);
  Facts.checkAll();
  sysSay('القناة خاملة — بانتظار اتصال المشرف');
  setTimeout(()=>toast('نظام','أهلاً '+ID.name+' — الوحدة بانتظارك. رمزك: راصد.'),700);
  setTimeout(incomingCall,3500);
}

initIntro();
