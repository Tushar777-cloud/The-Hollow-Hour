window.Game = window.Game || {};

Game.level9 = {
    start: function() {
        Game.state.currentLevel = 9;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 10;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(9);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'SYSTEM ERROR';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var container = document.getElementById('level9Content');
        container.innerHTML = '<div class="fake-system" id="fakeSystem">' +
            '<div class="system-line">Deleting save...</div>' +
            '<div class="system-line">Accessing camera...</div>' +
            '<div class="system-line">Uploading data...</div>' +
            '<div class="system-line" id="fakeReveal" style="display:none;">JUST KIDDING</div>' +
        '</div>';
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'Something is happening...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level9.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 10) * 100;
            timerFill.style.width = pct + '%';
            
            if (Game.state.timeLeft <= 3) {
                timerFill.classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
            }
        }, 100);
        
        setTimeout(function() {
            if (!Game.state.isChallengeActive) return;
            var reveal = document.getElementById('fakeReveal');
            if (reveal) reveal.style.display = 'block';
            hint.textContent = 'It was a trap...';
            hint.style.color = '#c00';
            
            setTimeout(function() {
                if (Game.state.isChallengeActive) {
                    Game.level9.complete();
                }
            }, 1500);
        }, 3000);
    },
    
    complete: function() {
        Game.utils.clearIntervalAll();
        Game.state.isChallengeActive = false;
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var container = document.getElementById('level9Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(9, function() {
                Game.startLevel(10);
            });
        }, 500);
    },
    
    fail: function(reason) {
        Game.state.isChallengeActive = false;
        Game.utils.clearIntervalAll();
        Game.sanity.onLevelFail(Game.state.timeLeft, 10);
        
        if (Game.sanity.current <= 0) {
            Game.triggerJumpscare('INSANITY');
            return;
        }
        
        Game.triggerJumpscare(reason);
    }
};
