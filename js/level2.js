window.Game = window.Game || {};

Game.level2 = {
    start: function() {
        Game.state.currentLevel = 2;
        var challengeScreen = document.getElementById('challengeScreen');
        var buttonsArena = document.getElementById('buttonsArena');
        var timerFill = document.getElementById('globalTimerFill');
        var hint = document.getElementById('challengeHintGlobal');
        var title = document.getElementById('challengeTitle');
        
        title.textContent = 'DO NOT CLICK THE RED BUTTON';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        Game.state.isChallengeActive = true;
        Game.state.safeClicks = 0;
        Game.state.timeLeft = 15;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(2);
        
        var l2 = document.getElementById('level2Content');
        if (l2) l2.style.opacity = '1';
        
        buttonsArena.innerHTML = '';
        
        var scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) scoreDisplay.textContent = 'Clicks: 0 / 10';
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'Click the safe buttons. Avoid red. 10 needed. 15 seconds!';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level2.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 15) * 100;
            timerFill.style.width = pct + '%';
            
            if (Game.state.timeLeft <= 7.5) {
                timerFill.classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
                Game.sanity.decrease(0.3);
            }
        }, 100);
        
        Game.state.buttonSpawnTimer = setInterval(function() {
            if (!Game.state.isChallengeActive) return;
            Game.level2.spawnButton();
        }, 800);
        
        this.spawnButton();
    },
    
    spawnButton: function() {
        if (!Game.state.isChallengeActive) return;
        
        var arena = document.getElementById('buttonsArena');
        var arenaRect = arena.getBoundingClientRect();
        var btn = document.createElement('button');
        
        var isRed = Math.random() < 0.25;
        btn.className = 'pop-btn ' + (isRed ? 'red' : 'safe');
        btn.textContent = isRed ? 'RED' : 'SAFE';
        
        var btnSize = 80;
        var maxX = Math.max(arenaRect.width - btnSize, 10);
        var maxY = Math.max(arenaRect.height - btnSize - 40, 10);
        var x = Math.random() * maxX;
        var y = Math.random() * maxY;
        
        btn.style.left = x + 'px';
        btn.style.top = y + 'px';
        
        function handleBtnClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isRed) {
                Game.level2.fail('WRONG');
            } else {
                Game.state.safeClicks++;
                var scoreDisplay = document.getElementById('scoreDisplay');
                if (scoreDisplay) {
                    scoreDisplay.textContent = 'Clicks: ' + Game.state.safeClicks + ' / 10';
                }
                
                btn.classList.add('fading-out');
                setTimeout(function() {
                    if (btn.parentNode) btn.parentNode.removeChild(btn);
                }, 300);
                
                if (Game.state.safeClicks >= 10) {
                    Game.utils.clearIntervalAll();
                    Game.state.isChallengeActive = false;
                    Game.level2.complete();
                }
            }
        }
        
        btn.addEventListener('click', handleBtnClick);
        btn.addEventListener('touchstart', handleBtnClick, { passive: false });
        
        arena.appendChild(btn);
        
        setTimeout(function() {
            if (btn.parentNode && Game.state.isChallengeActive) {
                btn.classList.add('fading-out');
                setTimeout(function() {
                    if (btn.parentNode) btn.parentNode.removeChild(btn);
                }, 300);
            }
        }, 1500);
    },
    
    complete: function() {
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var l2 = document.getElementById('level2Content');
        if (l2) l2.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(2, function() {
                Game.startLevel(3);
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
