// ========== نظام الصوت (Web Audio API) ==========
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.soundsEnabled = true;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // إنشاء صوت نقرة لوحة المفاتيح
    playKeyPress() {
        if (!this.soundsEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1 * this.masterVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    }

    // صوت تنبيه نجاح
    playSuccess() {
        if (!this.soundsEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const notes = [800, 1000, 1200];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15 * this.masterVolume, ctx.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i + 1) * 0.05);
            osc.start(ctx.currentTime + i * 0.05);
            osc.stop(ctx.currentTime + (i + 1) * 0.05);
        });
    }

    // صوت خطأ / تنبيه
    playError() {
        if (!this.soundsEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2 * this.masterVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }

    // صوت إشعار
    playNotification() {
        if (!this.soundsEnabled || !this.audioContext) return;
        this.playSuccess();
    }
}

const audioSystem = new AudioSystem();

// ========== الحالة العامة المحسّنة ==========
let state = {
    // المعلومات الشخصية
    cpu: 0,
    wanted: 0,
    money: 1500,
    inventory: [],
    displayName: 'محلل NEXUS',
    username: 'admin',
    password: '1234',
    wallpaper: 'radial-gradient(circle at 20% 30%, #1a2a3a, #0a0e17)',
    accentColor: '#00ffcc',
    
    // نظام البريد المحسّن
    mail: [
        {
            from: 'Ariel@NEXUS.sec',
            subject: '🔐 مرحباً بك في NEXUS',
            body: 'مرحباً بك في نظام NEXUS. أنت تم قبولك كمحلل امني جديد.\n\nاسمك في النظام: محلل NEXUS\nمستواك الأمني: 1 (مبتدئ)\n\nيجب عليك إكمال مهمة التدريب الأساسية أولاً.\nاكتب "help" في المحطة للبدء.\n\n-- Ariel, مدير العمليات'
        },
        {
            from: 'System@NEXUS.sec',
            subject: '📋 المهمة الأولى: الاتصال بالشبكة',
            body: 'تقدم احترافي يتطلب اتصالاً آمناً بشبكة NEXUS الخاصة.\n\nالمهمة:\n1. استخدم أمر "nmap" لمسح الشبكة\n2. ابحث عن الشبكة المحلية\n3. تواصل مع المقر HQ\n\nالمكافأة: 500 دولار + خبرة\n\n-- نظام العمليات الآلي'
        },
        {
            from: 'Unknown@darknet.sec',
            subject: '💬 رسالة غامضة',
            body: 'مرحباً محلل جديد...\nسمعت عنك. قد تكون مفيداً.\nقريباً سأجد لك عرضاً خاصاً.\n\n-- شخص غير معروف',
            hidden: true
        }
    ],
    bankTransactions: ['+1500 دولار (راتب ابتدائي)'],
    phoneMessages: [
        'مرحباً، هاتفك الآمن متصل.',
        'لديك بريد جديد من Ariel',
    ],
    phoneContacts: ['Ariel', 'System', 'Unknown'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    mission1Done: false,
    mission2Done: false,
    chosenPath: null, // 'guardian', 'pirate', 'spy'
    currentWifi: 'غير متصل',
    availableWifi: ['NEXUS_CORP', 'PUBLIC_WIFI', 'DARK_NET']
};

// نظام الملفات الوهمي
const fileSystem = {
    '/home/user': {
        'clue.txt': 'القرينة الأولى: الشبكة المحلية تحتوي على عنوان IP 192.168.1.100\nكلمة المرور المشفرة: NEXUS_CORP_2024',
        'secret.enc': '[ملف مشفر]\nData: Bitcoin_Wallet_256b4f8a9c...\nAmount: 50 BTC (قيمة: $2,000,000)',
        'report.pcap': '[حزمة بيانات مشفرة]\nSource IP: 192.168.1.45\nDestination: 8.8.8.8 (Google DNS)\nProtocol: HTTPS\nStatus: Encrypted',
        'readme.txt': 'مرحباً في NEXUS Terminal.\nهذا هو ملف البيانات الشخصية.\nاستخدم الأوامر المتاحة للتنقل والاستكشاف.'
    },
    '/etc': {
        'hosts': '127.0.0.1 localhost\n192.168.1.1 gateway.local\n192.168.1.100 nexus-server.local'
    },
    '/var/log': {
        'syslog': '[2024-01-15 10:00:00] NEXUS System initialized\n[2024-01-15 10:00:05] Security protocols loaded\n[2024-01-15 10:00:10] Network interfaces configured\n[2024-01-15 10:00:15] Ready for user login'
    }
};

let currentPath = '/home/user';
let selectedFile = null;

// ========== دوال مساعدة ==========
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

// ========== الإشعارات المحسّنة ==========
function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = 'notification';
    
    const colorMap = {
        'success': 'border-right-color: #2ed573;',
        'error': 'border-right-color: #ff4757;',
        'warning': 'border-right-color: #ffa502;',
        'info': 'border-right-color: #00ffcc;'
    };
    
    notif.style.borderRightColor = colorMap[type] ? colorMap[type].split(':')[1].trim().replace(';', '') : '#00ffcc';
    notif.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(notif);
    
    audioSystem.playNotification();
    
    setTimeout(() => {
        if (notif.parentNode) notif.remove();
    }, 5000);
}

// ========== نظام التعطل والاعتقال ==========
function triggerOverheat() {
    if (state.isOverheated) return;
    state.isOverheated = true;
    document.getElementById('bsod-overlay').style.display = 'flex';
    audioSystem.playError();
    let timer = 20;
    const timerEl = document.getElementById('bsodTimer');
    const progressEl = document.getElementById('bsodProgressFill');
    
    const interval = setInterval(() => {
        timer--;
        if (timerEl) timerEl.innerText = timer;
        if (progressEl) progressEl.style.width = (timer / 20 * 100) + '%';
        
        if (timer <= 0) {
            clearInterval(interval);
            document.getElementById('bsod-overlay').style.display = 'none';
            state.cpu = 20;
            state.isOverheated = false;
            addWanted(1);
            addLog('⚠️ تعطل النظام بسبب الحرارة!');
            updateUI();
            showNotification('⚠️ تعطل النظام', 'تم إعادة التشغيل ورفع مستوى المطاردة.', 'error');
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
    showNotification('🚨 تم الاعتقال!', `تم خصم ${fine} دولار ومصادرة أداة واحدة.`, 'error');
}

function closeArrest() {
    document.getElementById('arrest-overlay').style.display = 'none';
    state.isArrested = false;
    addLog('✅ تم الإفراج والعودة إلى المقر.');
    updateUI();
}

// ========== السحب (Drag and Drop) ==========
function makeDraggable(el) {
    let isDragging = false, offsetX = 0, offsetY = 0;
    const header = el.querySelector('.window-header');
    if (!header) return;
    
    const startDrag = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const rect = el.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        el.style.cursor = 'grabbing';
        el.style.transition = 'none';
        e.preventDefault();
    };
    
    const moveDrag = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let x = clientX - offsetX;
        let y = clientY - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight - 50));
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    };
    
    const endDrag = () => {
        isDragging = false;
        el.style.cursor = 'default';
    };
    
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    header.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', moveDrag, { passive: true });
    document.addEventListener('touchend', endDrag, { passive: true });
}

// ========== إدارة النوافذ ==========
function openWindow(id) {
    const container = document.getElementById('windows-container');
    const existing = document.getElementById(`win-${id}`);
    if (existing) {
        existing.style.zIndex = Date.now() % 1000 + 100;
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
        browser: 'المتصفح الشبكي',
        vault: 'القبو السري',
        profile: 'الملف الشخصي',
        phone: 'الهاتف الآمن',
        mail: 'البريد الآمن',
        bank: 'النظام المصرفي',
        hq: 'غرفة العمليات'
    };
    
    const icons = {
        terminal: 'terminal',
        files: 'folder',
        browser: 'globe',
        vault: 'lock',
        profile: 'user-circle',
        phone: 'mobile-alt',
        mail: 'envelope',
        bank: 'university',
        hq: 'project-diagram'
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
    appBtn.onclick = () => {
        existing ? closeWindow(id) : openWindow(id);
    };
    appBtn.id = `taskbar-${id}`;
    taskbar.appendChild(appBtn);

    if (id === 'terminal') {
        setTimeout(() => {
            const input = win.querySelector('.terminal-input');
            if (input) input.focus();
        }, 100);
    }
}

function closeWindow(id) {
    document.getElementById(`win-${id}`)?.remove();
    document.getElementById(`taskbar-${id}`)?.remove();
}

// ========== المحطة الطرفية المحسّنة ==========
function getTerminalHTML() {
    return `
        <div class="terminal-body">
            <div class="terminal-output" id="terminalOutput"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">$</span>
                <input type="text" class="terminal-input" id="terminalInput" placeholder="اكتب 'help' للمساعدة" onkeyup="handleTerminalInput(event)">
            </div>
            <div class="quick-commands">
                <button onclick="quickCommand('help')">help</button>
                <button onclick="quickCommand('ls')">ls</button>
                <button onclick="quickCommand('nmap')">nmap</button>
                <button onclick="quickCommand('clear')">clear</button>
            </div>
        </div>
    `;
}

function handleTerminalInput(event) {
    if (event.key !== 'Enter') {
        audioSystem.playKeyPress();
        return;
    }
    
    const input = event.target.value.trim();
    if (!input) return;
    
    const output = document.getElementById('terminalOutput');
    output.innerHTML += `<div><span class="terminal-prompt">$</span> ${input}</div>`;
    
    const result = executeCommand(input);
    output.innerHTML += `<div>${result}</div>`;
    
    event.target.value = '';
    output.parentElement.scrollTop = output.parentElement.scrollHeight;
}

function quickCommand(cmd) {
    const input = document.getElementById('terminalInput');
    if (input) {
        input.value = cmd;
        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        input.dispatchEvent(event);
    }
}

function executeCommand(cmd) {
    addLog(`تنفيذ: ${cmd}`);
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    
    switch (command) {
        case 'help':
            return `أوامر NEXUS المتاحة:
help - عرض هذه الرسالة
ls - عرض الملفات
cd [path] - الانتقال للمجلد
cat [file] - عرض محتوى الملف
nmap - مسح الشبكة (CPU +25%)
ping [ip] - اختبار الاتصال
whoami - عرض اسم المستخدم
ifconfig - معلومات الشبكة
clear - مسح الشاشة`;
        
        case 'ls':
            const files = fileSystem[currentPath];
            return files ? Object.keys(files).join('\n') : 'المجلد فارغ';
        
        case 'cd':
            if (parts[1] && fileSystem[parts[1]]) {
                currentPath = parts[1];
                return `تم الانتقال إلى ${currentPath}`;
            }
            return 'مجلد غير موجود';
        
        case 'cat':
            const file = fileSystem[currentPath]?.[parts[1]];
            if (file) {
                audioSystem.playSuccess();
                return file;
            }
            return `خطأ: الملف '${parts[1]}' غير موجود`;
        
        case 'nmap':
            addCPU(25);
            audioSystem.playSuccess();
            if (!state.mission1Done) {
                state.mission1Done = true;
                addMoney(500);
                showNotification('✅ مهمة مكتملة!', 'مسح الشبكة نجح. +500 دولار', 'success');
            }
            return `Nmap scan report:
192.168.1.1 (gateway) - UP
192.168.1.100 (nexus-server) - UP
Connected to NEXUS_CORP`;
        
        case 'whoami':
            return state.username;
        
        case 'ifconfig':
            return `eth0: ${state.currentWifi}\nIP: 192.168.1.${Math.floor(Math.random() * 254) + 1}`;
        
        case 'clear':
            document.getElementById('terminalOutput').innerHTML = '';
            return '';
        
        default:
            addWanted(0.5);
            return `خطأ: أمر غير معروف '${command}'`;
    }
}

// ========== تطبيقات أخرى ==========
function getFilesHTML() {
    let html = '<div style="font-size: 12px;">';
    const files = fileSystem[currentPath];
    if (files) {
        html += `<div style="margin-bottom: 10px; color: #00ffcc;">📁 ${currentPath}</div>`;
        Object.keys(files).forEach(file => {
            html += `<div style="padding: 8px; background: rgba(0,255,204,0.05); margin: 4px 0; border-radius: 6px; cursor: pointer;" onclick="showFileContent('${file}')">${file}</div>`;
        });
    }
    html += '</div>';
    return html;
}

function showFileContent(filename) {
    const content = fileSystem[currentPath]?.[filename];
    if (content) {
        showNotification(`📄 ${filename}`, content.substring(0, 100) + '...', 'info');
    }
}

function getBrowserHTML() {
    return `
        <div class="browser-toolbar" style="display: flex; gap: 8px;">
            <input type="text" placeholder="https://nexus.sec" style="flex: 1; padding: 8px; background: #1a1f2f; border: 1px solid #2a3a5a; border-radius: 4px; color: #fff;">
            <button style="padding: 8px 16px; background: #00ffcc; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Go</button>
        </div>
        <div style="margin-top: 15px;">
            <h4 style="color: #00ffcc; margin-bottom: 10px;">📡 المواقع المتاحة</h4>
            <div style="background: rgba(0,255,204,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #00ffcc;">nexus.sec</div>
                <div style="font-size: 12px; color: #888;">نظام الإنترنت الآمن</div>
            </div>
            <div style="background: rgba(0,255,204,0.05); padding: 12px; border-radius: 8px;">
                <div style="font-weight: bold; color: #ffa502;">dark-market.onion</div>
                <div style="font-size: 12px; color: #888;">السوق السوداء (متقدم)</div>
            </div>
        </div>
    `;
}

function getMailHTML() {
    let html = '<div class="mail-list">';
    state.mail.forEach((mail, i) => {
        if (!mail.hidden || state.wanted > 2) {
            html += `
                <div class="mail-item" onclick="this.classList.toggle('open')">
                    <div class="subject">${mail.from}</div>
                    <div class="from">${mail.subject}</div>
                    <div class="body" style="white-space: pre-wrap;">${mail.body}</div>
                </div>
            `;
        }
    });
    html += '</div>';
    return html;
}

function getProfileHTML() {
    return `
        <div style="font-size: 13px;">
            <div style="background: rgba(0,255,204,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #00ffcc;">
                <div style="margin: 8px 0;"><strong>اسم المستخدم:</strong> <input type="text" value="${state.username}" style="background: #1a1f2f; color: #fff; border: 1px solid #2a3a5a; padding: 4px 8px; border-radius: 4px;"></div>
                <div style="margin: 8px 0;"><strong>الاسم الكامل:</strong> <input type="text" value="${state.displayName}" style="background: #1a1f2f; color: #fff; border: 1px solid #2a3a5a; padding: 4px 8px; border-radius: 4px;"></div>
                <div style="margin: 8px 0;"><strong>المستوى الأمني:</strong> <span style="color: #00ffcc;">المستوى 1 - مبتدئ</span></div>
            </div>
            <div style="background: rgba(255,165,2,0.1); padding: 15px; border-radius: 8px; border: 1px solid #ffa502;">
                <strong style="color: #ffa502;">⚙️ الإحصائيات</strong>
                <div style="margin-top: 10px; font-size: 12px;">
                    <div>الأموال: <span style="color: #00ffcc;">${state.money} دولار</span></div>
                    <div>المستوى الحالي: <span style="color: #ffa502;">${state.wanted}/5</span></div>
                    <div>درجة الحرارة: <span style="color: ${state.cpu > 70 ? '#ff4757' : '#00ffcc'};"">${state.cpu}%</span></div>
                </div>
            </div>
        </div>
    `;
}

function getBankHTML() {
    return `
        <div style="font-size: 13px;">
            <div style="background: linear-gradient(135deg, rgba(0,255,204,0.1), rgba(0,255,204,0.05)); padding: 20px; border-radius: 12px; border: 1px solid #00ffcc; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 11px; color: #888; margin-bottom: 5px;">الرصيد الحالي</div>
                <div style="font-size: 28px; color: #00ffcc; font-weight: bold;">${state.money} $</div>
            </div>
            <div style="background: rgba(30,45,74,0.5); padding: 15px; border-radius: 8px;">
                <strong style="color: #00ffcc;">📊 السجل المصرفي</strong>
                <div style="margin-top: 10px; font-size: 12px; max-height: 200px; overflow-y: auto;">
                    ${state.bankTransactions.map(t => `<div style="padding: 4px; border-bottom: 1px solid #2a3a5a;">${t}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function getVaultHTML() {
    return `
        <div style="font-size: 13px;">
            <div style="background: rgba(255,71,87,0.1); padding: 15px; border-radius: 8px; border: 1px solid #ff4757; margin-bottom: 15px;">
                <strong style="color: #ff4757;">⚠️ منطقة خطيرة</strong>
                <p style="margin-top: 10px; font-size: 12px; color: #888;">هذا القبو يحتوي على الأدوات والأسرار المظلمة.</p>
            </div>
            <div style="background: rgba(30,45,74,0.5); padding: 15px; border-radius: 8px;">
                <strong style="color: #ffa502;">🎒 الحقيبة</strong>
                <div style="margin-top: 10px; font-size: 12px;">
                    ${state.inventory.length > 0 ? state.inventory.map(item => `<div style="padding: 4px;">✓ ${item}</div>`).join('') : '<div style="color: #888;">الحقيبة فارغة</div>'}
                </div>
            </div>
        </div>
    `;
}

function getPhoneHTML() {
    return `
        <div class="phone-frame">
            <div class="phone-screen">
                <div class="phone-status">
                    <span>NEXUS</span>
                    <span>📱 100%</span>
                </div>
                <div class="phone-apps">
                    <div class="phone-app" onclick="showNotification('📞 الاتصالات', 'لا توجد مكالمات جديدة', 'info')">
                        <i class="fas fa-phone"></i>
                        <span>الاتصالات</span>
                    </div>
                    <div class="phone-app" onclick="showNotification('💬 الرسائل', 'لديك 2 رسالة جديدة', 'info')">
                        <i class="fas fa-sms"></i>
                        <span>الرسائل</span>
                    </div>
                    <div class="phone-app" onclick="showNotification('🖼️ المعرض', 'لا توجد صور', 'info')">
                        <i class="fas fa-images"></i>
                        <span>المعرض</span>
                    </div>
                    <div class="phone-app" onclick="showNotification('⚙️ الإعدادات', 'الإعدادات محمية', 'info')">
                        <i class="fas fa-cog"></i>
                        <span>الإعدادات</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getHQHTML() {
    let html = `
        <div style="font-size: 13px;">
            <div style="background: linear-gradient(135deg, rgba(0,255,204,0.1), transparent); padding: 15px; border-radius: 8px; border: 1px solid #00ffcc; margin-bottom: 15px;">
                <h3 style="color: #00ffcc; margin-bottom: 10px;">🎯 المهام النشطة</h3>
                <div style="font-size: 12px;">
                    <div style="padding: 8px; background: rgba(0,255,204,0.05); margin: 5px 0; border-radius: 4px;">
                        <strong>${state.mission1Done ? '✅' : '⏳'} المهمة الأولى:</strong> مسح الشبكة باستخدام nmap
                        <div style="color: #888; margin-top: 4px;">المكافأة: 500 دولار</div>
                    </div>
                </div>
            </div>
            <div style="background: rgba(30,45,74,0.5); padding: 15px; border-radius: 8px;">
                <h3 style="color: #ffa502; margin-bottom: 10px;">📡 الاتصالات الحية</h3>
                <div style="font-size: 12px; color: #888;">
                    <div>البريد: 3 رسائل جديدة</div>
                    <div>المكالمات: 0 مكالمات</div>
                    <div>الإجراءات المعلقة: 1</div>
                </div>
            </div>
        </div>
    `;
    return html;
}

// ========== إدارة الشاشات والقوائم ==========
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('wifiMenu').style.display = 'none';
}

function toggleWifiMenu() {
    const menu = document.getElementById('wifiMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('startMenu').style.display = 'none';
}

function connectWifi(network) {
    state.currentWifi = network;
    updateUI();
    audioSystem.playSuccess();
    showNotification('📡 متصل', `تم الاتصال بـ ${network}`, 'success');
    document.getElementById('wifiMenu').style.display = 'none';
}

// ========== تسجيل الدخول والتمهيد ==========
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    
    audioSystem.playKeyPress();
    
    if ((username === 'admin' && password === '1234') || (username && password)) {
        state.username = username;
        audioSystem.playSuccess();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        updateUI();
        showNotification('✅ تسجيل دخول ناجح', `مرحباً ${username}`, 'success');
        
        // بدء الساعة
        updateClock();
        setInterval(updateClock, 1000);
    } else {
        audioSystem.playError();
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('loginError').innerText = 'بيانات دخول غير صحيحة';
    }
    return false;
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clockDisplay').innerText = time;
}

function resetGame() {
    if (confirm('هل تريد فعلاً إعادة تشغيل اللعبة؟')) {
        audioSystem.playError();
        location.reload();
    }
}

// ========== التهيئة ==========
window.addEventListener('DOMContentLoaded', () => {
    audioSystem.init();
    
    // محاكاة BIOS
    setTimeout(() => {
        document.getElementById('bootBarFill').style.width = '100%';
        document.getElementById('bootContinueBtn').style.display = 'block';
    }, 2000);
    
    document.getElementById('bootContinueBtn').addEventListener('click', () => {
        audioSystem.playSuccess();
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
    });
});
