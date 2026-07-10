window.Game = window.Game || {};

Game.level3 = {
    start: function() {
        Game.state.currentLevel = 3;
        var challengeScreen = document.getElementById('challengeScreen');
        var title = document.getElementById('challengeTitle');
        var timerFill = document.getElementById('globalTimerFill');
        var hint = document.getElementById('challengeHintGlobal');
        
        title.textContent = 'DEFUSE THE BOMB';
        challengeScreen.classList.add('active');
        document.body.classList.add('challenge-active');
        Game.state.isChallengeActive = true;
        Game.state.timeLeft = 45;
        Game.state.cutCount = 0;
        
        Game.ui.show('sanityBarContainer');
        Game.ui.updateSanityBar(Game.sanity.current);
        Game.ui.showLevelContent(3);
        
        var l3 = document.getElementById('level3Content');
        if (l3) l3.style.opacity = '1';
        
        var riddleIndex = Math.floor(Math.random() * Game.RIDDLES.length);
        Game.state.currentRiddle = Game.RIDDLES[riddleIndex];
        
        var answerArr = Array.isArray(Game.state.currentRiddle.answer) 
            ? Game.state.currentRiddle.answer[Math.floor(Math.random() * Game.state.currentRiddle.answer.length)] 
            : Game.state.currentRiddle.answer;
        Game.state.currentRiddle.currentAnswer = answerArr.toUpperCase();
        
        var shuffledColors = Game.utils.shuffle(Game.WIRE_COLORS);
        Game.state.bombColors = shuffledColors.slice(0, 3);
        
        Game.level3.renderRiddle(Game.state.bombColors);
        Game.level3.renderWires(Game.state.bombColors);
        
        timerFill.style.width = '100%';
        timerFill.classList.remove('warning');
        hint.textContent = 'You have 45 seconds...';
        hint.style.color = '#666';
        
        document.getElementById('bombTimer').textContent = '45';
        document.getElementById('bombTimer').classList.remove('warning');
        document.getElementById('answerInput').value = '';
        
        Game.state.challengeTimer = setInterval(function() {
            Game.state.timeLeft -= 0.1;
            
            if (Game.state.timeLeft <= 0) {
                Game.state.timeLeft = 0;
                Game.utils.clearIntervalAll();
                Game.level3.fail('TIME');
                return;
            }
            
            var pct = (Game.state.timeLeft / 45) * 100;
            timerFill.style.width = pct + '%';
            
            var displayTime = Math.ceil(Game.state.timeLeft);
            document.getElementById('bombTimer').textContent = displayTime;
            
            if (Game.state.timeLeft <= 22.5) {
                timerFill.classList.add('warning');
                document.getElementById('bombTimer').classList.add('warning');
                hint.textContent = 'HURRY...';
                hint.style.color = '#c00';
                Game.sanity.decrease(0.3);
            }
        }, 100);
    },
    
    renderRiddle: function(colors) {
        var container = document.getElementById('riddleContainer');
        var html = '';
        var riddle = Game.state.currentRiddle;
        
        riddle.lines.forEach(function(line, lineIndex) {
            var words = line.split(' ');
            var coloredIdx = riddle.coloredWordIndices[lineIndex];
            var color = colors[lineIndex];
            
            var lineHtml = '<span class="riddle-line">';
            words.forEach(function(word, wordIndex) {
                if (wordIndex === coloredIdx) {
                    lineHtml += '<span style="color:' + color + '; text-shadow: 0 0 15px ' + color + '; font-weight:bold;">' + word + '</span> ';
                } else {
                    lineHtml += word + ' ';
                }
            });
            lineHtml += '</span>';
            html += lineHtml;
        });
        
        container.innerHTML = html;
    },
    
    renderWires: function(colors) {
        var container = document.getElementById('wiresContainer');
        container.innerHTML = '';
        Game.state.bombWireElements = [];
        
        colors.forEach(function(color, index) {
            var wire = document.createElement('div');
            wire.className = 'wire';
            wire.dataset.order = index + 1;
            wire.dataset.color = color;
            wire.style.background = 'linear-gradient(180deg, ' + color + ', ' + color + '88)';
            wire.style.boxShadow = '0 0 15px ' + color;
            
            var overlay = document.createElement('div');
            overlay.className = 'wire-hold-overlay';
            
            var text = document.createElement('div');
            text.className = 'wire-hold-text';
            text.textContent = 'HOLD';
            
            var label = document.createElement('div');
            label.className = 'wire-label';
            label.textContent = Game.WIRE_COLOR_NAMES[color] || 'WIRE';
            
            wire.appendChild(overlay);
            wire.appendChild(text);
            wire.appendChild(label);
            
            wire.addEventListener('mousedown', function(e) { Game.level3.startWireHold(e, wire); });
            wire.addEventListener('touchstart', function(e) { Game.level3.startWireHold(e, wire); }, { passive: false });
            wire.addEventListener('mouseup', function(e) { Game.level3.cancelWireHold(e, wire); });
            wire.addEventListener('touchend', function(e) { Game.level3.cancelWireHold(e, wire); });
            wire.addEventListener('mouseleave', function(e) { Game.level3.cancelWireHold(e, wire); });
            
            container.appendChild(wire);
            Game.state.bombWireElements.push(wire);
        });
    },
    
    startWireHold: function(e, wire) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!Game.state.isChallengeActive || wire.classList.contains('cut')) return;
        
        var wireOrderNum = parseInt(wire.dataset.order);
        
        if (wireOrderNum !== Game.state.cutCount + 1) {
            Game.level3.fail('WRONG');
            return;
        }
        
        Game.state.holdingWire = wire;
        Game.state.holdStartTime = Date.now();
        wire.classList.add('holding');
        
        Game.state.wireHoldInterval = setInterval(function() {
            if (!Game.state.holdingWire) return;
            
            var elapsed = Date.now() - Game.state.holdStartTime;
            var progress = Math.min(elapsed / 3000, 1);
            
            if (progress >= 1) {
                Game.level3.cutWire(wire);
            }
        }, 50);
    },
    
    cancelWireHold: function(e, wire) {
        if (Game.state.holdingWire === wire) {
            wire.classList.remove('holding');
            Game.state.holdingWire = null;
            clearInterval(Game.state.wireHoldInterval);
        }
    },
    
    cutWire: function(wire) {
        wire.classList.remove('holding');
        Game.state.holdingWire = null;
        clearInterval(Game.state.wireHoldInterval);
        
        wire.classList.add('cut');
        wire.style.animation = 'cutWire 0.5s ease forwards';
        Game.state.cutCount++;
        
        if (Game.state.cutCount >= 3) {
            Game.utils.clearIntervalAll();
            Game.state.isChallengeActive = false;
            Game.level3.complete();
        }
    },
    
    submitAnswer: function() {
        if (Game.state.currentLevel !== 3 || !Game.state.isChallengeActive) return;
        
        var input = document.getElementById('answerInput');
        var userAnswer = input.value.trim().toUpperCase();
        
        if (userAnswer === Game.state.currentRiddle.currentAnswer) {
            Game.utils.clearIntervalAll();
            Game.state.isChallengeActive = false;
            Game.level3.complete();
        } else {
            Game.level3.fail('WRONG');
        }
    },
    
    complete: function() {
        Game.sanity.onLevelComplete();
        
        var hint = document.getElementById('challengeHintGlobal');
        hint.textContent = 'You survived... for now.';
        hint.style.color = '#8f8';
        document.body.classList.remove('challenge-active');
        
        var l3 = document.getElementById('level3Content');
        if (l3) l3.style.opacity = '0';
        
        setTimeout(function() {
            document.getElementById('challengeScreen').classList.remove('active');
            Game.narrative.showPostLevel(3, function() {
                Game.startLevel(4);
            });
        }, 500);
    },
    
    fail: function(reason) {
        Game.state.isChallengeActive = false;
        Game.utils.clearIntervalAll();
        Game.sanity.onLevelFail(Game.state.timeLeft, 45);
        
        if (Game.sanity.current <= 0) {
            Game.triggerJumpscare('INSANITY');
            return;
        }
        
        Game.triggerJumpscare(reason);
    }
};
