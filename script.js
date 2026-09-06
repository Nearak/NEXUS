// ======= الحالة العامة =======
const state = {
    cpu: 0,
    wanted: 0,
    money: 1000,
    inventory: [],
    name: 'root',
    wallpaper: 'radial-gradient(circle at 20% 30%, #1a2a3a, #0a0e17)',
    accent: '#00ffcc',
    mail: [{ from: 'Ariel@NEXUS', subject: 'مرحباً', body: 'أنت جاهز. استخدم المحطة.' }],
    bankTx: ['+1000 دولار (إيداع أولي)'],
    phone: ['رسالة ترحيبية من المقر.'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    currentPath: '/home/user'
};

// نظام ملفات وهمي
const fs = {
    '/home/user': {
        'clue.txt': 'القرينة: كلمة المرور الضعيفة 12345678',
        'secret.enc': 'بيانات مشفرة: U2FsdGVkX1...',
        'report.pcap': 'حزمة بيانات: IP 192.168.1.45'
    },
    '/etc': { 'hosts': '127.0.0.1 localhost' }
};

// ======= دوال مساعدة =======
function updateUI() {
    document.getElementById('cpuValue').textContent = Math.min(state.cpu, 100);
    document.getElementById('wantedValue').textContent = state.wanted;
    document.getElementById('wallpaper').style.background = state.wallpaper;
    document.querySelectorAll('.window-header h3, .terminal-prompt, #cpuIndicator').forEach(el => {
        el.style.color = state.accent;
    });
}
function addLog(msg) { state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`); }

// ======= الحرارة والمطاردة =======
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

// ======= التعطل (BSOD) =======
function triggerOverheat() {
    if (state.isOverheated) return;
    state.isOverheated = true;
    const overlay = document.getElementById('bsodOverlay');
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
            state.cpu = 20;
            state.isOverheated = false;
            addWanted(1);
            addLog('تعطل النظام بسبب الحرارة! +1 مطاردة.');
            updateUI();
        }
    }, 1000);
}

// ======= الاعتقال =======
function triggerArrest() {
    if (state.isArrested) return;
    state.isArrested = true;
    const fine = Math.floor(state.money * 0.5);
    state.money -= fine;
    if (state.inventory.length > 0) {
        const removed = state.inventory.pop();
        addLog(`مصادرة: ${removed}`);
    }
    document.getElementById('arrestFine').textContent = fine;
    document.getElementById('arrestOverlay').style.display = 'flex';
    state.wanted = 0;
    updateUI();
}
function closeArrest() {
    document.getElementById('arrestOverlay').style.display = 'none';
    state.isArrested = false;
    addLog('الإفراج والعودة إلى المقر.');
    updateUI();
}

// ======= إدارة النوافذ (قابلة للسحب) =======
function openWindow(appId) {
    const container = document.getElementById('windowsContainer');
    // منع تكرار النافذة نفسها
    if (document.getElementById(`win-${appId}`)) {
        focusWindow(appId);
        return;
    }
    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${appId}`;
    win.style.zIndex = Date.now() % 1000 + 100;

    const titles = {
        terminal: 'المحطة الطرفية',
        vault: 'القبو - السوق المظلم',
        profile: 'ملفي الشخصي',
        phone: 'الهاتف الآمن',
        mail: 'البريد الوارد',
        bank: 'بنك NEXUS',
        hq: 'المقر - غرفة العمليات'
    };
    const icons = {
        terminal: 'fa-terminal',
        vault: 'fa-skull',
        profile: 'fa-user',
        phone: 'fa-mobile-alt',
        mail: 'fa-envelope',
        bank: 'fa-university',
        hq: 'fa-headquarters'
    };

    let content = '';
    switch (appId) {
        case 'terminal': content = getTerminalHTML(); break;
        case 'profile': content = getProfileHTML(); break;
        case 'vault': content = getVaultHTML(); break;
        case 'phone': content = getPhoneHTML(); break;
        case 'mail': content = getMailHTML(); break;
        case 'bank': content = getBankHTML(); break;
        case 'hq': content = getHQHTML(); break;
        default: content = '<p>تطبيق غير معروف</p>';
    }

    win.innerHTML = `
        <div class="window-header" data-app="${appId}">
            <h3><i class="fas ${icons[appId] || 'fa-cube'}"></i> ${titles[appId] || appId}</h3>
            <button class="close-btn" onclick="closeWindow('${appId}')">✕</button>
        </div>
        <div class="window-body">${content}</div>
    `;
    container.appendChild(win);

    // إضافة في شريط المهام
    const taskbar = document.getElementById('taskbarApps');
    const appBtn = document.createElement('span');
    appBtn.className = 'taskbar-app';
    appBtn.textContent = titles[appId] || appId;
    appBtn.onclick = () => focusWindow(appId);
    appBtn.id = `task-${appId}`;
    taskbar.appendChild(appBtn);

    // جعل النافذة قابلة للسحب
    makeDraggable(win);

    // تهيئة الطرفية
    if (appId === 'terminal') setTimeout(initTerminal, 100);
}

function closeWindow(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) win.remove();
    const task = document.getElementById(`task-${appId}`);
    if (task) task.remove();
}

function focusWindow(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) win.style.zIndex = Date.now() % 1000 + 100;
}

// ======= سحب النوافذ (يدعم اللمس والفأرة) =======
function makeDraggable(win) {
    const header = win.querySelector('.window-header');
    let offsetX, offsetY, isDragging = false;

    function startDrag(e) {
        const rect = win.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        isDragging = true;
        win.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let x = clientX - offsetX;
        let y = clientY - offsetY;
        // منع الخروج من الشاشة
        x = Math.max(0, Math.min(x, window.innerWidth - win.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - win.offsetHeight - 50));
        win.style.left = x + 'px';
        win.style.top = y + 'px';
        e.preventDefault();
    }

    function endDrag() {
        isDragging = false;
        win.style.cursor = 'default';
    }

    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

// ======= الطرفية المحسنة =======
function getTerminalHTML() {
    return `
        <div class="terminal-body" id="terminalBody">
            <div class="terminal-output" id="terminalOutput">نظام NEXUS جاهز. اكتب 'help' للأوامر.\n</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">${state.name}@nexus:~$</span>
                <input type="text" class="terminal-input" id="terminalInput" autofocus spellcheck="false" autocomplete="off">
            </div>
            <div class="quick-commands">
                <button onclick="quickCmd('help')">help</button>
                <button onclick="quickCmd('ls')">ls</button>
                <button onclick="quickCmd('nmap')">nmap</button>
                <button onclick="quickCmd('clear')">clear</button>
                <button onclick="quickCmd('cooldown')">cooldown</button>
                <button onclick="quickCmd('incognito')">incognito</button>
            </div>
        </div>
    `;
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
    setTimeout(() => input.focus(), 200);
}

function quickCmd(cmd) {
    const input = document.getElementById('terminalInput');
    if (input) { input.value = cmd; executeCommand(cmd); }
}

function executeCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    const prompt = `${state.name}@nexus:~$ `;
    output.innerHTML += `\n<span class="prompt">${prompt}</span>${cmd}`;

    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();
    const args = parts.slice(1);
    let response = '';

    switch (main) {
        case 'help':
            response = `الأوامر المتاحة:\n- ls, cat, echo, clear\n- nmap, ping, ifconfig\n- chmod, sudo, whoami\n- cooldown (يستخدم مبرد)\n- incognito (يستخدم هوية)\n- help`;
            break;
        case 'ls':
            const files = Object.keys(fs[state.currentPath] || {});
            response = files.length ? files.join('  ') : 'مجلد فارغ';
            break;
        case 'cat':
            if (!args.length) { response = 'حدد اسم ملف.'; break; }
            const content = fs[state.currentPath]?.[args[0]];
            response = content || 'الملف غير موجود.';
            break;
        case 'echo':
            response = args.join(' ') || '';
            break;
        case 'clear':
            output.innerHTML = '';
            return;
        case 'nmap':
            addCPU(25);
            response = `[🔍] فحص ${args[0] || '127.0.0.1'}...\nمنافذ مفتوحة: 22(SSH) 80(HTTP) 443(HTTPS) 8080(PROXY)`;
            addLog('تم استخدام nmap، ارتفاع الحرارة.');
            break;
        case 'ping':
            addCPU(5);
            response = `PING ${args[0] || '8.8.8.8'} ...\n64 بايت: زمن=12ms TTL=64`;
            break;
        case 'ifconfig':
            response = `eth0: 192.168.1.100\nlo: 127.0.0.1\nwlan0: 10.0.0.5`;
            break;
        case 'chmod':
            addCPU(8);
            response = '✅ تم تغيير الصلاحيات (محاكاة).';
            break;
        case 'sudo':
            addCPU(10);
            response = `[🔐] تنفيذ ${args.join(' ')} بصلاحيات الرووت... تم.`;
            break;
        case 'whoami':
            response = state.name;
            break;
        case 'cooldown':
            if (state.inventory.includes('مبرد سيليكون')) {
                state.cpu = Math.max(state.cpu - 30, 0);
                state.inventory = state.inventory.filter(i => i !== 'مبرد سيليكون');
                response = `❄️ تم التبريد! الحرارة ${state.cpu}%.`;
                addLog('استخدم مبرد.');
            } else {
                response = '❌ لا يوجد مبرد. اشترِ من القبو.';
            }
            break;
        case 'incognito':
            if (state.inventory.includes('هوية مزيفة')) {
                reduceWanted(3);
                state.inventory = state.inventory.filter(i => i !== 'هوية مزيفة');
                response = `🕵️ تم تفعيل الهوية! المطاردة ${state.wanted}.`;
                addLog('استخدم هوية مزيفة.');
            } else {
                response = '❌ لا يوجد هوية. اشترِ من القبو.';
            }
            break;
        default:
            response = `أمر غير معروف: ${main}. اكتب 'help'.`;
            addWanted(1);
            addLog(`أمر خاطئ: ${main}`);
            break;
    }

    output.innerHTML += `\n${response}`;
    output.scrollTop = output.scrollHeight;
    updateUI();
    saveState();
}

// ======= بقية التطبيقات =======
function getProfileHTML() {
    return `
        <div style="display:flex;flex-direction:column;gap:15px;">
            <h3>👤 الملف الشخصي</h3>
            <label>الاسم: <input type="text" id="profileName" value="${state.name}" style="background:#1a2639;border:1px solid #2a3a5a;color:#fff;padding:6px;border-radius:4px;width:100%;"></label>
            <label>خلفية: <input type="color" id="profileBg" value="#1a2a3a"></label>
            <label>لون الإطار: <input type="color" id="profileAccent" value="#00ffcc"></label>
            <button onclick="saveProfile()" style="background:#00ffcc;color:#000;border:none;padding:10px;border-radius:6px;cursor:pointer;">💾 حفظ</button>
            <p>💰 الرصيد: ${state.money} دولار</p>
            <p>📦 الأدوات: ${state.inventory.length ? state.inventory.join(' - ') : 'لا يوجد'}</p>
            <p>🛡️ المطاردة: ${state.wanted}/5</p>
        </div>
    `;
}

function saveProfile() {
    const name = document.getElementById('profileName').value.trim() || 'root';
    const bg = document.getElementById('profileBg').value;
    const accent = document.getElementById('profileAccent').value;
    state.name = name;
    state.wallpaper = `radial-gradient(circle at 20% 30%, ${bg}, #0a0e17)`;
    state.accent = accent;
    updateUI();
    saveState();
    alert('تم حفظ الملف!');
    closeWindow('profile');
    openWindow('profile');
}

function getVaultHTML() {
    const items = [
        { name: 'ماسح الثغرات الشامل', price: 350, desc: 'مسح جميع المنافذ.' },
        { name: 'مبرد سيليكون', price: 200, desc: 'يخفض الحرارة 30%.' },
        { name: 'هوية مزيفة', price: 500, desc: 'يخفض المطاردة 3 درجات.' },
        { name: 'طقم فك التشفير', price: 400, desc: 'فك تشفير سريع.' },
        { name: 'Rootkit متقدم', price: 750, desc: 'إخفاء العمليات.' }
    ];
    let html = `<h3>💀 القبو</h3><p>💰 رصيدك: ${state.money} BTCr</p><hr>`;
    items.forEach(item => {
        const owned = state.inventory.includes(item.name);
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #1e2d4a;">
                <div><strong>${item.name}</strong><br><small>${item.desc}</small></div>
                <div>
                    <span style="margin-right:10px;">${item.price} BTCr</span>
                    <button onclick="buyItem('${item.name}', ${item.price})" style="background:${owned?'#2a3a5a':'#00ffcc'};color:#000;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">${owned?'✅ مملوك':'شراء'}</button>
                </div>
            </div>
        `;
    });
    return html;
}

function buyItem(name, price) {
    if (state.inventory.includes(name)) { alert('لديك هذا بالفعل!'); return; }
    if (state.money < price) { alert('رصيد غير كافٍ!'); return; }
    state.money -= price;
    state.inventory.push(name);
    addLog(`شراء ${name}`);
    saveState();
    closeWindow('vault');
    openWindow('vault');
    updateUI();
}

function getPhoneHTML() {
    return `<h3>📱 الهاتف</h3><hr>${state.phone.map(msg => `<p>📩 ${msg}</p>`).join('')}`;
}
function getMailHTML() {
    return `<h3>📧 البريد</h3><hr>${state.mail.map(m => `<div style="border:1px solid #1e2d4a;padding:10px;margin:8px 0;border-radius:6px;"><b>${m.from}</b> - ${m.subject}<p>${m.body}</p></div>`).join('')}`;
}
function getBankHTML() {
    return `<h3>🏦 البنك</h3><p>💰 الرصيد: ${state.money} دولار</p><hr><h4>المعاملات:</h4>${state.bankTx.map(t => `<p>▪️ ${t}</p>`).join('')}`;
}
function getHQHTML() {
    return `
        <h3>🏢 المقر</h3>
        <p>🔹 المهمة النشطة: استعادة الاتصال بالإنترنت.</p>
        <p>🔹 استخدم <b>nmap</b> لفحص الشبكة، ثم اتبع التعليمات.</p>
        <hr>
        <p><i class="fas fa-circle" style="color:#00ffcc;"></i> النظام: يعمل</p>
        <p><i class="fas fa-circle" style="color:#ffa502;"></i> الشبكة: مستقرة</p>
        <button onclick="addLog('تحديث المقر')" style="background:#1e2d4a;border:none;color:#fff;padding:8px;border-radius:6px;cursor:pointer;">تحديث</button>
    `;
}

// ======= تسجيل الدخول والإقلاع =======
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    // اسم وكلمة مرور بسيطة
    if (user === 'root' && pass === 'toor') {
        state.name = user;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        updateUI();
        // فتح نوافذ ترحيبية
        openWindow('terminal');
        openWindow('hq');
        addLog('تسجيل دخول ناجح.');
        saveState();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة!\n(المستخدم: root / كلمة المرور: toor)');
    }
}

// ======= الإقلاع التلقائي =======
function bootSequence() {
    const progress = document.getElementById('bootProgress');
    const messages = document.getElementById('bootMessages');
    let p = 0;
    const interval = setInterval(() => {
        p += Math.random() * 12 + 3;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            // إخفاء شاشة الإقلاع وإظهار تسجيل الدخول
            document.getElementById('bootScreen').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'flex';
            // إضافة رسائل إضافية
            const msgs = messages.querySelectorAll('div');
            msgs[msgs.length-1].textContent = '✓ النظام جاهز.';
        }
        progress.style.width = p + '%';
    }, 200);
}

// ======= حفظ وتحميل الحالة =======
function saveState() {
    try { localStorage.setItem('nexusState', JSON.stringify(state)); } catch(e) {}
}
function loadState() {
    try {
        const saved = localStorage.getItem('nexusState');
        if (saved) Object.assign(state, JSON.parse(saved));
    } catch(e) {}
}

function resetGame() {
    if (confirm('إعادة التشغيل؟')) {
        localStorage.removeItem('nexusState');
        location.reload();
    }
}

// ======= تشغيل الساعة =======
function updateClock() {
    document.getElementById('clockDisplay').textContent = new Date().toLocaleTimeString();
}

// ======= قائمة ابدأ =======
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// ======= ربط أيقونات سطح المكتب =======
document.addEventListener('DOMContentLoaded', function() {
    loadState();
    // بدء الإقلاع
    bootSequence();
    // الساعة
    updateClock();
    setInterval(updateClock, 1000);

    // أحداث أيقونات سطح المكتب وقائمة ابدأ
    document.querySelectorAll('.desk-icon, .start-menu-item').forEach(el => {
        el.addEventListener('click', function(e) {
            const app = this.dataset.app;
            if (app) {
                openWindow(app);
                document.getElementById('startMenu').style.display = 'none';
            }
        });
    });

    // إغلاق قائمة ابدأ بالنقر خارجها
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('startMenu');
        if (menu && !menu.contains(e.target) && e.target.id !== 'startBtn') {
            menu.style.display = 'none';
        }
    });
});
