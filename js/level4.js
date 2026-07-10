window.Game = window.Game || {};

Game.level4 = {
    start: function() {
        Game.state.currentLevel = 4;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 15;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(4);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'FIND THE LIAR';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var statements = [
            { text: 'The monster is asleep.', isLiar: false },
            { text: 'The monster sees movement.', isLiar: true },
            { text: 'Don\'t trust the first sentence.', isLiar: false }
        ];
        
        var shuffled = Game.utils.shuffle(statements);
        Game.state.liarStatements = shuffled;
        
        var container = document.getElementById('level4Content');
        container.innerHTML = '<div class="statements-container" id="statementsContainer"></div>';
        
        var stmtContainer = document.getElementById('statementsContainer');
        shuffled.forEach(function(stmt, idx) {
            var btn = document.createElement('button');
            btn.className = 'statement-btn';
            btn.textContent = stmt.text;
            btn.dataset.index = idx;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (shuffled[idx].isLiar) {
                    Game.level4.complete();
                } else {
                    Game.level4.fail('WRONG');
                }
            });
            stmtContainer.appendChild(btn);
        });
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'One of these is a lie...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level4.fail('TIME');
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
    },
    
    complete: function() {
        Game.utils.clearIntervalAll();
        Game.state.isChallengeActive = false;
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var container = document.getElementById('level4Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(4, function() {
                Game.startLevel(5);
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
