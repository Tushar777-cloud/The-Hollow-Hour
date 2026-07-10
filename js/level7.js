window.Game = window.Game || {};

Game.level7 = {
    start: function() {
        Game.state.currentLevel = 7;
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 15;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(7);
        
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var hint = document.getElementById('challengeHintGlobal');
        var timerFill = document.getElementById('globalTimerFill');
        
        title.textContent = 'SHADOW CHOICE';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        
        var container = document.getElementById('level7Content');
        container.innerHTML = '<div class="shadow-whispers" id="shadowWhispers"></div>' +
            '<div class="silhouettes-container" id="silhouettesContainer">' +
                '<div class="silhouette" data-idx="0"></div>' +
                '<div class="silhouette" data-idx="1"></div>' +
                '<div class="silhouette" data-idx="2"></div>' +
            '</div>';
        
        var correctIdx = Math.floor(Math.random() * 3);
        Game.state.movingShadow = correctIdx;
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'One of them is moving...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level7.fail('TIME');
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
        
        var whispers = [
            'The left one is still...',
            'The right one breathes...',
            'The middle one watches...',
            'One of them is not like the others...',
            'Don\'t trust your eyes...'
        ];
        
        var whisperIndex = 0;
        Game.state.buttonSpawnTimer = setInterval(function() {
            if (!Game.state.isChallengeActive) return;
            
            var whispersEl = document.getElementById('shadowWhispers');
            if (whispersEl && whisperIndex < whispers.length) {
                var whisper = document.createElement('div');
                whisper.className = 'shadow-whisper';
                whisper.textContent = whispers[whisperIndex % whispers.length];
                whispersEl.appendChild(whisper);
                
                setTimeout(function() {
                    if (whisper.parentNode) whisper.parentNode.removeChild(whisper);
                }, 2500);
                whisperIndex++;
            }
        }, 3000);
        
        setTimeout(function() {
            if (!Game.state.isChallengeActive) return;
            var silhouettes = document.querySelectorAll('.silhouette');
            if (silhouettes[correctIdx]) {
                silhouettes[correctIdx].classList.add('moving');
            }
        }, 2000);
        
        var silhouettes = document.querySelectorAll('.silhouette');
        silhouettes.forEach(function(s) {
            s.addEventListener('click', function(e) {
                e.preventDefault();
                var idx = parseInt(s.dataset.idx);
                if (idx === Game.state.movingShadow) {
                    Game.level7.complete();
                } else {
                    Game.level7.fail('WRONG');
                }
            });
        });
    },
    
    complete: function() {
        Game.utils.clearIntervalAll();
        Game.state.isChallengeActive = false;
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var container = document.getElementById('level7Content');
        if (container) container.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(7, function() {
                Game.startLevel(8);
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
