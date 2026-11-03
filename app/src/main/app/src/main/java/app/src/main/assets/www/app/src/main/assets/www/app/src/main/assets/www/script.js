function openScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if(screenId === 'trainer-screen') {
        initCanvas();
    }
}

// SIMULADOR AIMBOT E TREINAMENTO DE HEADSHOTS
const canvas = document.getElementById('aimCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let totalShots = 0;
let headshots = 0;
let aimbotActive = false;
let headlockMode = false;
let trackingSpeed = 0.08;

let target = {
    x: 100,
    y: 100,
    radius: 40,
    headRadius: 15,
    dx: 2,
    dy: 2
};

function initCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    resetTarget();
}

function resetTarget() {
    target.x = Math.random() * (canvas.width - 80) + 40;
    target.y = Math.random() * (canvas.height - 120) + 60;
    target.dx = (Math.random() - 0.5) * 4;
    target.dy = (Math.random() - 0.5) * 4;
}

function toggleAimbot() {
    aimbotActive = !aimbotActive;
    const btn = document.getElementById('toggle-aimbot');
    btn.innerText = aimbotActive ? "Aimbot: ON (Simulador)" : "Aimbot: OFF";
    btn.style.borderColor = aimbotActive ? "#00ffcc" : "#a855f7";
}

function updateSpeed(val) {
    document.getElementById('speed-val').innerText = val;
    trackingSpeed = val * 0.015;
}

function updatePrec(val) {
    document.getElementById('prec-val').innerText = val;
}

function activateHeadlockMode() {
    headlockMode = true;
    aimbotActive = true;
    document.getElementById('toggle-aimbot').innerText = "Headlock Mode: ON";
}

// Loop do Simulador
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Movimentação do Alvo (Simulando o oponente)
    target.x += target.dx;
    target.y += target.dy;

    if (target.x < 40 || target.x > canvas.width - 40) target.dx *= -1;
    if (target.y < 60 || target.y > canvas.height - 60) target.dy *= -1;

    // Lógica do Aimbot / Headlock simulado próprio
    if (aimbotActive) {
        // Posição da cabeça (região superior do alvo)
        let headX = target.x;
        let headY = target.y - 15;
        
        // Puxada suave simulada em direção à cabeça
        if (touchX && touchY) {
            touchX += (headX - touchX) * trackingSpeed;
            touchY += (headY - touchY) * trackingSpeed;
        }
    }

    // Renderizar Alvo (Corpo)
    ctx.fillStyle = '#1e1e2f';
    ctx.beginPath();
    ctx.arc(target.x, target.y + 10, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Renderizar Região da Cabeça (Prioridade Headshot)
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(target.x, target.y - 15, target.headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Renderizar Mira do Usuário / Toque
    if (touchX && touchY) {
        ctx.strokeStyle = headlockMode ? '#00ffcc' : '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(touchX, touchY, 10, 0, Math.PI * 2);
        ctx.moveTo(touchX - 15, touchY); ctx.lineTo(touchX + 15, touchY);
        ctx.moveTo(touchX, touchY - 15); ctx.lineTo(touchX, touchY + 15);
        ctx.stroke();
    }

    requestAnimationFrame(update);
}

let touchX = null;
let touchY = null;

canvas.addEventListener('touchstart', (e) => {
    handleTouch(e);
});

canvas.addEventListener('touchmove', (e) => {
    handleTouch(e);
});

function handleTouch(e) {
    const rect = canvas.getBoundingClientRect();
    touchX = e.touches[0].clientX - rect.left;
    touchY = e.touches[0].clientY - rect.top;
    
    // Verificar colisão de tiro
    let distX = touchX - target.x;
    let distYHead = touchY - (target.y - 15);
    let distBody = Math.sqrt(distX * distX + distYHead * distYHead);

    totalShots++;
    if (distBody < target.headRadius + 10) {
        headshots++;
        score += 100;
        resetTarget();
    }
    
    let hsPercent = totalShots > 0 ? Math.round((headshots / totalShots) * 100) : 0;
    document.getElementById('score-board').innerText = `Pontos: ${score} | HS: ${hsPercent}%`;
    document.getElementById('stat-trainings').innerText = Math.floor(totalShots / 10) + 1;
    document.getElementById('stat-hs').innerText = hsPercent;
}

// Iniciar loop de animação
requestAnimationFrame(update);
