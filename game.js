'use strict';
/* ============================================================
   NEXUS-7 — محطة المشغّل «راصد» (Hacknet × The Operator)
   ★ الليلة 1: «الطريق 16» — المشرف كامل، جريمة قتل،
     لوحة أدلة EVIDENCE مع ربط وخيوط وإرفاق بالتقرير.
   ============================================================ */

const IMG={
  camCar:'assests/car1p.png',
  driver:'assests/person1p.png''
};

/* ============ أدوات عامة ============ */
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

/* ============ الصور ============ */
const CAR_SVG=`<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern id="c-win" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="#b3b8ba"/><rect x="7" y="6" width="26" height="20" fill="#5a666e"/><rect x="7" y="6" width="26" height="6" fill="#6e7a82"/></pattern>
<radialGradient id="c-vig" cx="50%" cy="45%" r="78%"><stop offset="55%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.55)"/></radialGradient>
<filter id="c-noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .07 0"/></filter>
</defs>
<rect width="480" height="300" fill="#c6caca"/>
<rect x="0" y="12" width="480" height="128" fill="url(#c-win)"/>
<rect x="0" y="136" width="480" height="8" fill="#8e9598"/>
<rect x="0" y="144" width="480" height="156" fill="#4c514d"/>
<g stroke="#c9cdc7" stroke-width="3" opacity=".65">
<line x1="30" y1="160" x2="10" y2="296"/><line x1="140" y1="160" x2="128" y2="296"/><line x1="250" y1="160" x2="246" y2="296"/><line x1="360" y1="160" x2="364" y2="296"/><line x1="462" y1="160" x2="470" y2="296"/>
</g>
<g transform="translate(8,168)"><rect width="86" height="34" rx="9" fill="#dad7cd"/><rect x="14" y="-14" width="56" height="22" rx="8" fill="#c9c6bc"/><rect x="20" y="-10" width="44" height="13" rx="4" fill="#5d6a72"/><rect x="8" y="30" width="16" height="12" rx="4" fill="#20211f"/><rect x="60" y="30" width="16" height="12" rx="4" fill="#20211f"/></g>
<g transform="translate(356,166)"><rect width="92" height="36" rx="9" fill="#39434d"/><rect x="16" y="-14" width="58" height="22" rx="8" fill="#2e3740"/><rect x="22" y="-10" width="46" height="13" rx="4" fill="#4d5860"/><rect x="8" y="32" width="17" height="12" rx="4" fill="#15161a"/><rect x="64" y="32" width="17" height="12" rx="4" fill="#15161a"/></g>
<ellipse cx="240" cy="268" rx="128" ry="12" fill="rgba(0,0,0,.35)"/>
<rect x="140" y="192" width="200" height="62" rx="14" fill="#2e4a7a"/>
<path d="M172 194 L186 160 Q190 154 200 154 L280 154 Q290 154 294 160 L308 194 Z" fill="#27406b"/>
<path d="M196 166 L284 166 L296 190 L184 190 Z" fill="#1c2937"/>
<path d="M196 166 L284 166 L286 170 L194 170 Z" fill="#31445c" opacity=".8"/>
<rect x="308" y="168" width="26" height="22" rx="5" fill="#22303d"/>
<rect x="146" y="196" width="36" height="11" rx="4" fill="#a8282a"/><rect x="150" y="198" width="24" height="6" rx="2" fill="#d8494a"/>
<rect x="298" y="196" width="36" height="11" rx="4" fill="#a8282a"/><rect x="304" y="198" width="24" height="6" rx="2" fill="#d8494a"/>
<line x1="150" y1="216" x2="330" y2="216" stroke="#223a61" stroke-width="2"/>
<rect x="142" y="228" width="196" height="22" rx="9" fill="#263d66"/>
<circle cx="240" cy="207" r="8" fill="#1c2f52" stroke="#152744" stroke-width="2"/>
<rect x="214" y="226" width="52" height="17" rx="3" fill="#e6c437" stroke="#8a7a20"/>
<text x="240" y="239" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#1c1c14">HX-4471</text>
<rect x="152" y="248" width="40" height="15" rx="6" fill="#17130f"/><rect x="288" y="248" width="40" height="15" rx="6" fill="#17130f"/>
<rect width="480" height="300" fill="url(#c-vig)"/>
<rect width="480" height="300" filter="url(#c-noise)"/>
<g font-family="monospace" font-size="13" fill="#f1f2ec" letter-spacing=".5">
<text x="14" y="26">2024-05-15 14:32:01 UTC</text>
<text x="466" y="26" text-anchor="end">CAM-04/CHK-3 HWY-16</text>
<text x="14" y="286">CAM-04/CHK-3 HWY-16</text>
</g>
<circle cx="430" cy="282" r="5" fill="#ff4136"><animate attributeName="opacity" values="1;.15;1" dur="1.2s" repeatCount="indefinite"/></circle>
<text x="444" y="287" font-family="monospace" font-size="12" fill="#ff6b60">REC</text>
</svg>`;
const DRIVER_SVG=`<svg viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdd2d4"/><stop offset="1" stop-color="#aab1b4"/></linearGradient>
<radialGradient id="d-vig" cx="50%" cy="45%" r="80%"><stop offset="60%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient>
<filter id="d-noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .06 0"/></filter>
<pattern id="d-win" width="34" height="30" patternUnits="userSpaceOnUse"><rect x="5" y="5" width="20" height="16" fill="#7d848a" opacity=".8"/></pattern>
</defs>
<rect width="460" height="300" fill="url(#d-sky)"/>
<rect x="0" y="58" width="460" height="124" fill="#9aa1a5"/>
<rect x="0" y="58" width="460" height="124" fill="url(#d-win)"/>
<rect x="6" y="10" width="448" height="240" rx="18" fill="none" stroke="#12161a" stroke-width="14"/>
<path d="M336 70 Q396 66 402 120 L402 300 L330 300 L326 140 Q326 92 336 70 Z" fill="#191d21"/>
<path d="M352 176 L260 300 L296 300 L376 186 Z" fill="#22272c"/>
<path d="M110 300 Q118 232 168 214 Q196 202 210 196 L268 196 Q330 214 352 300 Z" fill="#39482f"/>
<path d="M210 196 L268 196 L262 214 L216 214 Z" fill="#2c3925"/>
<path d="M206 200 Q238 188 270 200 L262 176 Q238 168 214 176 Z" fill="#46563a"/>
<rect x="222" y="168" width="36" height="26" rx="10" fill="#c99a76"/>
<ellipse cx="240" cy="130" rx="47" ry="55" fill="#d8a884"/>
<ellipse cx="284" cy="136" rx="9" ry="14" fill="#c99a76"/>
<path d="M193 118 Q196 70 240 66 Q284 70 287 118 Q288 96 274 84 Q240 74 206 84 Q192 96 193 118 Z" fill="#4a3a2c"/>
<line x1="212" y1="118" x2="232" y2="116" stroke="#3c2f24" stroke-width="4" stroke-linecap="round"/>
<line x1="246" y1="116" x2="264" y2="118" stroke="#3c2f24" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="222" cy="130" rx="7" ry="6" fill="#2c241d"/><circle cx="219" cy="130" r="2.4" fill="#0d0b09"/>
<ellipse cx="254" cy="130" rx="7" ry="6" fill="#2c241d"/><circle cx="251" cy="130" r="2.4" fill="#0d0b09"/>
<path d="M236 132 Q232 144 236 150 Q240 153 244 150" fill="none" stroke="#b98a67" stroke-width="3" stroke-linecap="round"/>
<path d="M203 142 Q206 176 226 186 Q240 192 254 186 Q274 176 277 142 Q276 168 262 178 Q240 190 218 178 Q204 168 203 142 Z" fill="#4e3d2c"/>
<path d="M206 146 Q210 172 228 181 Q240 186 252 181 Q270 172 274 146 Q272 164 258 173 Q240 182 222 173 Q208 164 206 146 Z" fill="#5b4935"/>
<path d="M228 166 Q240 172 252 166" stroke="#3a2d20" stroke-width="3" fill="none" stroke-linecap="round"/>
<rect x="0" y="244" width="460" height="56" fill="#14181c"/>
<rect x="0" y="240" width="460" height="8" rx="4" fill="#1d2227"/>
<rect x="30" y="262" width="60" height="10" rx="5" fill="#2a3138"/>
<rect width="460" height="300" fill="url(#d-vig)"/>
<rect width="460" height="300" filter="url(#d-noise)"/>
</svg>`;
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
  const rows=[['── استطلاع ──',''],['nmap','مسح الشبكة واكتشاف الخدمات'],['ping &lt;ip&gt;','اختبار وصول عقدة'],['── اختراق ──',''],['hydra -l admin -P rockyou.txt ssh://ip','كسر كلمة مرور SSH'],['connect &lt;ip&gt; [user pass]','فتح نفق (يمكن تمرير بيانات الدخول يدوياً)'],['msfconsole','إطار استغلال الثغرات — metasploit'],['hashcat -m 0 &lt;hash&gt; rockyou.txt','كسر بصمات MD5'],['john &lt;hash&gt;','كسر بـ john the ripper'],['── ملفات ──',''],['ls · cat &lt;f&gt; · download &lt;f&gt; · rm &lt;f&gt;','استعراض ونسخ وحذف'],['── أدوات المشغّل ──',''],['db · decrypt · evidence · notes · send · trace','—'],['── أخرى ──',''],['ifconfig · netstat · ps · history · clear','—']];
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
  localFiles.forEach(n=>{const f=FILES[n];tprint(n.padEnd(18)+' '+String(f.kb).padStart(3)+' KB  <span class="gr">['+f.kind+']</span>');});
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
    if(p.startsWith('search')){tprint('Matching Modules\n================\n   #  Name                                  Rank     Check\n   -  ----                                  ----     -----\n   0  exploit/linux/http/hwycam_rce         excellent  Yes\n      <span class="am">HWY-CAM v2.x — Unauthenticated RCE (CVE-2024-1337)</span>');return;}
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
    if(p==='info'){tprint('Name: HWY-CAM Unauthenticated RCE\nModule: exploit/linux/http/hwycam_rce\nCVE: 2024-1337 — HWY-CAM 2.1\nملاحظة: يتطلب نفق نشط نحو الهدف','dim');return;}
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
  'README.txt':{where:'local',kb:1,kind:'text',body:'NEXUS-7 :: INTEL WORKSTATION — BUILD 7.6\n----------------------------------------\nمحطة مشغّل في وحدة الاستخبارات. كل ما يخرج من هنا مُوقّع باسمك.\n\nالأدوات:\n  TERM     الطرفية — nmap, hydra, msfconsole, hashcat...\n  NET      خريطة الشبكة\n  FILES    الخزنة والعارض — اسحب أي ملف وأفلته على سلة المهملات\n  EVIDENCE لوحة الأدلة — رتّب الأدلة واربطها ثم أرفقها بالتقرير\n  DECRYPT  مطرقة فك الأختام\n  DB       قاعدة السجلات المدنية\n  BROWSER  نافذتك على الشبكة — راقب "0day-souq"\n  NOTES    مفكرتك الخاصة — تبقى حتى بعد إعادة الضبط\n\nالهاتف أسفل الشاشة: عليه اتصالات المشرف كامل وسجل المهمة.'},
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
      d.innerHTML=esc(ln).replace(/(PLATE [A-Z]+-\d+|CODE \d+|SUSPECT[^\n]*|extension 44|md5 :: [a-f0-9]+)/g,'<span class="am">$1</span>');
      await sleep(22);
    }
  })();
}
function buildFiles(host){
  host.innerHTML='<div class="t-files"><div id="fileList"></div><div id="fileView"><div class="fv-empty">اختر ملفاً من الخزنة لعرضه<br><span style="font-size:11px">أو اسحب ملفاً من القائمة وأفلته على سلة المهملات في سطح المكتب</span></div></div></div>';
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

/* ============ ★ لوحة الأدلة EVIDENCE ============ */
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
let sel
