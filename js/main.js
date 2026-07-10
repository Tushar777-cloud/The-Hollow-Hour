window.Game = window.Game || {};

Game.RIDDLES = [
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

Game.WIRE_COLORS = ['#ff4444', '#44ff44', '#4488ff', '#ffaa00', '#ff44ff', '#00ffff'];
Game.WIRE_COLOR_NAMES = {
    '#ff4444': 'RED',
    '#44ff44': 'GREEN',
    '#4488ff': 'BLUE',
    '#ffaa00': 'ORANGE',
    '#ff44ff': 'PURPLE',
    '#00ffff': 'CYAN'
};

Game.state = {
    isChallengeActive: false,
    challengeTimer: null,
    buttonSpawnTimer: null,
    wireHoldInterval: null,
    nauseaTimer: null,
    currentLevel: 1,
    typedIndex: 0,
    safeClicks: 0,
    timeLeft: 10,
    cutCount: 0,
    holdingWire: null,
    holdStartTime: 0,
    playerName: '',
    currentRiddle: null,
    bombColors: null
};

Game.init = function() {
    Game.canvas = document.getElementById('bloodCanvas');
    Game.ctx = Game.canvas.getContext('2d');
    
    function resize() {
        Game.canvas.width = window.innerWidth;
        Game.canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    Game.bloodParticles = [];
    Game.bloodDrips = [];
    
    for (var i = 0; i < 60; i++) {
        Game.bloodParticles.push(new BloodParticle());
    }
    for (var i = 0; i < 25; i++) {
        Game.bloodDrips.push(new BloodDrip(Math.random() * Game.canvas.width, Math.random() * 4 + 2));
    }
    
    function animate() {
        Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        Game.ctx.fillStyle = 'rgba(5, 0, 0, 0.1)';
        Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        
        for (var i = 0; i < Game.bloodParticles.length; i++) {
            Game.bloodParticles[i].update();
            Game.bloodParticles[i].draw();
        }
        for (var i = 0; i < Game.bloodDrips.length; i++) {
            Game.bloodDrips[i].update();
            Game.bloodDrips[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    animate();
    
    document.getElementById('startBtn').addEventListener('click', function() {
        Game.audio.init();
        Game.audio.startBg();
        
        document.getElementById('landingContainer').classList.add('hidden');
        
        setTimeout(function() {
            Game.narrative.start();
        }, 1500);
    });
    
    document.getElementById('narrativeOverlay').addEventListener('click', function() {
        Game.narrative.next();
    });
    
    document.getElementById('submitAnswerBtn').addEventListener('click', function() {
        Game.level3.submitAnswer();
    });
    
    document.getElementById('answerInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            Game.level3.submitAnswer();
        }
    });
};

Game.startLevel = function(level) {
    Game.utils.clearIntervalAll();
    Game.sanity.isNauseaActive = false;
    Game.ui.hide('nauseaOverlay');
    document.body.classList.remove('sanity-nausea');
    Game.ui.show('sanityBarContainer');
    Game.ui.updateSanityBar(Game.sanity.current);
    
    if (level === 1) Game.level1.start();
    else if (level === 2) Game.level2.start();
    else if (level === 3) Game.level3.start();
    else if (level === 4) Game.level4.start();
    else if (level === 5) Game.level5.start();
    else if (level === 6) Game.level6.start();
    else if (level === 7) Game.level7.start();
    else if (level === 8) Game.level8.start();
    else if (level === 9) Game.level9.start();
    else if (level === 10) Game.level10.start();
};

Game.triggerJumpscare = function(reason) {
    Game.utils.clearIntervalAll();
    Game.state.isChallengeActive = false;
    
    Game.audio.playJumpscare();
    
    var overlay = document.getElementById('jumpscareOverlay');
    var text = document.getElementById('jumpscareText');
    text.textContent = reason === 'TIME' ? 'TOO LATE' : (reason === 'INSANITY' ? 'GONE' : 'WRONG');
    overlay.classList.add('active');
    
    document.body.style.cursor = 'none';
    
    setTimeout(function() {
        overlay.classList.remove('active');
        document.getElementById('challengeScreen').classList.remove('active');
        document.getElementById('landingContainer').classList.remove('hidden');
        document.body.classList.remove('challenge-active');
        document.body.style.cursor = 'none';
        
        var timerFill = document.getElementById('globalTimerFill');
        timerFill.classList.remove('warning');
        document.getElementById('bombTimer').classList.remove('warning');
        
        Game.ui.hideSanityBar();
        Game.state.isChallengeActive = false;
    }, 2500);
};

function BloodParticle() {
    this.reset();
}

BloodParticle.prototype.reset = function() {
    var canvas = document.getElementById('bloodCanvas');
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 3 + 1;
    this.speedY = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.color = 'rgba(' + Game.utils.randomInt(140, 200) + ', ' + Game.utils.randomInt(0, 30) + ', ' + Game.utils.randomInt(0, 20) + ', ' + this.opacity + ')';
};

BloodParticle.prototype.update = function() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y > Game.canvas.height) this.reset();
};

BloodParticle.prototype.draw = function() {
    var canvas = document.getElementById('bloodCanvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
};

function BloodDrip(x, width) {
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

BloodDrip.prototype.update = function() {
    var canvas = document.getElementById('bloodCanvas');
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
};

BloodDrip.prototype.draw = function() {
    var canvas = document.getElementById('bloodCanvas');
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(this.x, 0, this.x, this.y + this.accumulated);
    gradient.addColorStop(0, 'rgba(80, 0, 0, 0)');
    gradient.addColorStop(0.1, 'rgba(120, 0, 0, ' + this.opacity + ')');
    gradient.addColorStop(0.5, 'rgba(160, 0, 0, ' + (this.opacity * 1.2) + ')');
    gradient.addColorStop(1, 'rgba(200, 20, 20, ' + (this.opacity * 0.8) + ')');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x - this.width / 2, 0, this.width, this.y + this.accumulated);
    
    if (this.dripping) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        Game.init();
    });
} else {
    Game.init();
}
