window.Game = window.Game || {};

Game.level1 = {
    start: function() {
        Game.state.currentLevel = 1;
        var challengeScreen = document.getElementById('challengeScreen');
        var lettersContainer = document.getElementById('lettersContainer');
        var typedLetters = document.getElementById('typedLetters');
        var timerFill = document.getElementById('globalTimerFill');
        var hint = document.getElementById('challengeHintGlobal');
        var title = document.getElementById('challengeTitle');
        
        title.textContent = 'FIND LETTERS QUICKLY';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        Game.state.isChallengeActive = true;
        Game.state.typedIndex = 0;
        Game.state.timeLeft = 10;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(1);
        
        var l1 = document.getElementById('level1Content');
        if (l1) l1.style.opacity = '1';
        
        lettersContainer.innerHTML = '';
        typedLetters.innerHTML = '';
        
        this.renderTypedLetters();
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'You have 10 seconds...';
        hint.style.color = '#666';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level1.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 10) * 100;
            timerFill.style.width = pct + '%';
            
            if (Game.state.timeLeft <= 5) {
                timerFill.classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
                Game.sanity.decrease(0.3);
            }
        }, 100);
        
        var allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var letters = [];
        
        for (var i = 0; i < 20; i++) {
            letters.push(allLetters.charAt(Math.floor(Math.random() * allLetters.length)));
        }
        
        var targetSequence = 'START'.split('');
        var available = letters.map(function(_, idx) { return idx; });
        for (var i = available.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = available[i]; available[i] = available[j]; available[j] = temp;
        }
        var targetIndices = available.slice(0, targetSequence.length);
        targetIndices.forEach(function(idx, i) {
            letters[idx] = targetSequence[i];
        });
        
        var hasAllTarget = true;
        for (var c = 0; c < targetSequence.length; c++) {
            if (letters.indexOf(targetSequence[c]) === -1) {
                hasAllTarget = false;
                break;
            }
        }
        
        if (!hasAllTarget) {
            var avail = [];
            for (var i = 0; i < letters.length; i++) {
                if (targetIndices.indexOf(i) === -1) avail.push(i);
            }
            var shuffled = Game.utils.shuffle(avail);
            var ai = 0;
            for (var i = 0; i < targetSequence.length; i++) {
                if (letters.indexOf(targetSequence[i]) === -1 && ai < shuffled.length) {
                    letters[shuffled[ai]] = targetSequence[i];
                    ai++;
                }
            }
        }
        
        requestAnimationFrame(function() {
            var positions = [];
            var padding = 60;
            var maxAttempts = 400;
            var containerRect = lettersContainer.getBoundingClientRect();
            var maxWidth = Math.max(containerRect.width - padding * 2, 200);
            var maxHeight = Math.max(containerRect.height - padding * 2, 200);
            
            for (var i = 0; i < letters.length; i++) {
                var placed = false;
                var attempts = 0;
                
                while (!placed && attempts < maxAttempts) {
                    attempts++;
                    var x = padding + Math.random() * maxWidth;
                    var y = padding + Math.random() * maxHeight;
                    
                    var overlaps = false;
                    for (var p = 0; p < positions.length; p++) {
                        var dist = Math.hypot(x - positions[p].x, y - positions[p].y);
                        if (dist < 75) {
                            overlaps = true;
                            break;
                        }
                    }
                    
                    if (!overlaps) {
                        positions.push({ x: x, y: y, letter: letters[i] });
                        placed = true;
                    }
                }
                
                if (!placed) {
                    positions.push({
                        x: padding + Math.random() * maxWidth,
                        y: padding + Math.random() * maxHeight,
                        letter: letters[i]
                    });
                }
            }
            
            positions.forEach(function(pos, index) {
                var el = document.createElement('div');
                el.className = 'floating-letter';
                el.textContent = pos.letter;
                el.style.left = pos.x + 'px';
                el.style.top = pos.y + 'px';
                el.style.animationDelay = (Math.random() * 2) + 's';
                el.dataset.letter = pos.letter;
                el.dataset.index = index;
                
                function handleSelect(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var clickedLetter = el.dataset.letter;
                    var expectedLetter = 'START'[Game.state.typedIndex];
                    
                    if (clickedLetter === expectedLetter) {
                        el.classList.add('clicked');
                        Game.state.typedIndex++;
                        Game.level1.renderTypedLetters();
                        
                        if (Game.state.typedIndex >= 5) {
                            Game.utils.clearIntervalAll();
                            Game.state.isChallengeActive = false;
                            Game.level1.complete();
                        }
                    } else {
                        Game.level1.fail('WRONG');
                    }
                }
                
                el.addEventListener('click', handleSelect);
                el.addEventListener('touchstart', handleSelect, { passive: false });
                
                lettersContainer.appendChild(el);
            });
        });
    },
    
    renderTypedLetters: function() {
        var typedLetters = document.getElementById('typedLetters');
        var html = '';
        var target = 'START';
        for (var i = 0; i < target.length; i++) {
            if (i < Game.state.typedIndex) {
                html += '<div class="typed-letter">' + target[i] + '</div>';
            } else {
                html += '<div class="typed-letter pending">' + target[i] + '</div>';
            }
        }
        typedLetters.innerHTML = html;
    },
    
    complete: function() {
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var l1 = document.getElementById('level1Content');
        if (l1) l1.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(1, function() {
                Game.startLevel(2);
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
