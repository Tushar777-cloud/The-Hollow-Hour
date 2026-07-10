window.Game = window.Game || {};

Game.audio = {
    bgMusic: null,
    jumpscareSound: null,
    
    init: function() {
        if (this.bgMusic) return;
        
        this.bgMusic = new Audio('Assets/Background.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4;
        
        this.jumpscareSound = new Audio('Assets/Jumpscare Scream 1.mp3');
        this.jumpscareSound.volume = 0.8;
    },
    
    startBg: function() {
        if (!this.bgMusic) this.init();
        this.bgMusic.currentTime = 0;
        this.bgMusic.play().catch(function() {});
    },
    
    playJumpscare: function() {
        if (!this.jumpscareSound) this.init();
        this.jumpscareSound.currentTime = 0;
        this.jumpscareSound.play().catch(function() {});
    },
    
    stopBg: function() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }
};
