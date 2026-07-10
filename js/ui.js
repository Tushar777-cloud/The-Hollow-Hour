window.Game = window.Game || {};

Game.ui = {
    show: function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    },
    
    hide: function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    },
    
    showBlock: function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'block';
    },
    
    hideBlock: function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    },
    
    setText: function(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    },
    
    typeWriter: function(elementId, text, speed, callback) {
        var el = document.getElementById(elementId);
        if (!el) return;
        
        el.textContent = '';
        var i = 0;
        
        function type() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        
        type();
    },
    
    updateSanityBar: function(sanity) {
        var fill = document.getElementById('sanityFill');
        var value = document.getElementById('sanityValue');
        var container = document.getElementById('sanityBarContainer');
        
        if (!fill || !value) return;
        
        container.style.display = 'flex';
        fill.style.width = sanity + '%';
        value.textContent = Math.round(sanity);
        
        fill.classList.remove('low', 'critical');
        if (sanity <= 20) {
            fill.classList.add('critical');
        } else if (sanity <= 50) {
            fill.classList.add('low');
        }
        
        document.body.classList.remove('sanity-low', 'sanity-medium', 'sanity-critical', 'sanity-nausea');
        if (sanity <= 10) {
            document.body.classList.add('sanity-nausea');
        } else if (sanity <= 20) {
            document.body.classList.add('sanity-critical');
        } else if (sanity <= 40) {
            document.body.classList.add('sanity-medium');
        } else if (sanity <= 60) {
            document.body.classList.add('sanity-low');
        }
    },
    
    hideSanityBar: function() {
        var container = document.getElementById('sanityBarContainer');
        if (container) container.style.display = 'none';
        document.body.classList.remove('sanity-low', 'sanity-medium', 'sanity-critical', 'sanity-nausea');
    },
    
    showLevelContent: function(level) {
        var l1 = document.getElementById('level1Content');
        var l2 = document.getElementById('level2Content');
        var l3 = document.getElementById('level3Content');
        var l4 = document.getElementById('level4Content');
        var l5 = document.getElementById('level5Content');
        var l6 = document.getElementById('level6Content');
        var l7 = document.getElementById('level7Content');
        var l8 = document.getElementById('level8Content');
        var l9 = document.getElementById('level9Content');
        var l10 = document.getElementById('level10Content');
        
        if (l1) l1.style.display = level === 1 ? 'flex' : 'none';
        if (l2) l2.style.display = level === 2 ? 'flex' : 'none';
        if (l3) l3.style.display = level === 3 ? 'flex' : 'none';
        if (l4) l4.style.display = level === 4 ? 'flex' : 'none';
        if (l5) l5.style.display = level === 5 ? 'flex' : 'none';
        if (l6) l6.style.display = level === 6 ? 'flex' : 'none';
        if (l7) l7.style.display = level === 7 ? 'flex' : 'none';
        if (l8) l8.style.display = level === 8 ? 'flex' : 'none';
        if (l9) l9.style.display = level === 9 ? 'flex' : 'none';
        if (l10) l10.style.display = level === 10 ? 'flex' : 'none';
    }
};
