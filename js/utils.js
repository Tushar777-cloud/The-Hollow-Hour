window.Game = window.Game || {};

Game.utils = {
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    shuffle: function(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },
    
    wait: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    clearIntervalAll: function() {
        if (Game.state.challengeTimer) clearInterval(Game.state.challengeTimer);
        if (Game.state.buttonSpawnTimer) clearInterval(Game.state.buttonSpawnTimer);
        if (Game.state.wireHoldInterval) clearInterval(Game.state.wireHoldInterval);
        if (Game.state.nauseaTimer) clearInterval(Game.state.nauseaTimer);
    }
};
