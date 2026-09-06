// ========== الحالة العامة ==========
let state = {
    cpu: 0,
    wanted: 0,
    money: 1000,
    inventory: [],
    name: 'محلل NEXUS',
    wallpaper: 'radial-gradient(circle at 20% 30%, #1a2a3a, #0a0e17)',
    accentColor: '#00ffcc',
    mail: [
        { from: 'Ariel@NEXUS', subject: 'مرحباً بك', body: 'أنت جاهز. اكتب help في الطرفية لبدء رحلتك.' }
    ],
    bankTransactions: ['+1000 دولار (إيداع أولي)'],
    phoneMessages: ['مرحباً، هذا هاتفك الآمن. استخدمه للمهام السرية.'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    mission1Done: false
};

const fileSystem = {
    '/home/user': {
        'clue.txt': 'القرينة: الشبكة المتاحة هي NEXUS_CORP، كلمة المرور 12345678',
        'secret.enc': 'ملف مشفر: U2FsdGVkX1... بيانات بيتكوين',
        'report.pcap': 'حزمة بيانات: IP المصدر 192.168.1.45'
    },
    '/etc': { 'hosts': '127.0.0.1 localhost' }
};
let currentPath = '/home/user';

// ========== دوال مساعدة ==========
function updateUI() {
    document.getElementById('cpuValue').innerText = Math.min(state.cpu, 100);
    document.getElementById('wantedValue').innerText = state.wanted;
    document.getElementById('wallpaper').style.background = state.wallpaper;
    document.querySelectorAll('.window-header, #startBtn, .terminal-prompt').forEach(el => {
        if (el.style) el.style.color = state.accentColor;
    });
}
function addLog(msg) { state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`); }

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

// ========== الإشعارات ==========
function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.borderRightColor = type === 'success' ? '#00ffcc' : '#ffa502';
    notif.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(notif);
    setTimeout(() => { if (notif.parentNode) notif.remove(); }, 5000);
}

// ========== نظام التعطل (BSOD) ==========
function triggerOverheat() {
    if (state.isOverheated) return;
    state.isOverheated = true;
    document.getElementById('bsod-overlay').style.display = 'flex';
    let timer = 20;
    const timerEl = document.getElementById('bsodTimer');
    const interval = setInterval(() => {
        timer--;
        timerEl.innerText = timer;
        document.getElementById('bsodProgressFill').style.width = (timer / 20 * 100) + '%';
        if (timer <= 0) {
            clearInterval(interval);
            document.getElementById('bsod-overlay').style.display = 'none';
            state.cpu = 20;
            state.isOverheated = false;
            addWanted(1);
            addLog('تعطل النظام بسبب الحرارة!');
            updateUI();
            showNotification('⚠️ تعطل النظام', 'تم إعادة التشغيل ورفع المطاردة نقطة.', 'error');
        }
    }, 1000);
}

// ========== نظام الاعتقال ==========
function triggerArrest() {
    if (state.isArrested) return;
    state.isArrested = true;
    const fine = Math.floor(state.money * 0.5);
    state.money -= fine;
    if (state.inventory.length > 0) state.inventory.pop();
    document.getElementById('arrestFine').innerText = fine;
    document.getElementById('arrest-overlay').style.display = 'flex';
    state.wanted = 0;
    updateUI();
    showNotification('🚨 تم القبض عليك!', `تم خصم ${fine} دولار ومصادرة أداة.`, 'error');
}
function closeArrest() {
    document.getElementById('arrest-overlay').style.display = 'none';
    state.isArrested = false;
    addLog('تم الإفراج والعودة للمقر.');
    updateUI();
}

// ========== السحب (Drag and Drop) للنوافذ ==========
function makeDraggable(el) {
    let isDragging = false, offsetX = 0, offsetY = 0;
    const header = el.querySelector('.window-header');
    if (!header) return;
    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const rect = el.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        el.style.cursor = 'grabbing';
        header.style.cursor = 'grabbing';
        el.style.transition = 'none';
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight - 50));
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            el.style.cursor = 'default';
            if (header) header.style.cursor = 'grab';
        }
    });
    // دعم اللمس للهواتف
    header.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const touch = e.touches[0];
        const rect = el.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        isDragging = true;
        el.style.transition = 'none';
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        let x = touch.clientX - offsetX;
        let y = touch.clientY - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight - 50));
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    }, { passive: true });
    document.addEventListener('touchend', () => { isDragging = false; }, { passive: true });
}

// ========== إدارة النوافذ ==========
function openWindow(id) {
    const container = document.getElementById('windows-container');
    // إذا كانت النافذة مفتوحة نركز عليها
    const existing = document.getElementById(`win-${id}`);
    if (existing) { existing.style.zIndex = Date.now() % 1000 + 100; return; }

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = Date.now() % 1000 + 100;
    win.style.right = (8 + Math.random() * 4) + '%';
    win.style.top = (8 + Math.random() * 4) + '%';

    let title = { terminal: 'المحطة الطرفية', files: 'مدير الملفات', vault: 'القبو', profile: 'ملفي الشخصي', phone: 'الهاتف', mail: 'البريد', bank: 'البنك', hq: 'المقر HQ' }[id] || id;
    let content = '';
    switch (id) {
        case 'terminal': content = getTerminalHTML(); break;
        case 'profile': content = getProfileHTML(); break;
        case 'vault': content = getVaultHTML(); break;
        case 'phone': content = getPhoneHTML(); break;
        case 'mail': content = getMailHTML(); break;
        case 'bank': content = getBankHTML(); break;
        case 'hq': content = getHQHTML(); break;
        case 'files': content = getFilesHTML(); break;
        default: content = '<p>تطبيق قيد التطوير</p>';
    }

    win.innerHTML = `
        <div class="window-header">
            <h3><i class="fas fa-${id === 'terminal' ? 'terminal' : id === 'vault' ? 'skull' : id === 'profile' ? 'user' : id === 'phone' ? 'mobile' : id === 'mail' ? 'envelope' : id === 'bank' ? 'university' : id === 'hq' ? 'headquarters' : 'folder'}"></i> ${title}</h3>
            <button class="win-close" onclick="closeWindow('${id}')">✕</button>
        </div>
        <div class="window-body">${content}</div>
    `;
    container.appendChild(win);
    makeDraggable(win);

    // إضافة إلى شريط المهام
    const taskbar = document.getElementById('taskbarApps');
    const appBtn = document.createElement('span');
    appBtn.className = 'taskbar-app';
    appBtn.innerText = title;
    appBtn.onclick = () => focusWindow(id);
    appBtn.id = `task-${id}`;
    taskbar.appendChild(appBtn);

    if (id === 'terminal') setTimeout(initTerminal, 100);
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

// ========== الطرفية (Terminal) ==========
function getTerminalHTML() {
    return `
        <div class="terminal-body" id="terminalBody">
            <div class="terminal-output" id="terminalOutput">نظام NEXUS جاهز. اكتب 'help' لبدء المهام.\n</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">user@nexus:~$</span>
                <input type="text" class="terminal-input" id="terminalInput" autofocus spellcheck="false" autocomplete="off">
            </div>
            <div class="quick-commands">
                <button onclick="quickCmd('help')">help</button>
                <button onclick="quickCmd('ls')">ls</button>
                <button onclick="quickCmd('nmap')">nmap</button>
                <button onclick="quickCmd('ping')">ping</button>
                <button onclick="quickCmd('clear')">clear</button>
                <button onclick="quickCmd('cooldown')">cooldown</button>
                <button onclick="quickCmd('incognito')">incognito</button>
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
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';
                executeCommand(cmd);
            }
        });
        setTimeout(() => input.focus(), 50);
    }
}

// ========== تنفيذ الأوامر (التفاعلية) ==========
function executeCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    const prompt = 'user@nexus:~$ ';
    output.innerText += `\n${prompt}${cmd}`;

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let response = '';

    switch (mainCmd) {
        case 'help':
            response = `📋 الأوامر المتاحة:
  ls, cat [ملف], echo [نص], clear, nmap, ping, ifconfig
  chmod, incognito, cooldown, sudo, whoami, mission_status
💡 مهمتك الأولى: استخدم 'nmap' لمسح الشبكة.`;
            break;
        case 'ls':
            const files = Object.keys(fileSystem[currentPath] || {});
            response = files.length ? files.join('  ') : 'مجلد فارغ';
            break;
        case 'cat':
            if (!args[0]) { response = 'حدد اسم ملف.'; break; }
            const content = fileSystem[currentPath]?.[args[0]];
            response = content || 'الملف غير موجود.';
            break;
        case 'echo':
            response = args.join(' ') || '';
            break;
        case 'clear':
            output.innerText = '';
            return;
        case 'nmap':
            addCPU(25);
            response = `🔍 جارٍ فحص الشبكة...\n[▓▓▓▓▓▓▓▓▓▓] 100%\n✅ منافذ مفتوحة: 22(SSH), 80(HTTP), 443(HTTPS), 8080(PROXY)`;
            addLog('تم استخدام nmap.');
            // إنجاز المهمة الأولى
            if (!state.mission1Done) {
                state.mission1Done = true;
                state.money += 200;
                state.bankTransactions.push('+200 دولار (مكافأة المهمة الأولى)');
                showNotification('🎉 مهمة مكتملة!', 'تم الاتصال بالشبكة! حصلت على 200 دولار.', 'success');
                addLog('المهمة الأولى (الاتصال بالشبكة) مكتملة!');
            }
            break;
        case 'ping':
            addCPU(5);
            response = `PING ${args[0] || '8.8.8.8'} ...\n64 بايت: زمن=12ms TTL=64`;
            break;
        case 'ifconfig':
            response = `eth0: 192.168.1.100\nlo: 127.0.0.1\nwlan0: 10.0.0.5 (متصل)`;
            break;
        case 'chmod':
            addCPU(8);
            response = '✅ تم تغيير صلاحيات الملف بنجاح (محاكاة).';
            break;
        case 'incognito':
            if (state.inventory.includes('هوية مزيفة')) {
                reduceWanted(3);
                state.inventory = state.inventory.filter(i => i !== 'هوية مزيفة');
                response = `🕵️ تم تفعيل الهوية! المطاردة الآن ${state.wanted}.`;
                addLog('استخدم هوية مزيفة.');
            } else { response = '❌ ليس لديك هوية مزيفة. اشترِ من القبو.'; }
            break;
        case 'cooldown':
            if (state.inventory.includes('مبرد سيليكون')) {
                state.cpu = Math.max(state.cpu - 30, 0);
                state.inventory = state.inventory.filter(i => i !== 'مبرد سيليكون');
                response = `❄️ تم التبريد! الحرارة ${state.cpu}%.`;
                addLog('استخدم مبرد.');
            } else { response = '❌ ليس لديك مبرد. اشترِ من القبو.'; }
            break;
        case 'sudo':
            addCPU(10);
            response = `🔐 تنفيذ ${args.join(' ')} بصلاحيات الرووت... تم.`;
            break;
        case 'whoami':
            response = state.name;
            break;
        case 'mission_status':
            response = `📌 المهمة الأولى: ${state.mission1Done ? '✅ مكتملة' : '⏳ قيد التنفيذ (استخدم nmap)'}`;
            break;
        default:
            response = `❌ أمر غير معروف: ${mainCmd}. اكتب help.`;
            addWanted(1);
            addLog(`أمر خاطئ: ${mainCmd}`);
            break;
    }
    output.innerText += `\n${response}\n`;
    output.scrollTop = output.scrollHeight;
    updateUI();
    saveState();
}

// ========== بقية التطبيقات ==========
function getFilesHTML() {
    const files = Object.keys(fileSystem[currentPath] || {});
    return `<h3>📂 ${currentPath}</h3><hr>${files.map(f => `<div>📄 ${f}</div>`).join('')}`;
}
function getProfileHTML() {
    return `
        <h3>👤 ملفي الشخصي</h3>
        <label>الاسم: <input type="text" id="profileName" value="${state.name}" style="background:#1a2639;border:1px solid #2a3a5a;color:#fff;padding:5px;border-radius:4px;width:100%;"></label><br>
        <label>خلفية: <input type="color" id="profileBg" value="#1a2a3a"></label><br>
        <label>لون الإطار: <input type="color" id="profileAccent" value="#00ffcc"></label><br>
        <button onclick="saveProfile()" style="background:#00ffcc;color:#000;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;">💾 حفظ</button>
        <hr><p>💰 الرصيد: ${state.money} دولار</p>
        <p>📦 الأدوات: ${state.inventory.length ? state.inventory.join(' - ') : 'لا يوجد'}</p>
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
    showNotification('✅ تم الحفظ', 'تم تحديث الملف الشخصي.', 'success');
}
function getVaultHTML() {
    const items = [
        { name: 'ماسح شامل', price: 350, desc: 'مسح جميع المنافذ.' },
        { name: 'مبرد سيليكون', price: 200, desc: 'يخفض الحرارة 30%.' },
        { name: 'هوية مزيفة', price: 500, desc: 'يخفض المطاردة 3 درجات.' },
        { name: 'طقم فك تشفير', price: 400, desc: 'فك تشفير سريع.' }
    ];
    let html = `<h3>💀 القبو</h3><p>رصيدك: ${state.money} BTCr</p><hr>`;
    items.forEach(item => {
        const owned = state.inventory.includes(item.name);
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #1e2d4a;">
                <div><strong>${item.name}</strong><br><small>${item.desc}</small></div>
                <div>
                    <span style="margin-left:10px;">${item.price} BTCr</span>
                    <button onclick="buyItem('${item.name}', ${item.price})" style="background:${owned?'#2a3a5a':'#00ffcc'};color:#000;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">${owned ? '✅ مملوك' : 'شراء'}</button>
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
    addLog(`شراء ${name}`);
    saveState();
    closeWindow('vault');
    openWindow('vault');
    updateUI();
    showNotification('🛒 تم الشراء', `تم شراء ${name}.`, 'success');
}
function getPhoneHTML() {
    return `<h3>📱 الهاتف</h3><hr>${state.phoneMessages.map(m => `<p>📩 ${m}</p>`).join('')}`;
}
function getMailHTML() {
    return `<h3>📧 البريد</h3><hr>${state.mail.map(m => `<div style="border:1px solid #1e2d4a;padding:10px;margin:8px 0;border-radius:6px;"><b>${m.from}</b> - ${m.subject}<p>${m.body}</p></div>`).join('')}`;
}
function getBankHTML() {
    return `<h3>🏦 البنك</h3><p>💰 الرصيد: ${state.money} دولار</p><hr><h4>المعاملات:</h4>${state.bankTransactions.map(t => `<p>▪️ ${t}</p>`).join('')}`;
}
function getHQHTML() {
    return `
        <h3>🏢 المقر - غرفة العمليات</h3>
        <p>🔹 المهمة النشطة: <b>الاتصال بالشبكة</b> (استخدم nmap).</p>
        <p>🔹 الحالة: ${state.mission1Done ? '✅ الشبكة متصلة' : '⏳ في انتظار الاتصال'}</p>
        <hr>
        <button onclick="addLog('تحديث المقر')" style="background:#1e2d4a;border:none;color:#fff;padding:8px;border-radius:6px;cursor:pointer;">تحديث</button>
    `;
}

// ========== حفظ وتحميل ==========
function saveState() {
    try { localStorage.setItem('nexusGameState', JSON.stringify(state)); } catch(e) {}
}
function loadState() {
    try {
        const saved = localStorage.getItem('nexusGameState');
        if (saved) Object.assign(state, JSON.parse(saved));
    } catch(e) {}
}

// ========== تسجيل الدخول ==========
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    if (user === 'nexus' && pass === 'root') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        loadState();
        updateUI();
        updateClock();
        setInterval(updateClock, 1000);
        showNotification('🔓 مرحباً بك', `أهلاً ${state.name}، النظام جاهز.`, 'success');
        openWindow('terminal');
        openWindow('hq');
        return false;
    } else {
        document.getElementById('loginError').innerText = '❌ اسم المستخدم أو كلمة السر غير صحيحة!';
        addWanted(1);
        return false;
    }
}

// ========== قائمة ابدأ والساعة ==========
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
function updateClock() {
    document.getElementById('clockDisplay').innerText = new Date().toLocaleTimeString();
}
function resetGame() {
    if (confirm('إعادة التشغيل؟')) {
        localStorage.removeItem('nexusGameState');
        location.reload();
    }
}

// ========== التمهيد (Boot) ==========
window.onload = function() {
    const bootScreen = document.getElementById('boot-screen');
    const loginScreen = document.getElementById('login-screen');
    const bar = document.getElementById('bootBarFill');
    const btn = document.getElementById('bootContinueBtn');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            bar.style.width = '100%';
            btn.style.display = 'inline-block';
            btn.onclick = () => {
                bootScreen.style.display = 'none';
                loginScreen.style.display = 'flex';
            };
        }
        bar.style.width = Math.min(progress, 100) + '%';
    }, 300);
};

// إغلاق النوافذ بالـ Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const wins = document.querySelectorAll('.window');
        if (wins.length > 0) {
            const last = wins[wins.length - 1];
            const id = last.id.replace('win-', '');
            closeWindow(id);
        }
    }
});

// إغلاق قائمة ابدأ بالنقر خارجها
document.addEventListener('click', (e) => {
    const menu = document.getElementById('startMenu');
    const startBtn = document.getElementById('startBtn');
    if (menu && menu.style.display === 'block') {
        if (!menu.contains(e.target) && !startBtn.contains(e.target)) {
            menu.style.display = 'none';
        }
    }
});
