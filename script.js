// ============================================================
//  NEXUS: الجدار المكسور - الإصدار المتكامل
//  واجهة كاملة + نظام ملفات + أوامر + مهام
// ============================================================

// ---------- نظام الصوت ----------
const AudioSystem = {
    ctx: null,
    init() {
        if (!this.ctx) this.ctx = new(window.AudioContext || window.webkitAudioContext)();
    },
    playKey() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.05;
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.03);
    },
    playSuccess() {
        if (!this.ctx) return;
        [800, 1000, 1200].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.06;
            osc.start(this.ctx.currentTime + i * 0.06);
            osc.stop(this.ctx.currentTime + (i + 1) * 0.06);
        });
    },
    playError() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 300;
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
        gain.gain.value = 0.08;
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.3);
    }
};

// ---------- نظام الملفات ----------
const fileSystem = {
    '/home/user': {
        'README.md': '# NEXUS Terminal\nمرحباً بك في نظام NEXUS.',
        'clue.txt': 'القرينة: شبكة NEXUS_CORP تستخدم كلمة مرور ضعيفة.',
        'secret.txt': '🔥 المفتاح هو 12345678',
        'report.log': '[2024-01-15] تم اكتشاف محاولة اختراق.'
    },
    '/etc': {
        'hosts': '127.0.0.1 localhost\n192.168.1.1 gateway.local',
        'passwd': 'root:x:0:0:root:/root:/bin/bash'
    },
    '/var/log': {
        'syslog': 'NEXUS system initialized.'
    }
};

// ---------- الحالة ----------
const state = {
    username: 'admin',
    level: 1,
    money: 1000,
    cpu: 0,
    wanted: 0,
    inventory: [],
    currentWifi: null, // null = غير متصل
    networks: {
        'NEXUS_CORP': { discovered: false, cracked: false, password: '12345678' },
        'PUBLIC_WIFI': { discovered: false, cracked: true, password: '' },
        'DARK_NET': { discovered: false, cracked: false, password: 'dark2024' }
    },
    tasks: [
        { id: 1, title: 'اكتشاف شبكة NEXUS_CORP', desc: 'استخدم scan', reward: 200, status: 'pending' },
        { id: 2, title: 'اختراق شبكة NEXUS_CORP', desc: 'استخدم crack NEXUS_CORP', reward: 500, status: 'pending' },
        { id: 3, title: 'قراءة secret.txt', desc: 'استخدم cat secret.txt', reward: 300, status: 'pending' }
    ],
    mail: [
        { from: 'Ariel@NEXUS.sec', subject: 'مرحباً بك', body: 'مرحباً في NEXUS.\nابدأ بكتابة help.' },
        { from: 'System@NEXUS.sec', subject: 'المهمة الأولى', body: 'استخدم scan لاكتشاف الشبكات.' }
    ],
    phoneMessages: ['مرحباً، هاتفك الآمن متصل.'],
    bankTransactions: ['+1000 دولار (راتب ابتدائي)'],
    logs: []
};

let currentPath = '/home/user';
let windowZIndex = 100;
let windows = {};

// ---------- دوال مساعدة ----------
function updateHUD() {
    document.getElementById('cpuValue').textContent = Math.min(state.cpu, 100);
    document.getElementById('cpuFill').style.width = Math.min(state.cpu, 100) + '%';
    document.getElementById('wantedValue').textContent = state.wanted;
    document.getElementById('wifiStatus').textContent = state.currentWifi || 'غير متصل';
    updateWifiMenu();
}

function addLog(msg) {
    state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function addCPU(amount) {
    state.cpu = Math.min(state.cpu + amount, 100);
    updateHUD();
    if (state.cpu >= 100) {
        showNotification('⚠️ ارتفاع الحرارة!', 'تعطل النظام مؤقتاً.', 'error');
        state.cpu = 20;
        updateHUD();
    }
}

function addWanted(amount) {
    state.wanted = Math.min(state.wanted + amount, 5);
    updateHUD();
    if (state.wanted >= 5) {
        showNotification('🚨 تم القبض عليك!', 'تم خصم 50% من أموالك.', 'error');
        state.money = Math.floor(state.money * 0.5);
        state.wanted = 0;
        updateHUD();
    }
}

function addMoney(amount) {
    state.money += amount;
    state.bankTransactions.push(`${amount > 0 ? '+' : ''}${amount} دولار`);
    updateHUD();
}

function updateTaskStatus(taskId, status) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.status !== 'completed') {
        task.status = status;
        if (status === 'completed') {
            addMoney(task.reward);
            showNotification(`✅ ${task.title}`, `+${task.reward} دولار`, 'success');
            AudioSystem.playSuccess();
        }
        saveState();
    }
}

function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notification-container');
    const el = document.createElement('div');
    el.className = 'notification';
    const colors = { success: '#2ed573', error: '#ff4757', warning: '#ffa502', info: '#00ffcc' };
    el.style.borderRightColor = colors[type] || '#00ffcc';
    el.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// ---------- إدارة النوافذ ----------
function openWindow(id) {
    const container = document.getElementById('windows-container');

    // إذا كانت مفتوحة بالفعل
    if (windows[id]) {
        const win = document.getElementById(`win-${id}`);
        if (win) {
            win.style.zIndex = ++windowZIndex;
            // إذا كانت مصغرة، أعد إظهارها
            if (win.dataset.minimized === 'true') {
                win.dataset.minimized = 'false';
                win.style.display = 'flex';
                document.querySelector(`#taskbar-${id}`)?.classList.remove('minimized');
            }
            win.focus();
        }
        return;
    }

    const titles = {
        terminal: 'المحطة الطرفية',
        files: 'مدير الملفات',
        browser: 'المتصفح',
        mail: 'البريد',
        phone: 'الهاتف',
        hq: 'المقر',
        bank: 'البنك',
        vault: 'القبو',
        profile: 'الملف الشخصي',
        tasks: 'المهام'
    };
    const icons = {
        terminal: 'terminal',
        files: 'folder',
        browser: 'globe',
        mail: 'envelope',
        phone: 'mobile-alt',
        hq: 'headquarters',
        bank: 'university',
        vault: 'lock',
        profile: 'user-circle',
        tasks: 'tasks'
    };

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = ++windowZIndex;
    win.dataset.minimized = 'false';

    // محتوى النافذة
    let content = '';
    switch (id) {
        case 'terminal':
            content = getTerminalHTML();
            break;
        case 'files':
            content = getFilesHTML();
            break;
        case 'browser':
            content = getBrowserHTML();
            break;
        case 'mail':
            content = getMailHTML();
            break;
        case 'phone':
            content = getPhoneHTML();
            break;
        case 'hq':
            content = getHQHTML();
            break;
        case 'bank':
            content = getBankHTML();
            break;
        case 'vault':
            content = getVaultHTML();
            break;
        case 'profile':
            content = getProfileHTML();
            break;
        case 'tasks':
            content = getTasksHTML();
            break;
        default:
            content = '<p>تطبيق قيد التطوير</p>';
    }

    win.innerHTML = `
        <div class="window-header">
            <h3><i class="fas fa-${icons[id]}"></i> ${titles[id]}</h3>
            <div class="window-controls">
                <button class="win-min" onclick="minimizeWindow('${id}')" title="تصغير">−</button>
                <button class="win-max" onclick="maximizeWindow('${id}')" title="تكبير">□</button>
                <button class="win-close" onclick="closeWindow('${id}')" title="إغلاق">✕</button>
            </div>
        </div>
        <div class="window-body">${content}</div>
    `;

    container.appendChild(win);
    windows[id] = true;

    // إضافة إلى شريط المهام
    const taskbar = document.getElementById('taskbarApps');
    const appBtn = document.createElement('span');
    appBtn.className = 'taskbar-app';
    appBtn.id = `taskbar-${id}`;
    appBtn.textContent = titles[id];
    appBtn.onclick = () => focusWindow(id);
    taskbar.appendChild(appBtn);

    // جعل النافذة قابلة للسحب
    makeDraggable(win);

    // تهيئة الطرفية
    if (id === 'terminal') {
        setTimeout(() => {
            const input = win.querySelector('.terminal-input');
            if (input) input.focus();
            // عرض الترحيب
            const output = win.querySelector('.terminal-output');
            if (output && !output.innerHTML) {
                output.innerHTML = '█ NEXUS Terminal v3.0\nاكتب help لبدء رحلتك.\n';
            }
        }, 100);
    }

    saveState();
}

function closeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) win.remove();
    delete windows[id];
    const task = document.getElementById(`taskbar-${id}`);
    if (task) task.remove();
}

function minimizeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    if (win.dataset.minimized === 'true') {
        win.dataset.minimized = 'false';
        win.style.display = 'flex';
        document.querySelector(`#taskbar-${id}`)?.classList.remove('minimized');
    } else {
        win.dataset.minimized = 'true';
        win.style.display = 'none';
        document.querySelector(`#taskbar-${id}`)?.classList.add('minimized');
    }
}

function maximizeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    if (win.dataset.maximized === 'true') {
        win.dataset.maximized = 'false';
        win.style.top = '8%';
        win.style.right = '8%';
        win.style.width = '84%';
        win.style.height = '80%';
    } else {
        win.dataset.maximized = 'true';
        win.style.top = '0';
        win.style.right = '0';
        win.style.width = '100%';
        win.style.height = '100%';
        win.style.borderRadius = '0';
    }
}

function focusWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    win.style.zIndex = ++windowZIndex;
    if (win.dataset.minimized === 'true') {
        minimizeWindow(id);
    }
}

// ---------- السحب ----------
function makeDraggable(el) {
    let isDragging = false,
        offsetX = 0,
        offsetY = 0;
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

// ---------- المحطة ----------
function getTerminalHTML() {
    return `
        <div class="terminal-body">
            <div class="terminal-output" id="terminalOutput">█ NEXUS Terminal v3.0\nاكتب help لبدء رحلتك.\n</div>
            <div class="terminal-input-line">
                <span class="prompt">$</span>
                <input type="text" class="terminal-input" id="terminalInput" placeholder="اكتب أمراً..." onkeydown="handleTerminalKey(event)">
            </div>
            <div class="quick-commands">
                <button onclick="quickCmd('help')">help</button>
                <button onclick="quickCmd('ls')">ls</button>
                <button onclick="quickCmd('scan')">scan</button>
                <button onclick="quickCmd('crack NEXUS_CORP')">crack</button>
                <button onclick="quickCmd('tasks')">tasks</button>
                <button onclick="quickCmd('clear')">clear</button>
            </div>
        </div>
    `;
}

function handleTerminalKey(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const cmd = input.value.trim();
        if (!cmd) return;
        const output = document.getElementById('terminalOutput');
        output.innerHTML += `<div class="terminal-line"><span class="prompt">$</span> <span class="cmd">${cmd}</span></div>`;
        const result = executeCommand(cmd);
        output.innerHTML += `<div class="terminal-line"><span class="output">${result}</span></div>`;
        input.value = '';
        output.parentElement.scrollTop = output.parentElement.scrollHeight;
    } else {
        AudioSystem.playKey();
    }
}

function quickCmd(cmd) {
    const input = document.getElementById('terminalInput');
    if (input) {
        input.value = cmd;
        const ev = new KeyboardEvent('keydown', { key: 'Enter' });
        input.dispatchEvent(ev);
    }
}

// ---------- تنفيذ الأوامر ----------
function executeCommand(input) {
    const parts = input.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let result = '';

    switch (cmd) {
        case 'help':
            result = `الأوامر المتاحة:\nhelp, ls, cd [path], cat [file], clear, whoami\nscan, crack [network], tasks, status, money`;
            break;

        case 'ls':
            const files = fileSystem[currentPath] || {};
            result = Object.keys(files).join('  ') || 'المجلد فارغ';
            break;

        case 'cd':
            if (!args[0]) { result = 'استخدام: cd [path]'; break; }
            const target = args[0];
            if (target === '..') {
                const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                if (fileSystem[newPath]) { currentPath = newPath;
                    result = `→ ${currentPath}`; } else result = 'مسار غير موجود';
            } else {
                const newPath = currentPath === '/' ? '/' + target : currentPath + '/' + target;
                if (fileSystem[newPath]) { currentPath = newPath;
                    result = `→ ${currentPath}`; } else result = 'مجلد غير موجود';
            }
            break;

        case 'cat':
            if (!args[0]) { result = 'استخدام: cat [file]'; break; }
            const content = fileSystem[currentPath]?.[args[0]];
            if (content) {
                result = content;
                if (args[0] === 'secret.txt' && currentPath === '/home/user') {
                    updateTaskStatus(3, 'completed');
                }
            } else result = `الملف '${args[0]}' غير موجود`;
            break;

        case 'clear':
            const output = document.getElementById('terminalOutput');
            if (output) output.innerHTML = '';
            return '';

        case 'whoami':
            result = state.username;
            break;

        case 'scan':
            addCPU(15);
            let found = false;
            for (let net in state.networks) {
                if (!state.networks[net].discovered) {
                    state.networks[net].discovered = true;
                    found = true;
                    result += `✅ تم اكتشاف: ${net}\n`;
                    if (net === 'NEXUS_CORP') updateTaskStatus(1, 'completed');
                }
            }
            if (!found) result = 'لا توجد شبكات جديدة.';
            updateWifiMenu();
            break;

        case 'crack':
            if (!args[0]) { result = 'استخدام: crack [network]'; break; }
            const netName = args[0];
            const net = state.networks[netName];
            if (!net) { result = `الشبكة '${netName}' غير معروفة.`; break; }
            if (!net.discovered) { result = `الشبكة '${netName}' غير مكتشفة. استخدم scan.`; break; }
            if (net.cracked) { result = `✅ ${netName} مخترقة بالفعل.`; break; }
            addCPU(20);
            const dict = ['12345678', 'password', 'admin', '00000000', 'letmein'];
            const success = dict.some(p => p === net.password);
            if (success) {
                net.cracked = true;
                result = `✅ اختراق ناجح! المفتاح: ${net.password}`;
                AudioSystem.playSuccess();
                if (netName === 'NEXUS_CORP') updateTaskStatus(2, 'completed');
                // الاتصال التلقائي
                state.currentWifi = netName;
                updateHUD();
                showNotification(`📡 متصل بـ ${netName}`, 'تم الاتصال تلقائياً بعد الاختراق.', 'success');
            } else {
                result = `❌ فشل اختراق ${netName}. حاول مجدداً.`;
                addWanted(1);
                AudioSystem.playError();
            }
            updateWifiMenu();
            break;

        case 'tasks':
            let taskList = '📋 قائمة المهام:\n';
            state.tasks.forEach(t => {
                taskList += `  ${t.status === 'completed' ? '✅' : '⏳'} ${t.title} (${t.reward}$)\n`;
            });
            result = taskList;
            break;

        case 'status':
            result = `👤 ${state.username}\n💰 ${state.money}$\n🔥 ${state.cpu}%\n🚨 ${state.wanted}/5\n📁 ${currentPath}\n📡 ${state.currentWifi || 'غير متصل'}`;
            break;

        case 'money':
            if (args[0] === 'add') {
                const amt = parseInt(args[1]) || 100;
                addMoney(amt);
                result = `+${amt} دولار`;
            } else result = `الرصيد: ${state.money}$`;
            break;

        default:
            result = `❌ أمر غير معروف: ${cmd}. اكتب help.`;
            addWanted(0.5);
            AudioSystem.playError();
            break;
    }

    saveState();
    return result;
}

// ---------- تطبيقات ----------
function getFilesHTML() {
    let html = `<div style="font-size:13px;"><div style="color:#00ffcc;">📁 ${currentPath}</div>`;
    const files = fileSystem[currentPath] || {};
    Object.keys(files).forEach(f => {
        html += `<div class="file-item" onclick="showFile('${f}')">${f}</div>`;
    });
    return html + '</div>';
}

function showFile(filename) {
    const content = fileSystem[currentPath]?.[filename];
    if (content) {
        showNotification(`📄 ${filename}`, content, 'info');
        if (filename === 'secret.txt' && currentPath === '/home/user') {
            updateTaskStatus(3, 'completed');
        }
    }
}

function getBrowserHTML() {
    return `
        <div style="font-size:13px;">
            <div style="display:flex; gap:8px; margin-bottom:10px;">
                <input type="text" id="browserUrl" value="nexus://home" style="flex:1; background:#1a1f2f; border:1px solid #2a3a5a; border-radius:4px; color:#fff; padding:6px 10px; font-size:13px; direction:ltr;">
                <button onclick="browserGo()" style="background:#00ffcc; color:#000; border:none; border-radius:4px; padding:6px 16px; cursor:pointer; font-weight:bold;">Go</button>
            </div>
            <div id="browserContent" style="background:rgba(0,0,0,0.3); padding:12px; border-radius:6px; min-height:150px;">
                <h4 style="color:#00ffcc;">🏠 الصفحة الرئيسية</h4>
                <div onclick="browserNavigate('tasks')" style="padding:8px; margin:4px 0; background:rgba(0,255,204,0.05); border-radius:4px; cursor:pointer;">📋 المهام</div>
                <div onclick="browserNavigate('bank')" style="padding:8px; margin:4px 0; background:rgba(0,255,204,0.05); border-radius:4px; cursor:pointer;">🏦 البنك</div>
                <div onclick="browserNavigate('vault')" style="padding:8px; margin:4px 0; background:rgba(0,255,204,0.05); border-radius:4px; cursor:pointer;">🔒 القبو</div>
            </div>
        </div>
    `;
}

function browserNavigate(page) {
    const content = document.getElementById('browserContent');
    const url = document.getElementById('browserUrl');
    if (!content) return;
    if (page === 'tasks') {
        url.value = 'nexus://tasks';
        content.innerHTML = `<h4 style="color:#00ffcc;">📋 المهام</h4>${getTasksHTML()}`;
    } else if (page === 'bank') {
        url.value = 'nexus://bank';
        content.innerHTML = `<h4 style="color:#00ffcc;">🏦 البنك</h4>${getBankHTML()}`;
    } else if (page === 'vault') {
        url.value = 'nexus://vault';
        content.innerHTML = `<h4 style="color:#00ffcc;">🔒 القبو</h4>${getVaultHTML()}`;
    } else {
        url.value = 'nexus://home';
        content.innerHTML = `<h4 style="color:#00ffcc;">🏠 الصفحة الرئيسية</h4>
            <div onclick="browserNavigate('tasks')" style="padding:8px; margin:4px 0; background:rgba(0,255,204,0.05); border-radius:4px; cursor:pointer;">📋 المهام</div>
            <div onclick="browserNavigate('bank')" style="padding:8px; margin:4px 0; background:rgba(0,255,204,0.05); border-radius:4px; cursor:pointer;">🏦 البنك</div>
            <div onclick="browserNavigate('vault')" style="padding:8px; margin:4px 0; background:rgba(0,255,204,0.05); border-radius:4px; cursor:pointer;">🔒 القبو</div>`;
    }
}

function browserGo() {
    const url = document.getElementById('browserUrl');
    if (!url) return;
    const val = url.value;
    if (val.includes('tasks')) browserNavigate('tasks');
    else if (val.includes('bank')) browserNavigate('bank');
    else if (val.includes('vault')) browserNavigate('vault');
    else browserNavigate('home');
}

function getMailHTML() {
    let html = '<div style="font-size:13px;">';
    state.mail.forEach((m, i) => {
        html += `
            <div class="mail-item" onclick="this.classList.toggle('open')">
                <div class="subject">${m.subject}</div>
                <div class="from">${m.from}</div>
                <div class="body">${m.body}</div>
            </div>
        `;
    });
    return html + '</div>';
}

function getPhoneHTML() {
    return `
        <div class="phone-frame">
            <div class="phone-screen">
                <div class="phone-status"><span>NEXUS</span><span>📱 100%</span></div>
                <div class="phone-apps">
                    <div class="phone-app" onclick="showNotification('📞', 'لا توجد مكالمات', 'info')"><i class="fas fa-phone"></i><span>اتصال</span></div>
                    <div class="phone-app" onclick="showNotification('💬', 'رسائل جديدة', 'info')"><i class="fas fa-sms"></i><span>رسائل</span></div>
                    <div class="phone-app" onclick="showNotification('📷', 'الكاميرا', 'info')"><i class="fas fa-camera"></i><span>كاميرا</span></div>
                    <div class="phone-app" onclick="showNotification('⚙️', 'الإعدادات', 'info')"><i class="fas fa-cog"></i><span>إعدادات</span></div>
                </div>
                <div class="phone-messages">
                    ${state.phoneMessages.map(m => `<div>📨 ${m}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function getHQHTML() {
    let html = `
        <div style="font-size:13px;">
            <div style="background:linear-gradient(135deg,rgba(0,255,204,0.1),transparent); padding:15px; border-radius:8px; border:1px solid #00ffcc;">
                <h3 style="color:#00ffcc;">🎯 المهام النشطة</h3>
    `;
    state.tasks.forEach(t => {
        html += `
            <div style="padding:6px; background:rgba(0,255,204,0.05); margin:4px 0; border-radius:4px;">
                ${t.status === 'completed' ? '✅' : '⏳'} ${t.title} (${t.reward}$)
            </div>
        `;
    });
    html += `
            </div>
            <div style="background:rgba(30,45,74,0.5); padding:12px; border-radius:8px; margin-top:12px;">
                <strong style="color:#ffa502;">📡 الاتصالات</strong>
                <div style="font-size:12px; color:#7a8fa0;">
                    <div>البريد: ${state.mail.length} رسائل</div>
                    <div>الشبكة: ${state.currentWifi || 'غير متصل'}</div>
                </div>
            </div>
        </div>
    `;
    return html;
}

function getBankHTML() {
    let html = `
        <div class="bank-balance">
            <div style="font-size:12px; color:#7a8fa0;">الرصيد</div>
            <div class="amount">${state.money} $</div>
        </div>
        <div style="font-size:12px; max-height:150px; overflow-y:auto;">
            <strong style="color:#00ffcc;">📊 السجل</strong>
    `;
    state.bankTransactions.forEach(t => {
        html += `<div class="bank-transaction">${t}</div>`;
    });
    return html + '</div></div>';
}

function getVaultHTML() {
    let html = `
        <div style="background:rgba(255,71,87,0.1); padding:15px; border-radius:8px; border:1px solid #ff4757; margin-bottom:12px;">
            <strong style="color:#ff4757;">⚠️ منطقة خطيرة</strong>
            <p style="font-size:12px; color:#7a8fa0;">أدوات وأسرار مظلمة</p>
        </div>
        <div style="background:rgba(30,45,74,0.5); padding:15px; border-radius:8px;">
            <strong style="color:#ffa502;">🎒 الحقيبة</strong>
            <div style="font-size:12px; margin-top:8px;">
                ${state.inventory.length ? state.inventory.map(i => `<div>✓ ${i}</div>`).join('') : '<div style="color:#7a8fa0;">فارغة</div>'}
            </div>
        </div>
    `;
    return html;
}

function getProfileHTML() {
    return `
        <div style="font-size:13px;">
            <div style="background:rgba(0,255,204,0.1); padding:15px; border-radius:8px; border:1px solid #00ffcc;">
                <div><strong>المستخدم:</strong> ${state.username}</div>
                <div><strong>المستوى:</strong> ${state.level}</div>
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

function getTasksHTML() {
    let html = '<div style="font-size:13px;">';
    state.tasks.forEach(t => {
        const cls = t.status === 'completed' ? 'task-item completed' : 'task-item';
        const statusText = t.status === 'completed' ? '✅ مكتملة' : '⏳ قيد التنفيذ';
        html += `
            <div class="${cls}">
                <div class="title">${t.title}</div>
                <div class="desc">${t.desc}</div>
                <div class="reward">💰 ${t.reward} دولار</div>
                <div class="status">${statusText}</div>
            </div>
        `;
    });
    return html + '</div>';
}

// ---------- الشبكات ----------
function toggleWifiMenu() {
    const menu = document.getElementById('wifiMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('startMenu').style.display = 'none';
    updateWifiMenu();
}

function updateWifiMenu() {
    for (let net in state.networks) {
        const info = state.networks[net];
        const el = document.getElementById(`ws-${net}`);
        if (!el) continue;
        if (info.cracked || info.status === 'open') {
            el.textContent = info.cracked ? '✅ مخترقة' : '🌐 مفتوحة';
            el.className = 'wifi-strength cracked';
        } else {
            el.textContent = '🔒 محمية';
            el.className = 'wifi-strength secure';
        }
    }
}

function connectWifi(network) {
    const info = state.networks[network];
    if (!info) return;
    if (state.currentWifi === network) {
        showNotification('📡 متصل', `أنت متصل بالفعل بـ ${network}`, 'info');
        document.getElementById('wifiMenu').style.display = 'none';
        return;
    }
    if (info.cracked || info.status === 'open') {
        state.currentWifi = network;
        updateHUD();
        AudioSystem.playSuccess();
        showNotification('📡 متصل', `تم الاتصال بـ ${network}`, 'success');
        document.getElementById('wifiMenu').style.display = 'none';
        saveState();
    } else {
        AudioSystem.playError();
        showNotification('🔒 محمية', `شبكة ${network} غير مخترقة. استخدم crack ${network}`, 'error');
    }
}

function forgetWifi() {
    if (!state.currentWifi) {
        showNotification('⚠️ تنبيه', 'أنت غير متصل بأي شبكة.', 'warning');
        return;
    }
    state.currentWifi = null;
    updateHUD();
    showNotification('🗑️ تم نسيان الشبكة', 'تم قطع الاتصال.', 'info');
    document.getElementById('wifiMenu').style.display = 'none';
    saveState();
}

// ---------- قوائم ----------
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('wifiMenu').style.display = 'none';
}

function updateClock() {
    document.getElementById('clockDisplay').textContent = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function resetGame() {
    if (confirm('هل تريد إعادة التشغيل؟')) {
        localStorage.removeItem('nexusState');
        location.reload();
    }
}

// ---------- تسجيل الدخول ----------
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('loginUser').value.trim() || 'admin';
    const pass = document.getElementById('loginPass').value.trim() || '1234';
    if (user && pass) {
        state.username = user;
        AudioSystem.playSuccess();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        loadState();
        updateHUD();
        updateClock();
        setInterval(updateClock, 1000);
        showNotification('✅ مرحباً', `أهلاً ${user}`, 'success');
        openWindow('terminal');
        openWindow('hq');
        return false;
    }
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').textContent = 'بيانات غير صحيحة';
    return false;
}

// ---------- حفظ و تحميل ----------
function saveState() {
    try { localStorage.setItem('nexusState', JSON.stringify(state)); } catch (e) {}
}

function loadState() {
    try {
        const saved = localStorage.getItem('nexusState');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        }
    } catch (e) {}
}

// ---------- بدء اللعبة ----------
function startGame() {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('loginUser').value = state.username;
    document.getElementById('loginPass').value = '1234';
}

// ---------- تمهيد BIOS ----------
window.addEventListener('DOMContentLoaded', () => {
    AudioSystem.init();
    loadState();
    let progress = 0;
    const bar = document.getElementById('bootBar');
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            bar.style.width = '100%';
        }
        bar.style.width = Math.min(progress, 100) + '%';
    }, 200);
    document.getElementById('bootBtn').style.display = 'inline-block';
});

// إغلاق القوائم
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
