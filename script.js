// ========== الحالة العامة للعبة ==========
let state = {
    cpu: 0,
    wanted: 0,
    money: 2500,
    inventory: ['Basic Sniffer'],
    name: 'العميل 0X',
    username: 'admin',
    password: '1234',
    wallpaper: 'radial-gradient(circle at 50% 50%, #0d1726 0%, #03060d 100%)',
    currentWifi: 'DARK_NET',
    nodes: [
        { ip: '192.168.1.1', name: 'الموجه الرئيسي (Router)', status: 'LOCKED', ports: [80] },
        { ip: '192.168.1.45', name: 'خادم البنك (Bank Server)', status: 'PROTECTED', ports: [22, 443] },
        { ip: '192.168.1.99', name: 'كاميرات المراقبة (CCTV)', status: 'OPEN', ports: [8080] }
    ]
};

// نظام الملفات الشبيه بـ Linux/Unix
const fileSystem = {
    '/home/admin': {
        'targets.txt': 'الهدف القادم: خادم البنك 192.168.1.45 - افتح منفذ 22 لاستخراج البيانات.',
        'exploit.py': 'أداة لاستغلال ثغرات SSH المعطلة.'
    },
    '/var/log': {
        'syslog': '127.0.0.1 [AUTHENTICATED]\n192.168.1.45 [CONNECTION FAILED]'
    }
};
let currentPath = '/home/admin';

// ========== تحديث الواجهة والـ Metrics ==========
function updateUI() {
    const cpuEl = document.getElementById('cpuValue');
    const wantedEl = document.getElementById('wantedValue');
    const wifiEl = document.getElementById('wifiStatus');

    if (cpuEl) cpuEl.innerText = Math.min(state.cpu, 100);
    if (wantedEl) wantedEl.innerText = state.wanted;
    if (wifiEl) wifiEl.innerText = state.currentWifi;
}

function showNotification(title, body, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.borderRightColor = type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--accent-red)' : 'var(--accent-cyan)';
    notif.innerHTML = `<strong>${title}</strong><br>${body}`;
    container.appendChild(notif);
    
    setTimeout(() => { if (notif.parentNode) notif.remove(); }, 4000);
}

// ========== نظام تحريك النوافذ (Draggable Windows) ==========
function makeDraggable(el) {
    let isDragging = false, offsetX = 0, offsetY = 0;
    const header = el.querySelector('.window-header');
    if (!header) return;

    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
        el.style.zIndex = Date.now() % 1000 + 100;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        el.style.left = (e.clientX - offsetX) + 'px';
        el.style.top = (e.clientY - offsetY) + 'px';
        el.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
}

// ========== فتح وإدارة النوافذ ==========
function openWindow(id) {
    const container = document.getElementById('windows-container');
    if (!container) return;

    const existing = document.getElementById(`win-${id}`);
    if (existing) { 
        existing.style.zIndex = Date.now() % 1000 + 100; 
        return; 
    }

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.zIndex = Date.now() % 1000 + 100;
    win.style.left = (15 + Math.random() * 5) + '%';
    win.style.top = (10 + Math.random() * 5) + '%';

    const titles = { 
        terminal: 'CONSOLE // TERMINAL', 
        files: 'SYSTEM // FILESYSTEM', 
        nodes: 'NETWORK // SCANNER', 
        cctv: 'SURVEILLANCE // CCTV' 
    };
    
    let content = '';
    switch (id) {
        case 'terminal': content = getTerminalHTML(); break;
        case 'files': content = getFilesHTML(); break;
        case 'nodes': content = getNodesHTML(); break;
        case 'cctv': content = getCCTVHTML(); break;
        default: content = '<p style="padding:10px;">التطبيق قيد الصيانة...</p>';
    }

    win.innerHTML = `
        <div class="window-header">
            <h3><i class="fas fa-terminal"></i> ${titles[id] || 'APP'}</h3>
            <button class="win-close" onclick="closeWindow('${id}')">✕</button>
        </div>
        <div class="window-body">${content}</div>
    `;
    container.appendChild(win);
    makeDraggable(win);

    if (id === 'terminal') setTimeout(initTerminal, 100);
}

function closeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) win.remove();
}

// ========== محاكاة أجهزة الكاميرا (CCTV) ==========
function getCCTVHTML() {
    return `
        <div class="cctv-grid">
            <div class="cctv-feed"><span style="color:var(--text-dim); font-size:11px;">CAM_01 - MAIN ENTRANCE</span></div>
            <div class="cctv-feed"><span style="color:var(--text-dim); font-size:11px;">CAM_02 - SERVER ROOM</span></div>
        </div>
    `;
}

// ========== قائمة الشبكات المكتشفة ==========
function getNodesHTML() {
    return `
        <div style="font-size:12px;">
            <p style="margin-bottom:10px; color:var(--accent-cyan);">الأجهزة المتصلة بالشبكة الحالية:</p>
            ${state.nodes.map(n => `
                <div style="background:#050912; padding:10px; margin-bottom:8px; border:1px solid var(--border-color); border-radius:4px;">
                    <strong>${n.name}</strong> (${n.ip})<br>
                    <small style="color:var(--text-dim);">المنافذ: ${n.ports.join(', ')} | الحالة: ${n.status}</small>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== محاكي الطرفية والـ Commands ==========
function getTerminalHTML() {
    return `
        <div class="terminal-body" id="terminalBody">
            <div class="terminal-output" id="terminalOutput">NEXUS OS v4.0.2 [Kernel Core Loaded]\nType 'help' or 'scan' to inspect network targets.\n</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">root@nexus:~$</span>
                <input type="text" class="terminal-input" id="terminalInput" autofocus spellcheck="false" autocomplete="off">
            </div>
            <div class="quick-commands">
                <button onclick="quickCmd('help')">help</button>
                <button onclick="quickCmd('scan')">scan</button>
                <button onclick="quickCmd('ls')">ls</button>
                <button onclick="quickCmd('logcleaner')">logcleaner</button>
                <button onclick="quickCmd('clear')">clear</button>
            </div>
        </div>
    `;
}

function quickCmd(cmd) {
    const input = document.getElementById('terminalInput');
    if (input) { 
        input.value = cmd; 
        executeCommand(cmd); 
    }
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
    }
}

function executeCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    output.innerText += `\nroot@nexus:~$ ${cmd}`;

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const target = parts[1];
    let response = '';

    switch (mainCmd) {
        case 'help':
            response = `AVAILABLE COMMANDS:\n  scan               : Mass scan local nodes\n  bruteforce [ip]    : Attempt SSH handshake breach\n  logcleaner         : Flush active trace logs\n  ls                 : List filesystem\n  cat [file]         : Read file data\n  clear              : Reset terminal screen`;
            break;

        case 'scan':
            state.cpu = Math.min(state.cpu + 15, 100);
            response = `[+] Initiating Network Sweep...\n[+] Found 3 Active Nodes:\n    - 192.168.1.1 (Router)\n    - 192.168.1.45 (Bank Server) [PORT 22 OPEN]\n    - 192.168.1.99 (CCTV Node)`;
            showNotification('SYSTEM SCAN', 'تم العثور على أجهزة جديدة على الشبكة.', 'info');
            break;

        case 'bruteforce':
            if (!target) {
                response = `Usage: bruteforce [target_ip]`;
            } else if (target === '192.168.1.45') {
                state.cpu = Math.min(state.cpu + 40, 100);
                state.money += 1000;
                response = `[*] Bypassing SSH Encryption...\n[+] PASS KEY FOUND: 'admin_root_99'\n[+] Access Granted! Extracted $1000 BTC.`;
                showNotification('EXPLOIT SUCCESS', 'تم اختراق الخادم وتحويل الرصيد!', 'success');
            } else {
                response = `[-] Failed to establish exploit chain on ${target}`;
            }
            break;

        case 'logcleaner':
            state.wanted = Math.max(state.wanted - 2, 0);
            response = `[+] Logs scrubbed from remote targets. Wanted status lowered.`;
            break;

        case 'ls':
            const files = Object.keys(fileSystem[currentPath] || {});
            response = files.join('   ');
            break;

        case 'cat':
            if (!target) { 
                response = 'Usage: cat [file]'; 
                break; 
            }
            response = fileSystem[currentPath]?.[target] || 'File not found.';
            break;

        case 'clear':
            output.innerText = '';
            return;

        default:
            response = `Command not recognized: '${mainCmd}'. Type 'help'.`;
            break;
    }

    output.innerText += `\n${response}\n`;
    output.scrollTop = output.scrollHeight;
    updateUI();
}

function getFilesHTML() {
    const files = Object.keys(fileSystem[currentPath] || {});
    return `
        <div style="font-size:12px;">
            <p style="color:var(--accent-cyan); margin-bottom:10px;">المسار الحالي: ${currentPath}</p>
            ${files.map(f => `<div style="padding:6px; background:#050912; margin-bottom:4px; border:1px solid var(--border-color);">📄 ${f}</div>`).join('')}
        </div>
    `;
}

// ========== التشغيل والتحميل الأول ==========
window.onload = function() {
    const bootScreen = document.getElementById('boot-screen');
    const loginScreen = document.getElementById('login-screen');
    const bar = document.getElementById('bootBarFill');
    const btn = document.getElementById('bootContinueBtn');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            if (bar) bar.style.width = '100%';
            if (btn) {
                btn.style.display = 'block';
                btn.onclick = () => {
                    if (bootScreen) bootScreen.style.display = 'none';
                    if (loginScreen) loginScreen.style.display = 'flex';
                };
            }
        } else {
            if (bar) bar.style.width = progress + '%';
        }
    }, 200);
};

function handleLogin(e) {
    e.preventDefault();
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (desktop) desktop.style.display = 'block';
    
    updateUI();
    showNotification('SYSTEM READY', 'أهلاً بك في بيئة NEXUS.', 'success');
    openWindow('terminal');
    return false;
}
