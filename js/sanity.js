window.Game = window.Game || {};

Game.sanity = {
    current: 100,
    max: 100,
    isNauseaActive: false,
    
    decrease: function(amount) {
        this.current = Math.max(0, this.current - amount);
        Game.ui.updateSanityBar(this.current);
        this.checkEffects();
    },
    
    increase: function(amount) {
        this.current = Math.min(this.max, this.current + amount);
        Game.ui.updateSanityBar(this.current);
        this.checkEffects();
    },
    
    set: function(value) {
        this.current = Math.max(0, Math.min(this.max, value));
        Game.ui.updateSanityBar(this.current);
        this.checkEffects();
    },
    
    checkEffects: function() {
        if (this.current <= 10 && !this.isNauseaActive && Game.state.isChallengeActive) {
            this.triggerNausea();
        }
    },
    
    triggerNausea: function() {
        this.isNauseaActive = true;
        Game.utils.clearIntervalAll();
        Game.state.isChallengeActive = false;
        
        Game.ui.show('nauseaOverlay');
        document.body.classList.add('sanity-nausea');
        
        var nauseaTimer = 5;
        Game.ui.setText('nauseaTimer', nauseaTimer);
        Game.ui.setText('nauseaInput', '');
        
        Game.state.nauseaTimer = setInterval(function() {
            nauseaTimer -= 0.1;
            Game.ui.setText('nauseaTimer', Math.ceil(nauseaTimer));
            
            if (nauseaTimer <= 0) {
                clearInterval(Game.state.nauseaTimer);
                Game.sanity.failNausea();
            }
        }, 100);
        
        document.getElementById('nauseaSubmit').onclick = function() {
            var input = document.getElementById('nauseaInput').value.trim().toUpperCase();
            if (input === Game.state.playerName.toUpperCase()) {
                clearInterval(Game.state.nauseaTimer);
                Game.sanity.passNausea();
            } else {
                clearInterval(Game.state.nauseaTimer);
                Game.sanity.failNausea();
            }
        };
        
        document.getElementById('nauseaInput').onkeydown = function(e) {
            if (e.key === 'Enter') {
                document.getElementById('nauseaSubmit').click();
            }
        };
    },
    
    passNausea: function() {
        this.isNauseaActive = false;
        Game.ui.hide('nauseaOverlay');
        document.body.classList.remove('sanity-nausea');
        
        this.increase(50);
        
        var currentLevel = Game.state.currentLevel;
        Game.ui.setText('nauseaInput', '');
        
        Game.startLevel(currentLevel);
    },
    
    failNausea: function() {
        this.isNauseaActive = false;
        Game.ui.hide('nauseaOverlay');
        document.body.classList.remove('sanity-nausea');
        
        var currentLevel = Game.state.currentLevel;
        var newLevel = Math.max(1, currentLevel - 1);
        if (currentLevel === 1) newLevel = 1;
        
        this.set(100);
        Game.ui.updateSanityBar(this.current);
        
        Game.startLevel(newLevel);
    },
    
    onLevelFail: function(timeLeft, totalTime) {
        var ratio = timeLeft / totalTime;
        if (ratio < 0.5) {
            this.decrease(20);
        } else {
            this.decrease(10);
        }
    },
    
    onLevelComplete: function() {
        this.increase(10);
    }
};
