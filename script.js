// ========== الحالة العامة للعبة ==========
let state = {
    cpu: 0,
    wanted: 0,
    money: 1000,
    inventory: [],
    name: "محلل NEXUS",
    wallpaper: 'radial-gradient(circle at 20% 30%, #1a2a3a, #0a0e17)',
    accentColor: '#00ffcc',
    mail: [
        { from: 'Ariel@NEXUS', subject: 'مرحباً بك', body: 'أنت جاهز لبدء المهمات. استخدم المحطة الطرفية لاستكشاف البيئة.' }
    ],
    bankTransactions: ['+1000 دولار (إيداع أولي)'],
    phoneMessages: ['مرحباً، هذا هاتفك الآمن. استخدمه لتلقي التعليمات السرية.'],
    logs: [],
    isOverheated: false,
    isArrested: false
};

// نظام الملفات الوهمي (القرص الصلب)
const fileSystem = {
    '/home/user': {
        'clue.txt': 'القرينة الأولى: كلمة المرور الضعيفة هي 12345678',
        'secret.enc': 'ملف مشفر: U2FsdGVkX1... (بيانات بيتكوين)',
        'report.pcap': 'حزمة بيانات مرصودة... تحتوي على IP: 192.168.1.45'
    },
    '/etc': {
        'hosts': '127.0.0.1 localhost'
    }
};
let currentPath = '/home/user';

// ========== دوال مساعدة ==========
function updateUI() {
    document.getElementById('cpuValue').innerText = Math.min(state.cpu, 100);
    document.getElementById('wantedValue').innerText = state.wanted;
    document.getElementById('wallpaper').style.background = state.wallpaper;
    // تحديث لون الأكسن
    document.querySelectorAll('.window-header, #startBtn, .terminal-prompt, .sys-indicators #cpuIndicator').forEach(el => {
        el.style.color = state.accentColor;
    });
}

function addLog(msg) {
    state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

// ========== نظام الحرارة والمطاردة ==========
function addCPU(amount) {
    if (state.isOverheated) return;
    state.cpu = Math.min(state.cpu + amount, 100);
    updateUI();
    if (state.cpu >= 100) triggerOverheat();
}

function addWanted(amount) {
    state.wanted = Math.min(state.wanted + amount, 5);
    updateUI();
    if (state.wanted >= 5) triggerArrest();
}

function reduceWanted(amount) {
    state.wanted = Math.max(state.wanted - amount, 0);
    updateUI();
}

// ========== التعطل (BSOD) ==========
function triggerOverheat() {
    if (state.isOverheated) return;
    state.isOverheated = true;
    document.getElementById('bsod-overlay').style.display = 'flex';
    let timer = 20;
    const timerEl = document.getElementById('bsodTimer');
    const fillEl = document.getElementById('bsodProgressFill');
    const interval = setInterval(() => {
        timer--;
        timerEl.innerText = timer;
        fillEl.style.width = (timer / 20 * 100) + '%';
        if (timer <= 0) {
            clearInterval(interval);
            document.getElementById('bsod-overlay').style.display = 'none';
            state.cpu = 20;
            state.isOverheated = false;
            // في حالة التعطل أثناء عملية حساسة، نرفع المطاردة
            addWanted(1);
            addLog('تعطل النظام بسبب الحرارة! تم رفع المطاردة.');
            updateUI();
        }
    }, 1000);
}

// ========== الاعتقال ==========
function triggerArrest() {
    if (state.isArrested) return;
    state.isArrested = true;
    const fine = Math.floor(state.money * 0.5);
    state.money -= fine;
    // مصادرة أداة عشوائية
    if (state.inventory.length > 0) {
        const removed = state.inventory.pop();
        addLog(`تمت مصادرة الأداة: ${removed}`);
    }
    document.getElementById('arrestFine').innerText = fine;
    document.getElementById('arrest-overlay').style.display = 'flex';
    state.wanted = 0;
    updateUI();
}

function closeArrest() {
    document.getElementById('arrest-overlay').style.display = 'none';
    state.isArrested = false;
    addLog('تم الإفراج بكفالة، العودة إلى المقر.');
    updateUI();
}

// ========== إدارة النوافذ ==========
function openWindow(id) {
    const container = document.getElementById('windows-container');
    // إنشاء نافذة جديدة
    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = Date.now() % 1000 + 100;

    let title = id.charAt(0).toUpperCase() + id.slice(1);
    let content = '';

    switch (id) {
        case 'terminal': content = getTerminalHTML(); break;
        case 'profile': content = getProfileHTML(); break;
        case 'vault': content = getVaultHTML(); break;
        case 'phone': content = getPhoneHTML(); break;
        case 'mail': content = getMailHTML(); break;
        case 'bank': content = getBankHTML(); break;
        case 'hq': content = getHQHTML(); break;
        default: content = '<p>تطبيق قيد التطوير</p>';
    }

    win.innerHTML = `
        <div class="window-header">
            <h3><i class="fas fa-${id === 'terminal' ? 'terminal' : id === 'vault' ? 'skull' : id === 'profile' ? 'user' : id === 'phone' ? 'mobile' : id === 'mail' ? 'envelope' : id === 'bank' ? 'university' : 'headquarters'}"></i> ${title}</h3>
            <button onclick="closeWindow('${id}')">✕</button>
        </div>
        <div class="window-body">${content}</div>
    `;
    container.appendChild(win);

    // إظهار في شريط المهام
    const taskbar = document.getElementById('taskbarApps');
    const appBtn = document.createElement('span');
    appBtn.className = 'taskbar-app';
    appBtn.innerText = title;
    appBtn.onclick = () => focusWindow(id);
    appBtn.id = `task-${id}`;
    taskbar.appendChild(appBtn);

    // إذا كانت الطرفية، نربط الأحداث
    if (id === 'terminal') setTimeout(() => initTerminal(), 50);
}

function closeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) win.remove();
    const task = document.getElementById(`task-${id}`);
    if (task) task.remove();
}

function focusWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) win.style.zIndex = Date.now() % 1000 + 100;
}

// ========== هيكل الطرفية (الأهم) ==========
function getTerminalHTML() {
    return `
        <div class="terminal-body" id="terminalBody">
            <div class="terminal-output" id="terminalOutput">نظام NEXOS جاهز. اكتب 'help' لمعرفة الأوامر.\n</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">user@nexus:~$</span>
                <input type="text" class="terminal-input" id="terminalInput" autofocus spellcheck="false" autocomplete="off">
            </div>
            <div class="quick-commands">
                <button onclick="quickCmd('ls')">ls</button>
                <button onclick="quickCmd('nmap')">nmap</button>
                <button onclick="quickCmd('clear')">clear</button>
                <button onclick="quickCmd('help')">help</button>
                <button onclick="quickCmd('cooldown')">cooldown</button>
            </div>
        </div>
    `;
}

function quickCmd(cmd) {
    const input = document.getElementById('terminalInput');
    if (input) { input.value = cmd; executeCommand(cmd); }
}

function initTerminal() {
    const input = document.getElementById('terminalInput');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            input.value = '';
            executeCommand(cmd);
        }
    });
    // التركيز التلقائي
    setTimeout(() => input.focus(), 100);
}

function executeCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;

    const prompt = 'user@nexus:~$ ';
    output.innerText += `\n${prompt}${cmd}`;

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let response = '';

    // ===== معالجة الأوامر =====
    switch (mainCmd) {
        case 'help':
            response = `الأوامر المتاحة:
- ls : عرض الملفات في المجلد الحالي
- cat [ملف] : قراءة محتوى ملف
- echo [نص] : طباعة نص
- clear : مسح الشاشة
- nmap [ip] : مسح الشبكة (يرفع الحرارة)
- ping [ip] : اختبار الاتصال
- ifconfig : عرض الشبكات
- chmod +x : محاكاة منح صلاحيات
- incognito : تقليل المطاردة (يستخدم مرة)
- cooldown : تبريد المعالج (يستخدم مرة)
- sudo [امر] : تنفيذ أمر بصلاحيات عليا`;
            break;

        case 'ls':
            const files = Object.keys(fileSystem[currentPath] || {});
            response = files.length ? files.join('  ') : 'مجلد فارغ';
            break;

        case 'cat':
            if (args.length === 0) { response = 'يرجى تحديد اسم ملف.'; break; }
            const fileContent = fileSystem[currentPath]?.[args[0]];
            response = fileContent ? fileContent : 'الملف غير موجود.';
            break;

        case 'echo':
            response = args.join(' ') || '';
            break;

        case 'clear':
            output.innerText = '';
            return;

        case 'nmap':
            addCPU(25);
            response = `[🔍] فحص الشبكة ${args[0] || '127.0.0.1'}...\nمنافذ مفتوحة: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (PROXY)`;
            addLog('تم استخدام nmap، ارتفاع الحرارة.');
            break;

        case 'ping':
            addCPU(5);
            response = `PING ${args[0] || '8.8.8.8'} ...\n64 بايت من ${args[0] || '8.8.8.8'}: زمن=12ms TTL=64`;
            break;

        case 'ifconfig':
            response = `eth0: 192.168.1.100\nlo: 127.0.0.1\nwlan0: 10.0.0.5 (متصل)`;
            break;

        case 'chmod':
            addCPU(8);
            response = `✅ تم تغيير صلاحيات الملف بنجاح (محاكاة).`;
            break;

        case 'incognito':
            if (state.inventory.includes('هوية مزيفة')) {
                reduceWanted(3);
                state.inventory = state.inventory.filter(i => i !== 'هوية مزيفة');
                response = `🕵️ تم تفعيل الهوية المزيفة! تم خفض المطاردة إلى ${state.wanted}.`;
                addLog('تم استخدام هوية مزيفة.');
            } else {
                response = '❌ ليس لديك هوية مزيفة. اشترِ واحدة من القبو.';
            }
            break;

        case 'cooldown':
            if (state.inventory.includes('مبرد سيليكون')) {
                state.cpu = Math.max(state.cpu - 30, 0);
                state.inventory = state.inventory.filter(i => i !== 'مبرد سيليكون');
                response = `❄️ تم استخدام المبرد! الحرارة الآن ${state.cpu}%.`;
                addLog('تم استخدام المبرد.');
            } else {
                response = '❌ ليس لديك مبرد. اشترِ واحداً من القبو.';
            }
            break;

        case 'sudo':
            addCPU(10);
            response = `[🔐] تنفيذ ${args.join(' ')} بصلاحيات الرووت... تم بنجاح.`;
            break;

        case 'whoami':
            response = state.name;
            break;

        default:
            response = `أمر غير معروف: ${mainCmd}. اكتب 'help' للقائمة.`;
            addWanted(1); // الأمر الخاطئ يرفع الشبهات
            addLog(`أمر خاطئ: ${mainCmd}، رفع المطاردة.`);
            break;
    }

    output.innerText += `\n${response}\n`;
    output.scrollTop = output.scrollHeight;
    updateUI();
    // حفظ الحالة محلياً
    saveState();
}

// ========== بقية التطبيقات (ملف شخصي، قبو، الخ) ==========
function getProfileHTML() {
    return `
        <div style="display:flex; flex-direction:column; gap:15px;">
            <h3>👤 الملف الشخصي</h3>
            <label>الاسم: <input type="text" id="profileName" value="${state.name}" style="background:#1a2639;border:1px solid #2a3a5a;color:#fff;padding:5px;border-radius:4px;"></label>
            <label>لون الخلفية: <input type="color" id="profileBg" value="#1a2a3a" style="background:transparent;border:none;"></label>
            <label>لون الإطار (Accent): <input type="color" id="profileAccent" value="#00ffcc" style="background:transparent;border:none;"></label>
            <button onclick="saveProfile()" style="background:#00ffcc;color:#000;border:none;padding:8px;border-radius:6px;cursor:pointer;">💾 حفظ التغييرات</button>
            <p>💰 الرصيد: ${state.money} دولار</p>
            <p>📦 الأدوات: ${state.inventory.length ? state.inventory.join(' - ') : 'لا يوجد'}</p>
            <p>🛡️ مستوى المطاردة: ${state.wanted}/5</p>
        </div>
    `;
}

function saveProfile() {
    const name = document.getElementById('profileName').value;
    const bg = document.getElementById('profileBg').value;
    const accent = document.getElementById('profileAccent').value;
    state.name = name || 'محلل NEXUS';
    state.wallpaper = `radial-gradient(circle at 20% 30%, ${bg}, #0a0e17)`;
    state.accentColor = accent;
    updateUI();
    saveState();
    alert('تم حفظ الملف الشخصي!');
    closeWindow('profile');
    openWindow('profile');
}

function getVaultHTML() {
    const items = [
        { name: 'ماسح الثغرات الشامل', price: 350, desc: 'مسح جميع المنافذ بدقة.' },
        { name: 'مبرد سيليكون', price: 200, desc: 'يخفض الحرارة 30% عند الاستخدام.' },
        { name: 'هوية مزيفة', price: 500, desc: 'يخفض المطاردة 3 درجات (استخدام واحد).' },
        { name: 'طقم فك التشفير', price: 400, desc: 'فك تشفير الملفات بسرعة.' },
        { name: 'Rootkit متقدم', price: 750, desc: 'إخفاء العمليات لمدة دقيقة.' }
    ];
    let html = `<h3>💀 القبو - السوق المظلم</h3><p>رصيدك: ${state.money} BTCr</p><hr>`;
    items.forEach(item => {
        const owned = state.inventory.includes(item.name) ? '✅ مملوك' : 'شراء';
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #1e2d4a;">
                <div><strong>${item.name}</strong><br><small>${item.desc}</small></div>
                <div>
                    <span style="margin-right:10px;">${item.price} BTCr</span>
                    <button onclick="buyItem('${item.name}', ${item.price})" style="background:${owned.includes('مملوك')?'#2a3a5a':'#00ffcc'};color:#000;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">${owned}</button>
                </div>
            </div>
        `;
    });
    return html;
}

function buyItem(name, price) {
    if (state.inventory.includes(name)) { alert('لديك هذا بالفعل!'); return; }
    if (state.money < price) { alert('رصيدك غير كافٍ!'); return; }
    state.money -= price;
    state.inventory.push(name);
    addLog(`تم شراء ${name} من القبو.`);
    saveState();
    closeWindow('vault');
    openWindow('vault');
    updateUI();
}

function getPhoneHTML() {
    return `<h3>📱 الهاتف الآمن</h3><hr>${state.phoneMessages.map((msg,i) => `<p key=${i}>📩 ${msg}</p>`).join('')}`;
}

function getMailHTML() {
    return `<h3>📧 البريد الوارد</h3><hr>${state.mail.map(m => `<div style="border:1px solid #1e2d4a;padding:10px;margin:8px 0;border-radius:6px;"><b>${m.from}</b> - ${m.subject}<p>${m.body}</p></div>`).join('')}`;
}

function getBankHTML() {
    return `<h3>🏦 بنك NEXUS</h3><p>💰 الرصيد الحالي: ${state.money} دولار</p><hr><h4>آخر المعاملات:</h4>${state.bankTransactions.map(t => `<p>▪️ ${t}</p>`).join('')}`;
}

function getHQHTML() {
    return `
        <h3>🏢 المقر (HQ) - غرفة العمليات</h3>
        <p>🔹 هنا ستظهر المهام القصصية والجانبية.</p>
        <p>🔹 المهمة النشطة: <b>استعادة اتصال الإنترنت</b> (استخدم nmap و aircrack-ng).</p>
        <hr>
        <p><i class="fas fa-circle" style="color:#00ffcc;"></i> نظام المراقبة: يعمل</p>
        <p><i class="fas fa-circle" style="color:#ffa502;"></i> حالة الشبكة: مستقرة</p>
        <button onclick="addLog('تم تحديث المقر')" style="background:#1e2d4a;border:none;color:#fff;padding:8px;border-radius:6px;cursor:pointer;">تحديث الحالة</button>
    `;
}

// ========== حفظ وتحميل الحالة ==========
function saveState() {
    try {
        localStorage.setItem('nexusGameState', JSON.stringify(state));
    } catch(e) {}
}

function loadState() {
    try {
        const saved = localStorage.getItem('nexusGameState');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        }
    } catch(e) {}
}

// ========== إعادة تشغيل اللعبة ==========
function resetGame() {
    if (confirm('هل أنت متأكد؟ سيتم فقدان التقدم المحلي.')) {
        localStorage.removeItem('nexusGameState');
        location.reload();
    }
}

// ========== إدارة قائمة ابدأ ==========
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// ========== الساعة ==========
function updateClock() {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
}

// ========== التهيئة الرئيسية ==========
window.onload = function() {
    loadState();
    updateUI();
    updateClock();
    setInterval(updateClock, 1000);

    // إخفاء شاشة التحميل وإظهار سطح المكتب
    const boot = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');
    const fill = document.getElementById('loaderFill');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            boot.style.display = 'none';
            desktop.style.display = 'block';
            // فتح الطرفية تلقائياً
            openWindow('terminal');
            openWindow('hq');
        }
        fill.style.width = progress + '%';
    }, 200);
};

// ========== إغلاق النوافذ بالضغط على Escape ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const windows = document.querySelectorAll('.window');
        if (windows.length > 0) {
            const last = windows[windows.length - 1];
            const id = last.id.replace('win-', '');
            closeWindow(id);
        }
    }
});
