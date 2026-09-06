// ===== نظام الصوت (نفس السابق) =====
class AudioSystem { /* ... */ }
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
        { from: 'Ariel@NEXUS.sec', subject: '🔐 مرحباً بك', body: 'أهلاً بك في NEXUS...' },
        { from: 'System@NEXUS.sec', subject: '📋 المهمة الأولى: اختراق الشبكة', body: 'لبدء العمل، يجب عليك اختراق شبكة NEXUS_CORP.\nاستخدم الأمر: crackwifi NEXUS_CORP\nثم جرب كلمات المرور: 12345678, password, admin, 00000000' }
    ],
    bankTransactions: ['+1500 دولار (راتب ابتدائي)'],
    phoneMessages: ['مرحباً، هاتفك الآمن متصل.'],
    logs: [],
    isOverheated: false,
    isArrested: false,
    // المهام
    tasks: [
        { id: 1, title: 'اختراق شبكة NEXUS_CORP', desc: 'استخدم أمر crackwifi NEXUS_CORP ثم جرب كلمات المرور المذكورة.', reward: 500, status: 'pending' },
        { id: 2, title: 'فك تشفير ملف secret.enc', desc: 'استخدم أمر decrypt secret.enc', reward: 800, status: 'pending' },
        { id: 3, title: 'استغلال ثغرة SQL في موقع test.com', desc: 'استخدم أمر sqlmap http://test.com/login', reward: 1200, status: 'pending' }
    ],
    // حالة الشبكات
    wifiNetworks: {
        'NEXUS_CORP': { status: 'secure', password: '12345678', cracked: false },
        'PUBLIC_WIFI': { status: 'open', cracked: true },
        'DARK_NET': { status: 'secure', password: 'dark2024', cracked: false }
    },
    currentWifi: 'غير متصل',
    mission1Done: false,
    chosenPath: null
};

// ===== نظام الملفات (نفس السابق) =====
const fileSystem = {
    '/home/user': {
        'clue.txt': 'القرينة: شبكة NEXUS_CORP تستخدم كلمة مرور ضعيفة...',
        'secret.enc': '[ملف مشفر] المحتوى: "Bitcoin Wallet: 1A2B3C... الرصيد: 50 BTC"',
        'report.pcap': 'حزمة بيانات: تم اكتشاف محاولات اختراق من IP 192.168.1.45'
    }
};
let currentPath = '/home/user';

// ===== دوال مساعدة (نفس السابق) =====
function updateUI() { /* ... */ }
function addLog(msg) { /* ... */ }
function addCPU(amount) { /* ... */ }
function addWanted(amount) { /* ... */ }
function reduceWanted(amount) { /* ... */ }
function addMoney(amount) { /* ... */ }

// ===== الإشعارات =====
function showNotification(title, body, type = 'info') { /* ... */ }

// ===== أنظمة التعطل والاعتقال (نفس السابق) =====
function triggerOverheat() { /* ... */ }
function triggerArrest() { /* ... */ }
function closeArrest() { /* ... */ }

// ===== السحب (نفس السابق) =====
function makeDraggable(el) { /* ... */ }

// ===== إدارة النوافذ (مع إضافة 'tasks') =====
function openWindow(id) {
    // نفس الكود السابق مع إضافة حالة tasks
    const titles = {
        /* ... */ tasks: 'دفتر المهام'
    };
    const icons = {
        /* ... */ tasks: 'tasks'
    };
    let content = '';
    switch (id) {
        /* ... */
        case 'tasks': content = getTasksHTML(); break;
        default: content = '<p>تطبيق قيد التطوير</p>';
    }
    // ... باقي الكود
}

function closeWindow(id) { /* ... */ }

// ===== المحطة الطرفية (مع أوامر جديدة) =====
function getTerminalHTML() { /* نفس السابق */ }

function handleTerminalInput(event) {
    if (event.key !== 'Enter') { audioSystem.playKeyPress(); return; }
    const input = event.target.value.trim();
    if (!input) return;
    const output = document.getElementById('terminalOutput');
    output.innerHTML += `<div><span class="terminal-prompt">$</span> ${input}</div>`;
    const result = executeCommand(input);
    output.innerHTML += `<div>${result}</div>`;
    event.target.value = '';
    output.parentElement.scrollTop = output.parentElement.scrollHeight;
}

function quickCommand(cmd) { /* نفس السابق */ }

// ===== تنفيذ الأوامر (محسّن) =====
function executeCommand(cmd) {
    addLog(`تنفيذ: ${cmd}`);
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts[1] || '';

    switch (command) {
        case 'help':
            return `أوامر NEXUS المتاحة:
help - عرض هذه الرسالة
ls - عرض الملفات
cd [path] - الانتقال للمجلد
cat [file] - عرض محتوى الملف
nmap - مسح الشبكة (CPU +25%)
crackwifi [SSID] - اختراق شبكة Wi-Fi (يتطلب قاموس)
decrypt [file] - فك تشفير ملف
sqlmap [url] - اختبار ثغرة SQL
ping [ip] - اختبار الاتصال
whoami - عرض اسم المستخدم
ifconfig - معلومات الشبكة
clear - مسح الشاشة
tasks - عرض المهام`;

        case 'ls':
            return Object.keys(fileSystem[currentPath] || {}).join('\n') || 'المجلد فارغ';

        case 'cd':
            if (arg && fileSystem[arg]) { currentPath = arg; return `تم الانتقال إلى ${currentPath}`; }
            return 'مجلد غير موجود';

        case 'cat':
            const file = fileSystem[currentPath]?.[arg];
            if (file) { audioSystem.playSuccess(); return file; }
            return `خطأ: الملف '${arg}' غير موجود`;

        case 'nmap':
            addCPU(25);
            audioSystem.playSuccess();
            if (!state.mission1Done) {
                state.mission1Done = true;
                addMoney(500);
                showNotification('✅ مهمة مكتملة!', 'مسح الشبكة نجح. +500 دولار', 'success');
            }
            return `Nmap scan report:\n192.168.1.1 (gateway) - UP\n192.168.1.100 (nexus-server) - UP\nConnected to NEXUS_CORP`;

        // ===== أمر اختراق الشبكة =====
        case 'crackwifi':
            if (!arg) return 'استخدام: crackwifi [SSID]';
            const network = state.wifiNetworks[arg];
            if (!network) return `الشبكة '${arg}' غير موجودة`;
            if (network.cracked) return `✅ الشبكة '${arg}' مخترقة بالفعل!`;
            // محاكاة عملية الاختراق باستخدام قاموس
            addCPU(15);
            // محاولة كلمات مرور من قاموس
            const passwords = ['12345678', 'password', 'admin', '00000000', 'letmein', 'qwerty'];
            let found = false;
            for (let pwd of passwords) {
                if (pwd === network.password) {
                    found = true;
                    break;
                }
            }
            if (found) {
                network.cracked = true;
                state.currentWifi = arg;
                updateUI();
                audioSystem.playSuccess();
                // تحديث حالة المهمة الأولى
                updateTaskStatus(1, 'completed');
                addMoney(500);
                showNotification(`✅ اختراق ناجح!`, `تم اختراق شبكة ${arg}. +500 دولار`, 'success');
                return `✅ اختراق الشبكة '${arg}' نجح! المفتاح: ${network.password}`;
            } else {
                addWanted(1);
                audioSystem.playError();
                return `❌ فشل اختراق الشبكة '${arg}'. حاول مرة أخرى. تم رفع المطاردة.`;
            }

        // ===== أمر فك التشفير =====
        case 'decrypt':
            if (!arg) return 'استخدام: decrypt [file]';
            const fileToDecrypt = fileSystem[currentPath]?.[arg];
            if (!fileToDecrypt) return `الملف '${arg}' غير موجود`;
            if (arg === 'secret.enc') {
                addCPU(10);
                // محاكاة فك التشفير
                const decrypted = '✅ تم فك التشفير: المحتوى الأصلي هو "Bitcoin Wallet: 1A2B3C... الرصيد: 50 BTC"';
                updateTaskStatus(2, 'completed');
                addMoney(800);
                showNotification('🔓 فك التشفير', 'تم فك تشفير secret.enc بنجاح! +800 دولار', 'success');
                return decrypted;
            }
            return `لا يمكن فك تشفير '${arg}'`;

        // ===== أمر اختبار SQL =====
        case 'sqlmap':
            if (!arg) return 'استخدام: sqlmap [url]';
            if (arg === 'http://test.com/login') {
                addCPU(20);
                // محاكاة استغلال الثغرة
                updateTaskStatus(3, 'completed');
                addMoney(1200);
                showNotification('💥 استغلال ثغرة SQL', 'تم استغلال الثغرة بنجاح! +1200 دولار', 'success');
                return '✅ تم استغلال ثغرة SQL. تم استخراج بيانات المستخدمين.';
            }
            return `لم يتم العثور على ثغرة في ${arg}`;

        case 'ping':
            addCPU(5);
            return `PING ${arg || '8.8.8.8'} ...\n64 bytes: time=12ms TTL=64`;

        case 'ifconfig':
            return `eth0: ${state.currentWifi}\nIP: 192.168.1.${Math.floor(Math.random() * 254) + 1}`;

        case 'clear':
            document.getElementById('terminalOutput').innerHTML = '';
            return '';

        case 'whoami':
            return state.username;

        case 'tasks':
            return getTasksText();

        default:
            addWanted(0.5);
            return `خطأ: أمر غير معروف '${command}'`;
    }
}

// ===== وظائف المهام =====
function updateTaskStatus(taskId, status) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = status;
        // إذا كانت المهمة المكتملة هي الأولى، فتح شبكة DARK_NET
        if (taskId === 1 && status === 'completed') {
            showNotification('🔓 تم فتح شبكة DARK_NET', 'يمكنك الآن محاولة اختراق DARK_NET.', 'info');
        }
        saveState();
    }
}

function getTasksHTML() {
    let html = '<div style="font-size:13px;">';
    state.tasks.forEach(task => {
        const statusText = task.status === 'completed' ? '✅ مكتملة' : '⏳ قيد التنفيذ';
        const className = task.status === 'completed' ? 'task-item completed' : 'task-item';
        html += `
            <div class="${className}">
                <div class="task-title">${task.title}</div>
                <div class="task-desc">${task.desc}</div>
                <div class="task-reward">💰 ${task.reward} دولار</div>
                <div class="task-status">${statusText}</div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function getTasksText() {
    let output = '📋 قائمة المهام:\n';
    state.tasks.forEach(task => {
        const status = task.status === 'completed' ? '[✅]' : '[⏳]';
        output += `${status} ${task.title} - ${task.desc}\n`;
    });
    return output;
}

// ===== الشبكات =====
function toggleWifiMenu() {
    const menu = document.getElementById('wifiMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('startMenu').style.display = 'none';
    // تحديث حالة الشبكات في القائمة
    updateWifiMenu();
}

function updateWifiMenu() {
    for (let net in state.wifiNetworks) {
        const info = state.wifiNetworks[net];
        const statusEl = document.getElementById(`wifi-status-${net}`);
        const checkEl = document.getElementById(`wifi-check-${net}`);
        if (info.cracked) {
            statusEl.innerText = '✅ مخترقة (متصل)';
            statusEl.className = 'wifi-strength cracked';
            if (checkEl) checkEl.style.display = 'inline-block';
        } else if (info.status === 'open') {
            statusEl.innerText = '🌐 مفتوحة (متاحة)';
            statusEl.className = 'wifi-strength';
            if (checkEl) checkEl.style.display = 'none';
        } else {
            statusEl.innerText = '🔒 محمية (غير مخترقة)';
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
        showNotification('🔒 شبكة محمية', `شبكة ${network} غير مخترقة. استخدم crackwifi ${network}`, 'error');
    }
}

function connectWifi(network) {
    // محاكاة الاتصال المباشر (للشبكات المفتوحة)
    selectWifi(network);
}

// ===== تسجيل الدخول والتمهيد (نفس السابق) =====
function handleLogin(event) { /* ... */ }
function updateClock() { /* ... */ }
function resetGame() { /* ... */ }

// ===== حفظ الحالة =====
function saveState() {
    try { localStorage.setItem('nexusState', JSON.stringify(state)); } catch(e) {}
}
function loadState() {
    try {
        const saved = localStorage.getItem('nexusState');
        if (saved) Object.assign(state, JSON.parse(saved));
    } catch(e) {}
}

// ===== التهيئة =====
window.addEventListener('DOMContentLoaded', () => {
    audioSystem.init();
    loadState();
    // محاكاة BIOS
    setTimeout(() => {
        document.getElementById('bootBarFill').style.width = '100%';
        document.getElementById('bootContinueBtn').style.display = 'block';
    }, 2000);
    document.getElementById('bootContinueBtn').addEventListener('click', () => {
        audioSystem.playSuccess();
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        // تعبئة بيانات الدخول
        document.getElementById('loginUser').value = state.username;
        document.getElementById('loginPass').value = state.password;
    });
});
