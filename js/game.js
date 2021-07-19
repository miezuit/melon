
/* Game */
var game = {

    // an object where to store game information
    data: {
        score: 0
    },


    // Run on page load.
    "onload": function () {
        // Initializeaza canvas-ul.
        if (!me.video.init(640, 480, {
            wrapper: "screen", scale: "auto", scaleMethod: "flex"
        })) {
            alert("Your browser does not support HTML5 canvas.")
        }

        me.audio.init("mp3,ogg");

        me.loader.preload(game.resources, this.loaded.bind(this));
    },

        // Run on game resources loaded.
        "loaded" : function () {
            me.state.set(me.state.PLAY, new game.PlayScreen())

            me.pool.register("mainPlayer", game.PlayerEntity)
            me.pool.register("coin", game.Coin)
            me.pool.register("danger", game.Danger)

            me.input.bindKey(me.input.KEY.LEFT, "left")
            me.input.bindKey(me.input.KEY.RIGHT, "right")
            me.input.bindKey(me.input.KEY.A, "left")
            me.input.bindKey(me.input.KEY.D, "right")
            me.input.bindKey(me.input.KEY.UP, "jump", true)
            me.input.bindKey(me.input.KEY.SPACE, "jump", true)
            me.input.bindKey(me.input.KEY.W, "jump", true)

            me.state.change(me.state.PLAY)
        }
    };
