window.Game = window.Game || {};

Game.narrativeNames = [
    'Alia', 'Raven', 'Luna', 'Mira', 'Nova',
    'Sable', 'Vex', 'Wren', 'Zara', 'Kira'
];

Game.narrative = {
    scenes: [
        { speaker: 'narrator', text: 'My name is {name}...' },
        { speaker: 'narrator', text: 'I don\'t know how long I\'ve been trapped here. Time doesn\'t work the same in The Hollow Hour.' },
        { speaker: 'narrator', text: 'It feeds on fear. It feeds on sanity. Every failed test tears your mind apart.' },
        { speaker: 'narrator', text: 'I can hear it whispering... it knows your name. It knows YOUR name.' },
        { speaker: 'narrator', text: 'The more you fail, the closer it gets. The more time you waste, the weaker you become.' },
        { speaker: 'narrator', text: 'But if you can survive... if you can keep your mind intact... you might break this cycle.' },
        { speaker: 'narrator', text: 'Remember who you are. Remember MY name. And whatever you do... don\'t let it take you.' }
    ],
    postLevelScenes: {
        1: [
            { speaker: 'narrator', text: 'You made it through the first test... but The Hollow Hour is not done with you yet.' },
            { speaker: 'narrator', text: 'Something is watching. Something is learning. Don\'t make the same mistake twice.' }
        ],
        2: [
            { speaker: 'narrator', text: 'Two tests survived. But the real horror is just beginning.' },
            { speaker: 'narrator', text: 'The walls are closing in. Can you feel it?' }
        ],
        3: [
            { speaker: 'narrator', text: 'You chose a door... but was it the right one?' },
            { speaker: 'narrator', text: 'The whispers are getting louder. They know you\'re here.' }
        ],
        4: [
            { speaker: 'narrator', text: 'You found the liar... but the truth is much worse.' },
            { speaker: 'narrator', text: 'Every lie you uncover brings you closer to the real nightmare.' }
        ],
        5: [
            { speaker: 'narrator', text: 'You caught the word before it vanished... barely.' },
            { speaker: 'narrator', text: 'Your mind is slipping. Can you hold on much longer?' },
            { speaker: 'Elias', text: 'My name is Elias. I\'ve been waiting for you.' }
        ],
        6: [
            { speaker: 'narrator', text: 'SOS... but nobody is coming to save you.' },
            { speaker: 'narrator', text: 'The signal was a trap. And you just walked right into it.' }
        ],
        7: [
            { speaker: 'narrator', text: 'You chose the right shadow... this time.' },
            { speaker: 'narrator', text: 'But shadows have a way of multiplying in the dark.' }
        ],
        8: [
            { speaker: 'narrator', text: 'You counted the eyes... but did you miss one?' },
            { speaker: 'narrator', text: 'Nothing is as it seems in The Hollow Hour.' }
        ],
        9: [
            { speaker: 'narrator', text: 'The system lied to you... but so did your eyes.' },
            { speaker: 'narrator', text: 'Trust nothing. Trust no one.' }
        ],
        10: [
            { speaker: 'narrator', text: 'You remembered Elias... but memory is a fragile thing.' },
            { speaker: 'narrator', text: 'The Hollow Hour has ended... or has it just begun?' }
        ]
    },
    currentScene: 0,
    isTyping: false,
    currentScenes: null,
    postLevelCallback: null,
    
    start: function() {
        this.currentScenes = this.scenes;
        this.currentScene = 0;
        Game.state.narratorName = Game.narrativeNames[Math.floor(Math.random() * Game.narrativeNames.length)];
        
        var overlay = document.getElementById('narrativeOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.add('active');
        }
        
        var skipBtn = document.getElementById('narrativeSkip');
        if (skipBtn) {
            skipBtn.style.display = 'block';
            skipBtn.onclick = function() {
                if (Game.narrative.isTyping) {
                    Game.narrative.skipTyping();
                } else {
                    Game.narrative.next();
                }
            };
        }
        
        this.showScene();
    },
    
    showPostLevel: function(level, callback) {
        var scenes = this.postLevelScenes[level];
        if (!scenes) {
            callback();
            return;
        }
        
        this.currentScenes = scenes;
        this.currentScene = 0;
        this.postLevelCallback = callback;
        
        var overlay = document.getElementById('narrativeOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.add('active');
        }
        
        var skipBtn = document.getElementById('narrativeSkip');
        if (skipBtn) {
            skipBtn.style.display = 'block';
            skipBtn.onclick = function() {
                if (Game.narrative.isTyping) {
                    Game.narrative.skipTyping();
                } else {
                    Game.narrative.next();
                }
            };
        }
        
        this.showScene();
    },
    
    showScene: function() {
        if (this.currentScene >= this.currentScenes.length) {
            this.end();
            return;
        }
        
        var scene = this.currentScenes[this.currentScene];
        var isLast = this.currentScene === this.currentScenes.length - 1;
        var narratorName = Game.state.narratorName || 'Alia';
        
        var nameEl = document.getElementById('narrativeName');
        var hintEl = document.getElementById('narrativeHint');
        var textEl = document.getElementById('narrativeText');
        
        if (nameEl) nameEl.textContent = (scene.speaker === '???' || scene.speaker === 'Elias') ? scene.speaker : narratorName;
        if (hintEl) {
            hintEl.style.display = 'block';
            hintEl.textContent = isLast ? 'Click to begin' : 'Click to continue';
        }
        
        this.isTyping = true;
        if (textEl) {
            textEl.textContent = '';
            var i = 0;
            var speed = 40;
            var text = scene.text.replace(/\{name\}/g, narratorName);
            
            function type() {
                if (i < text.length) {
                    textEl.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    Game.narrative.isTyping = false;
                }
            }
            type();
        }
    },
    
    next: function() {
        if (this.isTyping) return;
        this.currentScene++;
        this.showScene();
    },
    
    skipTyping: function() {
        var textEl = document.getElementById('narrativeText');
        if (textEl && this.isTyping) {
            textEl.textContent = this.currentScenes[this.currentScene].text.replace(/\{name\}/g, Game.state.narratorName || 'Alia');
            this.isTyping = false;
        }
    },
    
    end: function() {
        var overlay = document.getElementById('narrativeOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('active');
        }
        
        var skipBtn = document.getElementById('narrativeSkip');
        if (skipBtn) skipBtn.style.display = 'none';
        
        if (this.postLevelCallback) {
            var callback = this.postLevelCallback;
            this.postLevelCallback = null;
            this.currentScenes = this.scenes;
            callback();
        } else {
            Game.startLevel(1);
        }
    }
};
