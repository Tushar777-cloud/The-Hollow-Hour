window.Game = window.Game || {};

Game.level5 = {
    start: function() {
        Game.state.currentLevel = 5;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 8;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(5);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'TYPE BEFORE IT VANISHES';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var words = ['SHADOW', 'WHISPER', 'HOLLOW', 'DARKNESS', 'SCREAM', 'FORGET'];
        var word = words[Math.floor(Math.random() * words.length)];
        Game.state.vanishingWord = word;
        
        var container = document.getElementById('level5Content');
        container.innerHTML = '<div class="vanishing-word" id="vanishingWord">' + word + '</div>' +
            '<input type="text" class="memory-input" id="vanishingInput" placeholder="TYPE THE WORD..." autocomplete="off">' +
            '<button class="submit-btn" id="vanishingSubmit">SUBMIT</button>';
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'Type it before it vanishes...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level5.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 8) * 100;
            timerFill.style.width = pct + '%';
            
            if (Game.state.timeLeft <= 3) {
                timerFill.classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
            }
        }, 100);
        
        var vanishInterval = setInterval(function() {
            if (!Game.state.isChallengeActive) {
                clearInterval(vanishInterval);
                return;
            }
            
            var wordEl = document.getElementById('vanishingWord');
            if (wordEl && wordEl.textContent.length > 0) {
                wordEl.textContent = wordEl.textContent.slice(0, -1);
                wordEl.style.opacity = Math.max(0.2, parseFloat(wordEl.style.opacity || 1) - 0.15);
            }
        }, 500);
        
        document.getElementById('vanishingSubmit').addEventListener('click', function() {
            Game.level5.checkAnswer();
        });
        
        document.getElementById('vanishingInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') Game.level5.checkAnswer();
        });
    },
    
    checkAnswer: function() {
        var input = document.getElementById('vanishingInput');
        if (input.value.trim().toUpperCase() === Game.state.vanishingWord) {
            Game.level5.complete();
        } else {
            Game.level5.fail('WRONG');
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
        
        var container = document.getElementById('level5Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(5, function() {
                Game.startLevel(6);
            });
        }, 500);
    },
    
    fail: function(reason) {
        Game.state.isChallengeActive = false;
        Game.utils.clearIntervalAll();
        Game.sanity.onLevelFail(Game.state.timeLeft, 8);
        
        if (Game.sanity.current <= 0) {
            Game.triggerJumpscare('INSANITY');
            return;
        }
        
        Game.triggerJumpscare(reason);
    }
};
