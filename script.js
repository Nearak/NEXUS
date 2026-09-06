// ============================================================
//  NEXUS: الجدار المكسور - الإصدار المتكامل v3.0
//  واجهة ديناميكية + نظام ملفات + أوامر + مهام
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
        gain.gain.value = 0.04;
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.025);
    },
    playSuccess() {
        if (!this.ctx) return;
        [800, 1000, 1200].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.05;
            osc.start(this.ctx.currentTime + i * 0.05);
            osc.stop(this.ctx.currentTime + (i + 1) * 0.05);
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
    currentWifi: null,
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
    settings: {
        theme: 'dark',
        fontSize: 'medium',
        animations: true
    },
    logs: []
};

let currentPath = '/home/user';
let windowZIndex = 100;
let windows = {};
let commandHistory = [];
let historyIndex = -1;

// ---------- دوال مساعدة ----------
function updateHUD() {
    document.getElementById('cpuValue').textContent = Math.min(state.cpu, 100);
    document.getElementById('cpuFill').style.width = Math.min(state.cpu, 100) + '%';
    document.getElementById('wantedValue').textContent = state.wanted;
    document.getElementById('wifiStatus').textContent = state.currentWifi || 'غير متصل';
    document.getElementById('startUsername').textContent = state.username;
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
        triggerOverheat();
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
        // تحديث نافذة المهام إذا كانت مفتوحة
        if (windows['tasks']) {
            const win = document.getElementById('win-tasks');
            if (win) {
                const body = win.querySelector('.window-body');
                if (body) body.innerHTML = getTasksHTML();
            }
        }
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

// ---------- الإعدادات ----------
function applySettings() {
    const root = document.documentElement;
    const s = state.settings;
    
    // حجم الخط
    const fontSizes = { small: '12px', medium: '14px', large: '16px' };
    document.querySelectorAll('.window-body, .terminal-body, .terminal-output').forEach(el => {
        el.style.fontSize = fontSizes[s.fontSize] || '14px';
    });
    
    // السمات
    if (s.theme === 'light') {
        root.style.setProperty('--bg-primary', '#f0f2f5');
        root.style.setProperty('--text-primary', '#1a1a2e');
        root.style.setProperty('--bg-secondary', '#e8eaed');
        root.style.setProperty('--border-color', '#c8c8d0');
    } else {
        root.style.setProperty('--bg-primary', '#0a0e17');
        root.style.setProperty('--text-primary', '#c8d6e5');
        root.style.setProperty('--bg-secondary', '#131b2b');
        root.style.setProperty('--border-color', '#2a3a5a');
    }
}

// ---------- نظام التعطل ----------
function triggerOverheat() {
    if (state.isOverheated) return;
    state.isOverheated = true;
    const overlay = document.getElementById('bsod-overlay');
    overlay.style.display = 'flex';
    let timer = 20;
    const timerEl = document.getElementById('bsodTimer');
    const fillEl = document.getElementById('bsodProgressFill');
    const interval = setInterval(() => {
        timer--;
        timerEl.textContent = timer;
        fillEl.style.width = (timer / 20 * 100) + '%';
        if (timer <= 0) {
            clearInterval(interval);
            overlay.style.display = 'none';
            state.isOverheated = false;
            addWanted(1);
            updateHUD();
            showNotification('⚠️ تعطل النظام', 'تم إعادة التشغيل.', 'error');
        }
    }, 1000);
}

function triggerArrest() {
    if (state.isArrested) return;
    state.isArrested = true;
    const fine = Math.floor(state.money * 0.5);
    state.money = Math.max(0, state.money - fine);
    if (state.inventory.length > 0) state.inventory.pop();
    document.getElementById('arrestFine').textContent = fine;
    document.getElementById('arrest-overlay').style.display = 'flex';
    state.wanted = 0;
    updateHUD();
    showNotification('🚨 تم الاعتقال!', `تم خصم ${fine} دولار.`, 'error');
}

function closeArrest() {
    document.getElementById('arrest-overlay').style.display = 'none';
    state.isArrested = false;
    updateHUD();
}

// ---------- إدارة النوافذ ----------
function openWindow(id) {
    const container = document.getElementById('windows-container');

    if (windows[id]) {
        const win = document.getElementById(`win-${id}`);
        if (win) {
            win.style.zIndex = ++windowZIndex;
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
        tasks: 'المهام',
        settings: 'الإعدادات'
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
        tasks: 'tasks',
        settings: 'cog'
    };

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = ++windowZIndex;
    win.dataset.minimized = 'false';

    let content = '';
    switch (id) {
        case 'terminal': content = getTerminalHTML(); break;
        case 'files': content = getFilesHTML(); break;
        case 'browser': content = getBrowserHTML(); break;
        case 'mail': content = getMailHTML(); break;
        case 'phone': content = getPhoneHTML(); break;
        case 'hq': content = getHQHTML(); break;
        case 'bank': content = getBankHTML(); break;
        case 'vault': content = getVaultHTML(); break;
        case 'profile': content = getProfileHTML(); break;
        case 'tasks': content = getTasksHTML(); break;
        case 'settings': content = getSettingsHTML(); break;
        default: content = '<p>تطبيق قيد التطوير</p>';
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
    appBtn.className = 'top-bar-app';
    appBtn.id = `taskbar-${id}`;
    appBtn.textContent = titles[id];
    appBtn.onclick = () => focusWindow(id);
    taskbar.appendChild(appBtn);

    makeDraggable(win);

    if (id === 'terminal') {
        setTimeout(() => {
            const input = win.querySelector('.terminal-input');
            if (input) input.focus();
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
        win.style.top = '60px';
        win.style.left = '50%';
        win.style.transform = 'translateX(-50%)';
        win.style.width = '85%';
        win.style.height = '75%';
        win.style.borderRadius = 'var(--radius)';
    } else {
        win.dataset.maximized = 'true';
        win.style.top = '44px';
        win.style.left = '0';
        win.style.transform = 'none';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 44px)';
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
        el.style.transform = 'none';
        e.preventDefault();
    };

    const moveDrag = (e) => {
        if (!isDragging) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        let x = cx - offsetX;
        let y = cy - offsetY;
        const maxX = window.innerWidth - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight - 44;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(44, Math.min(y, maxY));
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
                <input type="text" class="terminal-input" id="terminalInput" placeholder="اكتب أمراً..." 
                    onkeydown="handleTerminalKey(event)" 
                    onkeyup="handleTerminalHistory(event)"
                    autofocus>
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

let historyTemp = '';

function handleTerminalKey(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const cmd = input.value.trim();
        if (!cmd) return;
        
        // إضافة إلى التاريخ
        if (cmd !== commandHistory[commandHistory.length - 1]) {
            commandHistory.push(cmd);
        }
        historyIndex = commandHistory.length;
        historyTemp = '';
        
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

function handleTerminalHistory(event) {
    const input = event.target;
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex] || '';
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex] || '';
        } else {
            historyIndex = commandHistory.length;
            input.value = historyTemp;
        }
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
            let scanResult = '';
            for (let net in state.networks) {
                if (!state.networks[net].discovered) {
                    state.networks[net].discovered = true;
                    found = true;
                    scanResult += `✅ تم اكتشاف: ${net}\n`;
                    if (net === 'NEXUS_CORP') updateTaskStatus(1, 'completed');
                }
            }
            result = scanResult || 'لا توجد شبكات جديدة.';
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
                state.currentWifi = netName;
                updateHUD();
                showNotification(`📡 متصل بـ ${netName}`, 'تم الاتصال تلقائياً.', 'success');
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
    let html = `<div style="font-size:13px;"><div style="color:var(--accent);margin-bottom:8px;">📁 ${currentPath}</div>`;
    const files = fileSystem[currentPath] || {};
    const keys = Object.keys(files);
    if (keys.length === 0) {
        html += '<div style="color:var(--text-secondary);font-size:12px;">المجلد فارغ</div>';
    } else {
        keys.forEach(f => {
            html += `<div class="file-item" onclick="showFile('${f}')">${f}</div>`;
        });
    }
    return html + '</div>';
}

function showFile(filename) {
    const content = fileSystem[currentPath]?.[filename];
    if (content) {
        showNotification(`📄 ${filename}`, content.substring(0, 150) + (content.length > 150 ? '...' : ''), 'info');
        if (filename === 'secret.txt' && currentPath === '/home/user') {
            updateTaskStatus(3, 'completed');
        }
    }
}

function getBrowserHTML() {
    return `
        <div style="font-size:13px;">
            <div style="display:flex; gap:8px; margin-bottom:10px;">
                <input type="text" id="browserUrl" value="nexus://home" 
                    style="flex:1; background:var(--bg-input); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); padding:6px 12px; font-size:13px; direction:ltr;">
                <button onclick="browserGo()" 
                    style="background:var(--accent); color:#000; border:none; border-radius:6px; padding:6px 18px; cursor:pointer; font-weight:bold; transition:var(--transition);">
                    Go
                </button>
            </div>
            <div id="browserContent" style="background:rgba(0,0,0,0.3); padding:14px; border-radius:8px; min-height:150px;">
                <h4 style="color:var(--accent);">🏠 الصفحة الرئيسية</h4>
                <div onclick="browserNavigate('tasks')" style="padding:10px; margin:6px 0; background:rgba(0,255,204,0.05); border-radius:6px; cursor:pointer; transition:var(--transition);">
                    📋 المهام
                </div>
                <div onclick="browserNavigate('bank')" style="padding:10px; margin:6px 0; background:rgba(0,255,204,0.05); border-radius:6px; cursor:pointer; transition:var(--transition);">
                    🏦 البنك
                </div>
                <div onclick="browserNavigate('vault')" style="padding:10px; margin:6px 0; background:rgba(0,255,204,0.05); border-radius:6px; cursor:pointer; transition:var(--transition);">
                    🔒 القبو
                </div>
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
        content.innerHTML = `<h4 style="color:var(--accent);">📋 المهام</h4>${getTasksHTML()}`;
    } else if (page === 'bank') {
        url.value = 'nexus://bank';
        content.innerHTML = `<h4 style="color:var(--accent);">🏦 البنك</h4>${getBankHTML()}`;
    } else if (page === 'vault') {
        url.value = 'nexus://vault';
        content.innerHTML = `<h4 style="color:var(--accent);">🔒 القبو</h4>${getVaultHTML()}`;
    } else {
        url.value = 'nexus://home';
        content.innerHTML = `<h4 style="color:var(--accent);">🏠 الصفحة الرئيسية</h4>
            <div onclick="browserNavigate('tasks')" style="padding:10px; margin:6px 0; background:rgba(0,255,204,0.05); border-radius:6px; cursor:pointer; transition:var(--transition);">📋 المهام</div>
            <div onclick="browserNavigate('bank')" style="padding:10px; margin:6px 0; background:rgba(0,255,204,0.05); border-radius:6px; cursor:pointer; transition:var(--transition);">🏦 البنك</div>
            <div onclick="browserNavigate('vault')" style="padding:10px; margin:6px 0; background:rgba(0,255,204,0.05); border-radius:6px; cursor:pointer; transition:var(--transition);">🔒 القبو</div>`;
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
                    <div class="phone-app" onclick="showNotification('📞', 'لا توجد مكالمات', 'info')">
                        <i class="fas fa-phone"></i><span>اتصال</span>
                    </div>
                    <div class="phone-app" onclick="showNotification('💬', 'رسائل جديدة', 'info')">
                        <i class="fas fa-sms"></i><span>رسائل</span>
                    </div>
                    <div class="phone-app" onclick="showNotification('📷', 'الكاميرا', 'info')">
                        <i class="fas fa-camera"></i><span>كاميرا</span>
                    </div>
                    <div class="phone-app" onclick="showNotification('⚙️', 'الإعدادات', 'info')">
                        <i class="fas fa-cog"></i><span>إعدادات</span>
                    </div>
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
            <div style="background:linear-gradient(135deg,rgba(0,255,204,0.08),transparent); padding:16px; border-radius:8px; border:1px solid var(--accent);">
                <h3 style="color:var(--accent);">🎯 المهام النشطة</h3>
    `;
    state.tasks.forEach(t => {
        html += `
            <div style="padding:6px 10px; background:rgba(0,255,204,0.04); margin:4px 0; border-radius:4px; font-size:12px;">
                ${t.status === 'completed' ? '✅' : '⏳'} ${t.title} (${t.reward}$)
            </div>
        `;
    });
    html += `
            </div>
            <div style="background:rgba(30,45,74,0.3); padding:14px; border-radius:8px; margin-top:12px; border:1px solid var(--border-color);">
                <strong style="color:var(--warning);">📡 الاتصالات</strong>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                    <div>📧 البريد: ${state.mail.length} رسائل</div>
                    <div>📶 الشبكة: ${state.currentWifi || 'غير متصل'}</div>
                    <div>💰 الرصيد: ${state.money}$</div>
                </div>
            </div>
        </div>
    `;
    return html;
}

function getBankHTML() {
    let html = `
        <div class="bank-balance">
            <div style="font-size:12px; color:var(--text-secondary);">الرصيد</div>
            <div class="amount">${state.money} $</div>
        </div>
        <div style="font-size:12px; max-height:150px; overflow-y:auto;">
            <strong style="color:var(--accent);">📊 السجل</strong>
    `;
    state.bankTransactions.forEach(t => {
        html += `<div class="bank-transaction">${t}</div>`;
    });
    return html + '</div></div>';
}

function getVaultHTML() {
    let html = `
        <div style="background:rgba(255,71,87,0.08); padding:14px; border-radius:8px; border:1px solid var(--danger); margin-bottom:12px;">
            <strong style="color:var(--danger);">⚠️ منطقة خطيرة</strong>
            <p style="font-size:12px; color:var(--text-secondary);">أدوات وأسرار مظلمة</p>
        </div>
        <div style="background:rgba(30,45,74,0.3); padding:14px; border-radius:8px; border:1px solid var(--border-color);">
            <strong style="color:var(--warning);">🎒 الحقيبة</strong>
            <div style="font-size:12px; margin-top:8px;">
                ${state.inventory.length ? state.inventory.map(i => `<div style="padding:4px 0; border-bottom:1px solid var(--border-color);">✓ ${i}</div>`).join('') : '<div style="color:var(--text-secondary);">فارغة</div>'}
            </div>
        </div>
    `;
    return html;
}

function getProfileHTML() {
    return `
        <div style="font-size:13px;">
            <div style="background:rgba(0,255,204,0.06); padding:16px; border-radius:8px; border:1px solid var(--accent);">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                    <i class="fas fa-user-circle" style="font-size:40px; color:var(--accent);"></i>
                    <div>
                        <div style="font-weight:bold; font-size:16px;">${state.username}</div>
                        <div style="font-size:12px; color:var(--text-secondary);">المستوى ${state.level}</div>
                    </div>
                </div>
            </div>
            <div style="background:rgba(255,165,2,0.06); padding:16px; border-radius:8px; border:1px solid var(--warning); margin-top:12px;">
                <strong style="color:var(--warning);">⚙️ الإحصائيات</strong>
                <div style="margin-top:8px; font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:4px;">
                    <div>💰 الأموال: <span style="color:var(--accent);">${state.money} $</span></div>
                    <div>🚨 المطاردة: <span style="color:${state.wanted > 3 ? 'var(--danger)' : 'var(--warning)'};">${state.wanted}/5</span></div>
                    <div>🔥 الحرارة: <span style="color:${state.cpu > 70 ? 'var(--danger)' : 'var(--accent)'};">${state.cpu}%</span></div>
                    <div>📡 الشبكة: <span style="color:var(--accent);">${state.currentWifi || 'غير متصل'}</span></div>
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

function getSettingsHTML() {
    const s = state.settings;
    return `
        <div style="font-size:13px;">
            <div class="settings-group">
                <h4>🎨 المظهر</h4>
                <div class="settings-row">
                    <span>السمة</span>
                    <select onchange="updateSetting('theme', this.value)">
                        <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>داكن</option>
                        <option value="light" ${s.theme === 'light' ? 'selected' : ''}>فاتح</option>
                    </select>
                </div>
                <div class="settings-row">
                    <span>حجم الخط</span>
                    <select onchange="updateSetting('fontSize', this.value)">
                        <option value="small" ${s.fontSize === 'small' ? 'selected' : ''}>صغير</option>
                        <option value="medium" ${s.fontSize === 'medium' ? 'selected' : ''}>متوسط</option>
                        <option value="large" ${s.fontSize === 'large' ? 'selected' : ''}>كبير</option>
                    </select>
                </div>
                <div class="settings-row">
                    <span>الرسوم المتحركة</span>
                    <select onchange="updateSetting('animations', this.value === 'true')">
                        <option value="true" ${s.animations ? 'selected' : ''}>مفعلة</option>
                        <option value="false" ${!s.animations ? 'selected' : ''}>معطلة</option>
                    </select>
                </div>
            </div>
            <div class="settings-group">
                <h4>ℹ️ حول</h4>
                <div style="font-size:12px; color:var(--text-secondary);">
                    <p>NEXUS v3.0 - بيئة الاختراق المتقدمة</p>
                    <p style="margin-top:4px;">${state.username} | المستوى ${state.level}</p>
                    <p style="margin-top:4px;">المهام المكتملة: ${state.tasks.filter(t => t.status === 'completed').length}/${state.tasks.length}</p>
                </div>
            </div>
        </div>
    `;
}

function updateSetting(key, value) {
    state.settings[key] = value;
    applySettings();
    saveState();
    showNotification('⚙️ تم التحديث', `تم تحديث ${key}`, 'success');
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
        applySettings();
        updateClock();
        setInterval(updateClock, 1000);
        showNotification('✅ مرحباً', `أهلاً ${user}`, 'success');
        setTimeout(() => {
            openWindow('terminal');
            openWindow('hq');
        }, 300);
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
