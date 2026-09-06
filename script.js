// ============================================================
//  NEXUS: الجدار المكسور - الإصدار النصي
//  نظام ملفات افتراضي، أوامر متفاعلة، حالة عالمية
// ============================================================

// ---------- نظام الصوت (اختياري) ----------
const AudioSystem = {
    ctx: null,
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    playKey() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.06;
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
            gain.gain.value = 0.08;
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
        gain.gain.value = 0.1;
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.3);
    }
};

// ---------- نظام الملفات الافتراضي ----------
const fileSystem = {
    '/home/user': {
        'README.md': '# NEXUS Terminal\nمرحباً بك في نظام NEXUS.\nاكتب help لمعرفة الأوامر.',
        'clue.txt': 'القرينة: شبكة NEXUS_CORP تستخدم كلمة مرور ضعيفة جداً.',
        'secret.txt': '🔥 هذا الملف السري يحتوي على: "المفتاح هو 12345678"',
        'report.log': '[2024-01-15] تم اكتشاف محاولة اختراق من IP 192.168.1.45'
    },
    '/etc': {
        'hosts': '127.0.0.1 localhost\n192.168.1.1 gateway.local\n192.168.1.100 nexus-server.local',
        'passwd': 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash'
    },
    '/var/log': {
        'syslog': 'NEXUS system initialized.\nAll services running normally.'
    }
};

// ---------- الحالة العامة ----------
const state = {
    username: 'admin',
    level: 1,
    money: 1000,
    cpu: 0,
    wanted: 0,
    inventory: [],
    networks: {
        'NEXUS_CORP': { discovered: false, cracked: false, password: '12345678' },
        'PUBLIC_WIFI': { discovered: false, cracked: true, password: '' },
        'DARK_NET': { discovered: false, cracked: false, password: 'dark2024' }
    },
    tasks: [
        { id: 1, title: 'اكتشاف شبكة NEXUS_CORP', desc: 'استخدم أمر scan لمسح الشبكة', reward: 200, status: 'pending' },
        { id: 2, title: 'اختراق شبكة NEXUS_CORP', desc: 'استخدم crack NEXUS_CORP', reward: 500, status: 'pending' },
        { id: 3, title: 'قراءة الملف السري', desc: 'استخدم cat secret.txt في مجلد /home/user', reward: 300, status: 'pending' }
    ],
    logs: []
};

let currentPath = '/home/user';

// ---------- دوال مساعدة ----------
function updateHUD() {
    document.getElementById('hud-level').textContent = state.level;
    document.getElementById('hud-money').textContent = state.money;
    document.getElementById('hud-cpu').textContent = Math.min(state.cpu, 100);
    document.getElementById('hud-wanted').textContent = state.wanted;
}

function addLog(msg) {
    state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function addCPU(amount) {
    state.cpu = Math.min(state.cpu + amount, 100);
    updateHUD();
    if (state.cpu >= 100) {
        showNotification('⚠️ ارتفاع الحرارة!', 'تعطل النظام مؤقتاً. انتظر 5 ثوان.', 'error');
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
    updateHUD();
}

function updateTaskStatus(taskId, status) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = status;
        if (status === 'completed') {
            addMoney(task.reward);
            showNotification(`✅ مهمة مكتملة: ${task.title}`, `+${task.reward} دولار`, 'success');
            AudioSystem.playSuccess();
        }
    }
}

function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notifications');
    const el = document.createElement('div');
    el.className = 'notification';
    const colors = {
        success: '#2ed573',
        error: '#ff4757',
        warning: '#ffa502',
        info: '#00ffcc'
    };
    el.style.borderRightColor = colors[type] || '#00ffcc';
    el.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// ---------- عرض المحطة ----------
function printTerminal(text, type = 'output') {
    const output = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function printPrompt(cmd) {
    printTerminal(`<span class="prompt">$</span> <span class="cmd">${cmd}</span>`, 'cmd');
}

function printOutput(text, cls = 'output') {
    printTerminal(`<span class="${cls}">${text}</span>`, cls);
}

// ---------- تنفيذ الأوامر ----------
function executeCommand(input) {
    const parts = input.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let result = '';

    AudioSystem.playKey();

    switch (cmd) {
        // ---------- المساعدة ----------
        case 'help':
            result = `الأوامر المتاحة:
  help, ls, cd [path], cat [file], clear, whoami
  scan, crack [network], tasks, status, money`;
            printOutput(result);
            break;

        // ---------- عرض الملفات ----------
        case 'ls':
            const files = fileSystem[currentPath] || {};
            const list = Object.keys(files);
            if (list.length) {
                printOutput(list.join('  '));
            } else {
                printOutput('المجلد فارغ', 'error');
            }
            break;

        // ---------- التنقل بين المجلدات ----------
        case 'cd':
            if (!args[0]) {
                printOutput('استخدام: cd [path]', 'error');
                break;
            }
            const target = args[0];
            if (target === '..') {
                const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                if (fileSystem[newPath]) {
                    currentPath = newPath;
                    printOutput(`→ ${currentPath}`);
                } else {
                    printOutput('مسار غير موجود', 'error');
                }
            } else {
                const newPath = currentPath === '/' ? '/' + target : currentPath + '/' + target;
                if (fileSystem[newPath]) {
                    currentPath = newPath;
                    printOutput(`→ ${currentPath}`);
                } else {
                    printOutput('مجلد غير موجود', 'error');
                }
            }
            break;

        // ---------- قراءة الملف ----------
        case 'cat':
            if (!args[0]) {
                printOutput('استخدام: cat [file]', 'error');
                break;
            }
            const fileContent = fileSystem[currentPath]?.[args[0]];
            if (fileContent) {
                printOutput(fileContent);
                // المهمة 3: قراءة secret.txt
                if (args[0] === 'secret.txt' && currentPath === '/home/user') {
                    updateTaskStatus(3, 'completed');
                }
            } else {
                printOutput(`الملف '${args[0]}' غير موجود`, 'error');
            }
            break;

        // ---------- مسح الشاشة ----------
        case 'clear':
            document.getElementById('terminal-output').innerHTML = '';
            break;

        // ---------- من أنا ----------
        case 'whoami':
            printOutput(state.username);
            break;

        // ---------- مسح الشبكة ----------
        case 'scan':
            addCPU(15);
            printOutput('🔍 جارٍ مسح الشبكة...');
            setTimeout(() => {
                let discovered = false;
                for (let net in state.networks) {
                    if (!state.networks[net].discovered) {
                        state.networks[net].discovered = true;
                        discovered = true;
                        printOutput(`✅ تم اكتشاف الشبكة: ${net}`);
                        // المهمة 1
                        if (net === 'NEXUS_CORP') {
                            updateTaskStatus(1, 'completed');
                        }
                    }
                }
                if (!discovered) {
                    printOutput('لا توجد شبكات جديدة.', 'info');
                }
            }, 500);
            break;

        // ---------- اختراق الشبكة ----------
        case 'crack':
            if (!args[0]) {
                printOutput('استخدام: crack [network]', 'error');
                break;
            }
            const targetNet = args[0];
            const netInfo = state.networks[targetNet];
            if (!netInfo) {
                printOutput(`الشبكة '${targetNet}' غير معروفة. استخدم scan أولاً.`, 'error');
                break;
            }
            if (!netInfo.discovered) {
                printOutput(`الشبكة '${targetNet}' غير مكتشفة. استخدم scan أولاً.`, 'error');
                break;
            }
            if (netInfo.cracked) {
                printOutput(`✅ الشبكة '${targetNet}' مخترقة بالفعل.`, 'success');
                break;
            }
            // محاكاة اختراق
            addCPU(20);
            printOutput(`🔓 جارٍ اختراق ${targetNet}...`);
            setTimeout(() => {
                // قاموس كلمات مرور بسيط
                const dict = ['12345678', 'password', 'admin', '00000000', 'letmein', 'qwerty'];
                const found = dict.some(pwd => pwd === netInfo.password);
                if (found) {
                    netInfo.cracked = true;
                    printOutput(`✅ اختراق ناجح! مفتاح الشبكة: ${netInfo.password}`, 'success');
                    AudioSystem.playSuccess();
                    // المهمة 2
                    if (targetNet === 'NEXUS_CORP') {
                        updateTaskStatus(2, 'completed');
                    }
                } else {
                    printOutput(`❌ فشل اختراق ${targetNet}. حاول مجدداً.`, 'error');
                    addWanted(1);
                    AudioSystem.playError();
                }
            }, 800);
            break;

        // ---------- عرض المهام ----------
        case 'tasks':
            let taskList = '📋 قائمة المهام:\n';
            state.tasks.forEach(t => {
                const status = t.status === 'completed' ? '✅' : '⏳';
                taskList += `  ${status} ${t.title} (${t.reward}$)\n`;
            });
            printOutput(taskList);
            break;

        // ---------- الحالة ----------
        case 'status':
            const info = `👤 المستخدم: ${state.username}
💰 الرصيد: ${state.money}$
🔥 الحرارة: ${state.cpu}%
🚨 المطاردة: ${state.wanted}/5
📁 المسار: ${currentPath}
📦 المخزون: ${state.inventory.length ? state.inventory.join(', ') : 'فارغ'}`;
            printOutput(info);
            break;

        // ---------- المال (غش) ----------
        case 'money':
            if (args[0] === 'add') {
                const amt = parseInt(args[1]) || 100;
                addMoney(amt);
                printOutput(`+${amt} دولار`, 'success');
            } else {
                printOutput(`الرصيد: ${state.money}$`);
            }
            break;

        // ---------- أوامر غير معروفة ----------
        default:
            printOutput(`أمر غير معروف: ${cmd}. اكتب help.`, 'error');
            addWanted(0.5);
            AudioSystem.playError();
            break;
    }
}

// ---------- معالجة الإدخال ----------
function handleCommand() {
    const input = document.getElementById('terminal-input');
    const cmd = input.value.trim();
    if (!cmd) return;
    printPrompt(cmd);
    executeCommand(cmd);
    input.value = '';
    // حفظ الحالة
    saveState();
}

// ---------- أوامر سريعة ----------
function quickCmd(cmd) {
    const input = document.getElementById('terminal-input');
    input.value = cmd;
    handleCommand();
    input.focus();
}

// ---------- تشغيل المحطة ----------
function initTerminal() {
    const input = document.getElementById('terminal-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCommand();
        }
    });
    // بداية الترحيب
    printOutput('█ NEXUS Terminal v3.0');
    printOutput('اكتب help لبدء رحلتك.');
    printOutput(`المستخدم: ${state.username} | المسار: ${currentPath}`);
}

// ---------- حفظ و تحميل ----------
function saveState() {
    try {
        localStorage.setItem('nexusState', JSON.stringify(state));
    } catch(e) {}
}

function loadState() {
    try {
        const saved = localStorage.getItem('nexusState');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        }
    } catch(e) {}
}

// ---------- بدء اللعبة ----------
function startGame() {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    loadState();
    updateHUD();
    initTerminal();
    // تنبيه إذا كانت هناك مهام معلقة
    const pending = state.tasks.filter(t => t.status === 'pending');
    if (pending.length) {
        setTimeout(() => {
            showNotification('📋 مهام جديدة', `لديك ${pending.length} مهمة معلقة. اكتب tasks.`, 'info');
        }, 500);
    }
}

// ---------- تمهيد BIOS ----------
window.addEventListener('DOMContentLoaded', () => {
    AudioSystem.init();
    let progress = 0;
    const bar = document.getElementById('bootBar');
    const btn = document.getElementById('bootBtn');
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            bar.style.width = '100%';
            btn.style.display = 'inline-block';
        }
        bar.style.width = Math.min(progress, 100) + '%';
    }, 200);
});

// ---------- إغلاق الإشعارات ----------
document.addEventListener('click', (e) => {
    if (e.target.closest('.notification')) {
        e.target.closest('.notification').remove();
    }
});
