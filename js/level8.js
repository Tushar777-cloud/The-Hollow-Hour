window.Game = window.Game || {};

Game.level8 = {
    start: function() {
        Game.state.currentLevel = 8;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 15;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(8);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'COUNT THE EYES';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var faces = [];
        var totalEyes = 0;
        var eyeCount = 0;
        
        for (var i = 0; i < 6; i++) {
            var face = '( ͡° ͜ʖ ͡°)';
            var eyes = 2;
            totalEyes += eyes;
            faces.push(face);
        }
        
        Game.state.eyeAnswer = totalEyes;
        
        var container = document.getElementById('level8Content');
        container.innerHTML = '<div class="faces-grid" id="facesGrid"></div>' +
            '<div class="eye-question">How many eyes?</div>' +
            '<input type="number" class="memory-input" id="eyeInput" placeholder="TYPE NUMBER..." autocomplete="off">' +
            '<button class="submit-btn" id="eyeSubmit">SUBMIT</button>';
        
        var grid = document.getElementById('facesGrid');
        faces.forEach(function(face) {
            var faceEl = document.createElement('div');
            faceEl.className = 'ascii-face';
            faceEl.textContent = face;
            grid.appendChild(faceEl);
        });
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'Watch carefully...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level8.fail('TIME');
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
        
        setTimeout(function() {
            if (!Game.state.isChallengeActive) return;
            
            var faceEls = document.querySelectorAll('.ascii-face');
            faceEls.forEach(function(el) {
                el.textContent = '( ͡° ͜ʖ ͡°)';
                el.style.opacity = '0.3';
            });
            
            hint.textContent = 'Now answer...';
            hint.style.color = '#c00';
            
            var input = document.getElementById('eyeInput');
            if (input) input.focus();
        }, 3000);
        
        document.getElementById('eyeSubmit').addEventListener('click', function() {
            Game.level8.checkAnswer();
        });
        
        document.getElementById('eyeInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') Game.level8.checkAnswer();
        });
    },
    
    checkAnswer: function() {
        var input = document.getElementById('eyeInput');
        if (parseInt(input.value) === Game.state.eyeAnswer) {
            Game.level8.complete();
        } else {
            Game.level8.fail('WRONG');
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
        
        var container = document.getElementById('level8Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(8, function() {
                Game.startLevel(9);
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
