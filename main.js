const canvas = document.getElementById('bloodCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class BloodParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = `rgba(${140 + Math.random() * 60}, ${Math.random() * 30}, ${Math.random() * 20}, ${this.opacity})`;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class BloodDrip {
    constructor(x, width) {
        this.x = x;
        this.y = 0;
        this.width = width;
        this.height = Math.random() * 80 + 40;
        this.speed = Math.random() * 1 + 0.3;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.accumulated = 0;
        this.dripping = false;
        this.dripSpeed = 0;
        this.pauseTimer = Math.random() * 200;
    }

    update() {
        if (!this.dripping) {
            this.accumulated += this.speed * 0.1;
            if (this.accumulated > this.height) {
                this.dripping = true;
                this.dripSpeed = Math.random() * 2 + 1;
            }
        } else {
            this.y += this.dripSpeed;
            if (this.y > canvas.height) {
                this.y = 0;
                this.accumulated = 0;
                this.dripping = false;
            }
        }
        
        this.pauseTimer--;
        if (this.pauseTimer <= 0) {
            this.pauseTimer = Math.random() * 300 + 100;
            this.speed = Math.random() * 1 + 0.3;
        }
    }

    draw() {
        const gradient = ctx.createLinearGradient(this.x, 0, this.x, this.y + this.accumulated);
        gradient.addColorStop(0, `rgba(80, 0, 0, 0)`);
        gradient.addColorStop(0.1, `rgba(120, 0, 0, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(160, 0, 0, ${this.opacity * 1.2})`);
        gradient.addColorStop(1, `rgba(200, 20, 20, ${this.opacity * 0.8})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width / 2, 0, this.width, this.y + this.accumulated);
        
        if (this.dripping) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

const particles = [];
const drips = [];

for (let i = 0; i < 60; i++) {
    particles.push(new BloodParticle());
}

for (let i = 0; i < 25; i++) {
    drips.push(new BloodDrip(
        Math.random() * canvas.width,
        Math.random() * 4 + 2
    ));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(5, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    drips.forEach(d => {
        d.update();
        d.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();

let bgMusic = null;
let jumpscareSound = null;
let isChallengeActive = false;
let challengeTimer = null;
let timeLeft = 10;
const TARGET = 'START';
let typedIndex = 0;
let currentLevel = 1;
let safeClicks = 0;
const SAFE_CLICKS_NEEDED = 10;
let buttonSpawnTimer = null;

const RIDDLES = [
    {
        lines: [
            "I have no feet, yet I follow your pace.",
            "I have no eyes, yet I know your face.",
            "Turn around... and I will disappear."
        ],
        answer: "SHADOW",
        coloredWordIndices: [4, 6, 4]
    },
    {
        lines: [
            "I only speak when no one else does.",
            "The louder you breathe, the closer I come.",
            "What am I...?"
        ],
        answer: ["SILENCE", "FEAR"],
        coloredWordIndices: [1, 4, 2]
    },
    {
        lines: [
            "The first time you saw me, I wasn't there.",
            "The second time, I smiled.",
            "Don't wait for the third."
        ],
        answer: "REFLECTION",
        coloredWordIndices: [6, 3, 3]
    },
    {
        lines: [
            "I knock without hands.",
            "I enter without doors.",
            "Invite me once, and I never leave."
        ],
        answer: "FEAR",
        coloredWordIndices: [1, 2, 5]
    },
    {
        lines: [
            "I arrive without knocking.",
            "No lock has ever stopped me.",
            "Who waits for everyone?"
        ],
        answer: "DEATH",
        coloredWordIndices: [1, 4, 1]
    }
];

const WIRE_COLORS = ['#ff4444', '#44ff44', '#4488ff', '#ffaa00', '#ff44ff', '#00ffff'];
const WIRE_COLOR_NAMES = {
    '#ff4444': 'RED',
    '#44ff44': 'GREEN',
    '#4488ff': 'BLUE',
    '#ffaa00': 'ORANGE',
    '#ff44ff': 'PURPLE',
    '#00ffff': 'CYAN'
};

let currentRiddle = null;
let wireOrder = [];
let cutCount = 0;
let holdingWire = null;
let holdStartTime = 0;
const HOLD_DURATION = 3000;
let bombTimer = null;
let wireHoldInterval = null;

function initAudio() {
    if (bgMusic) return;
    
    bgMusic = new Audio('Assets/Background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    
    jumpscareSound = new Audio('Assets/Jumpscare Scream 1.mp3');
    jumpscareSound.volume = 0.8;
}

function startBackgroundMusic() {
    if (!bgMusic) initAudio();
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
}

function playJumpscareSound() {
    if (!jumpscareSound) initAudio();
    jumpscareSound.currentTime = 0;
    jumpscareSound.play().catch(() => {});
}

document.getElementById('startBtn').addEventListener('click', () => {
    initAudio();
    startBackgroundMusic();
    
    const landing = document.getElementById('landingContainer');
    landing.classList.add('hidden');
    
    setTimeout(() => {
        startLevel1();
    }, 1500);
});

function showLevelContent(level) {
    const l1 = document.getElementById('level1Content');
    const l2 = document.getElementById('level2Content');
    const l3 = document.getElementById('level3Content');
    const footer = document.querySelector('.challenge-footer');
    
    l1.style.display = level === 1 ? 'flex' : 'none';
    l2.style.display = level === 2 ? 'flex' : 'none';
    l3.style.display = level === 3 ? 'flex' : 'none';
    
    if (footer) {
        footer.style.display = (level === 1 || level === 2) ? 'flex' : 'none';
    }
}

function startLevel1() {
    currentLevel = 1;
    const challengeScreen = document.getElementById('challengeScreen');
    const lettersContainer = document.getElementById('lettersContainer');
    const typedLetters = document.getElementById('typedLetters');
    const timerFill = document.getElementById('globalTimerFill');
    const hint = document.getElementById('challengeHintGlobal');
    const title = document.getElementById('challengeTitle');
    
    title.textContent = 'TYPE START QUICKLY';
    challengeScreen.classList.add('active');
    document.body.classList.add('challenge-active');
    isChallengeActive = true;
    typedIndex = 0;
    timeLeft = 10;
    
    showLevelContent(1);
    
    lettersContainer.innerHTML = '';
    typedLetters.innerHTML = '';
    
    renderTypedLetters();
    
    timerFill.style.width = '100%';
    timerFill.classList.remove('warning');
    hint.textContent = 'You have 10 seconds...';
    hint.style.color = '#666';
    
    challengeTimer = setInterval(() => {
        timeLeft -= 0.1;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(challengeTimer);
            triggerJumpscare('TIME');
            return;
        }
        
        const pct = (timeLeft / 10) * 100;
        timerFill.style.width = pct + '%';
        
        if (timeLeft <= 3) {
            timerFill.classList.add('warning');
            hint.textContent = 'HURRY...';
            hint.style.color = '#c00';
        }
    }, 100);
    
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letters = [];
    
    for (let i = 0; i < 20; i++) {
        letters.push(allLetters[Math.floor(Math.random() * allLetters.length)]);
    }
    
    const targetSequence = TARGET.split('');
    const available = letters.map((_, i) => i);
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }
    const targetIndices = available.slice(0, targetSequence.length);
    targetIndices.forEach((idx, i) => {
        letters[idx] = targetSequence[i];
    });
    
    let hasAllTarget = true;
    for (const char of targetSequence) {
        if (!letters.includes(char)) {
            hasAllTarget = false;
            break;
        }
    }
    
    if (!hasAllTarget) {
        const avail = [];
        for (let i = 0; i < letters.length; i++) {
            if (!targetIndices.includes(i)) avail.push(i);
        }
        const shuffled = avail.sort(() => Math.random() - 0.5);
        let ai = 0;
        for (let i = 0; i < targetSequence.length; i++) {
            if (!letters.includes(targetSequence[i]) && ai < shuffled.length) {
                letters[shuffled[ai]] = targetSequence[i];
                ai++;
            }
        }
    }
    
    requestAnimationFrame(() => {
        const positions = [];
        const padding = 60;
        const maxAttempts = 400;
        const containerRect = lettersContainer.getBoundingClientRect();
        const maxWidth = Math.max(containerRect.width - padding * 2, 200);
        const maxHeight = Math.max(containerRect.height - padding * 2, 200);
        
        for (let i = 0; i < letters.length; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < maxAttempts) {
                attempts++;
                const x = padding + Math.random() * maxWidth;
                const y = padding + Math.random() * maxHeight;
                
                let overlaps = false;
                for (const pos of positions) {
                    const dist = Math.hypot(x - pos.x, y - pos.y);
                    if (dist < 75) {
                        overlaps = true;
                        break;
                    }
                }
                
                if (!overlaps) {
                    positions.push({ x, y, letter: letters[i] });
                    placed = true;
                }
            }
            
            if (!placed) {
                positions.push({
                    x: padding + Math.random() * maxWidth,
                    y: padding + Math.random() * maxHeight,
                    letter: letters[i]
                });
            }
        }
        
        positions.forEach((pos, index) => {
            const el = document.createElement('div');
            el.className = 'floating-letter';
            el.textContent = pos.letter;
            el.style.left = pos.x + 'px';
            el.style.top = pos.y + 'px';
            el.style.animationDelay = (Math.random() * 2) + 's';
            el.dataset.letter = pos.letter;
            el.dataset.index = index;
            
            function handleSelect(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const clickedLetter = el.dataset.letter;
                const expectedLetter = TARGET[typedIndex];
                
                if (clickedLetter === expectedLetter) {
                    el.classList.add('clicked');
                    typedIndex++;
                    renderTypedLetters();
                    
                    if (typedIndex >= TARGET.length) {
                        isChallengeActive = false;
                        clearInterval(challengeTimer);
                        
                        const hint = document.getElementById('challengeHintGlobal');
                        hint.textContent = 'You survived... for now.';
                        hint.style.color = '#8f8';
                        document.body.classList.remove('challenge-active');
                        
                        setTimeout(() => {
                            challengeScreen.classList.remove('active');
                            startLevel2();
                        }, 1500);
                    }
                } else {
                    triggerJumpscare('WRONG');
                }
            }
            
            el.addEventListener('click', handleSelect);
            el.addEventListener('touchstart', handleSelect, { passive: false });
            
            lettersContainer.appendChild(el);
        });
    });
}

function startLevel2() {
    currentLevel = 2;
    const challengeScreen = document.getElementById('challengeScreen');
    const buttonsArena = document.getElementById('buttonsArena');
    const timerFill = document.getElementById('globalTimerFill');
    const hint = document.getElementById('challengeHintGlobal');
    const title = document.getElementById('challengeTitle');
    
    title.textContent = 'DO NOT CLICK THE RED BUTTON';
    challengeScreen.classList.add('active');
    document.body.classList.add('challenge-active');
    isChallengeActive = true;
    safeClicks = 0;
    timeLeft = 15;
    
    showLevelContent(2);
    
    buttonsArena.innerHTML = '';
    
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) scoreDisplay.textContent = 'Clicks: 0 / ' + SAFE_CLICKS_NEEDED;
    
    timerFill.style.width = '100%';
    timerFill.classList.remove('warning');
    hint.textContent = 'Click the safe buttons. Avoid red. 10 needed. 15 seconds!';
    hint.style.color = '#666';
    
    challengeTimer = setInterval(() => {
        timeLeft -= 0.1;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(challengeTimer);
            clearInterval(buttonSpawnTimer);
            triggerJumpscare('TIME');
            return;
        }
        
        const pct = (timeLeft / 15) * 100;
        timerFill.style.width = pct + '%';
        
        if (timeLeft <= 5) {
            timerFill.classList.add('warning');
            hint.textContent = 'HURRY...';
            hint.style.color = '#c00';
        }
    }, 100);
    
    buttonSpawnTimer = setInterval(() => {
        if (!isChallengeActive) return;
        spawnButton();
    }, 800);
    
    spawnButton();
}

function spawnButton() {
    if (!isChallengeActive) return;
    
    const arena = document.getElementById('buttonsArena');
    const arenaRect = arena.getBoundingClientRect();
    const btn = document.createElement('button');
    
    const isRed = Math.random() < 0.25;
    btn.className = 'pop-btn ' + (isRed ? 'red' : 'safe');
    btn.textContent = isRed ? 'RED' : 'SAFE';
    
    const btnSize = 80;
    const maxX = Math.max(arenaRect.width - btnSize, 10);
    const maxY = Math.max(arenaRect.height - btnSize - 40, 10);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    
    function handleBtnClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isRed) {
            triggerJumpscare('WRONG');
        } else {
            safeClicks++;
            const scoreDisplay = document.getElementById('scoreDisplay');
            if (scoreDisplay) {
                scoreDisplay.textContent = 'Clicks: ' + safeClicks + ' / ' + SAFE_CLICKS_NEEDED;
            }
            
            btn.classList.add('fading-out');
            setTimeout(() => {
                if (btn.parentNode) btn.parentNode.removeChild(btn);
            }, 300);
            
            if (safeClicks >= SAFE_CLICKS_NEEDED) {
                isChallengeActive = false;
                clearInterval(challengeTimer);
                clearInterval(buttonSpawnTimer);
                
                const hint = document.getElementById('challengeHintGlobal');
                hint.textContent = 'You survived... for now.';
                hint.style.color = '#8f8';
                document.body.classList.remove('challenge-active');
                
                setTimeout(() => {
                    challengeScreen.classList.remove('active');
                    startLevel3();
                }, 1500);
            }
        }
    }
    
    btn.addEventListener('click', handleBtnClick);
    btn.addEventListener('touchstart', handleBtnClick, { passive: false });
    
    arena.appendChild(btn);
    
    setTimeout(() => {
        if (btn.parentNode && isChallengeActive) {
            btn.classList.add('fading-out');
            setTimeout(() => {
                if (btn.parentNode) btn.parentNode.removeChild(btn);
            }, 300);
        }
    }, 1500);
}

function startLevel3() {
    currentLevel = 3;
    const challengeScreen = document.getElementById('challengeScreen');
    const title = document.getElementById('challengeTitle');
    const timerFill = document.getElementById('timerFill');
    const hint = document.getElementById('challengeHintGlobal');
    
    title.textContent = 'DEFUSE THE BOMB';
    challengeScreen.classList.add('active');
    document.body.classList.add('challenge-active');
    isChallengeActive = true;
    timeLeft = 45;
    cutCount = 0;
    
    showLevelContent(3);
    
    const riddleIndex = Math.floor(Math.random() * RIDDLES.length);
    currentRiddle = RIDDLES[riddleIndex];
    
    const answerArr = Array.isArray(currentRiddle.answer) 
        ? currentRiddle.answer[Math.floor(Math.random() * currentRiddle.answer.length)] 
        : currentRiddle.answer;
    currentRiddle.currentAnswer = answerArr.toUpperCase();
    
    const shuffledColors = [...WIRE_COLORS].sort(() => Math.random() - 0.5);
    window.bombColors = shuffledColors.slice(0, 3);
    
    renderRiddle(window.bombColors);
    renderWires(window.bombColors);
    
    timerFill.style.width = '100%';
    timerFill.classList.remove('warning');
    hint.textContent = 'You have 45 seconds...';
    hint.style.color = '#666';
    
    document.getElementById('bombTimer').textContent = '45';
    document.getElementById('bombTimer').classList.remove('warning');
    document.getElementById('answerInput').value = '';
    
    challengeTimer = setInterval(() => {
        timeLeft -= 0.1;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(challengeTimer);
            triggerJumpscare('TIME');
            return;
        }
        
        const pct = (timeLeft / 45) * 100;
        timerFill.style.width = pct + '%';
        
        const displayTime = Math.ceil(timeLeft);
        document.getElementById('bombTimer').textContent = displayTime;
        
        if (timeLeft <= 10) {
            timerFill.classList.add('warning');
            document.getElementById('bombTimer').classList.add('warning');
            hint.textContent = 'HURRY...';
            hint.style.color = '#c00';
        }
    }, 100);
}

function renderRiddle(colors) {
    const container = document.getElementById('riddleContainer');
    let html = '';
    
    currentRiddle.lines.forEach((line, lineIndex) => {
        const words = line.split(' ');
        const coloredIdx = currentRiddle.coloredWordIndices[lineIndex];
        const color = colors[lineIndex];
        
        let lineHtml = '<span class="riddle-line">';
        words.forEach((word, wordIndex) => {
            if (wordIndex === coloredIdx) {
                lineHtml += `<span style="color:${color}; text-shadow: 0 0 15px ${color}; font-weight:bold;">${word}</span> `;
            } else {
                lineHtml += `${word} `;
            }
        });
        lineHtml += '</span>';
        html += lineHtml;
    });
    
    container.innerHTML = html;
}

function renderWires(colors) {
    const container = document.getElementById('wiresContainer');
    container.innerHTML = '';
    window.bombWireElements = [];
    
    colors.forEach((color, index) => {
        const wire = document.createElement('div');
        wire.className = 'wire';
        wire.dataset.order = index + 1;
        wire.dataset.color = color;
        wire.style.background = `linear-gradient(180deg, ${color}, ${color}88)`;
        wire.style.boxShadow = `0 0 15px ${color}`;
        
        const overlay = document.createElement('div');
        overlay.className = 'wire-hold-overlay';
        
        const text = document.createElement('div');
        text.className = 'wire-hold-text';
        text.textContent = 'HOLD';
        
        const label = document.createElement('div');
        label.className = 'wire-label';
        label.textContent = WIRE_COLOR_NAMES[color] || 'WIRE';
        
        wire.appendChild(overlay);
        wire.appendChild(text);
        wire.appendChild(label);
        
        wire.addEventListener('mousedown', (e) => startWireHold(e, wire));
        wire.addEventListener('touchstart', (e) => startWireHold(e, wire), { passive: false });
        
        wire.addEventListener('mouseup', (e) => cancelWireHold(e, wire));
        wire.addEventListener('touchend', (e) => cancelWireHold(e, wire));
        wire.addEventListener('mouseleave', (e) => cancelWireHold(e, wire));
        
        container.appendChild(wire);
        window.bombWireElements.push(wire);
    });
}

function startWireHold(e, wire) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isChallengeActive || wire.classList.contains('cut')) return;
    
    const wireOrderNum = parseInt(wire.dataset.order);
    
    if (wireOrderNum !== cutCount + 1) {
        triggerJumpscare('WRONG');
        return;
    }
    
    holdingWire = wire;
    holdStartTime = Date.now();
    wire.classList.add('holding');
    
    wireHoldInterval = setInterval(() => {
        if (!holdingWire) return;
        
        const elapsed = Date.now() - holdStartTime;
        const progress = Math.min(elapsed / HOLD_DURATION, 1);
        
        if (progress >= 1) {
            cutWire(wire);
        }
    }, 50);
}

function cancelWireHold(e, wire) {
    if (holdingWire === wire) {
        wire.classList.remove('holding');
        holdingWire = null;
        clearInterval(wireHoldInterval);
    }
}

function cutWire(wire) {
    wire.classList.remove('holding');
    holdingWire = null;
    clearInterval(wireHoldInterval);
    
    wire.classList.add('cut');
    wire.style.animation = 'cutWire 0.5s ease forwards';
    cutCount++;
    
    if (cutCount >= 3) {
        isChallengeActive = false;
        clearInterval(challengeTimer);
        
        const hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        setTimeout(() => {
            document.getElementById('challengeScreen').classList.remove('active');
            document.getElementById('landingContainer').classList.remove('hidden');
        }, 2000);
    }
}

document.getElementById('submitAnswerBtn').addEventListener('click', () => {
    if (currentLevel !== 3 || !isChallengeActive) return;
    
    const input = document.getElementById('answerInput');
    const userAnswer = input.value.trim().toUpperCase();
    
    if (userAnswer === currentRiddle.currentAnswer) {
        isChallengeActive = false;
        clearInterval(challengeTimer);
        
        const hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        setTimeout(() => {
            document.getElementById('challengeScreen').classList.remove('active');
            document.getElementById('landingContainer').classList.remove('hidden');
        }, 2000);
    } else {
        triggerJumpscare('WRONG');
    }
});

document.getElementById('answerInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('submitAnswerBtn').click();
    }
});

function renderTypedLetters() {
    const typedLetters = document.getElementById('typedLetters');
    let html = '';
    
    for (let i = 0; i < TARGET.length; i++) {
        if (i < typedIndex) {
            html += `<div class="typed-letter">${TARGET[i]}</div>`;
        } else {
            html += `<div class="typed-letter pending">${TARGET[i]}</div>`;
        }
    }
    
    typedLetters.innerHTML = html;
}

function triggerJumpscare(reason) {
    isChallengeActive = false;
    clearInterval(challengeTimer);
    clearInterval(buttonSpawnTimer);
    clearInterval(bombTimer);
    clearInterval(wireHoldInterval);
    
    if (holdingWire) {
        holdingWire.classList.remove('holding');
        holdingWire = null;
    }
    
    playJumpscareSound();
    
    const overlay = document.getElementById('jumpscareOverlay');
    const text = document.getElementById('jumpscareText');
    text.textContent = reason === 'TIME' ? 'TOO LATE' : 'WRONG';
    overlay.classList.add('active');
    
    document.body.style.cursor = 'none';
    
    setTimeout(() => {
        overlay.classList.remove('active');
        document.getElementById('challengeScreen').classList.remove('active');
        document.getElementById('landingContainer').classList.remove('hidden');
        document.body.classList.remove('challenge-active');
        document.body.style.cursor = 'none';
        
        const timerFill = document.getElementById('timerFill');
        timerFill.classList.remove('warning');
        document.getElementById('bombTimer').classList.remove('warning');
        
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) scoreDisplay.remove();
        
        showLevelContent(1);
    }, 2500);
}
