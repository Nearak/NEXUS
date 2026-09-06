// ========== الحالة العامة ==========
let state = {
    cpu: 0,
    wanted: 0,
    money: 1500,
    inventory: [],
    name: 'محلل NEXUS',
    username: 'admin',
    password: '1234',
    wallpaper: 'radial-gradient(circle at 20% 30%, #1a2a3a, #0a0e17)',
    accentColor: '#00ffcc',
    mail: [
        { from: 'Ariel@NEXUS', subject: 'مرحباً بك في NEXUS', body: 'أنت الآن جاهز. اكتب "help" في الطرفية لبدء رحلتك.' },
        { from: 'System@NEXUS', subject: 'مهمة جديدة: الاتصال بالشبكة', body: 'استخدم أمر "nmap" لمسح الشبكة المحلية.' }
    ],
    bankTransactions: ['+1500 دولار (إيداع أولي)'],
    phoneMessages: ['مرحباً، هذا هاتفك الآمن.', 'رسالة جديدة: تحقق من البريد الإلكتروني.'],
    phoneContacts: ['Ariel', 'System', 'Unknown'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    mission1Done: false,
    currentWifi: 'غير متصل',
    availableWifi: ['NEXUS_CORP', 'PUBLIC_WIFI', 'DARK_NET']
};

// نظام الملفات الوهمي
const fileSystem = {
    '/home/user': {
        'clue.txt': 'القرينة: الشبكة المتاحة هي NEXUS_CORP، كلمة المرور 12345678',
        'secret.enc': 'ملف مشفر: U2FsdGVkX1... بيانات بيتكوين',
        'report.pcap': 'حزمة بيانات: IP المصدر 192.168.1.45'
    },
    '/etc': { 'hosts': '127.0.0.1 localhost' },
    '/var/log': { 'syslog': 'NEXUS system ready.' }
};
let currentPath = '/home/user';
let selectedFile = null;

// ========== دوال مساعدة ==========
function updateUI() {
    document.getElementById('cpuValue').innerText = Math.min(state.cpu, 100);
    document.getElementById('wantedValue').innerText = state.wanted;
    document.getElementById('wallpaper').style.background = state.wallpaper;
    document.getElementById('wifiStatus').innerText = state.currentWifi;
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
    notif.style.borderRightColor = type === 'success' ? '#00ffcc' : type === 'error' ? '#ff4757' : '#ffa502';
    notif.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(notif);
    setTimeout(() => { if (notif.parentNode) notif.remove(); }, 5000);
}

// ========== أنظمة التعطل والاعتقال ==========
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
            showNotification('⚠️ تعطل النظام', 'تم إعادة التشغيل ورفع المطاردة.', 'error');
        }
    }, 1000);
}

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
    const endDrag = () => { isDragging = false; el.style.cursor = 'default'; };
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
    if (existing) { existing.style.zIndex = Date.now() % 1000 + 100; return; }

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = Date.now() % 1000 + 100;
    win.style.right = (8 + Math.random() * 4) + '%';
    win.style.top = (8 + Math.random() * 4) + '%';

    const titles = { terminal: 'المحطة الطرفية', files: 'مدير الملفات', browser: 'المتصفح', vault: 'القبو', profile: 'ملفي الشخصي', phone: 'الهاتف', mail: 'البريد', bank: 'البنك', hq: 'المقر HQ' };
    const icons = { terminal: 'terminal', files: 'folder', browser: 'globe', vault: 'skull', profile: 'user', phone: 'mobile', mail: 'envelope', bank: 'university', hq: 'headquarters' };
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
            <div class="terminal-output" id="terminalOutput">NEXUS Terminal v3.0\nType 'help' for commands.\n</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">${state.username}@nexus:~$</span>
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
                <button onclick="quickCmd('manual')">manual</button>
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

// ========== كتيب الأوامر (Manual) ==========
const commandManual = {
    'help': 'عرض قائمة الأوامر المتاحة.',
    'ls': 'عرض محتويات المجلد الحالي.',
    'cd [folder]': 'التنقل إلى مجلد آخر.',
    'cat [file]': 'عرض محتوى ملف نصي.',
    'echo [text]': 'طباعة نص في الطرفية.',
    'clear': 'مسح شاشة الطرفية.',
    'nmap': 'مسح الشبكة بحثاً عن المنافذ المفتوحة (يرفع الحرارة).',
    'ping [ip]': 'اختبار الاتصال بعنوان IP.',
    'ifconfig': 'عرض واجهات الشبكة المتاحة.',
    'ssh [user]@[ip]': 'محاكاة الاتصال بخادم بعيد.',
    'chmod +x [file]': 'منح صلاحيات التنفيذ لملف.',
    'incognito': 'تفعيل الهوية المزيفة (يخفض المطاردة).',
    'cooldown': 'استخدام المبرد لتخفيض الحرارة.',
    'sudo [command]': 'تنفيذ أمر بصلاحيات المدير.',
    'whoami': 'عرض اسم المستخدم الحالي.',
    'mission_status': 'عرض حالة المهمة الحالية.',
    'manual': 'عرض هذا الكتيب الإرشادي.'
};

// ========== تنفيذ الأوامر ==========
function executeCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    const prompt = `${state.username}@nexus:~$ `;
    output.innerText += `\n${prompt}${cmd}`;

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let response = '';

    switch (mainCmd) {
        case 'help':
            response = `Available commands:\n${Object.keys(commandManual).join(', ')}\nType 'manual' for detailed guide.`;
            break;
        case 'manual':
            response = '📖 **Command Manual** (كتيب الأوامر):\n';
            for (const [cmd, desc] of Object.entries(commandManual)) {
                response += `  ${cmd}: ${desc}\n`;
            }
            response += '\n💡 Tip: Most commands simulate real Linux tools.';
            break;
        case 'ls': {
            const files = Object.keys(fileSystem[currentPath] || {});
            response = files.length ? files.join('  ') : 'Empty directory.';
            break;
        }
        case 'cd':
            if (!args[0]) { response = 'Usage: cd [folder]'; break; }
            if (args[0] === '..') {
                const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                if (fileSystem[newPath]) { currentPath = newPath; response = `Changed to ${currentPath}`; }
                else response = 'Path not found.';
            } else {
                const newPath = currentPath + '/' + args[0];
                if (fileSystem[newPath]) { currentPath = newPath; response = `Changed to ${currentPath}`; }
                else response = 'Folder not found.';
            }
            break;
        case 'cat':
            if (!args[0]) { response = 'Usage: cat [file]'; break; }
            const content = fileSystem[currentPath]?.[args[0]];
            response = content || 'File not found.';
            break;
        case 'echo':
            response = args.join(' ') || '';
            break;
        case 'clear':
            output.innerText = '';
            return;
        case 'nmap':
            addCPU(25);
            response = `🔍 Scanning network...\n[▓▓▓▓▓▓▓▓▓▓] 100%\nOpen ports: 22(SSH), 80(HTTP), 443(HTTPS), 8080(PROXY)`;
            addLog('Used nmap.');
            if (!state.mission1Done) {
                state.mission1Done = true;
                state.money += 200;
                state.bankTransactions.push('+200 دولار (مكافأة المهمة الأولى)');
                showNotification('🎉 Mission Complete!', 'Network connected! +200$ reward.', 'success');
                addLog('Mission 1 completed!');
            }
            break;
        case 'ping':
            addCPU(5);
            response = `PING ${args[0] || '8.8.8.8'} ...\n64 bytes: time=12ms TTL=64`;
            break;
        case 'ifconfig':
            response = `eth0: 192.168.1.100\nlo: 127.0.0.1\nwlan0: ${state.currentWifi !== 'غير متصل' ? '10.0.0.5 (connected)' : 'disconnected'}`;
            break;
        case 'ssh':
            addCPU(15);
            response = `🔐 Connecting to ${args[0] || 'unknown'}...\nPassword: ********\nWelcome! You are now connected.`;
            break;
        case 'chmod':
            addCPU(8);
            response = '✅ File permissions changed successfully.';
            break;
        case 'incognito':
            if (state.inventory.includes('هوية مزيفة')) {
                reduceWanted(3);
                state.inventory = state.inventory.filter(i => i !== 'هوية مزيفة');
                response = `🕵️ Fake ID activated! Wanted level: ${state.wanted}`;
                addLog('Used Fake ID.');
            } else { response = '❌ No Fake ID found. Buy from Vault.'; }
            break;
        case 'cooldown':
            if (state.inventory.includes('مبرد سيليكون')) {
                state.cpu = Math.max(state.cpu - 30, 0);
                state.inventory = state.inventory.filter(i => i !== 'مبرد سيليكون');
                response = `❄️ Cooler used! CPU: ${state.cpu}%`;
                addLog('Used Cooler.');
            } else { response = '❌ No Cooler found. Buy from Vault.'; }
            break;
        case 'sudo':
            addCPU(10);
            response = `🔐 Executing ${args.join(' ')} with root privileges... Done.`;
            break;
        case 'whoami':
            response = state.username;
            break;
        case 'mission_status':
            response = `📌 Mission 1: ${state.mission1Done ? '✅ Complete' : '⏳ Pending (use nmap)'}`;
            break;
        case 'nmcli':
            response = `Available Wi-Fi networks:\n${state.availableWifi.map(w => `  ${w}`).join('\n')}`;
            break;
        default:
            response = `❌ Unknown command: ${mainCmd}. Type 'help'.`;
            addWanted(1);
            addLog(`Unknown command: ${mainCmd}`);
            break;
    }
    output.innerText += `\n${response}\n`;
    output.scrollTop = output.scrollHeight;
    updateUI();
    saveState();
}

// ========== تطبيقات أخرى ==========
function getFilesHTML() {
    const files = Object.keys(fileSystem[currentPath] || {});
    return `
        <h3>📂 ${currentPath}</h3>
        <hr>
        ${files.map(f => `
            <div style="display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #1a1f2f;cursor:pointer;" onclick="openFile('${f}')">
                <span>📄 ${f}</span>
                <span style="color:#888;font-size:12px;">click to view</span>
            </div>
        `).join('')}
        <div id="filePreview" style="margin-top:15px;background:#0a0e17;padding:10px;border-radius:6px;display:none;"></div>
    `;
}
function openFile(filename) {
    const preview = document.getElementById('filePreview');
    if (!preview) return;
    const content = fileSystem[currentPath]?.[filename];
    if (content) {
        preview.style.display = 'block';
        preview.innerHTML = `<strong>${filename}</strong><br><pre style="color:#c8d6e5;font-family:monospace;">${content}</pre>`;
        showNotification('📄 ملف مفتوح', `تم فتح ${filename}`, 'info');
    }
}

function getBrowserHTML() {
    return `
        <div class="browser-toolbar">
            <button onclick="browserGo('home')">🏠</button>
            <input type="text" id="browserUrl" value="nexus://home" dir="ltr">
            <button onclick="browserGo()">🔍</button>
        </div>
        <div class="browser-content" id="browserContent">
            <div class="site">
                <h3>🌐 NEXUS Browser</h3>
                <p>مواقع متاحة:</p>
                <ul>
                    <li onclick="browserGo('wifi')">🔗 شبكات الـ Wi-Fi المتاحة</li>
                    <li onclick="browserGo('missions')">📋 لوحة المهام</li>
                    <li onclick="browserGo('news')">📰 أخبار الأمن السيبراني</li>
                </ul>
            </div>
        </div>
    `;
}
function browserGo(page) {
    const content = document.getElementById('browserContent');
    const url = document.getElementById('browserUrl');
    if (!content) return;
    if (page === 'home' || !page) {
        url.value = 'nexus://home';
        content.innerHTML = `<div class="site"><h3>🌐 NEXUS Browser</h3><p>مواقع متاحة:</p><ul>
            <li onclick="browserGo('wifi')">🔗 شبكات الـ Wi-Fi المتاحة</li>
            <li onclick="browserGo('missions')">📋 لوحة المهام</li>
            <li onclick="browserGo('news')">📰 أخبار الأمن السيبراني</li>
        </ul></div>`;
    } else if (page === 'wifi') {
        url.value = 'nexus://wifi';
        content.innerHTML = `<div class="site"><h3>📶 شبكات Wi-Fi المتاحة</h3>
            ${state.availableWifi.map(w => `<div style="padding:8px;border-bottom:1px solid #1a1f2f;">${w} ${w === 'PUBLIC_WIFI' ? '(مفتوحة)' : '(مشفرة)'}</div>`).join('')}
            <p style="margin-top:10px;color:#888;">استخدم أمر nmcli في الطرفية لعرض التفاصيل.</p>
        </div>`;
    } else if (page === 'missions') {
        url.value = 'nexus://missions';
        content.innerHTML = `<div class="site"><h3>📋 لوحة المهام</h3>
            <p>المهمة النشطة: <b>الاتصال بالشبكة</b> (استخدم nmap)</p>
            <p>الحالة: ${state.mission1Done ? '✅ مكتملة' : '⏳ قيد التنفيذ'}</p>
        </div>`;
    } else {
        url.value = 'nexus://error';
        content.innerHTML = `<div class="site"><h3>⚠️ 404 - صفحة غير موجودة</h3></div>`;
    }
}

function getProfileHTML() {
    return `
        <h3>👤 الملف الشخصي</h3>
        <label>الاسم: <input type="text" id="profileName" value="${state.name}" style="background:#1a2639;border:1px solid #2a3a5a;color:#fff;padding:5px;border-radius:4px;width:100%;"></label><br>
        <label>اسم المستخدم: <input type="text" id="profileUser" value="${state.username}" style="background:#1a2639;border:1px solid #2a3a5a;color:#fff;padding:5px;border-radius:4px;width:100%;"></label><br>
        <label>كلمة السر: <input type="password" id="profilePass" value="${state.password}" style="background:#1a2639;border:1px solid #2a3a5a;color:#fff;padding:5px;border-radius:4px;width:100%;"></label><br>
        <label>خلفية: <input type="color" id="profileBg" value="#1a2a3a"></label><br>
        <label>لون الإطار: <input type="color" id="profileAccent" value="#00ffcc"></label><br>
        <button onclick="saveProfile()" style="background:#00ffcc;color:#000;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;">💾 حفظ</button>
        <hr><p>💰 الرصيد: ${state.money} دولار</p>
        <p>📦 الأدوات: ${state.inventory.length ? state.inventory.join(' - ') : 'لا يوجد'}</p>
        <p>🛡️ المطاردة: ${state.wanted}/5</p>
    `;
}
function saveProfile() {
    const name = document.getElementById('profileName').value;
    const user = document.getElementById('profileUser').value;
    const pass = document.getElementById('profilePass').value;
    const bg = document.getElementById('profileBg').value;
    const accent = document.getElementById('profileAccent').value;
    state.name = name || 'محلل NEXUS';
    state.username = user || 'admin';
    state.password = pass || '1234';
    state.wallpaper = `radial-gradient(circle at 20% 30%, ${bg}, #0a0e17)`;
    state.accentColor = accent;
    updateUI();
    saveState();
    showNotification('✅ تم الحفظ', 'تم تحديث الملف الشخصي.', 'success');
    // تحديث الـ prompt في الطرفية
    const promptEl = document.querySelector('.terminal-prompt');
    if (promptEl) promptEl.innerText = `${state.username}@nexus:~$`;
}

function getVaultHTML() {
    const items = [
        { name: 'ماسح شامل', price: 350, desc: 'مسح جميع المنافذ بدقة.' },
        { name: 'مبرد سيليكون', price: 200, desc: 'يخفض الحرارة 30%.' },
        { name: 'هوية مزيفة', price: 500, desc: 'يخفض المطاردة 3 درجات.' },
        { name: 'طقم فك تشفير', price: 400, desc: 'فك تشفير سريع.' }
    ];
    let html = `<h3>💀 القبو - السوق المظلم</h3><p>رصيدك: ${state.money} BTCr</p><hr>`;
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
    return `
        <div class="phone-frame">
            <div class="phone-screen">
                <div class="phone-status">
                    <span>📶 ${state.currentWifi}</span>
                    <span>🔋 87%</span>
                    <span>${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="phone-apps">
                    <div class="phone-app" onclick="showNotification('📞 اتصال', 'جارٍ الاتصال بـ Ariel...', 'info')"><i class="fas fa-phone"></i><span>اتصال</span></div>
                    <div class="phone-app" onclick="showNotification('💬 رسالة', 'تم إرسال رسالة إلى Unknown.', 'info')"><i class="fas fa-sms"></i><span>رسائل</span></div>
                    <div class="phone-app" onclick="showNotification('📷 كاميرا', 'الكاميرا قيد التشغيل.', 'info')"><i class="fas fa-camera"></i><span>كاميرا</span></div>
                    <div class="phone-app" onclick="showNotification('⚙️ إعدادات', 'فتح الإعدادات.', 'info')"><i class="fas fa-cog"></i><span>إعدادات</span></div>
                </div>
                <hr style="border-color:#1a1f2f;margin:10px 0;">
                <div style="font-size:12px;color:#888;">
                    <p>📩 رسائل واردة:</p>
                    ${state.phoneMessages.map(m => `<p style="padding:4px 0;border-bottom:1px solid #1a1f2f;">📨 ${m}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function getMailHTML() {
    return `
        <h3>📧 البريد الوارد</h3>
        <div class="mail-list">
            ${state.mail.map((m, i) => `
                <div class="mail-item" onclick="toggleMail(${i})">
                    <div class="from">${m.from}</div>
                    <div class="subject">${m.subject}</div>
                    <div class="body">${m.body}</div>
                </div>
            `).join('')}
        </div>
    `;
}
function toggleMail(index) {
    const items = document.querySelectorAll('.mail-item');
    if (items[index]) items[index].classList.toggle('open');
}

function getBankHTML() {
    return `<h3>🏦 بنك NEXUS</h3><p>💰 الرصيد: ${state.money} دولار</p><hr><h4>المعاملات:</h4>${state.bankTransactions.map(t => `<p>▪️ ${t}</p>`).join('')}`;
}

function getHQHTML() {
    return `
        <h3>🏢 المقر - غرفة العمليات</h3>
        <p>🔹 المهمة النشطة: <b>الاتصال بالشبكة</b> (استخدم nmap).</p>
        <p>🔹 الحالة: ${state.mission1Done ? '✅ الشبكة متصلة' : '⏳ في انتظار الاتصال'}</p>
        <hr>
        <p><i class="fas fa-circle" style="color:#00ffcc;"></i> نظام المراقبة: يعمل</p>
        <p><i class="fas fa-circle" style="color:#ffa502;"></i> حالة الشبكة: ${state.currentWifi}</p>
        <button onclick="addLog('تحديث المقر')" style="background:#1e2d4a;border:none;color:#fff;padding:8px;border-radius:6px;cursor:pointer;">تحديث</button>
    `;
}

// ========== Wi-Fi ==========
function toggleWifiMenu() {
    const menu = document.getElementById('wifiMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
function connectWifi(network) {
    state.currentWifi = network;
    updateUI();
    document.getElementById('wifiMenu').style.display = 'none';
    showNotification('📶 Wi-Fi', `تم الاتصال بـ ${network}`, 'success');
    addLog(`Connected to ${network}`);
    saveState();
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
    // التحقق: إذا كانت الحقول فارغة، استخدم الافتراضي
    const loginUser = user || 'admin';
    const loginPass = pass || '1234';
    
    // التحقق من صحة البيانات (أول مرة أو مطابقة للمحفوظ)
    if (loginUser === state.username && loginPass === state.password) {
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
        // إذا كانت هذه هي المرة الأولى، احفظ البيانات الجديدة
        if (user && pass) {
            state.username = user;
            state.password = pass;
            state.name = user;
            saveState();
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('desktop').style.display = 'block';
            loadState();
            updateUI();
            updateClock();
            setInterval(updateClock, 1000);
            showNotification('🔓 مرحباً بك', `أهلاً ${state.name}، تم إنشاء حسابك.`, 'success');
            openWindow('terminal');
            openWindow('hq');
            return false;
        }
        document.getElementById('loginError').innerText = '❌ اسم المستخدم أو كلمة السر غير صحيحة!';
        return false;
    }
}

// ========== قوائم ==========
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

// ========== التمهيد ==========
window.onload = function() {
    loadState();
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
                // تعبئة حقول تسجيل الدخول بالبيانات المحفوظة
                document.getElementById('loginUser').value = state.username;
                document.getElementById('loginPass').value = state.password;
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
    // Ctrl+D لإظهار سطح المكتب
    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const wins = document.querySelectorAll('.window');
        wins.forEach(w => w.style.display = w.style.display === 'none' ? 'flex' : 'none');
    }
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
