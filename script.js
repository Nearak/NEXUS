// ===== نظام الصوت =====
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.soundsEnabled = true;
    }
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    playKeyPress() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.06;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
    }
    playSuccess() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        [800, 1000, 1200].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.1;
            osc.start(ctx.currentTime + i * 0.06);
            osc.stop(ctx.currentTime + (i + 1) * 0.06);
        });
    }
    playError() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 300;
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.value = 0.12;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }
    playNotification() { this.playSuccess(); }
}

const audioSystem = new AudioSystem();

// ===== الحالة العامة =====
let state = {
    cpu: 0,
    wanted: 0,
    money: 1500,
    inventory: [],
    displayName: 'محلل NEXUS',
    username: 'admin',
    password: '1234',
    wallpaper: 'radial-gradient(circle at 20% 30%, #1a2a3a, #0a0e17)',
    accentColor: '#00ffcc',
    mail: [
        { from: 'Ariel@NEXUS.sec', subject: '🔐 مرحباً بك في NEXUS', body: 'مرحباً بك في نظام NEXUS... اكتب help في المحطة للبدء.' },
        { from: 'System@NEXUS.sec', subject: '📋 المهمة الأولى', body: 'لبدء العمل، يجب اختراق NEXUS_CORP.\nاستخدم: crackwifi NEXUS_CORP\nجرب: 12345678, password, admin' }
    ],
    bankTransactions: ['+1500 دولار (راتب ابتدائي)'],
    phoneMessages: ['مرحباً، هاتفك الآمن متصل.', 'لديك بريد جديد من Ariel'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    tasks: [
        { id: 1, title: 'اختراق شبكة NEXUS_CORP', desc: 'استخدم crackwifi NEXUS_CORP وجرب كلمات المرور', reward: 500, status: 'pending' },
        { id: 2, title: 'فك تشفير ملف secret.enc', desc: 'استخدم decrypt secret.enc', reward: 800, status: 'pending' },
        { id: 3, title: 'استغلال ثغرة SQL', desc: 'استخدم sqlmap http://test.com/login', reward: 1200, status: 'pending' }
    ],
    wifiNetworks: {
        'NEXUS_CORP': { status: 'secure', password: '12345678', cracked: false, connected: false },
        'PUBLIC_WIFI': { status: 'open', cracked: true, connected: false },
        'DARK_NET': { status: 'secure', password: 'dark2024', cracked: false, connected: false }
    },
    currentWifi: 'غير متصل',
    mission1Done: false
};

// ===== نظام الملفات =====
const fileSystem = {
    '/home/user': {
        'clue.txt': 'القرينة: شبكة NEXUS_CORP تستخدم كلمة مرور ضعيفة...',
        'secret.enc': '[ملف مشفر] المحتوى: "Bitcoin Wallet: 1A2B3C... الرصيد: 50 BTC"',
        'report.pcap': 'حزمة بيانات: تم اكتشاف محاولات اختراق من IP 192.168.1.45'
    },
    '/etc': { 'hosts': '127.0.0.1 localhost' }
};
let currentPath = '/home/user';

// ===== دوال مساعدة =====
function updateUI() {
    document.getElementById('cpuValue').innerText = Math.min(state.cpu, 100);
    document.getElementById('wantedValue').innerText = state.wanted;
    document.getElementById('wallpaper').style.background = state.wallpaper;
    document.getElementById('wifiStatus').innerText = state.currentWifi;
    updateWifiMenu();
}

function addLog(msg) {
    const timestamp = new Date().toLocaleTimeString('ar-EG');
    state.logs.push(`[${timestamp}] ${msg}`);
}

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

function addMoney(amount) {
    state.money += amount;
    state.bankTransactions.push(`${amount > 0 ? '+' : ''}${amount} دولار`);
}

function updateTaskStatus(taskId, status) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = status;
        if (taskId === 1 && status === 'completed') {
            showNotification('🔓 تم فتح DARK_NET', 'يمكنك الآن محاولة اختراق DARK_NET.', 'info');
        }
        saveState();
    }
}

// ===== الإشعارات =====
function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = 'notification';
    const colors = { success: '#2ed573', error: '#ff4757', warning: '#ffa502', info: '#00ffcc' };
    notif.style.borderRightColor = colors[type] || '#00ffcc';
    notif.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(notif);
    audioSystem.playNotification();
    setTimeout(() => { if (notif.parentNode) notif.remove(); }, 5000);
}

// ===== التعطل والاعتقال =====
function triggerOverheat() {
    if (state.isOverheated) return;
    state.isOverheated = true;
    document.getElementById('bsod-overlay').style.display = 'flex';
    audioSystem.playError();
    let timer = 20;
    const interval = setInterval(() => {
        timer--;
        document.getElementById('bsodTimer').innerText = timer;
        document.getElementById('bsodProgressFill').style.width = (timer / 20 * 100) + '%';
        if (timer <= 0) {
            clearInterval(interval);
            document.getElementById('bsod-overlay').style.display = 'none';
            state.cpu = 20;
            state.isOverheated = false;
            addWanted(1);
            updateUI();
            showNotification('⚠️ تعطل النظام', 'تم إعادة التشغيل ورفع المطاردة.', 'error');
        }
    }, 1000);
}

function triggerArrest() {
    if (state.isArrested) return;
    state.isArrested = true;
    const fine = Math.floor(state.money * 0.5);
    state.money = Math.max(0, state.money - fine);
    if (state.inventory.length > 0) state.inventory.pop();
    document.getElementById('arrestFine').innerText = fine;
    document.getElementById('arrest-overlay').style.display = 'flex';
    state.wanted = 0;
    updateUI();
    audioSystem.playError();
    showNotification('🚨 تم الاعتقال!', `تم خصم ${fine} دولار.`, 'error');
}

function closeArrest() {
    document.getElementById('arrest-overlay').style.display = 'none';
    state.isArrested = false;
    updateUI();
}

// ===== السحب =====
function makeDraggable(el) {
    let isDragging = false, offsetX = 0, offsetY = 0;
    const header = el.querySelector('.window-header');
    if (!header) return;
    const startDrag = (e) => {
        if (e.target.closest('.window-controls')) return;
        isDragging = true;
        const rect = el.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = cx - rect.left;
        offsetY = cy - rect.top;
        el.style.transition = 'none';
        e.preventDefault();
    };
    const moveDrag = (e) => {
        if (!isDragging) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        let x = cx - offsetX;
        let y = cy - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight - 50));
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    };
    const endDrag = () => { isDragging = false; };
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    header.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', moveDrag, { passive: true });
    document.addEventListener('touchend', endDrag, { passive: true });
}

// ===== إدارة النوافذ =====
let windowCounter = 0;
let minimizedWindows = {};

function openWindow(id, content = null) {
    const container = document.getElementById('windows-container');
    const existing = document.getElementById(`win-${id}`);
    if (existing) {
        existing.style.zIndex = Date.now() % 1000 + 100;
        if (existing.classList.contains('minimized')) {
            existing.classList.remove('minimized');
            const taskBtn = document.getElementById(`taskbar-${id}`);
            if (taskBtn) taskBtn.classList.remove('minimized-app');
        }
        return;
    }

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = Date.now() % 1000 + 100;
    win.style.right = (8 + Math.random() * 4) + '%';
    win.style.top = (8 + Math.random() * 4) + '%';

    const titles = {
        terminal: 'المحطة الطرفية',
        files: 'مدير الملفات',
        browser: 'المتصفح'
    };
    const icons = {
        terminal: 'terminal',
        files: 'folder',
        browser: 'globe'
    };

    let bodyContent = '';
    if (content) {
        bodyContent = content;
    } else {
        switch (id) {
            case 'terminal': bodyContent = getTerminalHTML(); break;
            case 'files': bodyContent = getFilesHTML(); break;
            case 'browser': bodyContent = getBrowserHTML(); break;
            default: bodyContent = '<p>تطبيق غير معروف</p>';
        }
    }

    win.innerHTML = `
        <div class="window-header">
            <h3><i class="fas fa-${icons[id] || 'window-maximize'}"></i> ${titles[id] || id}</h3>
            <div class="window-controls">
                <button class="win-minimize" onclick="minimizeWindow('${id}')" title="تصغير">─</button>
                <button class="win-maximize" onclick="maximizeWindow('${id}')" title="تكبير">☐</button>
                <button class="win-close" onclick="closeWindow('${id}')" title="إغلاق">✕</button>
            </div>
        </div>
        <div class="window-body">${bodyContent}</div>
    `;
    container.appendChild(win);
    makeDraggable(win);

    // إضافة إلى شريط المهام
    const taskbar = document.getElementById('taskbarApps');
    const appBtn = document.createElement('span');
    appBtn.className = 'taskbar-app';
    appBtn.innerText = titles[id] || id;
    appBtn.onclick = () => {
        const w = document.getElementById(`win-${id}`);
        if (w) {
            if (w.classList.contains('minimized')) {
                w.classList.remove('minimized');
                appBtn.classList.remove('minimized-app');
            } else {
                w.style.zIndex = Date.now() % 1000 + 100;
            }
        }
    };
    appBtn.id = `taskbar-${id}`;
    taskbar.appendChild(appBtn);

    if (id === 'terminal') setTimeout(() => { win.querySelector('.terminal-input')?.focus(); }, 100);
}

function closeWindow(id) {
    document.getElementById(`win-${id}`)?.remove();
    document.getElementById(`taskbar-${id}`)?.remove();
    delete minimizedWindows[id];
}

function minimizeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) {
        win.classList.add('minimized');
        const taskBtn = document.getElementById(`taskbar-${id}`);
        if (taskBtn) taskBtn.classList.add('minimized-app');
        minimizedWindows[id] = true;
    }
}

function maximizeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) {
        win.classList.toggle('maximized');
        const btn = win.querySelector('.win-maximize');
        if (btn) btn.innerText = win.classList.contains('maximized') ? '☐' : '☐';
    }
}

function focusWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) win.style.zIndex = Date.now() % 1000 + 100;
}

// ===== المحطة الطرفية =====
function getTerminalHTML() {
    return `
        <div class="terminal-body">
            <div class="terminal-output" id="terminalOutput">NEXUS Terminal v3.0\nاكتب 'help' لبدء المهام\n</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">$</span>
                <input type="text" class="terminal-input" id="terminalInput" placeholder="اكتب أمراً..." onkeyup="handleTerminalInput(event)">
            </div>
            <div class="quick-commands">
                <button onclick="quickCommand('help')">help</button>
                <button onclick="quickCommand('ls')">ls</button>
                <button onclick="quickCommand('nmap')">nmap</button>
                <button onclick="quickCommand('crackwifi NEXUS_CORP')">crackwifi</button>
                <button onclick="quickCommand('tasks')">tasks</button>
                <button onclick="quickCommand('clear')">clear</button>
            </div>
        </div>
    `;
}

function handleTerminalInput(event) {
    if (event.key === 'Enter') {
        const input = event.target.value.trim();
        if (!input) return;
        const output = document.getElementById('terminalOutput');
        output.innerHTML += `<div><span class="terminal-prompt">$</span> ${input}</div>`;
        const result = executeCommand(input);
        output.innerHTML += `<div>${result}</div>`;
        event.target.value = '';
        output.parentElement.scrollTop = output.parentElement.scrollHeight;
    } else {
        audioSystem.playKeyPress();
    }
}

function quickCommand(cmd) {
    const input = document.getElementById('terminalInput');
    if (input) {
        input.value = cmd;
        const ev = new KeyboardEvent('keyup', { key: 'Enter' });
        input.dispatchEvent(ev);
    }
}

// ===== تنفيذ الأوامر =====
function executeCommand(cmd) {
    addLog(`تنفيذ: ${cmd}`);
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    switch (command) {
        case 'help':
            return `أوامر NEXUS:\nhelp, ls, cd, cat, nmap, crackwifi [SSID], decrypt [file]\nsqlmap [url], ping, ifconfig, whoami, tasks, clear`;

        case 'ls':
            return Object.keys(fileSystem[currentPath] || {}).join('\n') || 'المجلد فارغ';

        case 'cd':
            if (arg && fileSystem[arg]) { currentPath = arg; return `→ ${currentPath}`; }
            return 'مجلد غير موجود';

        case 'cat':
            const f = fileSystem[currentPath]?.[arg];
            if (f) { audioSystem.playSuccess(); return f; }
            return `الملف '${arg}' غير موجود`;

        case 'nmap':
            addCPU(25);
            audioSystem.playSuccess();
            if (!state.mission1Done) {
                state.mission1Done = true;
                addMoney(200);
                showNotification('✅ مسح الشبكة', 'تم اكتشاف الشبكة! +200 دولار', 'success');
            }
            return `Nmap scan:\n192.168.1.1 (gateway) UP\n192.168.1.100 (server) UP`;

        case 'crackwifi':
            if (!arg) return 'استخدام: crackwifi [SSID]';
            const net = state.wifiNetworks[arg];
            if (!net) return `الشبكة '${arg}' غير موجودة`;
            if (net.cracked) return `✅ ${arg} مخترقة بالفعل!`;
            addCPU(15);
            const dict = ['12345678', 'password', 'admin', '00000000', 'letmein', 'qwerty'];
            let found = false;
            for (let pwd of dict) {
                if (pwd === net.password) { found = true; break; }
            }
            if (found) {
                net.cracked = true;
                connectToWifi(arg);
                audioSystem.playSuccess();
                updateTaskStatus(1, 'completed');
                addMoney(500);
                showNotification('✅ اختراق ناجح!', `تم اختراق ${arg}. +500 دولار`, 'success');
                return `✅ اختراق ${arg} نجح! المفتاح: ${net.password}`;
            } else {
                addWanted(1);
                audioSystem.playError();
                return `❌ فشل اختراق ${arg}. حاول مجدداً.`;
            }

        case 'decrypt':
            if (!arg) return 'استخدام: decrypt [file]';
            if (arg === 'secret.enc') {
                addCPU(10);
                updateTaskStatus(2, 'completed');
                addMoney(800);
                showNotification('🔓 فك تشفير', 'تم فك تشفير secret.enc! +800 دولار', 'success');
                return '✅ المحتوى: "Bitcoin Wallet: 1A2B3C... الرصيد: 50 BTC"';
            }
            return `لا يمكن فك تشفير ${arg}`;

        case 'sqlmap':
            if (!arg) return 'استخدام: sqlmap [url]';
            if (arg === 'http://test.com/login') {
                addCPU(20);
                updateTaskStatus(3, 'completed');
                addMoney(1200);
                showNotification('💥 ثغرة SQL', 'تم استغلال الثغرة! +1200 دولار', 'success');
                return '✅ تم استخراج بيانات المستخدمين.';
            }
            return `لم يتم العثور على ثغرة في ${arg}`;

        case 'ping':
            addCPU(5);
            return `PING ${arg || '8.8.8.8'} ...\n64 bytes: time=12ms TTL=64`;

        case 'ifconfig':
            return `eth0: ${state.currentWifi}\nIP: 192.168.1.${Math.floor(Math.random()*254+1)}`;

        case 'whoami':
            return state.username;

        case 'tasks':
            let out = '📋 قائمة المهام:\n';
            state.tasks.forEach(t => {
                out += `${t.status === 'completed' ? '✅' : '⏳'} ${t.title}\n`;
            });
            return out;

        case 'clear':
            document.getElementById('terminalOutput').innerHTML = '';
            return '';

        default:
            addWanted(0.5);
            return `❌ أمر غير معروف: ${command}`;
    }
}

// ===== المتصفح المحسّن =====
let browserHistory = [];
let browserHistoryIndex = -1;
let browserCurrentPage = 'home';

function openBrowser(page = 'home') {
    // نغلق أي نافذة متصفح مفتوحة
    const existing = document.getElementById('win-browser');
    if (existing) {
        closeWindow('browser');
    }
    // نفتح نافذة متصفح جديدة
    openWindow('browser', getBrowserHTML());
    // ننتظر حتى تظهر النافذة ثم نذهب للصفحة المطلوبة
    setTimeout(() => {
        if (page && page !== 'home') {
            navigateTo(page);
        }
    }, 100);
}

function getBrowserHTML() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;">
            <div class="browser-toolbar">
                <div class="browser-nav-buttons">
                    <button onclick="browserBack()" title="رجوع"><i class="fas fa-arrow-left"></i></button>
                    <button onclick="browserForward()" title="تقدم"><i class="fas fa-arrow-right"></i></button>
                    <button onclick="browserReload()" title="تحديث"><i class="fas fa-sync-alt"></i></button>
                </div>
                <div class="browser-url-bar">
                    <span class="url-icon"><i class="fas fa-lock" style="color:#00ffcc;"></i></span>
                    <input type="text" id="browserUrl" value="nexus://home" placeholder="ابحث أو اكتب عنوان..." onkeydown="if(event.key==='Enter')browserGo()">
                </div>
                <div class="browser-actions">
                    <button onclick="browserGo()" title="اذهب"><i class="fas fa-arrow-right"></i></button>
                    <button onclick="openBrowser('home')" title="الرئيسية"><i class="fas fa-home"></i></button>
                </div>
            </div>
            <div class="browser-content" id="browserContent">
                ${getPageContent('home')}
            </div>
        </div>
    `;
}

function getPageContent(page) {
    const pages = {
        'home': `
            <div class="browser-page">
                <div class="page-header">🏠 الصفحة الرئيسية</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;">
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('bank')">
                        <i class="fas fa-university" style="font-size:28px;color:#00ffcc;"></i>
                        <div style="margin-top:6px;">البنك</div>
                    </div>
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('tasks')">
                        <i class="fas fa-tasks" style="font-size:28px;color:#ffa502;"></i>
                        <div style="margin-top:6px;">المهام</div>
                    </div>
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('mail')">
                        <i class="fas fa-envelope" style="font-size:28px;color:#00ffcc;"></i>
                        <div style="margin-top:6px;">البريد</div>
                    </div>
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('profile')">
                        <i class="fas fa-user-circle" style="font-size:28px;color:#00ffcc;"></i>
                        <div style="margin-top:6px;">ملفي</div>
                    </div>
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('vault')">
                        <i class="fas fa-lock" style="font-size:28px;color:#ff4757;"></i>
                        <div style="margin-top:6px;">القبو</div>
                    </div>
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('hq')">
                        <i class="fas fa-project-diagram" style="font-size:28px;color:#00ffcc;"></i>
                        <div style="margin-top:6px;">المقر</div>
                    </div>
                    <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;cursor:pointer;text-align:center;" onclick="navigateTo('phone')">
                        <i class="fas fa-mobile-alt" style="font-size:28px;color:#00ffcc;"></i>
                        <div style="margin-top:6px;">الهاتف</div>
                    </div>
                </div>
                <div style="margin-top:20px;padding:16px;background:rgba(0,255,204,0.05);border-radius:8px;border:1px solid #00ffcc;">
                    <strong style="color:#00ffcc;">📡 حالة النظام</strong>
                    <div style="font-size:12px;color:#888;margin-top:8px;">
                        <div>المستخدم: ${state.username}</div>
                        <div>الشبكة: ${state.currentWifi}</div>
                        <div>المطاردة: ${state.wanted}/5</div>
                    </div>
                </div>
            </div>
        `,
        'bank': `
            <div class="browser-page">
                <div class="page-header">🏦 البنك الرقمي</div>
                <div class="bank-balance">
                    <div class="label">الرصيد الحالي</div>
                    <div class="amount">${state.money} $</div>
                </div>
                <div style="background:rgba(30,45,74,0.5);padding:12px;border-radius:8px;">
                    <strong style="color:#00ffcc;">📊 سجل المعاملات</strong>
                    <div style="margin-top:8px;max-height:200px;overflow-y:auto;">
                        ${state.bankTransactions.map(t => `<div class="bank-transaction">${t}</div>`).join('')}
                    </div>
                </div>
            </div>
        `,
        'tasks': `
            <div class="browser-page">
                <div class="page-header">📋 دفتر المهام</div>
                ${state.tasks.map(t => `
                    <div class="task-item ${t.status === 'completed' ? 'completed' : ''}">
                        <div class="task-title">${t.title}</div>
                        <div class="task-desc">${t.desc}</div>
                        <div class="task-reward">💰 ${t.reward} دولار</div>
                        <div class="task-status">${t.status === 'completed' ? '✅ مكتملة' : '⏳ قيد التنفيذ'}</div>
                    </div>
                `).join('')}
            </div>
        `,
        'mail': `
            <div class="browser-page">
                <div class="page-header">📧 البريد الآمن</div>
                ${state.mail.map((m, i) => `
                    <div class="mail-item" onclick="this.classList.toggle('open')">
                        <div class="subject">${m.from}</div>
                        <div class="from">${m.subject}</div>
                        <div class="body">${m.body}</div>
                    </div>
                `).join('')}
            </div>
        `,
        'profile': `
            <div class="browser-page">
                <div class="page-header">👤 الملف الشخصي</div>
                <div class="profile-card">
                    <div class="field"><strong>اسم المستخدم:</strong> <span class="value">${state.username}</span></div>
                    <div class="field"><strong>الاسم الكامل:</strong> <span class="value">${state.displayName}</span></div>
                    <div class="field"><strong>المستوى الأمني:</strong> <span class="value" style="color:#00ffcc;">مبتدئ</span></div>
                </div>
                <div style="background:rgba(255,165,2,0.1);padding:16px;border-radius:8px;border:1px solid #ffa502;">
                    <strong style="color:#ffa502;">⚙️ الإحصائيات</strong>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">${state.money}$</div>
                            <div class="stat-label">الأموال</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value" style="color:#ffa502;">${state.wanted}/5</div>
                            <div class="stat-label">المطاردة</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value" style="color:${state.cpu>70?'#ff4757':'#00ffcc'};">${state.cpu}%</div>
                            <div class="stat-label">الحرارة</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value" style="color:#00ffcc;">${state.inventory.length}</div>
                            <div class="stat-label">الأدوات</div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'vault': `
            <div class="browser-page">
                <div class="page-header">💀 القبو السري</div>
                <div style="background:rgba(255,71,87,0.1);padding:16px;border-radius:8px;border:1px solid #ff4757;margin-bottom:16px;">
                    <strong style="color:#ff4757;">⚠️ منطقة خطيرة</strong>
                    <p style="font-size:12px;color:#888;margin-top:6px;">أدوات وأسرار مظلمة للعمليات المتقدمة</p>
                </div>
                <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;">
                    <strong style="color:#ffa502;">🎒 الحقيبة</strong>
                    <div style="font-size:12px;margin-top:8px;">
                        ${state.inventory.length ? state.inventory.map(i => `<div style="padding:4px;border-bottom:1px solid #2a3a5a;">✓ ${i}</div>`).join('') : '<div style="color:#888;">فارغة</div>'}
                    </div>
                </div>
            </div>
        `,
        'hq': `
            <div class="browser-page">
                <div class="page-header">🏢 غرفة العمليات</div>
                <div style="background:linear-gradient(135deg,rgba(0,255,204,0.1),transparent);padding:16px;border-radius:8px;border:1px solid #00ffcc;margin-bottom:16px;">
                    <strong style="color:#00ffcc;">🎯 المهام النشطة</strong>
                    <div style="font-size:12px;margin-top:8px;">
                        ${state.tasks.map(t => `
                            <div style="padding:6px;background:rgba(0,255,204,0.05);margin:4px 0;border-radius:4px;">
                                ${t.status === 'completed' ? '✅' : '⏳'} ${t.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="background:rgba(30,45,74,0.5);padding:16px;border-radius:8px;">
                    <strong style="color:#ffa502;">📡 الاتصالات</strong>
                    <div style="font-size:12px;color:#888;margin-top:6px;">
                        <div>البريد: ${state.mail.length} رسائل</div>
                        <div>الشبكة: ${state.currentWifi}</div>
                        <div>المستخدمين النشطين: 1</div>
                    </div>
                </div>
            </div>
        `,
        'phone': `
            <div class="browser-page">
                <div class="page-header">📱 الهاتف الآمن</div>
                <div class="phone-container">
                    <div class="phone-frame">
                        <div class="phone-notch"></div>
                        <div class="phone-screen">
                            <div class="phone-status">
                                <span>NEXUS</span>
                                <span>📶 ${state.currentWifi}</span>
                                <span>🔋 100%</span>
                            </div>
                            <div class="phone-apps-grid">
                                <div class="phone-app" onclick="showNotification('📞', 'لا توجد مكالمات', 'info')">
                                    <i class="fas fa-phone"></i><span>اتصال</span>
                                </div>
                                <div class="phone-app" onclick="showNotification('💬', 'لديك رسائل جديدة', 'info')">
                                    <i class="fas fa-sms"></i><span>رسائل</span>
                                </div>
                                <div class="phone-app" onclick="showNotification('🖼️', 'لا توجد صور', 'info')">
                                    <i class="fas fa-images"></i><span>معرض</span>
                                </div>
                                <div class="phone-app" onclick="showNotification('⚙️', 'الإعدادات محمية', 'info')">
                                    <i class="fas fa-cog"></i><span>إعدادات</span>
                                </div>
                            </div>
                            <div class="phone-messages">
                                ${state.phoneMessages.map(m => `
                                    <div class="phone-message">📨 ${m}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    return pages[page] || pages['home'];
}

function navigateTo(page) {
    browserCurrentPage = page;
    const content = document.getElementById('browserContent');
    const url = document.getElementById('browserUrl');
    if (content) {
        content.innerHTML = getPageContent(page);
        // إضافة إلى التاريخ
        browserHistory = browserHistory.slice(0, browserHistoryIndex + 1);
        browserHistory.push(page);
        browserHistoryIndex = browserHistory.length - 1;
    }
    if (url) {
        url.value = `nexus://${page}`;
    }
}

function browserGo() {
    const url = document.getElementById('browserUrl');
    if (!url) return;
    const query = url.value.trim();
    // البحث عن صفحات معروفة
    const knownPages = ['home', 'bank', 'tasks', 'mail', 'profile', 'vault', 'hq', 'phone'];
    for (let page of knownPages) {
        if (query.includes(page)) {
            navigateTo(page);
            return;
        }
    }
    // إذا كان بحثاً
    if (query.length > 0) {
        showNotification('🔍 بحث', `البحث عن: ${query}`, 'info');
        navigateTo('home');
    }
}

function browserBack() {
    if (browserHistoryIndex > 0) {
        browserHistoryIndex--;
        navigateTo(browserHistory[browserHistoryIndex]);
    }
}

function browserForward() {
    if (browserHistoryIndex < browserHistory.length - 1) {
        browserHistoryIndex++;
        navigateTo(browserHistory[browserHistoryIndex]);
    }
}

function browserReload() {
    if (browserCurrentPage) {
        navigateTo(browserCurrentPage);
        showNotification('🔄 تحديث', 'تم تحديث الصفحة', 'info');
    }
}

// ===== وظائف الملفات =====
function getFilesHTML() {
    let html = `<div style="font-size:13px;"><div style="color:#00ffcc;">📁 ${currentPath}</div>`;
    const files = fileSystem[currentPath] || {};
    Object.keys(files).forEach(f => {
        html += `<div style="padding:6px;background:rgba(0,255,204,0.05);margin:4px 0;border-radius:4px;cursor:pointer;" onclick="showNotification('📄 ${f}', '${files[f].substring(0,80)}...', 'info')">${f}</div>`;
    });
    return html + '</div>';
}

// ===== الشبكات المحسّنة =====
function toggleWifiMenu() {
    const menu = document.getElementById('wifiMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('startMenu').style.display = 'none';
    updateWifiMenu();
}

function updateWifiMenu() {
    const list = document.getElementById('wifiList');
    if (!list) return;
    let html = '';
    for (let net in state.wifiNetworks) {
        const info = state.wifiNetworks[net];
        const isConnected = state.currentWifi === net;
        let statusText = '🔒 محمية';
        let statusClass = 'secure';
        let checkMark = '';
        let actions = '';

        if (info.cracked || info.status === 'open') {
            statusText = info.cracked ? '✅ مخترقة' : '🌐 مفتوحة';
            statusClass = info.cracked ? 'cracked' : '';
            if (isConnected) {
                statusText = '✅ متصل';
                statusClass = 'connected';
                checkMark = `<span class="wifi-check"><i class="fas fa-check-circle"></i></span>`;
            }
            actions = `
                <div class="wifi-actions">
                    ${!isConnected ? `<button onclick="connectToWifi('${net}')">اتصل</button>` : ''}
                    <button onclick="forgetWifi('${net}')" title="نسيان الشبكة"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else {
            actions = `
                <div class="wifi-actions">
                    <button onclick="showNotification('🔒 محمية', 'استخدم crackwifi ${net} لاختراقها', 'warning')">اختراق</button>
                </div>
            `;
        }

        html += `
            <div class="wifi-item" style="${isConnected ? 'background:rgba(0,255,204,0.05);border-right:3px solid #00ffcc;' : ''}">
                <i class="fas ${info.status === 'secure' ? 'fa-lock' : 'fa-wifi'}"></i>
                <div class="wifi-info">
                    <div class="wifi-name">${net}</div>
                    <div class="wifi-strength ${statusClass}">${statusText}</div>
                </div>
                ${checkMark}
                ${actions}
            </div>
        `;
    }
    list.innerHTML = html;
}

function connectToWifi(network) {
    const info = state.wifiNetworks[network];
    if (!info) return;
    if (info.cracked || info.status === 'open') {
        // قطع الاتصال بالشبكة الحالية
        for (let n in state.wifiNetworks) {
            state.wifiNetworks[n].connected = false;
        }
        info.connected = true;
        state.currentWifi = network;
        updateUI();
        audioSystem.playSuccess();
        showNotification('📡 متصل', `تم الاتصال بـ ${network}`, 'success');
        document.getElementById('wifiMenu').style.display = 'none';
        saveState();
    } else {
        audioSystem.playError();
        showNotification('🔒 محمية', `شبكة ${network} غير مخترقة. استخدم crackwifi ${network}`, 'error');
    }
}

function forgetWifi(network) {
    const info = state.wifiNetworks[network];
    if (!info) return;
    // إذا كانت الشبكة متصلة حالياً، افصلها
    if (state.currentWifi === network) {
        state.currentWifi = 'غير متصل';
        info.connected = false;
    }
    // إعادة ضبط حالة الاختراق (للشبكات الآمنة فقط)
    if (info.status === 'secure') {
        info.cracked = false;
        info.connected = false;
    }
    updateUI();
    audioSystem.playSuccess();
    showNotification('🗑️ تم النسيان', `تم نسيان شبكة ${network}`, 'info');
    document.getElementById('wifiMenu').style.display = 'none';
    saveState();
}

// ===== قوائم =====
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('wifiMenu').style.display = 'none';
}

function updateClock() {
    document.getElementById('clockDisplay').innerText = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function resetGame() {
    if (confirm('هل تريد إعادة التشغيل؟')) {
        localStorage.removeItem('nexusState');
        location.reload();
    }
}

// ===== تسجيل الدخول =====
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('loginUser').value.trim() || 'admin';
    const pass = document.getElementById('loginPass').value.trim() || '1234';
    if (user && pass) {
        state.username = user;
        audioSystem.playSuccess();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        loadState();
        updateUI();
        updateClock();
        setInterval(updateClock, 1000);
        showNotification('✅ مرحباً', `أهلاً ${user}`, 'success');
        // فتح التطبيقات الافتراضية
        setTimeout(() => {
            openWindow('terminal');
            openBrowser('hq');
        }, 300);
        return false;
    }
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').innerText = 'بيانات غير صحيحة';
    return false;
}

// ===== حفظ وتحميل =====
function saveState() {
    try { localStorage.setItem('nexusState', JSON.stringify(state)); } catch(e) {}
}

function loadState() {
    try {
        const saved = localStorage.getItem('nexusState');
        if (saved) Object.assign(state, JSON.parse(saved));
    } catch(e) {}
}

// ===== الإقلاع =====
window.addEventListener('DOMContentLoaded', () => {
    audioSystem.init();
    loadState();

    let progress = 0;
    const bar = document.getElementById('bootBarFill');
    const btn = document.getElementById('bootContinueBtn');
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            bar.style.width = '100%';
            btn.style.display = 'inline-block';
        }
        bar.style.width = Math.min(progress, 100) + '%';
    }, 250);

    btn.addEventListener('click', () => {
        audioSystem.playSuccess();
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('loginUser').value = state.username;
        document.getElementById('loginPass').value = state.password;
    });
});

// إغلاق القوائم بالنقر خارجها
document.addEventListener('click', (e) => {
    ['startMenu', 'wifiMenu'].forEach(id => {
        const menu = document.getElementById(id);
        const trigger = id === 'startMenu' ? document.getElementById('startBtn') : document.getElementById('wifiIndicator');
        if (menu && menu.style.display === 'block') {
            if (!menu.contains(e.target) && !trigger.contains(e.target)) {
                menu.style.display = 'none';
            }
        }
    });
});

// إغلاق النوافذ بـ Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const wins = document.querySelectorAll('.window:not(.minimized)');
        if (wins.length > 0) {
            const last = wins[wins.length - 1];
            const id = last.id.replace('win-', '');
            closeWindow(id);
        }
    }
});
