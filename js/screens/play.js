game.PlayScreen = me.Stage.extend({
    /**
     *  cand incepe ecranul
     */
    onResetEvent: function() {
        me.levelDirector.loadLevel("level1")

        game.data.score = 0

        this.HUD = new game.HUD.Container()
        me.game.world.addChild(this.HUD)
    },

    /**
     *  cand se schimba ecranul
     */
    onDestroyEvent: function() {
        
    }
});
