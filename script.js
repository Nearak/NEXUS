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
        gain.gain.value = 0.08;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
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
            gain.gain.value = 0.12;
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
        gain.gain.value = 0.15;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }
    playNotification() {
        this.playSuccess();
    }
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
        { from: 'Ariel@NEXUS.sec', subject: '🔐 مرحباً بك في NEXUS', body: 'مرحباً بك في NEXUS... اكتب help في المحطة للبدء.' },
        { from: 'System@NEXUS.sec', subject: '📋 المهمة الأولى: اختراق الشبكة', body: 'لبدء العمل، يجب اختراق NEXUS_CORP.\nاستخدم الأمر: crackwifi NEXUS_CORP\nجرب كلمات المرور: 12345678, password, admin' }
    ],
    bankTransactions: ['+1500 دولار (راتب ابتدائي)'],
    phoneMessages: ['مرحباً، هاتفك الآمن متصل.'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    tasks: [
        { id: 1, title: 'اختراق شبكة NEXUS_CORP', desc: 'استخدم crackwifi NEXUS_CORP وجرب كلمات المرور', reward: 500, status: 'pending' },
        { id: 2, title: 'فك تشفير ملف secret.enc', desc: 'استخدم decrypt secret.enc', reward: 800, status: 'pending' },
        { id: 3, title: 'استغلال ثغرة SQL', desc: 'استخدم sqlmap http://test.com/login', reward: 1200, status: 'pending' }
    ],
    wifiNetworks: {
        'NEXUS_CORP': { status: 'secure', password: '12345678', cracked: false },
        'PUBLIC_WIFI': { status: 'open', cracked: true },
        'DARK_NET': { status: 'secure', password: 'dark2024', cracked: false }
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
    document.getElementById('cpuFill').style.width = Math.min(state.cpu, 100) + '%';
    document.getElementById('wantedValue').innerText = state.wanted;
    document.getElementById('wallpaper').style.background = state.wallpaper;
    document.getElementById('wifiStatus').innerText = state.currentWifi;
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
            showNotification('🔓 تم فتح DARK_NET', 'يمكنك الآن اختراق DARK_NET.', 'info');
        }
        saveState();
    }
}

// ===== الإشعارات =====
function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = 'notification';
    const colors = {
        success: '#2ed573',
        error: '#ff4757',
        warning: '#ffa502',
        info: '#00ffcc'
    };
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
        if (e.target.tagName === 'BUTTON') return;
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
function openWindow(id) {
    const container = document.getElementById('windows-container');
    const existing = document.getElementById(`win-${id}`);
    if (existing) { existing.style.zIndex = Date.now() % 1000 + 100; return; }

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = Date.now() % 1000 + 100;
    win.style.right = (8 + Math.random() * 4) + '%';
    win.style.top = (8 + Math.random() * 4) + '%';

    const titles = {
        terminal: 'المحطة الطرفية', files: 'مدير الملفات', browser: 'المتصفح',
        vault: 'القبو', profile: 'الملف الشخصي', phone: 'الهاتف',
        mail: 'البريد', bank: 'البنك', hq: 'غرفة العمليات', tasks: 'دفتر المهام'
    };
    const icons = {
        terminal: 'terminal', files: 'folder', browser: 'globe', vault: 'lock',
        profile: 'user-circle', phone: 'mobile-alt', mail: 'envelope',
        bank: 'university', hq: 'project-diagram', tasks: 'tasks'
    };

    let content = '';
    switch (id) {
        case 'terminal': content = getTerminalHTML(); break;
        case 'files': content = getFilesHTML(); break;
        case 'browser': content = getBrowserHTML(); break;
        case 'profile': content = getProfileHTML(); break;
        case 'vault': content = getVaultHTML(); break;
        case 'phone': content = getPhoneHTML(); break;
        case 'mail': content = getMailHTML(); break;
        case 'bank': content = getBankHTML(); break;
        case 'hq': content = getHQHTML(); break;
        case 'tasks': content = getTasksHTML(); break;
        default: content = '<p>تطبيق قيد التطوير</p>';
    }

    win.innerHTML = `
        <div class="window-header">
            <h3><i class="fas fa-${icons[id]}"></i> ${titles[id]}</h3>
            <button class="win-close" onclick="closeWindow('${id}')">✕</button>
        </div>
        <div class="window-body">${content}</div>
    `;
    container.appendChild(win);
    makeDraggable(win);

    const taskbar = document.getElementById('taskbarApps');
    const appBtn = document.createElement('span');
    appBtn.className = 'taskbar-app';
    appBtn.innerText = titles[id];
    appBtn.onclick = () => focusWindow(id);
    appBtn.id = `taskbar-${id}`;
    taskbar.appendChild(appBtn);

    if (id === 'terminal') setTimeout(() => { win.querySelector('.terminal-input')?.focus(); }, 100);
}

function closeWindow(id) {
    document.getElementById(`win-${id}`)?.remove();
    document.getElementById(`taskbar-${id}`)?.remove();
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
                state.currentWifi = arg;
                updateUI();
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

// ===== وظائف التطبيقات =====
function getFilesHTML() {
    let html = `<div style="font-size:13px;"><div style="color:#00ffcc;">📁 ${currentPath}</div>`;
    const files = fileSystem[currentPath] || {};
    Object.keys(files).forEach(f => {
        html += `<div style="padding:6px; background:rgba(0,255,204,0.05); margin:4px 0; border-radius:4px; cursor:pointer;" onclick="showNotification('📄 ${f}', '${files[f].substring(0,80)}...', 'info')">${f}</div>`;
    });
    return html + '</div>';
}

function getBrowserHTML() {
    return `
        <div style="font-size:13px;">
            <h4 style="color:#00ffcc;">🌐 المتصفح</h4>
            <div style="background:rgba(0,255,204,0.05); padding:12px; border-radius:8px; margin:8px 0;">
                <div style="font-weight:bold; color:#00ffcc;">nexus.sec</div>
                <div style="font-size:12px; color:#888;">نظام الإنترنت الآمن</div>
            </div>
            <div style="background:rgba(0,255,204,0.05); padding:12px; border-radius:8px;">
                <div style="font-weight:bold; color:#ffa502;">dark-market.onion</div>
                <div style="font-size:12px; color:#888;">السوق السوداء (متقدم)</div>
            </div>
        </div>
    `;
}

function getMailHTML() {
    let html = '<div class="mail-list">';
    state.mail.forEach((m, i) => {
        html += `
            <div class="mail-item" onclick="this.classList.toggle('open')">
                <div class="subject">${m.from}</div>
                <div class="from">${m.subject}</div>
                <div class="body">${m.body}</div>
            </div>
        `;
    });
    return html + '</div>';
}

function getProfileHTML() {
    return `
        <div style="font-size:13px;">
            <div style="background:rgba(0,255,204,0.1); padding:15px; border-radius:8px; border:1px solid #00ffcc;">
                <div><strong>المستخدم:</strong> ${state.username}</div>
                <div><strong>الاسم:</strong> ${state.displayName}</div>
                <div><strong>المستوى:</strong> مبتدئ</div>
            </div>
            <div style="background:rgba(255,165,2,0.1); padding:15px; border-radius:8px; border:1px solid #ffa502; margin-top:12px;">
                <strong>⚙️ الإحصائيات</strong>
                <div style="margin-top:8px; font-size:12px;">
                    <div>الأموال: <span style="color:#00ffcc;">${state.money} $</span></div>
                    <div>المطاردة: <span style="color:#ffa502;">${state.wanted}/5</span></div>
                    <div>الحرارة: <span style="color:${state.cpu>70?'#ff4757':'#00ffcc'};">${state.cpu}%</span></div>
                </div>
            </div>
        </div>
    `;
}

function getBankHTML() {
    return `
        <div style="font-size:13px;">
            <div style="background:linear-gradient(135deg,rgba(0,255,204,0.1),rgba(0,255,204,0.05)); padding:20px; border-radius:12px; border:1px solid #00ffcc; text-align:center;">
                <div style="font-size:11px; color:#888;">الرصيد</div>
                <div style="font-size:28px; color:#00ffcc; font-weight:bold;">${state.money} $</div>
            </div>
            <div style="background:rgba(30,45,74,0.5); padding:12px; border-radius:8px; margin-top:12px;">
                <strong style="color:#00ffcc;">📊 السجل</strong>
                <div style="font-size:12px; max-height:150px; overflow-y:auto;">
                    ${state.bankTransactions.map(t => `<div style="padding:4px; border-bottom:1px solid #2a3a5a;">${t}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function getVaultHTML() {
    return `
        <div style="font-size:13px;">
            <div style="background:rgba(255,71,87,0.1); padding:15px; border-radius:8px; border:1px solid #ff4757;">
                <strong style="color:#ff4757;">⚠️ منطقة خطيرة</strong>
                <p style="font-size:12px; color:#888;">أدوات وأسرار مظلمة</p>
            </div>
            <div style="background:rgba(30,45,74,0.5); padding:15px; border-radius:8px; margin-top:12px;">
                <strong style="color:#ffa502;">🎒 الحقيبة</strong>
                <div style="font-size:12px; margin-top:8px;">
                    ${state.inventory.length ? state.inventory.map(i => `<div>✓ ${i}</div>`).join('') : '<div style="color:#888;">فارغة</div>'}
                </div>
            </div>
        </div>
    `;
}

function getPhoneHTML() {
    return `
        <div class="phone-frame">
            <div class="phone-screen">
                <div class="phone-status"><span>NEXUS</span><span>📱 100%</span></div>
                <div class="phone-apps">
                    <div class="phone-app" onclick="showNotification('📞', 'لا توجد مكالمات', 'info')"><i class="fas fa-phone"></i><span>اتصال</span></div>
                    <div class="phone-app" onclick="showNotification('💬', '2 رسائل جديدة', 'info')"><i class="fas fa-sms"></i><span>رسائل</span></div>
                    <div class="phone-app" onclick="showNotification('🖼️', 'لا توجد صور', 'info')"><i class="fas fa-images"></i><span>معرض</span></div>
                    <div class="phone-app" onclick="showNotification('⚙️', 'الإعدادات محمية', 'info')"><i class="fas fa-cog"></i><span>إعدادات</span></div>
                </div>
                <div style="font-size:11px; color:#888; margin-top:12px;">
                    ${state.phoneMessages.map(m => `<div>📨 ${m}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function getHQHTML() {
    return `
        <div style="font-size:13px;">
            <div style="background:linear-gradient(135deg,rgba(0,255,204,0.1),transparent); padding:15px; border-radius:8px; border:1px solid #00ffcc;">
                <h3 style="color:#00ffcc;">🎯 المهام النشطة</h3>
                <div style="font-size:12px;">
                    ${state.tasks.map(t => `
                        <div style="padding:6px; background:rgba(0,255,204,0.05); margin:4px 0; border-radius:4px;">
                            ${t.status === 'completed' ? '✅' : '⏳'} ${t.title}
                            <span style="color:#888; font-size:11px;">(${t.reward}$)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="background:rgba(30,45,74,0.5); padding:12px; border-radius:8px; margin-top:12px;">
                <strong style="color:#ffa502;">📡 الاتصالات</strong>
                <div style="font-size:12px; color:#888;">
                    <div>البريد: ${state.mail.length} رسائل</div>
                    <div>الشبكة: ${state.currentWifi}</div>
                </div>
            </div>
        </div>
    `;
}

function getTasksHTML() {
    let html = '<div style="font-size:13px;">';
    state.tasks.forEach(t => {
        const cls = t.status === 'completed' ? 'task-item completed' : 'task-item';
        const statusText = t.status === 'completed' ? '✅ مكتملة' : '⏳ قيد التنفيذ';
        html += `
            <div class="${cls}">
                <div class="task-title">${t.title}</div>
                <div class="task-desc">${t.desc}</div>
                <div class="task-reward">💰 ${t.reward} دولار</div>
                <div class="task-status">${statusText}</div>
            </div>
        `;
    });
    return html + '</div>';
}

// ===== الشبكات =====
function toggleWifiMenu() {
    const menu = document.getElementById('wifiMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('startMenu').style.display = 'none';
    updateWifiMenu();
}

function updateWifiMenu() {
    for (let net in state.wifiNetworks) {
        const info = state.wifiNetworks[net];
        const statusEl = document.getElementById(`wifi-status-${net}`);
        const checkEl = document.getElementById(`wifi-check-${net}`);
        if (info.cracked || info.status === 'open') {
            statusEl.innerText = info.cracked ? '✅ مخترقة' : '🌐 مفتوحة';
            statusEl.className = 'wifi-strength cracked';
            if (checkEl) checkEl.style.display = 'inline-block';
        } else {
            statusEl.innerText = '🔒 محمية';
            statusEl.className = 'wifi-strength secure';
            if (checkEl) checkEl.style.display = 'none';
        }
    }
}

function selectWifi(network) {
    const info = state.wifiNetworks[network];
    if (!info) return;
    if (info.cracked || info.status === 'open') {
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
        openWindow('terminal');
        openWindow('hq');
        return false;
    }
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').innerText = 'بيانات غير صحيحة';
    return false;
}

// ===== حفظ و تحميل =====
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

    // محاكاة تمهيد BIOS
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

// إغلاق القوائم بالضغط خارجها
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
