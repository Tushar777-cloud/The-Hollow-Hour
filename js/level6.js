window.Game = window.Game || {};

Game.level6 = {
    start: function() {
        Game.state.currentLevel = 6;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 20;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(6);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'MORSE CODE';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var container = document.getElementById('level6Content');
        container.innerHTML = '<div class="morse-display" id="morseDisplay"></div>' +
            '<div class="morse-input-container">' +
                '<input type="text" class="memory-input" id="morseInput" placeholder="TYPE ANSWER..." autocomplete="off">' +
                '<button class="submit-btn" id="morseSubmit">SUBMIT</button>' +
            '</div>';
        
        var morseCode = '... --- ...';
        Game.state.morseAnswer = 'SOS';
        
        var display = document.getElementById('morseDisplay');
        display.textContent = morseCode;
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'Decode the message...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level6.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 20) * 100;
            timerFill.style.width = pct + '%';
            
            if (Game.state.timeLeft <= 7) {
                timerFill.classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
            }
        }, 100);
        
        document.getElementById('morseSubmit').addEventListener('click', function() {
            Game.level6.checkAnswer();
        });
        
        document.getElementById('morseInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') Game.level6.checkAnswer();
        });
    },
    
    checkAnswer: function() {
        var input = document.getElementById('morseInput');
        if (input.value.trim().toUpperCase() === Game.state.morseAnswer) {
            Game.level6.complete();
        } else {
            Game.level6.fail('WRONG');
        }
    },
    
    complete: function() {
        Game.utils.clearIntervalAll();
        Game.state.isChallengeActive = false;
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var container = document.getElementById('level6Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(6, function() {
                Game.startLevel(7);
            });
        }, 500);
    },
    
    fail: function(reason) {
        Game.state.isChallengeActive = false;
        Game.utils.clearIntervalAll();
        Game.sanity.onLevelFail(Game.state.timeLeft, 20);
        
        if (Game.sanity.current <= 0) {
            Game.triggerJumpscare('INSANITY');
            return;
        }
        
        Game.triggerJumpscare(reason);
    }
};
