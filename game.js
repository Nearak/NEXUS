'use strict';
/* NEXUS-7 — الليلة 1: «الطريق 16» | المشرف كامل + لوحة الأدلة */

const IMG={camCar:'',driver:''};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=(a,b)=>a+Math.random()*(b-a);
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

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
  msg(){tone(620,.09,'sine',.05);tone(930,.12,'sine',.05,.1);},
  ring(){for(let i=0;i<3;i++){tone(1200,.1,'sine',.055,i*.24);tone(950,.1,'sine',.055,i*.24+.12);}},
  ok(){[523,659,880].forEach((f,i)=>tone(f,.1,'triangle',.05,i*.09));},
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

/* ============ الحالة ============ */
const S={host:null,scanned:false,msf:false,
  flags:{live:false,help:0,nmap:0,hydra:0,conn:0,log:0,hash:0,plate:0,root:0,enc:0,key:0,sent:0,declined:0,camShown:0,driverShown:0},
  trace:{on:false,pct:0,timer:null}};
let night=1;
const canSend=()=>S.flags.log&&S.flags.plate&&S.flags.root&&S.flags.key;
let gSec=2*3600+58*60;
function clockStr(){const p=n=>String(n).padStart(2,'0');return p(Math.floor(gSec/3600)%24)+':'+p(Math.floor(gSec/60)%60)+':'+p(gSec%60);}
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

/* ============ الصور المدمجة ============ */
const CAR_SVG=`<svg viewBox="0 0 480 300" xmlns="assests/car1p.png"><defs><pattern id="c-win" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="#b3b8ba"/><rect x="7" y="6" width="26" height="20" fill="#5a666e"/><rect x="7" y="6" width="26" height="6" fill="#6e7a82"/></pattern><radialGradient id="c-vig" cx="50%" cy="45%" r="78%"><stop offset="55%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.55)"/></radialGradient><filter id="c-noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .07 0"/></filter></defs><rect width="480" height="300" fill="#c6caca"/><rect x="0" y="12" width="480" height="128" fill="url(#c-win)"/><rect x="0" y="136" width="480" height="8" fill="#8e9598"/><rect x="0" y="144" width="480" height="156" fill="#4c514d"/><g stroke="#c9cdc7" stroke-width="3" opacity=".65"><line x1="30" y1="160" x2="10" y2="296"/><line x1="140" y1="160" x2="128" y2="296"/><line x1="250" y1="160" x2="246" y2="296"/><line x1="360" y1="160" x2="364" y2="296"/><line x1="462" y1="160" x2="470" y2="296"/></g><g transform="translate(8,168)"><rect width="86" height="34" rx="9" fill="#dad7cd"/><rect x="14" y="-14" width="56" height="22" rx="8" fill="#c9c6bc"/><rect x="20" y="-10" width="44" height="13" rx="4" fill="#5d6a72"/><rect x="8" y="30" width="16" height="12" rx="4" fill="#20211f"/><rect x="60" y="30" width="16" height="12" rx="4" fill="#20211f"/></g><g transform="translate(356,166)"><rect width="92" height="36" rx="9" fill="#39434d"/><rect x="16" y="-14" width="58" height="22" rx="8" fill="#2e3740"/><rect x="22" y="-10" width="46" height="13" rx="4" fill="#4d5860"/><rect x="8" y="32" width="17" height="12" rx="4" fill="#15161a"/><rect x="64" y="32" width="17" height="12" rx="4" fill="#15161a"/></g><ellipse cx="240" cy="268" rx="128" ry="12" fill="rgba(0,0,0,.35)"/><rect x="140" y="192" width="200" height="62" rx="14" fill="#2e4a7a"/><path d="M172 194 L186 160 Q190 154 200 154 L280 154 Q290 154 294 160 L308 194 Z" fill="#27406b"/><path d="M196 166 L284 166 L296 190 L184 190 Z" fill="#1c2937"/><rect x="308" y="168" width="26" height="22" rx="5" fill="#22303d"/><rect x="146" y="196" width="36" height="11" rx="4" fill="#a8282a"/><rect x="150" y="198" width="24" height="6" rx="2" fill="#d8494a"/><rect x="298" y="196" width="36" height="11" rx="4" fill="#a8282a"/><rect x="304" y="198" width="24" height="6" rx="2" fill="#d8494a"/><rect x="142" y="228" width="196" height="22" rx="9" fill="#263d66"/><circle cx="240" cy="207" r="8" fill="#1c2f52" stroke="#152744" stroke-width="2"/><rect x="214" y="226" width="52" height="17" rx="3" fill="#e6c437" stroke="#8a7a20"/><text x="240" y="239" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#1c1c14">HX-4471</text><rect x="152" y="248" width="40" height="15" rx="6" fill="#17130f"/><rect x="288" y="248" width="40" height="15" rx="6" fill="#17130f"/><rect width="480" height="300" fill="url(#c-vig)"/><rect width="480" height="300" filter="url(#c-noise)"/><g font-family="monospace" font-size="13" fill="#f1f2ec"><text x="14" y="26">2024-05-15 14:32:01 UTC</text><text x="466" y="26" text-anchor="end">CAM-04/CHK-3 HWY-16</text><text x="14" y="286">CAM-04/CHK-3 HWY-16</text></g><circle cx="430" cy="282" r="5" fill="#ff4136"><animate attributeName="opacity" values="1;.15;1" dur="1.2s" repeatCount="indefinite"/></circle><text x="444" y="287" font-family="monospace" font-size="12" fill="#ff6b60">REC</text></svg>`;
const DRIVER_SVG=`<svg viewBox="0 0 460 300" xmlns="assests/person1p.png"><defs><linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdd2d4"/><stop offset="1" stop-color="#aab1b4"/></linearGradient><radialGradient id="d-vig" cx="50%" cy="45%" r="80%"><stop offset="60%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient><filter id="d-noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .06 0"/></filter><pattern id="d-win" width="34" height="30" patternUnits="userSpaceOnUse"><rect x="5" y="5" width="20" height="16" fill="#7d848a" opacity=".8"/></pattern></defs><rect width="460" height="300" fill="url(#d-sky)"/><rect x="0" y="58" width="460" height="124" fill="#9aa1a5"/><rect x="0" y="58" width="460" height="124" fill="url(#d-win)"/><rect x="6" y="10" width="448" height="240" rx="18" fill="none" stroke="#12161a" stroke-width="14"/><path d="M336 70 Q396 66 402 120 L402 300 L330 300 L326 140 Q326 92 336 70 Z" fill="#191d21"/><path d="M352 176 L260 300 L296 300 L376 186 Z" fill="#22272c"/><path d="M110 300 Q118 232 168 214 Q196 202 210 196 L268 196 Q330 214 352 300 Z" fill="#39482f"/><path d="M210 196 L268 196 L262 214 L216 214 Z" fill="#2c3925"/><path d="M206 200 Q238 188 270 200 L262 176 Q238 168 214 176 Z" fill="#46563a"/><rect x="222" y="168" width="36" height="26" rx="10" fill="#c99a76"/><ellipse cx="240" cy="130" rx="47" ry="55" fill="#d8a884"/><ellipse cx="284" cy="136" rx="9" ry="14" fill="#c99a76"/><path d="M193 118 Q196 70 240 66 Q284 70 287 118 Q288 96 274 84 Q240 74 206 84 Q192 96 193 118 Z" fill="#4a3a2c"/><line x1="212" y1="118" x2="232" y2="116" stroke="#3c2f24" stroke-width="4" stroke-linecap="round"/><line x1="246" y1="116" x2="264" y2="118" stroke="#3c2f24" stroke-width="4" stroke-linecap="round"/><ellipse cx="222" cy="130" rx="7" ry="6" fill="#2c241d"/><circle cx="219" cy="130" r="2.4" fill="#0d0b09"/><ellipse cx="254" cy="130" rx="7" ry="6" fill="#2c241d"/><circle cx="251" cy="130" r="2.4" fill="#0d0b09"/><path d="M236 132 Q232 144 236 150 Q240 153 244 150" fill="none" stroke="#b98a67" stroke-width="3" stroke-linecap="round"/><path d="M203 142 Q206 176 226 186 Q240 192 254 186 Q274 176 277 142 Q276 168 262 178 Q240 190 218 178 Q204 168 203 142 Z" fill="#4e3d2c"/><path d="M206 146 Q210 172 228 181 Q240 186 252 181 Q270 172 274 146 Q272 164 258 173 Q240 182 222 173 Q208 164 206 146 Z" fill="#5b4935"/><path d="M228 166 Q240 172 252 166" stroke="#3a2d20" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="0" y="244" width="460" height="56" fill="#14181c"/><rect x="0" y="240" width="460" height="8" rx="4" fill="#1d2227"/><rect x="30" y="262" width="60" height="10" rx="5" fill="#2a3138"/><rect width="460" height="300" fill="url(#d-vig)"/><rect width="460" height="300" filter="url(#d-noise)"/></svg>`;
const camMedia=()=>IMG.camCar?'<img src="'+IMG.camCar+'" alt="CAM-04">':CAR_SVG;
const driverMedia=()=>IMG.driver?'<img src="'+IMG.driver+'" alt="driver">':DRIVER_SVG;
function showPhoto(title,media,meta){
  $('#pmMedia').innerHTML=media;
  $('#pmTitle').textContent=title;
  $('#pmMeta').textContent=meta||'';
  $('#photoModal').hidden=false;
  sfx.shutter();
}
 $('#pmClose').onclick=()=>{$('#photoModal').hidden=true;};
 $('#photoModal').addEventListener('click',e=>{if(e.target.id==='photoModal')$('#photoModal').hidden=true;});

/* ============ مدير النوافذ ============ */
let zTop=50,spawn=0,focusId=null;
const wins={},bodies={};
function focusWin(id){
  const w=wins[id];if(!w)return;
  focusId=id;
  w.style.zIndex=++zTop;
  $$('.win').forEach(x=>x.classList.remove('focus'));
  w.classList.add('focus');
  syncTaskWindows();
}
function openApp(id){
  const a=APPS[id];if(!a)return;
  sfx.pop();
  if(wins[id]){
    wins[id].style.display='flex';
    focusWin(id);
    a.onOpen&&a.onOpen();
    syncTaskWindows();
    return;
  }
  const win=document.createElement('section');
  win.className='win';win.dataset.app=id;
  win.style.width=a.w+'px';win.style.height=a.h+'px';
  const x=Math.max(8,Math.min(innerWidth-a.w-130,90+(spawn%6)*30));
  const y=Math.max(8,Math.min(innerHeight-a.h-70,26+(spawn%6)*26));spawn++;
  win.style.left=x+'px';win.style.top=y+'px';
  win.innerHTML='<header class="win-h"><span style="display:flex">'+a.icon+'</span><b>'+a.title+'</b><span class="win-btns"><button data-a="min" title="تصغير">–</button><button data-a="max" title="تكبير">▢</button><button data-a="close" title="إغلاق">×</button></span></header><div class="win-b"></div><div class="win-rz" title="تغيير الحجم"></div>';
  $('#winLayer').appendChild(win);
  wins[id]=win;
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
  focusWin(id);
  a.onOpen&&a.onOpen();
  syncTaskWindows();
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

/* ============ الطرفية ============ */
let termEl=null,cmdEl=null,promptEl=null;
let busy=false;const hist=[];let hi=-1;
function tprint(html='',cls=''){
  if(!termEl)return null;
  const d=document.createElement('div');d.className='tl '+cls;d.innerHTML=html;
  termEl.appendChild(d);termEl.scrollTop=termEl.scrollHeight;return d;
}
async function ttype(text,cls='',spd=7){
  const d=tprint('',cls);if(!d)return;
  for(const ch of text){d.textContent+=ch;if(Math.random()<.3)sfx.key();termEl.scrollTop=termEl.scrollHeight;await sleep(spd);}
}
async function tprogress(label,dur=1400){
  const d=tprint('');if(!d)return;
  for(let p=0;p<=100;p+=4){
    const fill=Math.floor(p/5);
    d.textContent=label+' ['+'█'.repeat(fill)+'░'.repeat(20-fill)+'] '+String(p).padStart(3)+'%';
    if(p%12===0)sfx.tick();
    termEl.scrollTop=termEl.scrollHeight;await sleep(dur/25);
  }
  d.innerHTML=esc(label)+' ['+'█'.repeat(20)+'] 100% <span class="gr">OK</span>';
}
async function runCmd(raw){
  const line=raw.trim();if(!line)return;
  if(S.msf)return runMsf(line);
  const parts=line.split(/\s+/);
  const cmd=parts[0].toLowerCase(),arg=parts.slice(1).join(' ');
  busy=true;
  try{
    switch(cmd){
      case 'help':cmdHelp();break;
      case 'ls':cmdLs();break;
      case 'cat':case 'open':cmdCat(parts[1]||'');break;
      case 'download':case 'dl':await cmdDownload(parts[1]||'');break;
      case 'rm':cmdRm(parts[1]||'');break;
      case 'nmap':await cmdNmap();break;
      case 'hydra':await cmdHydra(arg);break;
      case 'hashcat':await cmdHashcat('hashcat');break;
      case 'john':await cmdHashcat('john');break;
      case 'connect':case 'ssh':await cmdConnect(parts[1]||'',parts[2],parts[3]);break;
      case 'msfconsole':cmdMsfStart();break;
      case 'db':openApp('db');tprint('opening CIVIC RECORDS mirror…','dim');break;
      case 'decrypt':openApp('decrypt');break;
      case 'notes':openApp('notes');break;
      case 'evidence':case 'board':openApp('board');break;
      case 'disconnect':case 'exit':cmdDisconnect();break;
      case 'trace':cmdTrace();break;
      case 'send':await cmdSend();break;
      case 'clear':case 'cls':termEl.innerHTML='';break;
      case 'whoami':tprint('<span class="am">'+esc(ID.name)+'</span> — codename: <span class="am">RASED</span> · clearance: PROVISIONAL');break;
      case 'date':tprint(clockStr()+' — الليلة '+String(night).padStart(2,'0'));break;
      case 'pwd':tprint('/operator/nexus-7');break;
      case 'echo':tprint(esc(arg)||'');break;
      case 'history':hist.forEach((h,i)=>tprint('  '+String(i+1).padStart(3)+'  '+esc(h),'dim'));break;
      case 'ping':await cmdPing(parts[1]||'');break;
      case 'ifconfig':tprint('eth0: flags=4163<UP,BROADCAST,RUNNING>\n    inet <span class="am">10.0.44.9</span>  netmask 255.255.255.0\n    ether 8a:2f:11:c4:0e:77','dim');break;
      case 'netstat':if(S.host)tprint('tcp  0  0  10.0.44.9:4471  '+S.host+':22  <span class="gr">ESTABLISHED</span>','dim');else tprint('no active tunnels','dim');tprint('tcp  0  0  127.0.0.1:8010  0.0.0.0:*  LISTEN  (ch-07 daemon)','dim');break;
      case 'ps':tprint('  PID TTY      STAT   TIME COMMAND\n    1 ?        Ss     0:02 /sbin/init\n  217 ?        S      0:44 ch07-daemon --channel=secure\n  311 ?        S      0:01 trace-spoofer --stealth\n  402 pts/0    Ss     0:00 -bash','dim');break;
      case 'browser':openApp('browser');break;
      default:tprint(esc(cmd)+': command not found — اكتب <span class="am">help</span>','err-lite');sfx.err();
    }
  }finally{busy=false;}
}
function cmdHelp(){
  const rows=[['── استطلاع ──',''],['nmap','مسح الشبكة'],['ping &lt;ip&gt;','اختبار وصول'],['── اختراق ──',''],['hydra -l admin -P rockyou.txt ssh://ip','كسر كلمة مرور SSH'],['connect &lt;ip&gt; [user pass]','فتح نفق'],['msfconsole','إطار استغلال الثغرات'],['hashcat -m 0 &lt;hash&gt; rockyou.txt','كسر بصمات MD5'],['john &lt;hash&gt;','كسر بـ john'],['── ملفات ──',''],['ls · cat &lt;f&gt; · download &lt;f&gt; · rm &lt;f&gt;','استعراض ونسخ وحذف'],['── أدوات المشغّل ──',''],['db · decrypt · evidence · notes · send · trace','—'],['── أخرى ──',''],['ifconfig · netstat · ps · history · clear','—']];
  tprint('<span class="am">── NEXUS-7 shell — الأوامر المتاحة ──</span>');
  rows.forEach(([c,d])=>{if(!d)tprint('<span class="am">'+c+'</span>');else tprint('<div style="display:flex;gap:14px"><span style="min-width:250px;color:var(--amber)">'+c+'</span><span class="dim">'+d+'</span></div>');});
  objDone('help');if(S.flags.live)story.help();
}
function cmdLs(){
  if(S.host){
    tprint('host: <span class="am">'+NET.data[S.host].label+'</span>','dim');
    NET.data[S.host].files.forEach(n=>{
      const f=FILES[n];
      const tag=f.root?'<span class="rd">[root]</span>':(f.kind==='enc'?'<span class="rd">[enc]</span>':(f.kind==='photo'?'<span class="am">[photo]</span>':'<span class="dim">['+f.kind+']</span>'));
      tprint(n.padEnd(18)+' '+String(f.kb).padStart(3)+' KB  '+tag);
    });
  }
  tprint('vault: <span class="gr">local</span>','dim');
  localFiles.forEach(n=>{const f=FILES[n];if(f)tprint(n.padEnd(18)+' '+String(f.kb).padStart(3)+' KB  <span class="gr">['+f.kind+']</span>');});
}
function cmdCat(name){
  name=(name||'').trim();
  const f=FILES[name];
  if(!f){tprint('cat: '+esc(name||'?')+': no such file','err-lite');sfx.err();return;}
  const can=f.got||f.where==='local'||(S.host&&f.where===S.host);
  if(!can){tprint('file not reachable — اتصل بعقدته أولاً','err-lite');sfx.err();return;}
  openApp('files');openFile(name);
}
async function cmdDownload(name){
  name=(name||'').trim();
  if(!S.host){tprint('download: not connected — لا مضيف نشط','err-lite');sfx.err();return;}
  const f=FILES[name];
  if(!f||f.where!==S.host){tprint('download: '+esc(name)+': no such file on host — استخدم ls','err-lite');sfx.err();return;}
  if(f.got){tprint(name+': already in vault','dim');return;}
  if(f.root&&!S.flags.root){
    tprint('download: '+esc(name)+': <span class="rd">permission denied</span> — الملف للجذر root فقط','err-lite');
    tprint('hint: <span class="am">msfconsole</span> — ثغرة HWY-CAM 2.1 تمنحك جذر الشل','dim');sfx.err();return;
  }
  await ttype('downloading '+name+' ('+f.kb+' KB)','ok');
  const pulse=setInterval(()=>netPulse(S.host),260);
  await tprogress('transfer',1500);
  clearInterval(pulse);
  f.got=true;localFiles.push(name);persist();
  renderFiles();
  tprint('<span class="gr">saved → vault/'+esc(name)+'</span>');
  toast('الخزنة','وصل ملف جديد: '+name,'good');
  bumpTrace(10);
  if(name==='hwy16_log.log'){addClue('log');addClue('plate');objDone('log');story.log();}
  if(name==='case_file.enc'){objDone('enc');story.enc();}
}
function trashFile(name){
  if(!localFiles.includes(name))return false;
  if(name==='README.txt'){tprint('rm: لن تحذف ملاحظاتي يا عزيزي','err-lite');return false;}
  localFiles=localFiles.filter(x=>x!==name);
  FILES[name].got=false;trash.push(name);
  renderFiles();renderTrash();persist();
  sfx.pop();
  return true;
}
function cmdRm(name){
  name=(name||'').trim();
  if(trashFile(name))tprint('moved → trash/'+esc(name),'dim');
  else if(name){tprint('rm: '+esc(name)+': not in vault','err-lite');sfx.err();}
}
async function cmdNmap(){
  if(S.scanned){tprint('nmap: scan complete — راجع النتائج أعلاه أو خريطة NET','dim');return;}
  await ttype('Starting Nmap 7.94 ( https://nmap.org )','dim');
  await tprogress('scanning 10.0.44.0/24',1600);
  for(const [ip,label,tag] of [['10.0.44.1','ISP-GATEWAY','carrier'],['10.0.44.23','NET-BRIDGE-23','acl-locked'],['10.0.44.77','HWY16-CAM','secure']]){
    await sleep(rnd(240,460));
    tprint('Nmap scan report for <span class="am">'+ip+'</span>  ('+label+')  <span class="dim">['+tag+']</span>');
    netReveal(ip);sfx.tick();
  }
  await sleep(250);
  tprint('PORT     STATE  SERVICE   VERSION\n22/tcp   open   ssh       OpenSSH 7.9 <span class="am">(auth: password — weak host key)</span>\n80/tcp   open   http      <span class="am">HWY-CAM 2.1</span> <span class="rd">(known CVEs — check msfconsole)</span>','dim');
  tprint('Nmap done: 3 hosts up','ok');
  S.scanned=true;persist();
  objDone('nmap');story.nmap();
}
async function cmdHydra(arg){
  if(!arg.includes('10.0.44.77')){
    tprint('hydra: استخدم الهدف الصحيح — مثال:','err-lite');
    tprint('hydra -l admin -P rockyou.txt ssh://10.0.44.77','dim');sfx.err();return;
  }
  if(!S.scanned){tprint('hydra: no known host — شغّل <span class="am">nmap</span> أولاً','err-lite');sfx.err();return;}
  if(S.flags.hydra){tprint('hydra: كُسرت سابقاً — admin : <span class="gr">orion2024</span>','dim');return;}
  await ttype('Hydra v9.5 starting — 1 target, 16 threads','dim');
  const tries=['123456','admin','orion','letmein','qwerty','camera','111111','dragon','orion123'];
  for(const pw of tries){await sleep(rnd(140,320));tprint('[ATTEMPT] target ssh://10.0.44.77 - login "<span class="am">admin</span>" - pass "<span class="dim">'+pw+'</span>"');sfx.tick();}
  await sleep(500);
  tprint('[22][ssh] host: 10.0.44.77   login: admin   password: <span class="gr">orion2024</span>');
  tprint('1 of 1 target successfully completed.','gr');
  sfx.ok();S.flags.hydra=true;persist();
  toast('hydra','كلمة المرور: orion2024','good');
  objDone('hydra');story.hydra();
}
async function cmdHashcat(tool){
  if(!FILES['hwy16_log.log'].got){tprint(tool+': لا توجد بصمة — حمّل واقرأ <span class="am">hwy16_log.log</span> أولاً','err-lite');sfx.err();return;}
  if(S.flags.hash){tprint(tool+': البصمة مكسورة سابقاً → <span class="gr">password</span>','dim');return;}
  if(tool==='hashcat'){
    await ttype('hashcat (v6.2.6) starting in single-hash mode','dim');
    tprint('Hash.Mode........: 0 (MD5)\nSpeed.#1.........: 10234.5 kH/s\nRecovered........: 0/1 (0.00%) Digests','dim');
    await tprogress('cracking',1900);
    tprint('Recovered........: <span class="gr">1/1 (100.00%) Digests</span>');
    tprint('<span class="gr">5f4dcc3b5aa765d61d8327deb882cf99:password</span>');
  }else{
    await ttype('john the ripper — Loaded 1 password hash (Raw MD5)','dim');
    await tprogress('wordlist: rockyou.txt',1900);
    tprint('<span class="gr">password</span>         (?)\n1 password hash cracked in 00:00:07');
  }
  sfx.ok();S.flags.hash=true;persist();
  addClue('hash');
  toast(tool,'البصمة = password — لا تعليق.','good');
  objDone('hash');story.hash();
}
async function cmdConnect(ip,user,pass){
  ip=(ip||'').trim();
  if(!ip){tprint('usage: connect &lt;ip&gt; [user pass]','dim');return;}
  if(S.host===ip){tprint('already connected to '+ip,'dim');return;}
  if(!NET.known.has(ip)){tprint('no route to host '+esc(ip)+' — شغّل <span class="am">nmap</span> أولاً','err-lite');sfx.err();return;}
  const d=NET.data[ip];
  if(d.locked){tprint(ip+' <span class="am">'+d.label+'</span>: <span class="rd">'+d.reason+'</span>','err-lite');sfx.err();toast('عقدة محصّنة',d.reason,'bad');return;}
  if(!S.flags.hydra){
    if(user&&pass&&user.toLowerCase()==='admin'&&pass==='orion2024'){
      S.flags.hydra=true;persist();
      tprint('ssh creds accepted for '+ip,'ok');
    }else{
      tprint(ip+': ssh password required — شغّل <span class="am">hydra</span> أولاً، أو مرّر البيانات هكذا:','err-lite');
      tprint('connect '+ip+' &lt;user&gt; &lt;pass&gt;','dim');
      sfx.err();return;
    }
  }
  await ttype('resolving '+ip+' ... ok  (creds: admin)','ok');
  tprint('opening tunnel :: port 4471','dim');
  await tprogress('handshake',1100);
  glitch(1);sfx.conn();
  tprint('<span class="gr">ACCESS GRANTED</span> — node: <span class="am">'+d.label+'</span>');
  S.host=ip;
  const nh=$('#nmHost');if(nh)nh.textContent=ip+' :: '+d.label;
  netSetActive(ip);startTrace();
  tprint('<span class="rd">traceback active</span> — انسحب بـ disconnect قبل اكتمال العد.','dim');
  if(!S.flags.camShown){
    S.flags.camShown=1;persist();
    addClue('cam');
    setTimeout(()=>showPhoto('CAM-04 — بث مُعترَض · الطريق 16',camMedia(),'نقطة تفتيش 3 · 2024-05-15 14:32 UTC — سيارة زرقاء، اللوحة HX-4471. النسخة محفوظة: cam04_frame.jpg'),350);
  }
  objDone('conn');story.connect();
}
function cmdMsfStart(){
  if(!S.scanned){tprint('msfconsole: لا أهداف معروفة — شغّل <span class="am">nmap</span> أولاً','err-lite');sfx.err();return;}
  S.msf=true;
  if(promptEl)promptEl.textContent='msf6 >';
  tprint('       =[ metasploit v6.4 — 2418 exploits\n+ -- --=[ 1289 payloads / 47 encoders\n       =[ مستعد — اكتب <span class="am">search hwycam</span>','dim');
  tprint('للخروج: exit أو back','dim');
}
async function runMsf(line){
  const p=line.trim().toLowerCase();busy=true;
  try{
    if(p==='exit'||p==='back'||p==='quit'){S.msf=false;if(promptEl)promptEl.textContent=ID.name+'@nexus-7:~$';tprint('back to bash.','dim');return;}
    if(p.startsWith('search')){tprint('Matching Modules\n================\n   0  exploit/linux/http/hwycam_rce      excellent  Yes\n      <span class="am">HWY-CAM v2.x — Unauthenticated RCE (CVE-2024-1337)</span>');return;}
    if(p==='use 0'||p.includes('hwycam_rce')||p==='use'){tprint('Using exploit/linux/http/hwycam_rce','dim');tprint('الخطوة التالية: <span class="am">set RHOSTS 10.0.44.77</span> ثم <span class="am">exploit</span>','dim');return;}
    if(p.startsWith('set')){
      if(!S.host){tprint('[-] exploit requires an active tunnel — <span class="am">connect 10.0.44.77</span> أولاً','err-lite');sfx.err();return;}
      tprint('RHOSTS => 10.0.44.77 (from active tunnel)','dim');return;
    }
    if(p==='exploit'||p==='run'){
      if(!S.host){tprint('[-] لا نفق نشط — اتصل بالهدف أولاً','err-lite');sfx.err();return;}
      tprint('[*] Started reverse TCP handler on 10.0.44.9:4444','dim');
      await tprogress('sending stage',1600);
      await sleep(400);glitch(1);sfx.unlock();
      tprint('[*] Sending stage (20124 bytes) to 10.0.44.77','dim');
      tprint('<span class="gr">[+] Meterpreter session 1 opened — uid=0(root)</span>');
      tprint('<span class="gr">[+] root shell obtained — الملفات المحمية متاحة الآن</span>');
      if(!S.flags.root){S.flags.root=true;persist();bumpTrace(15);toast('metasploit','جلسة root مفتوحة — الجذر لك.','good');objDone('root');story.root();}
      return;
    }
    if(p==='info'){tprint('Name: HWY-CAM Unauthenticated RCE\nCVE: 2024-1337 — HWY-CAM 2.1\nملاحظة: يتطلب نفق نشط نحو الهدف','dim');return;}
    tprint(esc(p)+': unknown msf command','err-lite');sfx.err();
  }finally{busy=false;}
}
function cmdDisconnect(){
  if(!S.host){tprint('no active tunnel','dim');return;}
  tprint('tunnel closed. <span class="gr">traceback cleared.</span>');hostDown();
}
function cmdTrace(){
  if(!S.trace.on){tprint('no active traceback — <span class="gr">you are clean.</span>');return;}
  tprint('traceback: <span class="'+(S.trace.pct>70?'rd':'am')+'">'+Math.round(S.trace.pct)+'%</span> — disconnect لتصفيره.');
}
async function doSend(bundle){
  tprint('encrypting report :: AES-Q','dim');
  await tprogress('upload to CH-07',1300);
  tprint('<span class="gr">REPORT DELIVERED</span>'+(bundle?' — '+bundle:' — case items attached.'));
  S.flags.sent=true;persist();
  objDone('sent');story.sent();
}
async function cmdSend(){
  if(S.flags.sent){tprint('report already sent.','dim');return;}
  if(!canSend()){tprint('حزمة التقرير غير مكتملة — راجع سجل المهمة في هاتفك.','err-lite');sfx.err();story.hint(nextObjId());return;}
  await doSend('');
}
async function cmdPing(ip){
  ip=(ip||'').trim();
  if(!ip){tprint('usage: ping <ip>','dim');return;}
  if(!NET.known.has(ip)){tprint('ping: '+esc(ip)+': unknown host','err-lite');sfx.err();return;}
  for(let i=0;i<4;i++){await sleep(300);tprint('64 bytes from '+esc(ip)+': icmp_seq='+(i+1)+' ttl=61 time='+(Math.random()*8+1).toFixed(1)+' ms');}
  tprint('--- 4 packets transmitted, 4 received, 0% loss','dim');
}
function buildTerm(host){
  host.innerHTML='';
  const out=document.createElement('div');out.className='t-out';out.id='termOut';
  const row=document.createElement('div');row.className='t-in';
  promptEl=document.createElement('span');promptEl.className='prompt';promptEl.textContent=ID.name+'@nexus-7:~$';
  cmdEl=document.createElement('input');cmdEl.id='cmd';cmdEl.autocomplete='off';cmdEl.spellcheck=false;
  row.append(promptEl,cmdEl);
  const wrap=document.createElement('div');wrap.className='t-term';
  wrap.append(out,row);host.appendChild(wrap);
  termEl=out;
  cmdEl.addEventListener('keydown',async e=>{
    if(e.key==='Enter'){
      const v=cmdEl.value;cmdEl.value='';
      if(!v.trim())return;
      hist.push(v);hi=hist.length;
      tprint('<span class="usr">'+(S.msf?'msf6 >':ID.name+'@nexus-7:~$')+'</span> '+esc(v),'echo');
      if(busy){tprint('…busy','dim');return;}
      await runCmd(v);
    }else if(e.key==='ArrowUp'){if(hi>0){hi--;cmdEl.value=hist[hi];}}
    else if(e.key==='ArrowDown'){if(hi<hist.length-1){hi++;cmdEl.value=hist[hi];}else{hi=hist.length;cmdEl.value='';}}
  });
  out.addEventListener('click',()=>{if(!getSelection().toString())cmdEl.focus();});
  tprint('NEXUS-7 secure shell — build 7.6','dim');
  tprint('أهلاً <span class="am">'+esc(ID.name)+'</span> — رمزك «راصد». اكتب <span class="am">help</span>.','dim');
}

/* ============ الملفات ============ */
const KEY_PLAIN='== UNIT-7 CASE FILE 4471-A ==\nSUSPECT :: HUSSEINI, MOHANNAD K.\nWARRANT :: HOMICIDE - ACTIVE\nLAST PING :: HWY-16 / EXIT 9\nCLEARED BY :: DESK KAMEL';
const KEY_SHIFT=9;
function caesar(t,s){const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';return t.replace(/[A-Z]/g,ch=>A[(A.indexOf(ch)+s+26)%26]);}
const KEY_CIPHER=caesar(KEY_PLAIN,KEY_SHIFT);
const ENC_HEX='A3F1 0C77 9B2E D440 118F 6A22\nF90C 77B1 32D4 EA05 8871 0C4E';
const BAD_HASH='5f4dcc3b5aa765d61d8327deb882cf99';
const FILES={
  'README.txt':{where:'local',kb:1,kind:'text',body:'NEXUS-7 :: INTEL WORKSTATION — BUILD 7.6\n----------------------------------------\nمحطة مشغّل في وحدة الاستخبارات.\n\nالأدوات:\n  TERM     الطرفية\n  NET      خريطة الشبكة\n  FILES    الخزنة\n  EVIDENCE لوحة الأدلة — رتّب واربط ثم أرفق بالتقرير\n  DECRYPT  فك الأختام\n  DB       السجلات المدنية\n  BROWSER  الشبكة الداخلية\n  NOTES    مفكرتك — تبقى دائماً\n\nالهاتف أسفل الشاشة: اتصالات المشرف كامل وسجل المهمة.'},
  'admin_note.txt':{where:'10.0.44.77',kb:2,kind:'text',body:'=== NOTE TO SELF — sysop/hwy16 ===\n* rotate the admin password WEEKLY (nobody does)\n* someone pulls checkpoint logs past 03:00. not me.\n* ANPR cameras log EVERYTHING. wipe nothing.\n* unit-7 asked for exit-9 footage. twice. tell no one.\n* DO NOT answer extension 44. ever.'},
  'hwy16_log.log':{where:'10.0.44.77',kb:12,kind:'log',body:'[03:07:44] CHK-3 :: VEHICLE PASS :: HWY-16 NORTH\n[03:11:02] CHK-3 :: PLATE READ :: HX-4471\n[03:12:39] CHK-5 :: SPEED 142 :: LANE 2\n[03:13:01] CHK-5 :: PLATE READ :: HX-4471\n[03:14:02] AUTH-FAIL :: sysop :: md5 :: '+BAD_HASH+'\n[03:16:44] CHK-9 :: VEHICLE PASS :: NO PLATE READ\n[04:59:59] DAILY ARCHIVE :: UPLOAD FAILED :: RETRY'},
  'cam04_frame.jpg':{where:'10.0.44.77',kb:8,kind:'photo',body:''},
  'case_file.enc':{where:'10.0.44.77',kb:48,kind:'enc',root:true,body:KEY_PLAIN},
  'case_file.txt':{where:'local',kb:1,kind:'key',body:KEY_PLAIN,hidden:true},
};
let localFiles=['README.txt'];
let trash=[];
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
  localFiles.forEach(n=>{if(FILES[n])h+=fitem(n,FILES[n]);});
  h+='</div>';
  if(S.host){h+='<div class="fl-sec"><h4>المضيف: '+NET.data[S.host].label+'</h4>';NET.data[S.host].files.forEach(n=>h+=fitem(n,FILES[n]));h+='</div>';}
  L.innerHTML=h;
}
function renderTrash(){
  const L=$('#trashList');if(!L)return;
  if(!trash.length){L.innerHTML='<div class="tr-empty">السلة فارغة<br><span class="mono ltr" style="font-size:10px">rm &lt;file&gt; أو اسحب الملف وأفلته على أيقونة السلة</span></div>';return;}
  L.innerHTML=trash.map((n,i)=>'<div class="tr-item">'+fIcon(FILES[n]?FILES[n].kind:'text')+'<b>'+n+'</b><button data-i="'+i+'">استعادة</button></div>').join('');
  L.querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{const n=trash.splice(+b.dataset.i,1)[0];localFiles.push(n);FILES[n].got=true;renderTrash();renderFiles();persist();sfx.pop();};
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
  if(f.kind==='enc'&&!S.flags.key){
    body.innerHTML='<span class="rd">── RSA-OAEP envelope ──</span>\n'+ENC_HEX+'\n<span class="rd">── payload :: caesar ring ──</span>\n'+KEY_CIPHER+'\n\n<span class="am">&gt; افتح أداة DECRYPT</span>';
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
  host.innerHTML='<div class="t-files"><div id="fileList"></div><div id="fileView"><div class="fv-empty">اختر ملفاً من الخزنة لعرضه<br><span style="font-size:11px">أو اسحب ملفاً وأفلته على سلة المهملات</span></div></div></div>';
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
  host.querySelector('#trEmpty').onclick=()=>{if(trash.length){trash=[];renderTrash();sfx.pop();toast('السلة','أُفرغت السلة.','good');}};
  renderTrash();
}

/* ============ الخريطة ============ */
const NET={
  data:{
    'SELF':{x:400,y:452,label:'NEXUS-7',self:true},
    '10.0.44.1':{x:400,y:318,label:'ISP-GATEWAY',locked:true,reason:'carrier node — رفض الوصول'},
    '10.0.44.23':{x:158,y:170,label:'NET-BRIDGE-23',locked:true,reason:'ACL — تصريح صيانة مطلوب'},
    '10.0.44.77':{x:560,y:150,label:'HWY16-CAM',files:['hwy16_log.log','cam04_frame.jpg','admin_note.txt','case_file.enc']},
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
  host.innerHTML='<div class="t-net"><div class="nm-head"><span>LOCAL SUBNET — 10.0.44.0/24</span><b id="nmHost">—</b></div><svg id="netSvg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet"></svg><div class="nm-foot">انقر عقدة لفتح نفق — العقد المحصّنة ترفض الاتصال</div></div>';
  renderNet();
}

/* ============ التتبع ============ */
function startTrace(){
  S.trace.on=true;S.trace.pct=8;
  $('#tracePill').hidden=false;updTrace();
  S.trace.timer=setInterval(()=>{
    S.trace.pct=Math.min(100,S.trace.pct+1.5);updTrace();
    if(S.trace.pct>70&&S.trace.pct<100&&Math.round(S.trace.pct)%2===0)sfx.warn();
    if(S.trace.pct>=100)breach();
  },1000);
}
function bumpTrace(v){if(!S.trace.on)return;S.trace.pct=Math.min(100,S.trace.pct+v);updTrace();}
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
  tprint('<span class="rd">!! TRACEBACK COMPLETE — connection severed by remote host</span>','err-lite');
  hostDown();story.breach();
}
function hostDown(){
  S.host=null;stopTrace();netSetActive(null);
  const nh=$('#nmHost');if(nh)nh.textContent='—';
  renderFiles();
}

/* ============ فك التشفير ============ */
function buildDec(host){
  host.innerHTML='<div class="t-dec">'+
    '<div id="decEmpty" class="fv-empty" style="min-height:200px">لا يوجد ملف مشفر في الخزنة.<br>حمّل <b class="ltr" style="color:var(--amber)">case_file.enc</b> من HWY16-CAM (يتطلب root).</div>'+
    '<div id="decWork" hidden>'+
    '<div class="dec-lbl">CIPHERTEXT</div><pre id="decCipher" class="blob"></pre>'+
    '<div class="dec-ctl"><span class="lbl">RING&nbsp;SHIFT</span><input type="range" id="decShift" min="0" max="25" value="0" step="1"><output id="decShiftVal">00</output></div>'+
    '<div class="dec-lbl">PLAINTEXT (LIVE)</div><pre id="decPlain"></pre>'+
    '<div class="dec-meter"><div class="mbar"><i id="decBar"></i></div><b id="decPct">0%</b><span id="decStatus">حرّك الحلقة حتى يوضح النص…</span></div>'+
    '<button id="decLock" disabled>تثبيت الملف</button>'+
    '</div></div>';
  host.querySelector('#decShift').addEventListener('input',onShift);
  host.querySelector('#decLock').addEventListener('click',finalizeDecrypt);
}
function initDecrypt(){
  const got=FILES['case_file.enc'].got;
  const e=$('#decEmpty'),w=$('#decWork');if(!e||!w)return;
  e.hidden=got;w.hidden=!got;
  if(!got)return;
  $('#decCipher').textContent=KEY_CIPHER;
  if(S.flags.key){
    const p=$('#decPlain');p.textContent=KEY_PLAIN;p.classList.add('resolved');
    $('#decBar').style.width='100%';$('#decPct').textContent='100%';
    $('#decStatus').textContent='FILE STABILIZED — الملف case_file.txt في الخزنة';
    $('#decLock').disabled=true;return;
  }
  onShift();
}
function onShift(){
  const s=+$('#decShift').value;
  $('#decShiftVal').textContent=String(s).padStart(2,'0');
  const disp=caesar(KEY_CIPHER,26-s);
  const p=$('#decPlain');
  p.classList.remove('resolved');p.textContent=disp;
  const valid=s===KEY_SHIFT;
  const pct=valid?100:2+([...disp].reduce((a,c)=>a+c.charCodeAt(0),0)%11);
  $('#decBar').style.width=pct+'%';$('#decPct').textContent=pct+'%';
  $('#decBar').style.background=valid?'var(--green)':'var(--amber)';
  $('#decStatus').textContent=valid?'signature match — اضغط تثبيت الملف':'signature drift — النص غير مقروء، واصل المحاولة';
  $('#decLock').disabled=!valid;
}
async function finalizeDecrypt(){
  if(S.flags.key)return;
  const btn=$('#decLock');
  btn.disabled=true;btn.textContent='جارٍ التثبيت…';
  sfx.unlock();glitch(1);
  await resolveText($('#decPlain'),KEY_PLAIN);
  const p=$('#decPlain');p.classList.add('resolved');
  p.innerHTML=esc(KEY_PLAIN).replace(/(SUSPECT :: [^\n]+)/,'<span class="am" style="color:var(--amber)">$1</span>');
  $('#decStatus').textContent='FILE STABILIZED — أُضيف case_file.txt إلى الخزنة';
  btn.textContent='مُثبّت ✓';
  S.flags.key=true;persist();
  const cf=FILES['case_file.txt'];cf.hidden=false;cf.got=true;
  localFiles.push('case_file.txt');
  renderFiles();
  toast('فك التشفير','ملف القضية 4471-A فُتح — اسم المشتبه به مؤكد.','good');
  addClue('dossier');
  objDone('key');story.key();
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
  {plate:'QN-0912',name:'سامر نعيم عوض',phone:'057-3329-645',nid:'2-04-2190-332',job:'حارس أمن — الطريق 16',addr:'سكن الشركة — محطة التفتيش 5',note:'مناوبة ليلية — نقاط التفتيش',seed:88,hot:false},
  {plate:'LX-4482',name:'دينا فؤاد',phone:'052-9084-517',nid:'2-08-2844-908',job:'مصممة جرافيك',addr:'شارع الفن، 18 — الوسط',note:'—',seed:12,hot:false},
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
    if(!res.length){$('#dbRes').innerHTML='<div class="db-none">لا سجلات مطابقة — جرّب صيغة أخرى.</div>';sfx.err();return;}
    tone(700,.07,'triangle',.04);
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
  if(ph)ph.onclick=()=>showPhoto('المشتبه به — اللوحة '+r.plate,driverMedia(),'مطابق لصورة رخصة القيادة — مهند كريم الحسني');
  if(plate==='HX-4471'){
    if(!S.flags.driverShown){
      S.flags.driverShown=1;persist();
      setTimeout(()=>showPhoto('المشتبه به — اللوحة HX-4471',driverMedia(),'التقطت من كاميرا الطريق — مطابق لبطاقة السجل: مهند كريم الحسني'),300);
    }
    if(!S.flags.plate){S.flags.plate=true;addClue('db');objDone('plate');story.plate();}
  }
}

/* ============ لوحة الأدلة EVIDENCE ============ */
const CLUES=[
  {id:'cam',t:'لقطة CAM-04',sub:'سيارة زرقاء — تفتيش 3',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'},
  {id:'log',t:'سجل HWY-16',sub:'حركات فجر الحادثة',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>'},
  {id:'plate',t:'اللوحة HX-4471',sub:'قُرئت عند تفتيشين متتاليين',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>'},
  {id:'hash',t:'كلمة مرور مكشوفة',sub:'admin / password',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M11 12L21 2M16 7l3 3"/></svg>'},
  {id:'db',t:'السجل المدني',sub:'المالك: مهند كريم الحسني',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'},
  {id:'dossier',t:'ملف القضية 4471-A',sub:'مطلوب — جريمة قتل',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'},
];
let boardState={clues:[],pos:{},links:[]};
try{const bs=JSON.parse(localStorage.getItem('nexus7_board')||'null');if(bs&&bs.clues)boardState=bs;}catch(e){}
let selClue=null;
function persistBoard(){try{localStorage.setItem('nexus7_board',JSON.stringify(boardState));}catch(e){}}
function addClue(id){
  const cl=CLUES.find(c=>c.id===id);
  if(!cl||boardState.clues.includes(id))return;
  boardState.clues.push(id);
  persistBoard();
  toast('لوحة الأدلة','دليل جديد: '+cl.t,'good');
  sfx.pop();
  if(wins.board&&wins.board.style.display!=='none')renderBoardCards();
}
function buildBoard(host){
  host.innerHTML='<div class="t-board"><div class="bd-bar"><b>لوحة الأدلة</b><span class="hint">انقر دليلين متتاليين لربطهما — انقر الخيط لحذفه — اسحب البطاقات كما تشاء</span><button id="bdAttach">إرفاق الأدلة وإرسالها</button></div><div id="bdCanvas"><svg id="bdLinks"></svg></div></div>';
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
  CLUES.forEach(cl=>{
    if(!boardState.clues.includes(cl.id))return;
    if(!boardState.pos[cl.id]){
      const i=boardState.clues.indexOf(cl.id);
      boardState.pos[cl.id]={x:24+(i%4)*170,y:26+Math.floor(i/4)*158};
    }
    const el=document.createElement('div');
    el.className='clue'+(selClue===cl.id?' sel':'');
    el.dataset.c=cl.id;
    el.style.left=boardState.pos[cl.id].x+'px';
    el.style.top=boardState.pos[cl.id].y+'px';
    el.innerHTML='<b>'+cl.icon+cl.t+'</b><span>'+cl.sub+'</span>';
    c.appendChild(el);
    bindClueDrag(el);
  });
  renderBoardLinks();
  const btn=$('#bdAttach');
  if(btn)btn.disabled=S.flags.sent;
}
function renderBoardLinks(){
  const svg=$('#bdLinks');if(!svg)return;
  let h='';
  boardState.links.forEach((lk,i)=>{
    const a=boardState.pos[lk[0]],b=boardState.pos[lk[1]];
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
      boardState.links.splice(+p.dataset.i,1);
      persistBoard();renderBoardLinks();sfx.pop();
    };
  });
}
function bindClueDrag(el){
  let sx,sy,ox,oy,drag=false,pid=null;
  el.addEventListener('pointerdown',e=>{
    pid=e.pointerId;sx=e.clientX;sy=e.clientY;
    ox=boardState.pos[el.dataset.c].x;oy=boardState.pos[el.dataset.c].y;
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
      boardState.pos[el.dataset.c]={x:nx,y:ny};
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
    if(!boardState.links.some(l=>(l[0]===a&&l[1]===id)||(l[0]===id&&l[1]===a))){
      boardState.links.push([a,id]);
      persistBoard();renderBoardLinks();sfx.pop();
      if(S.flags.live&&boardState.links.length>=2)objDone('board');
    }else{
      toast('لوحة الأدلة','هذا الرابط موجود بالفعل.');
    }
  });
}
async function attachEvidence(){
  if(S.flags.sent){toast('التقرير','أُرسل مسبقاً.','good');return;}
  if(!canSend()){
    toast('ناقص أدلة','أكمل بقية المهمة قبل الإرفاق.','bad');
    story.hint(nextObjId());return;
  }
  const n=boardState.clues.length,l=boardState.links.length;
  meSay('أرفقت لوحة الأدلة يا مشرف: '+n+' أدلة و'+l+' رابط بينها.');
  await doSend('evidence bundle: '+n+' clues / '+l+' links');
}

/* ============ المتصفح ============ */
const PAGES={
  'nexus://home':()=>'<h1>NEXUS INTERNAL WEB</h1><p>شبكتك الداخلية — بلا رقيب تقريباً.</p>'+
    '<span class="wlink" data-u="0day-souq.onion">0day-souq.onion</span>'+
    '<span class="wlink" data-u="meridian-holdings.com">meridian-holdings.com</span>'+
    '<span class="wlink" data-u="city-gov.gov/civic">city-gov.gov/civic</span>'+
    '<span class="wlink" data-u="nexus://about">nexus://about</span>',
  '0day-souq.onion':()=>'<h1>0DAY SOUQ — سوق الثغرات</h1>'+
    '<div class="post"><div class="pmeta">thread #4471 · 2 days ago</div><h3>HWY-CAM 2.1 — Unauthenticated RCE</h3>'+
    '<p>CVE-2024-1337. تعمل <code>only from inside an active tunnel</code> — يعني: <code>connect</code> أولاً ثم <code>msfconsole → search hwycam → use 0 → set RHOSTS → exploit</code>. جذر مضمون.</p></div>'+
    '<div class="post"><div class="pmeta">thread #4402 · 5 days ago</div><h3>rockyou.txt mirror</h3>'+
    '<p>نسخة كاملة على كل محطة NEXUS. استخدمها مع <code>hydra</code> و<code>hashcat</code>.</p></div>'+
    '<div class="post"><div class="pmeta">thread #4390 · 1 week ago</div><h3>[RUMOR] «مِرقاب»</h3>'+
    '<p>شحنة أدوات جديدة تقول إنها ستوزّع على المشغّلين الوحيدين… من قال إنها حقيقية لم يظهر منذ ذلك اليوم.</p></div>',
  'meridian-holdings.com':()=>'<h1>MERIDIAN HOLDINGS</h1><p>«أمن اللوجستيات الليلية — منذ 1998.»</p>'+
    '<h2>مستودعاتنا</h2><p>12 مستودعاً — كلها بأنظمة مراقبة من الجيل الثاني.</p>'+
    '<h2>إشعار صيانة</h2><p>الخميس القادم: «توصيل» خارج الجدول على المستودع ب — البوابة 2 ستكون مفتوحة بين 03:00 و04:00. لا تدخّلوا.</p>',
  'city-gov.gov/civic':()=>'<h1>CIVIC RECORDS — MIRROR</h1>'+
    '<p>مرآة السجلات المدنية. للبحث استخدم أداة <code>DB</code> مباشرة.</p>'+
    '<span class="wlink" data-u="__open_db">افتح أداة DB الآن</span>',
  'nexus://about':()=>'<h1>NEXUS-7 — ABOUT</h1>'+
    '<p>محطة مشغّل في وحدة الاستخبارات. كل ليلة مهمة واحدة، وكل مهمة تُنسى عند الفجر.</p>'+
    '<p style="color:var(--amberDim);font-size:12px">النموذج الأولي — الليلة '+String(night).padStart(2,'0')+'</p>',
};
let brHist=[];
function brGo(url,push=true){
  const body=$('#brBody');if(!body)return;
  url=(url||'').trim();
  if(url==='__open_db'){openApp('db');return;}
  const fn=PAGES[url];
  if(push&&fn)brHist.push(url);
  $('#brUrl').value=url;
  if(!fn){body.innerHTML='<div class="webpage"><div class="err">ERR_NAME_NOT_RESOLVED — '+esc(url)+'</div></div>';sfx.err();return;}
  body.innerHTML='<div class="webpage">'+fn()+'</div>';
  body.querySelectorAll('.wlink').forEach(l=>l.onclick=()=>brGo(l.dataset.u));
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
    '<textarea id="notesTa" placeholder="اكتب ملاحظاتك… أسماء، لوحات، شيفرات، شكوك.&#10;ملاحظاتك تبقى محفوظة دائماً."></textarea>'+
    '<div class="nt-foot"><button id="ntClear">مسح الكل</button><span id="ntCount">0 حرف</span><span class="save" id="ntSaved"></span></div></div>';
  const ta=host.querySelector('#notesTa');
  try{ta.value=localStorage.getItem('nexus7_notes')||'';}catch(e){}
  const cnt=host.querySelector('#ntCount'),sv=host.querySelector('#ntSaved');
  const upd=()=>{cnt.textContent=ta.value.length+' حرف';};
  upd();
  let t=null;
  ta.addEventListener('input',()=>{
    upd();
    sv.textContent='…يحفظ';
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

/* ============ معلومات ============ */
function buildInfo(host){
  host.innerHTML='<div class="t-info"><h3>NEXUS-7 — محطة المشغّل</h3>'+
  '<p>محطة وحدة الاستخبارات — روح Hacknet × روح The Operator.</p>'+
  '<p><b>المشغّل:</b> <code class="ltr">'+esc(ID.name)+'</code> — الرمز: «راصد» · <b>المشرف:</b> كامل</p>'+
  '<p><b>التحكم:</b> اسحب النوافذ من شريطها، غيّر حجمها من الزاوية. في EVIDENCE: انقر دليلين لربطهما بخيط.</p>'+
  '<p><b>سير المهمة:</b> <code>help</code> ← <code>nmap</code> ← <code>hydra</code> ← <code>connect</code> ← <code>download</code> ← <code>hashcat</code> ← DB ← <code>msfconsole</code> ← <code>decrypt</code> ← EVIDENCE ← <code>send</code></p></div>';
}

/* ============ التطبيقات ============ */
const IC={
  term:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  files:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  browser:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  net:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/></svg>',
  db:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  dec:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  board:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};
const APPS={
  terminal:{title:'TERM — الطرفية',w:730,h:470,icon:IC.term,build:buildTerm},
  files:{title:'FILES — الخزنة',w:700,h:440,icon:IC.files,build:buildFiles,onOpen:renderFiles},
  browser:{title:'NEXUS WEB',w:740,h:500,icon:IC.browser,build:buildBrowser},
  notes:{title:'NOTES — المفكرة',w:560,h:460,icon:IC.notes,build:buildNotes},
  netmap:{title:'NET — خريطة الشبكة',w:680,h:480,icon:IC.net,build:buildNet,onOpen:renderNet},
  db:{title:'DB — السجلات المدنية',w:700,h:520,icon:IC.db,build:buildDb},
  board:{title:'EVIDENCE — لوحة الأدلة',w:740,h:540,icon:IC.board,build:buildBoard,onOpen:renderBoardCards},
  decrypt:{title:'DECRYPT — فك الأختام',w:640,h:560,icon:IC.dec,build:buildDec,onOpen:initDecrypt},
  trash:{title:'سلة المهملات',w:480,h:380,icon:IC.trash,build:buildTrash,onOpen:renderTrash},
  info:{title:'عن النظام',w:560,h:420,icon:IC.info,build:buildInfo},
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
 $('#tabChat').onclick=()=>{$('#tabChat').classList.add('on');$('#tabMission').classList.remove('on');setPhoneView(S.flags.live?'chat':'idle');};
 $('#tabMission').onclick=()=>{$('#tabMission').classList.add('on');$('#tabChat').classList.remove('on');setPhoneView('mission');};
function phScroll(){const c=$('#phChatLog');c.scrollTop=c.scrollHeight;}
async function say(text,who='كامل'){
  if(!S.flags.live)return;
  setPhoneView('chat');
  $('#tabChat').classList.add('on');$('#tabMission').classList.remove('on');
  const ind=document.createElement('div');
  ind.className='pmsg typing';
  ind.innerHTML='<span style="font-size:10px;color:var(--muted)">'+who+'</span><i></i><i></i><i></i>';
  $('#phChatLog').appendChild(ind);phScroll();
  await sleep(450+Math.min(1300,text.length*12));
  ind.remove();
  const m=document.createElement('div');
  m.className='pmsg them';m.textContent=text;
  $('#phChatLog').appendChild(m);sfx.msg();phScroll();
}
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
  if(!S.flags.live)return;
  const b1=document.createElement('button');
  b1.className='pchip';b1.textContent='أحتاج توجيه';
  b1.onclick=()=>{const id=nextObjId();if(id)story.hint(id);};
  q.appendChild(b1);
  if(!S.flags.sent&&boardState.clues.length>=2){
    const b3=document.createElement('button');
    b3.className='pchip';b3.textContent='افتح لوحة الأدلة';
    b3.onclick=()=>openApp('board');
    q.appendChild(b3);
  }
  if(canSend()&&!S.flags.sent){
    const b2=document.createElement('button');
    b2.className='pchip send';b2.textContent='أرسل التقرير الآن';
    b2.onclick=()=>{meSay('أرسلت الحزمة كاملة.');uiCmd('send');};
    q.appendChild(b2);
  }
}
let ringIv=null;
function incomingCall(){
  const p=$('#phone');
  p.classList.add('ringing');phoneUnfold();
  setPhoneView('call');sfx.ring();
  ringIv=setInterval(()=>sfx.ring(),2100);
}
function stopRing(){clearInterval(ringIv);ringIv=null;$('#phone').classList.remove('ringing');}
 $('#phAccept').onclick=()=>{
  stopRing();setPhoneView('chat');sfx.conn();glitch(1);
  sysSay('قبول الاتصال — CH-07');
  story.start();
};
 $('#phDecline').onclick=()=>{
  stopRing();setPhoneView('idle');
  toast('قناة CH-07','رفضت اتصال المشرف.');
  S.flags.declined++;
  if(S.flags.declined===1)setTimeout(()=>{S.flags.live&&say('أعتقد أنك رفضت بالخطأ يا راصد. أعد الرد… وسننسى الموقف.');},1800);
  setTimeout(()=>{toast('قناة CH-07','اتصال وارد من جديد…');incomingCall();},4200);
};

/* ============ الأهداف والقصة — «الطريق 16» ============ */
const OBJ=[
  {id:'help',t:'شغّل <code>help</code>'},
  {id:'nmap',t:'امسح شبكة الطريق 16 <code>nmap</code>'},
  {id:'hydra',t:'اكسر SSH بـ <code>hydra</code>'},
  {id:'conn',t:'اتصل بـ <code>HWY16-CAM</code>'},
  {id:'log',t:'حمّل <code>hwy16_log.log</code>'},
  {id:'hash',t:'اكسر البصمة <code>hashcat</code>'},
  {id:'plate',t:'حدد مالك اللوحة في <code>DB</code>'},
  {id:'root',t:'جذر عبر <code>msfconsole</code>'},
  {id:'enc',t:'حمّل <code>case_file.enc</code>'},
  {id:'key',t:'فك التشفير في <code>DECRYPT</code>'},
  {id:'board',t:'اربط الأدلة في لوحة <code>EVIDENCE</code>'},
  {id:'sent',t:'أرسل التقرير إلى المشرف كامل'},
];
const HINTS={
  help:'افتح الطرفية TERM واكتب help.',
  nmap:'في الطرفية اكتب: nmap',
  hydra:'hydra -l admin -P rockyou.txt ssh://10.0.44.77',
  conn:'connect 10.0.44.77 — أو انقر العقدة في خريطة NET.',
  log:'ls ثم download hwy16_log.log',
  hash:'في السجل بصمة md5. جرّب: hashcat -m 0 5f4dcc3b5aa765d61d8327deb882cf99 rockyou.txt',
  plate:'افتح DB وابحث عن: HX-4471',
  root:'msfconsole ← search hwycam ← use 0 ← set RHOSTS ← exploit',
  enc:'download case_file.enc — يحتاج جذر root.',
  key:'افتح DECRYPT واضبط حلقة الإزاحة حتى يوضح النص، ثم ثبّت.',
  board:'افتح EVIDENCE — انقر دليلين متتاليين لربطهما. رابطان على الأقل يكفيان.',
  sent:'زر «إرفاق الأدلة وإرسالها» في لوحة EVIDENCE، أو اكتب send في الطرفية.'
};
function renderObj(){
  $('#phObj').innerHTML=OBJ.map(o=>'<li id="obj-'+o.id+'" class="'+(o.done?'done':'')+'"><span class="tick"></span><span>'+o.t+'</span></li>').join('');
}
function objDone(id){
  const o=OBJ.find(x=>x.id===id);
  if(!o||o.done)return;
  o.done=true;persist();
  const li=$('#obj-'+id);if(li)li.classList.add('done');
  tone(740,.07,'triangle',.045);
  const dn=OBJ.filter(x=>x.done).length;
  toast('هدف مكتمل','سجل المهمة: '+dn+'/'+OBJ.length,'good');
  refreshQuick();
}
function nextObjId(){const o=OBJ.find(o=>!o.done);return o?o.id:null;}
async function uiCmd(text){
  if(!termEl)openApp('terminal');
  tprint('<span class="usr">'+ID.name+'@nexus-7:~$</span> '+esc(text),'echo');
  if(busy){sfx.err();return;}
  await runCmd(text);
}
const story={
  async start(){
    S.flags.live=true;
    sysSay('بدأت المهمة — «الطريق 16»');
    await say('أهلاً بك في الوحدة يا راصد. من اليوم أنت مشغّل مبتدئ في الاستخبارات — وأنا كامل، مشرفك المباشر.');
    await say('قبل يومين: جريمة قتل. المشتبه به اختفى — وآخر رصد له كان على الطريق السريع رقم 16. كاميرات الطريق على شبكة معزولة، ومهمتك الليلة: أخرج اسمه.');
    const nid=nextObjId();
    if(nid&&nid!=='help'){
      await say('أرى أنك استكشفت الأدوات قبل اتصالي — هذا يريحني. الخطوة التالية: '+HINTS[nid]);
    }else{
      await say('لنبدأ بالأساس. افتح الطرفية واكتب: help — لتتعرف على عدّتك.');
    }
    renderObj();refreshQuick();
    setPhoneView('chat');
  },
  async help(){if(!S.flags.live||S.flags.help)return;S.flags.help=true;await sleep(400);await say('ممتاز. الآن امسح شبكة الكاميرات: اكتب nmap — كل عقدة تكتشفها تُرسم على خريطة NET.');},
  async nmap(){if(!S.flags.live||S.flags.nmap)return;S.flags.nmap=true;await say('ثلاث عقد. تجاهل بوابة المزوّد والجسر المحصّن — هدفنا: HWY16-CAM على 10.0.44.77.');await say('لكنها محمية بكلمة مرور. اكسرها أولاً بأداة hydra — الصيغة الكاملة مكتوبة في المحادثة.');},
  async hydra(){if(!S.flags.live||S.flags.hydra)return;S.flags.hydra=true;await say('كلمة مرور تُحرج صاحبها… هكذا نبدأ دائماً. افتح النفق الآن: connect 10.0.44.77 — وانتبه: ساعة التتبع تعمل ضدك فور الدخول.');},
  async connect(){if(!S.flags.live||S.flags.conn)return;S.flags.conn=true;await say('أنت داخل شبكة كاميرات الطريق. لقطة حية فتحت عندك — سيارة زرقاء عند نقطة التفتيش 3. سجّل لوحتها.');await say('حمّل سجل الحركات: ls ثم download hwy16_log.log');},
  async log(){if(!S.flags.live||S.flags.log)return;S.flags.log=true;await say('السجل يتكلم: السيارة نفسها تُقرأ عند تفتيشين متتاليين — اللوحة HX-4471. وفيه بصمة md5 لمحاولة دخول فاشلة.');await say('مهمّتان: اكسر البصمة بـ hashcat… وحدد مالك اللوحة في قاعدة السجلات DB.');},
  async hash(){if(!S.flags.live||S.flags.hash)return;S.flags.hash=true;await say('«password»؟ حقاً؟ حتى القتلة يحتاجون أمناً سيئاً. ولا تنسَ اللوحة في DB.');},
  async plate(){
    if(!S.flags.live)return;
    await sleep(300);
    await say('مهند الحسني… نعم — ملفه مفتوح عندي من قبل: جريمة قتل، ملف 4471-A. صرت قريباً.');
    await say('نحتاج ملفه الكامل. على عقدة الكاميرات ملف مشفّر يتطلب صلاحيات الجذر: افتح msfconsole — الثغرة موثقة في 0day-souq. الخطوات في المحادثة.');
  },
  async root(){if(!S.flags.live||S.flags.root)return;S.flags.root=true;await say('جذر! الملفات المحمية لك الآن. حمّل ملف القضية: download case_file.enc');},
  async enc(){if(!S.flags.live)return;await say('افتح أداة DECRYPT واضبط حلقة الإزاحة حتى يوضح النص — ملف القضية مشفّر بنمط قديم. عندها ثبّته.');},
  async key(){if(!S.flags.live||S.flags.key)return;S.flags.key=true;await say('ملف القضية انفتح! الاسم مؤكد الآن. انقل كل شيء إلى لوحة EVIDENCE: رتّب الأدلة واربطها ببعضها بخيوط.');await say('ثم أرفقها وأرسل التقرير: زر الإرفاق في اللوحة نفسها… أو اكتب send في الطرفية.');refreshQuick();},
  async sent(){
    if(!S.flags.live)return;
    await say('استلمت الحزمة يا راصد: سجل الطريق، اللقطة، هوية المشتبه به، وملف القضية. عمل نظيف.');
    await say('هذا كان اختبار تشغيل فقط. الأربعاء القادم توصلك شحنة «مِرقاب»… وسنفتح معاً عقداً أعمق بكثير.');
    await say('نم قليلاً. سأتصل.');
    sysSay('المشرف كامل أغلق القناة');
    if(S.host){hostDown();tprint('connection closed by remote host','dim');}
    S.flags.live=false;refreshQuick();
    toast('المهمة مكتملة','الطريق 16: '+OBJ.length+'/'+OBJ.length,'good');
    setTimeout(async()=>{
      toast('نظام','اكتملت الجلسة — إعادة ضبط شاملة خلال لحظات…');
      await sleep(2200);
      sessionReset();
    },4500);
  },
  async breach(){
    if(!S.flags.live)return;
    await sleep(600);
    await say('كادوا يمسكونك! الملفات المحمّلة بأمان — أعد الاتصال وأكمل المهمة.');
  },
  async hint(id){if(!S.flags.live)return;await say('توجيه: '+(HINTS[id]||'اتبع سجل المهمة في هاتفك.'));}
};

/* ============ الحفظ والاستعادة ============ */
function persist(){
  try{
    localStorage.setItem('nexus7',JSON.stringify({
      flags:{...S.flags,live:0},scanned:S.scanned,night,
      known:[...NET.known],files:localFiles,
      got:Object.keys(FILES).filter(k=>FILES[k].got),
      done:OBJ.filter(o=>o.done).map(o=>o.id)
    }));
  }catch(e){}
}
function restoreGame(){
  let sv=null;
  try{sv=JSON.parse(localStorage.getItem('nexus7')||'null');}catch(e){}
  if(!sv)return;
  Object.assign(S.flags,sv.flags||{});S.flags.live=false;
  if(sv.scanned)S.scanned=true;
  if(sv.night)night=sv.night;
  (sv.known||[]).forEach(ip=>{if(NET.data[ip])NET.known.add(ip);});
  (sv.got||[]).forEach(n=>{if(FILES[n])FILES[n].got=true;});
  if(sv.files&&sv.files.length)localFiles=sv.files.filter(n=>FILES[n]);
  (sv.done||[]).forEach(id=>{const o=OBJ.find(x=>x.id===id);if(o)o.done=true;});
  $('#smNight').textContent='الليلة '+String(night).padStart(2,'0');
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
    localStorage.removeItem('nexus7_board');
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
    idSave();
    scr.hidden=true;
    sfx.ok();
    bootSeq();
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
    scr.hidden=true;
    sfx.conn();
    bootSeq();
  };
  btn.onclick=go;
  $('#lgPass').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  $('#lgReset').onclick=()=>{
    if(confirm('سيُمسح كل شيء: الهوية، التقدم، المفكرة، اللوحة. هل أنت متأكد؟')){
      idWipe();location.reload();
    }
  };
}

/* ============ الإعادة والإطفاء ============ */
function resetAll(){
  try{localStorage.removeItem('nexus7');}catch(e){}
  stopRing();stopTrace();
  S.host=null;S.scanned=false;S.msf=false;dbBusy=false;
  Object.keys(S.flags).forEach(k=>S.flags[k]=0);
  night++;
  $('#smNight').textContent='الليلة '+String(night).padStart(2,'0');
  Object.values(FILES).forEach(f=>{f.got=false;});
  FILES['case_file.txt'].hidden=true;
  localFiles=['README.txt'];trash=[];
  NET.known=new Set(['SELF','10.0.44.1']);NET.active=null;NET_ALPHA.clear();
  for(const k of Object.keys(wins)){wins[k].remove();delete wins[k];}
  for(const k of Object.keys(bodies)){delete bodies[k];}
  termEl=null;cmdEl=null;promptEl=null;focusId=null;spawn=0;hi=-1;hist.length=0;
  syncTaskWindows();
  $('#photoModal').hidden=true;
  const dr=$('#dbRes');if(dr)dr.innerHTML='';
  const dc=$('#dbCard');if(dc)dc.hidden=true;
  brHist=['nexus://home'];
  boardState={clues:[],pos:{},links:[]};selClue=null;
  try{localStorage.removeItem('nexus7_board');}catch(e){}
  OBJ.forEach(o=>o.done=false);renderObj();
  resetPhoneIdle();
  renderFiles();renderTrash();refreshQuick();
}
async function sessionReset(){
  glitch(1,true);sfx.shutdown();
  await sleep(300);
  resetAll();
  const d=$('#desktop');
  d.classList.remove('off','boot-in');void d.offsetWidth;
  d.classList.add('boot-in');
  sfx.conn();
  setTimeout(()=>toast('الليلة '+String(night).padStart(2,'0'),'نظام أُعيد ضبطه — خزنة فارغة، شبكة غير ممسوحة.','good'),600);
  setTimeout(incomingCall,7000);
}
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
async function rebootSeq(){
  sfx.shutdown();
  const d=$('#desktop');
  d.classList.add('off');
  await sleep(780);
  d.classList.remove('off');
  resetAll();
  d.classList.remove('boot-in');void d.offsetWidth;
  d.classList.add('boot-in');
  sfx.conn();
  setTimeout(()=>toast('الليلة '+String(night).padStart(2,'0'),'إعادة تشغيل — جلسة نظيفة.','good'),600);
  setTimeout(incomingCall,6000);
}
 $('#powerOnBtn').onclick=()=>{
  audioInit();
  $('#powerScreen').hidden=true;
  const d=$('#desktop');d.hidden=false;
  resetAll();
  d.classList.remove('boot-in');void d.offsetWidth;
  d.classList.add('boot-in');
  sfx.conn();
  setTimeout(()=>toast('الليلة '+String(night).padStart(2,'0'),'المحطة تعمل. بانتظار اتصال المشرف.'),800);
  setTimeout(incomingCall,4000);
};
 $('#tbPower').onclick=()=>{$('#powerDlg').hidden=false;};
 $('#pdCancel').onclick=()=>{$('#powerDlg').hidden=true;};
 $('#pdOff').onclick=()=>{$('#powerDlg').hidden=true;shutdownSeq();};
 $('#pdReboot').onclick=()=>{$('#powerDlg').hidden=true;rebootSeq();};
 $('#smShutdown').onclick=()=>{$('#startMenu').hidden=true;$('#powerDlg').hidden=false;};
 $('#smReboot').onclick=()=>{$('#startMenu').hidden=true;rebootSeq();};

/* ============ سطح المكتب ============ */
const ICON_ORDER=['terminal','files','browser','notes','netmap','db','board','decrypt','trash'];
let iconPos={};
try{iconPos=JSON.parse(localStorage.getItem('nexus7_icons')||'{}');}catch(e){iconPos={};}
function persistIcons(){try{localStorage.setItem('nexus7_icons',JSON.stringify(iconPos));}catch(e){}}
function renderIcons(){
  $('#icons').innerHTML=ICON_ORDER.map(id=>'<div class="dicon" data-app="'+id+'">'+APPS[id].icon+'<span>'+APPS[id].title.split('—')[0].trim()+'</span></div>').join('');
  let i=0;
  ICON_ORDER.forEach(id=>{
    const el=$('.dicon[data-app="'+id+'"]');
    if(!iconPos[id]){
      let x=innerWidth-116,y=16+i*100;
      if(id==='trash'){x=24;y=16;}
      iconPos[id]={x,y};
    }
    i++;
    el.style.left=iconPos[id].x+'px';
    el.style.top=iconPos[id].y+'px';
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
      if(name&&localFiles.includes(name)){
        if(trashFile(name))toast('سلة المهملات','نُقل إلى السلة: '+name);
      }
    });
  }
}
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
      const ny=Math.max(4,Math.min(innerHeight-170,oy+dy));
      iconPos[el.dataset.app]={x:nx,y:ny};
      el.style.left=nx+'px';el.style.top=ny+'px';
    }
  });
  el.addEventListener('pointerup',e=>{
    if(pid===null)return;
    try{el.releasePointerCapture(pid);}catch(_){}
    pid=null;
    if(drag){drag=false;el.classList.remove('dragging');persistIcons();}
    else openApp(el.dataset.app);
  });
}
function renderStart(){
  const list=[...ICON_ORDER,'info'];
  $('#smGrid').innerHTML=list.map(id=>'<div class="sm-app" data-app="'+id+'">'+APPS[id].icon+'<span>'+APPS[id].title.split('—')[0].trim()+'</span></div>').join('');
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
  m.innerHTML='<button id="cxTerm">فتح الطرفية</button><button id="cxNotes">المفكرة</button><button id="cxBoard">لوحة الأدلة</button><button id="cxStart">قائمة التطبيقات</button><hr><button id="cxInfo">معلومات النظام</button><button id="cxOff" class="danger">إيقاف التشغيل</button>';
  m.hidden=false;
  m.style.left=Math.min(e.clientX,innerWidth-200)+'px';
  m.style.top=Math.min(e.clientY,innerHeight-300)+'px';
  $('#cxTerm').onclick=()=>{m.hidden=true;openApp('terminal');};
  $('#cxNotes').onclick=()=>{m.hidden=true;openApp('notes');};
  $('#cxBoard').onclick=()=>{m.hidden=true;openApp('board');};
  $('#cxStart').onclick=()=>{m.hidden=true;$('#startMenu').hidden=false;};
  $('#cxInfo').onclick=()=>{m.hidden=true;openApp('info');};
  $('#cxOff').onclick=()=>{m.hidden=true;$('#powerDlg').hidden=false;};
});
 $$('.launch').forEach(b=>b.onclick=()=>openApp(b.dataset.app));

/* ============ الانترو + سلسلة الدخول ============ */
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
    vid.src='https://res.cloudinary.com/rr0h5xww/video/upload/v1788782718/intro.mp4';
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
    gSec=(gSec+1)%86400;
    const c=clockStr();
    $('#tbClock').textContent=c;
    $('#phClock').textContent=c.slice(0,5);
  },1000);
  $('#tbClock').textContent=clockStr();
  $('#phClock').textContent=clockStr().slice(0,5);
  renderIcons();renderStart();renderObj();
  sysSay('القناة خاملة — بانتظار اتصال المشرف');
  setTimeout(()=>toast('نظام','أهلاً '+ID.name+' — الوحدة بانتظارك. رمزك: راصد.'),700);
  setTimeout(incomingCall,3500);
}

initIntro();
