window.Game = window.Game || {};

Game.level10 = {
    start: function() {
        Game.state.currentLevel = 10;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 15;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(10);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'THE NAME';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var container = document.getElementById('level10Content');
        container.innerHTML = '<div class="name-question">What was my name?</div>' +
            '<input type="text" class="memory-input" id="nameInput" placeholder="TYPE NAME..." autocomplete="off">' +
            '<button class="submit-btn" id="nameSubmit">SUBMIT</button>';
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'Remember what you were told...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level10.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 15) * 100;
            timerFill.style.width = pct + '%';
            
            if (Game.state.timeLeft <= 5) {
                timerFill.classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
            }
        }, 100);
        
        document.getElementById('nameSubmit').addEventListener('click', function() {
            Game.level10.checkAnswer();
        });
        
        document.getElementById('nameInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') Game.level10.checkAnswer();
        });
    },
    
    checkAnswer: function() {
        var input = document.getElementById('nameInput');
        if (input.value.trim().toUpperCase() === 'ELIAS') {
            Game.level10.complete();
        } else {
            Game.level10.fail('WRONG');
        }
    },
    
    complete: function() {
        Game.utils.clearIntervalAll();
        Game.state.isChallengeActive = false;
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You remembered...';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var container = document.getElementById('level10Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(10, function() {
                alert('You have survived The Hollow Hour... for now.');
                document.getElementById('landingContainer').classList.remove('hidden');
            });
        }, 500);
    },
    
    fail: function(reason) {
        Game.state.isChallengeActive = false;
        Game.utils.clearIntervalAll();
        Game.sanity.onLevelFail(Game.state.timeLeft, 15);
        
        if (Game.sanity.current <= 0) {
            Game.triggerJumpscare('INSANITY');
            return;
        }
        
        Game.triggerJumpscare(reason);
    }
};
