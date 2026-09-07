'use strict';
/* ============================================================
   NEXUS-7 — story.js (v3 final)
   الليلة 1: الطريق 16 · الليلة 2: مِرقاب · الليلة 3: lynx
   ============================================================ */

const STORY_META={boss:'كامل',codename:'راصد',channel:'CH-07'};
const NIGHTS={};

/* ===== الليلة 1 — الطريق 16 ===== */
NIGHTS.n1={
  title:'الطريق 16',
  obj:[
    {id:'help',t:'شغّل <code>help</code>'},
    {id:'nmap',t:'امسح شبكة الطريق 16 <code>nmap</code>'},
    {id:'hydra',t:'اكسر SSH بـ <code>hydra</code>'},
    {id:'conn',t:'اتصل بـ <code>HWY16-CAM</code>'},
    {id:'log',t:'حمّل <code>hwy16_log.log</code>'},
    {id:'plate',t:'حدد مالك اللوحة في <code>DB</code>'},
    {id:'root',t:'جذر عبر <code>msfconsole</code>'},
    {id:'enc',t:'حمّل <code>case_file.enc</code>'},
    {id:'key',t:'فك التشفير في <code>DECRYPT</code>'},
    {id:'board',t:'اربط الأدلة في لوحة <code>EVIDENCE</code>'},
    {id:'sent',t:'أرسل التقرير إلى المشرف كامل'}
  ],
  hints:{
    help:'افتح الطرفية TERM واكتب help.',
    nmap:'في الطرفية اكتب: nmap',
    hydra:'hydra -l admin -P rockyou.txt ssh://10.0.44.77',
    conn:'connect 10.0.44.77 — أو انقر العقدة في خريطة NET.',
    log:'ls ثم download hwy16_log.log — وفيه لوحة السيارة المطلوبة.',
    plate:'افتح DB وابحث عن HX-4471 — ثم انقر على صف النتيجة نفسه لفتح بطاقة المالك.',
    root:'msfconsole ← search hwycam ← use 0 ← set RHOSTS ← exploit',
    enc:'download case_file.enc — يحتاج جذر root.',
    key:'افتح DECRYPT واضبط حلقة الإزاحة حتى يوضح النص، ثم ثبّت.',
    board:'افتح EVIDENCE — انقر دليلين متتاليين لربطهما. رابطان على الأقل.',
    sent:'زر «إرفاق الأدلة وإرسالها» في لوحة EVIDENCE، أو اكتب send في الطرفية.'
  },
  canSend:function(){return S.flags.log&&S.flags.plate&&S.flags.root&&S.flags.key;},
  clues:[
    {id:'cam',t:'لقطة CAM-04',sub:'سيارة زرقاء — تفتيش 3',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'},
    {id:'log',t:'سجل HWY-16',sub:'حركات فجر الحادثة',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>'},
    {id:'plate',t:'اللوحة HX-4471',sub:'قُرئت عند تفتيشين متتاليين',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>'},
    {id:'db',t:'السجل المدني',sub:'المالك: مهند كريم الحسني',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'},
    {id:'dossier',t:'ملف القضية 4471-A',sub:'مطلوب — جريمة قتل',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'}
  ]
};

/* ===== الليلة 2 — مِرقاب ===== */
NIGHTS.n2={
  title:'مِرقاب',
  obj:[
    {id:'open',t:'استلم شحنة <code>مِرقاب</code> وافتح الأداة'},
    {id:'mrq1',t:'التقط إشارة <code>مهند</code> بمِرقاب'},
    {id:'mrq2',t:'التقط الإشارة المجهولة — <code>ليث</code>'},
    {id:'board',t:'اربط الأدلة الجديدة في <code>EVIDENCE</code>'},
    {id:'sent',t:'أرسل تقرير الليلة إلى المشرف كامل'}
  ],
  hints:{
    open:'افتح تطبيق MIRQAB من شريط المهام واضغط «تشغيل الماسح».',
    mrq1:'حوّل التردد حتى تصفو الموجة ويعطيك LOCK — ثم «التقط الإشارة». التشويش يعلو كلما اقتربت!',
    mrq2:'إشارة ثانية ظهرت على الطيف بعد الأولى — عد للتقاطها أيضاً.',
    board:'افتح EVIDENCE واربط الدليلين بخيط واحد.',
    sent:'زر «إرفاق الأدلة وإرسالها» في اللوحة، أو send في الطرفية.'
  },
  canSend:function(){return S.flags.mrq1&&S.flags.mrq2;},
  clues:[
    {id:'signal',t:'إشارة مهند',sub:'نقطة مهجورة قرب الطريق 16 — K9',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12a10 10 0 0 1 20 0"/><path d="M5.5 12a6.5 6.5 0 0 1 13 0"/><circle cx="12" cy="12" r="2"/></svg>'},
    {id:'layth',t:'اتصال «ليث»',sub:'جهة اتصال متكررة — غير معروفة للوحدة',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'}
  ]
};

/* ===== الليلة 3 — lynx ===== */
NIGHTS.n3={
  title:'lynx',
  obj:[
    {id:'lynx1',t:'اجمع معلومات مهند و«ليث» بـ <code>lynx</code>'},
    {id:'social',t:'اعثر على حسابه الاجتماعي وشبكته المنزلية'},
    {id:'router',t:'اخترق شبكته ← سيطر على جهازه ← <code>سرق الكوكيز</code>'},
    {id:'crack',t:'فك تشفير <code>session_cookies.enc</code>'},
    {id:'login',t:'سجّل الدخول لحسابه واعثر على الرسالة'},
    {id:'sent',t:'أرسل التقرير — القبض'}
  ],
  hints:{
    lynx1:'افتح تطبيق LYNX وابحث: مهند الحسني — ثم ابحث: ليث',
    social:'في نتيجة lynx: انقر «عمّق ←» على بطاقة مهند — الحساب المجمد وشبكة MOHANNAD-HOME.',
    router:'المتصفح ← mohannad-home.net ← كسر الإدارة بـ hydra -l admin -P rockyou.txt ssh://192.168.88.1 ← ثم hijack ← ثم cookiesteal.',
    crack:'افتح DECRYPT على session_cookies.enc — نفس حلقة الإزاحة القديمة.',
    login:'المتصفح ← social.mohannad ← صفحة الدخول ← أدخل ما استخرجت من الكوكيز.',
    sent:'زر «إرفاق الأدلة وإرسالها» في اللوحة، أو send في الطرفية.'
  },
  canSend:function(){return S.flags.lynx1&&S.flags.social&&S.flags.router&&S.flags.crack&&S.flags.login;},
  clues:[
    {id:'lynxdossier',t:'بطاقة lynx — مهند',sub:'مزاعم مالية مع المرصد القابضة',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'},
    {id:'thorn',t:'خيط @thorn',sub:'ليث — فعال على شبكة داكنة',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>'},
    {id:'cookies',t:'جلسة مسروقة',sub:'كوكيز مشفرة — من جهازه مباشرة',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'},
    {id:'meet',t:'رسالة المستودع ب',sub:'الاجتماع القادم — 04:00',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>'},
    {id:'watched',t:'ليث يراقب الراصد',sub:'بطاقة موجهة إليك باسمك',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'}
  ]
};

/* ===== لحظات القصة ===== */
const ST_BEATS={
  n1:{
    async start(){
      S.flags.live=true;
      sysSay('بدأت المهمة — «الطريق 16»');
      await say('أهلاً بك في الوحدة يا راصد. من اليوم أنت مشغّل مبتدئ في الاستخبارات — وأنا كامل، مشرفك المباشر.');
      await say('قبل يومين: جريمة قتل. المشتبه به اختفى — وآخر رصد له كان على الطريق السريع رقم 16. كاميرات الطريق على شبكة معزولة، ومهمتك الليلة: أخرج اسمه.');
      await say('لنبدأ بالأساس. افتح الطرفية واكتب: help — لتتعرف على عدّتك.');
      renderObj();refreshQuick();
      setPhoneView('chat');
    },
    async breach(){ if(!S.flags.live)return; await sleep(600); await say('كادوا يمسكونك! الملفات المحمّلة بأمان — أعد الاتصال وأكمل المهمة.'); },
    async decline(){ if(!S.flags.live)return; await say('أعتقد أنك رفضت بالخطأ يا راصد. أعد الرد… وسننسى الموقف.'); },
    async finish(){
      await say('استلمت الحزمة يا راصد: سجل الطريق، اللقطة، هوية المشتبه به، وملف القضية. عمل نظيف.');
      await say('هذا كان اختبار تشغيل فقط. الأربعاء القادم توصلك شحنة «مِرقاب»… وسنفتح معاً عقداً أعمق بكثير.');
      await say('نم قليلاً. سأتصل.');
    }
  },
  n2:{
    async start(){
      S.flags.live=true;
      objDone('open');
      renderObj();refreshQuick();
      sysSay('ليلة '+String(night).padStart(2,'0')+' — «مِرقاب»');
      await say('راصد… الليلة لن أتصل كثيراً. اقرأ بسرعة.');
      await say('الشحنة وصلت محطتك قبل قليل — جهاز يسمونه «مِرقاب». يلتقط إشارات الهواتف القريبة منك. افتحه من شريط المهام وشغّل الماسح.');
      await say('هدفك: مهند. هاتفه ينبض كل ليلة من نقطة مهجورة قرب الطريق 16 — يلتقي أحداً هناك. حدد تردده والتقط إشارته.');
      await say('واعذرني عن التقطيع في كلامي… القناة الليلة ليست نظيفة كأمس.');
      setPhoneView('chat');
    },
    async breach(){ if(!S.flags.live)return; await sleep(600); await say('قطع الاتصال فوراً! ما جرى عندك لا يجب أن يُرصد. أكمل… بحذر هذه المرة.'); },
    async decline(){ if(!S.flags.live)return; await say('راصد. الرد. هذا ليس وقتاً للتجاهل.'); },
    async grab1(){ if(!S.flags.live)return; await sleep(400); await say('التقطت نبضته… نقطة مهجورة K9 قرب الطريق. الآن استمر — هناك إشارة أخرى مرافقة لنفس الالتقاء. التقطها أيضاً.'); },
    async grab2(){
      if(!S.flags.live)return;
      await sleep(700);
      await say('ماذا؟… «ليث»؟ هذا الاسم ليس في أي سجل عندنا. ولا في ملفاتي.');
      await say('وأثناء تنصتك… راصد، البث المضاد جاء من داخل قنوات الوحدة نفسها. لا تسألني من. لا أريد هذا مكتوباً في أي مكان.');
      await say('اجمع أدلتك في اللوحة… وارفع التقرير. ثم استمع لي جيداً.');
    },
    async finish(){
      await say('استلمت التقرير. إشارة مهند ونقطة الالتقاء، وجهة الاتصال «ليث». عمل نظيف… ليلة أصعب من أمس.');
      await say('والآن القسم الذي لم أرد أن أقوله أثناء المهمة: أنا لم أطلب لك مِرقاب. الشحنة وصلت محطتك من مصدر خارج قسمي… ولا أعرف كيف عرفوا عنوانك.');
      await say('القناة التي سمعت عبرها «ليث» مرّت من داخل وحدتنا. أحدنا يراقب… وربما يكون أنت الراصد الحقيقي.');
      await say('إن رنت ثلاث رنات غداً… اقبل. وإن رنت مرة واحدة — لا تفتح القناة أبداً.');
      await say('اخلئ المكان يا راصد… سأتواصل عندما يهدأ كل شيء.');
      await sleep(40000);
      sysSay('القناة ستُغلق خلال لحظات…');
      await sleep(4000);
    }
  },
  n3:{
    async start(){
      S.flags.live=true;
      objDone('lynx1_pre');
      renderObj();refreshQuick();
      sysSay('ليلة '+String(night).padStart(2,'0')+' — «lynx»');
      await say('راصد. الرنّة التي وصلتك ليست مني… ولا من ليث. تنصت لنا شخص ثالث، ولا وقت للأسئلة.');
      await say('اعتراضك لليلة الماضية أعطانا تردد مهند — لكن الإشارة وحدها لا تدين أحداً أمام المحكمة. نحتاج حياته الرقمية: حساباته، علاقاته، خططه.');
      await say('أداة جديدة وصلت محطتك: LYNX — تجمع كل ما يُعرف عن أي اسم من الشبكة المفتوحة. افتحها من شريط المهام وابحث: مهند الحسني. ثم ابحث: ليث.');
      setPhoneView('chat');
    },
    async dossiers(){
      if(!S.flags.live)return;
      await sleep(400);
      await say('مزاعم مالية مع المرصد القابضة… وكلمة «ليث» تختفي من الشبكة كلما اقتربنا.');
      await say('عمّق بطاقة مهند في lynx — حساباته القديمة، وشبكته المنزلية. كل جهاز يبث شيئاً عن صاحبه.');
    },
    async router(){
      if(!S.flags.live)return;
      await sleep(400);
      await say('شبكته المنزلية MOHANNAD-HOME على راوتر RT-88 — الثغرة موثقة في 0day-souq. اخترق الراوتر… ثم جهازه… ثم خذ كل ما يجري عليه.');
      await say('وسلّمني الجلسة كاملة. كوكيزه تعني حسابه مفتوحاً أمامك — دون كلمة سر حتى.');
    },
    async cookies(){
      if(!S.flags.live)return;
      await sleep(400);
      await say('الكوكيز مشفرة بنمط الوحدة القديم — نفس حلقة الإزاحة التي كسرتها أول ليلة. افتح DECRYPT واستخرج بيانات الدخول.');
    },
    async login(){
      if(!S.flags.live)return;
      await sleep(500);
      await say('اقرأ الرسائل يا راصد… اقرأها كاملة.');
      await sleep(4000);
      await say('المستودع ب، الساعة 04:00. هذا ما انتظرناه أسابيع. ارفع الحزمة كاملة الآن — وأنا أُحرّك الفريق.');
    },
    async finish(){
      await say('الفريق في الطريق. سأبقيك على الخط…');
      await sleep(6000);
      await say('تم القبض على مهند الحسني. سليم — في مكان آخر تماماً، بعيداً عن المستودع الذي أعطيتنا إياه.');
      await say('المستودع كان فارغاً يا راصد… إلا من صندوق واحد في المنتصف… عليه بطاقة موجهة إليك: «شكراً للراصد». من ليث.');
      await say('ليث يعرف اسمك. يعرف محطتك. ويعرف تحركاتنا قبل أن نتحرك.');
      await say('قصة مهند انتهت — القبض قيد التحقيق، والحقيقة أعمق مما رأينا. لكن قصة ليث… بدأت الليلة.');
      await say('من هذا الحين، كل ما أرسله لك موقّع باسمي: كمال الأنباري. دعني أعرفك من أنت أيضاً يا راصد — قريباً.');
      await say('الليلة… ابتعد عن المحطة. وإن رنت ثلاث رنات… فتلك أنا.');
      await sleep(40000);
      sysSay('القناة ستُغلق خلال لحظات…');
      await sleep(4000);
    }
  }
};
