// ========== حالة النظام والبيانات ==========
let systemState = {
    currentIp: '192.168.1.15',
    targetIp: '10.10.10.45',
    msfContext: false,
    activeModule: null,
    files: {
        '/root': ['passwords.txt', 'network_map.json', 'exploit.py'],
        '/root/loot': ['bank_credentials.csv', 'db_dump.sql']
    }
};

// ========== تشغيل النظام والإقلاع ==========
window.onload = function() {
    let progress = 0;
    const bar = document.getElementById('bootBar');
    const status = document.getElementById('bootStatus');
    const btn = document.getElementById('bootBtn');

    const bootInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(bootInterval);
            status.innerText = "System Ready. Welcome to Kali Linux.";
            btn.style.display = "inline-block";
        }
        bar.style.width = progress + '%';
    }, 150);

    setInterval(updateClock, 1000);
};

function startOS() {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    openWindow('terminal');
    notify('KALI OS INITIALIZED', 'Connected to secure interface', 'info');
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    document.getElementById('panelClock').innerText = timeStr;
}

function toggleAppMenu() {
    const menu = document.getElementById('app-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function notify(title, message, type = 'info') {
    const area = document.getElementById('notification-area');
    const notif = document.createElement('div');
    notif.className = 'kali-notif';
    if(type === 'alert') notif.style.borderLeftColor = 'var(--kali-red)';
    notif.innerHTML = `<strong>${title}</strong><br><span style="color:var(--text-muted);">${message}</span>`;
    area.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
}

// ========== نظام إدارة النوافذ ==========
function openWindow(id) {
    const container = document.getElementById('windows-container');
    const existing = document.getElementById(`win-${id}`);
    if (existing) { existing.style.zIndex = Date.now() % 1000 + 100; return; }

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.left = (10 + Math.random() * 10) + '%';
    win.style.top = (10 + Math.random() * 10) + '%';
    win.style.zIndex = Date.now() % 1000 + 100;

    let title = 'Terminal';
    let bodyContent = '';

    if (id === 'terminal') {
        title = 'root@kali:~';
        bodyContent = getTerminalHTML();
    } else if (id === 'files') {
        title = 'File Manager - /root';
        bodyContent = getFilesHTML();
    } else {
        title = id.toUpperCase();
        bodyContent = `<div style="padding:20px;">Application [${id}] is running.</div>`;
    }

    win.innerHTML = `
        <div class="window-header">
            <div class="window-title"><i class="fas fa-terminal"></i> ${title}</div>
            <div class="window-controls">
                <button class="win-btn win-min"></button>
                <button class="win-btn win-max"></button>
                <button class="win-btn win-close" onclick="closeWindow('${id}')"></button>
            </div>
        </div>
        <div class="window-body">${bodyContent}</div>
    `;

    container.appendChild(win);
    makeDraggable(win);
    if(id === 'terminal') initTerminal();
}

function closeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) win.remove();
}

function makeDraggable(win) {
    const header = win.querySelector('.window-header');
    let isDragging = false, x = 0, y = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('win-btn')) return;
        isDragging = true;
        x = e.clientX - win.offsetLeft;
        y = e.clientY - win.offsetTop;
        win.style.zIndex = Date.now() % 1000 + 100;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        win.style.left = (e.clientX - x) + 'px';
        win.style.top = (e.clientY - y) + 'px';
    });

    document.addEventListener('mouseup', () => isDragging = false);
}

// ========== محاكي أدوات الاختراق والـ CLI ==========
function openTool(toolName) {
    document.getElementById('app-menu').style.display = 'none';
    openWindow('terminal');
    setTimeout(() => {
        const input = document.getElementById('termInput');
        if (!input) return;
        if (toolName === 'msf') input.value = 'msfconsole';
        else if (toolName === 'nmap') input.value = 'nmap -sV 10.10.10.45';
        else if (toolName === 'nslookup') input.value = 'nslookup target-bank.com';
        else if (toolName === 'hydra') input.value = 'hydra -l admin -P pass.txt 10.10.10.45 ssh';
        
        handleCommandExecution(input.value);
        input.value = '';
    }, 200);
}

function getTerminalHTML() {
    return `
        <div class="terminal-container" id="termContainer">
            <div class="term-output" id="termOutput">┌──(root㉿kali)-[/root]\n└─# Type 'help' to view available hacking suites.\n</div>
            <div class="term-line">
                <span class="term-prompt" id="termPrompt">┌──(root㉿kali)-[/root]\n└─#</span>
                <input type="text" class="term-input" id="termInput" autofocus spellcheck="false" autocomplete="off">
            </div>
        </div>
    `;
}

function initTerminal() {
    const input = document.getElementById('termInput');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            input.value = '';
            handleCommandExecution(cmd);
        }
    });
}

function handleCommandExecution(cmd) {
    const output = document.getElementById('termOutput');
    const prompt = document.getElementById('termPrompt');
    if (!output) return;

    output.innerText += `\n${prompt.innerText} ${cmd}\n`;
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();
    let res = '';

    if (systemState.msfContext) {
        // إدارة أوامر Metasploit الداخلي
        if (cmd === 'exit') {
            systemState.msfContext = false;
            prompt.innerText = `┌──(root㉿kali)-[/root]\n└─#`;
            res = '[*] Exiting Metasploit Framework.';
        } else if (cmd.startsWith('use ')) {
            systemState.activeModule = parts[1];
            prompt.innerText = `msf6 exploit(${parts[1].split('/').pop()}) >`;
            res = `[*] Using module: ${parts[1]}`;
        } else if (cmd === 'run' || cmd === 'exploit') {
            res = `[*] Started reverse TCP handler on ${systemState.currentIp}:4444\n[*] Sending stage (175394 bytes) to ${systemState.targetIp}\n[+] Meterpreter session 1 opened! Command shell ready.\ntype 'shell' to interact.`;
            notify('EXPLOIT SUCCESS', 'Meterpreter session opened!', 'alert');
        } else {
            res = `msf6 > Unknown command. Try: 'use exploit/multi/samba/usermap_script', 'run', or 'exit'.`;
        }
    } else {
        // إدارة أوامر Linux الأساسية والأدوات
        switch (main) {
            case 'help':
                res = `KALI LINUX TOOLS SUITE:\n  nmap [ip]         : Network Mapper & Port Inspection\n  msfconsole        : Launch Metasploit Framework\n  nslookup [domain] : DNS Query & IP Lookup\n  hydra [args]      : Network Logon Cracker\n  ls / cat / clear  : Standard Linux File Utility`;
                break;

            case 'msfconsole':
                systemState.msfContext = true;
                prompt.innerText = `msf6 >`;
                res = `\n      :_____  :___               \n     _____||    ||     ||      \n    Metasploit Framework v6.3.2\n\nType 'use exploit/...' or 'help'.`;
                break;

            case 'nmap':
                const target = parts[1] || systemState.targetIp;
                res = `Starting Nmap 7.93 ( https://nmap.org )\nNmap scan report for ${target}\nHost is up (0.012s latency).\nPORT     STATE SERVICE VERSION\n21/tcp   open  ftp     vsftpd 2.3.4\n22/tcp   open  ssh     OpenSSH 4.7p1\n80/tcp   open  http    Apache httpd 2.2.8\nMAC Address: 00:50:56:C0:00:08`;
                break;

            case 'nslookup':
                const domain = parts[1] || 'target-bank.com';
                res = `Server:		192.168.1.1\nAddress:	192.168.1.1#53\n\nName:	${domain}\nAddress: 10.10.10.45`;
                break;

            case 'hydra':
                res = `Hydra v9.4 (c) 2022 by van Hauser/THC\n[DATA] attacking ssh://10.10.10.45:22/\n[22][ssh] host: 10.10.10.45   login: admin   password: shadow32\n1 target successfully cracked.`;
                notify('HYDRA CRACKED', 'Password found: shadow32', 'alert');
                break;

            case 'ls':
                res = systemState.files['/root'].join('   ');
                break;

            case 'clear':
                output.innerText = '';
                return;

            default:
                res = `bash: ${main}: command not found. Type 'help'.`;
                break;
        }
    }

    output.innerText += res + '\n';
    const container = document.getElementById('termContainer');
    if (container) container.scrollTop = container.scrollHeight;
}

function getFilesHTML() {
    return `
        <div style="padding:15px; font-size:12px;">
            <div style="color:var(--kali-blue); margin-bottom:10px;">Directory: /root</div>
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
                ${systemState.files['/root'].map(f => `
                    <div style="background:var(--kali-panel); padding:8px; border:1px solid var(--border-color); border-radius:4px;">
                        <i class="fas fa-file-code" style="color:var(--kali-cyan);"></i> ${f}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
