
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // score
        score : 0
    },


    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(640, 480, {wrapper : "screen", scale : "auto", scaleMethod : "flex"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set and load all resources.
        // (this will also automatically switch to the loading screen)
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    "loaded" : function () {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // add our player entity in the entity pool
        me.pool.register("mainPlayer", game.PlayerEntity);
        me.pool.register("enemyEntity", game.EnemyEntity);
        me.pool.register("staticEnemy", game.StaticEnemy);
        me.pool.register("coinEntity", game.Coin);

        // mapam tastele
        me.input.bindKey(me.input.KEY.LEFT, "left")
        me.input.bindKey(me.input.KEY.RIGHT, "right")
        me.input.bindKey(me.input.KEY.A, "left")
        me.input.bindKey(me.input.KEY.D, "right")
        me.input.bindKey(me.input.KEY.UP, "jump")
        me.input.bindKey(me.input.KEY.SPACE, "jump")
        me.input.bindKey(me.input.KEY.W, "jump")

        // Show menu.
        me.state.change(me.state.MENU);
    }
};

game.resources = [
    {
        "name": "dst-inertexponent",
        "type": "audio",
        "src": "data/bgm/"
    },
    {
        "name": "cling",
        "type": "audio",
        "src": "data/sfx/"
    },
    {
        "name": "jump",
        "type": "audio",
        "src": "data/sfx/"
    },
    {
        "name": "stomp",
        "type": "audio",
        "src": "data/sfx/"
    },
    {
        "name": "area01_bkg0",
        "type": "image",
        "src": "data/img/area01_bkg0.png"
    },
    {
        "name": "area01_bkg1",
        "type": "image",
        "src": "data/img/area01_bkg1.png"
    },
    {
        "name": "title_screen",
        "type": "image",
        "src": "data/img/gui/title_screen.png"
    },
    {
        "name": "area01_level_tiles",
        "type": "image",
        "src": "data/img/map/area01_level_tiles.png"
    },
    {
        "name": "gripe_run_right",
        "type": "image",
        "src": "data/img/sprite/gripe_run_right.png"
    },
    {
        "name": "spinning_coin_gold",
        "type": "image",
        "src": "data/img/sprite/spinning_coin_gold.png"
    },
    {
        "name": "wheelie_right",
        "type": "image",
        "src": "data/img/sprite/wheelie_right.png"
    },
    {
        "name": "area01",
        "type": "tmx",
        "src": "data/map/area01.tmx"
    },
    {
        "name": "game01",
        "type": "tmx",
        "src": "data/map/game01.tmx"
    },
    {
        "name": "game02",
        "type": "tmx",
        "src": "data/map/game02.tmx"
    },
    {
        "name": "mymap",
        "type": "tmx",
        "src": "data/map/mymap.tmx"
    },
    {
        "name": "area01_level_tiles",
        "type": "tsx",
        "src": "data/map/area01_level_tiles.tsx"
    },
    {
        "name": "game01_level_tiles",
        "type": "tsx",
        "src": "data/map/game01_level_tiles.tsx"
    },
    {
        "name": "PressStart2P",
        "type": "binary",
        "src": "data/fnt/PressStart2P.fnt"
    },
    {
        "name": "PressStart2P",
        "type": "image",
        "src": "data/fnt/PressStart2P.png"
    }
];
/**
 * Coin Entity
 */
game.Coin = me.CollectableEntity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        me.CollectableEntity.prototype.init.apply(this, [x, y , settings])
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        // dispare moneda
        this.body.setCollisionMask(me.collision.types.NO_OBJECT)

        // sunet
        me.audio.play("cling", false)

        // scoatem moneda din joc
        me.game.world.removeChild(this)

        // crestem scorul
        game.data.score += 100

        // obiectul nu este solid
        return false
    }
})
/**
 * Enemy Entity
 */
game.EnemyEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {

        // salvam lungimea initiala a elementului din harta
        // (locul unde se plimba)
        var width = settings.width || settings.framewidth

        // definim imaginea
        settings.image = "wheelie_right"

        // setam lungimea si inaltimea frame-ului
        settings.framewidth = settings.width = 64
        settings.frameheight = settings.height = 64

        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight)

        // call the constructor
        me.Entity.prototype.init.apply(this, [x, y , settings])

        x = this.pos.x
        // de unde porneste
        this.startX = x
        // unde se intoarce
        this.endX = x + width - settings.framewidth
        // pozitia intiala
        this.pos.x = this.endX

        // directia de mers
        this.walkLeft = false

        // setam viteza maxima si frictiunea
        this.body.setMaxVelocity(1, 0)
        //this.body.setFriction(0.4, 0)
        this.body.force.set(1, 0)

        // setam tipul de coliziune pentru a recunaste acest tip de obiect
        this.body.collisionType = me.collision.types.ENEMY_OBJECT

        // nu vrem sa actualizam personajul cat timp nu este vizibil
        this.alwaysUpdate = true

        // este un inamic in miscare
        this.isMovingEnemy = true
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // a ajuns la start?
        if (this.walkLeft && this.pos.x <= this.startX) {
            // forta este pozitiva (merge la dreapta)
            this.body.force.x = Math.abs(this.body.force.x)
            // il intoarcem cu fata spre dreapta
            this.renderable.flipX(false)
            this.walkLeft = false
        } else if (!this.walkLeft && this.pos.x >= this.endX) {
            // a ajuns la final?
            // forta este negativa (merge la stanga)
            this.body.force.x = -Math.abs(this.body.force.x)
            // il intoarcem cu fata spre stanga
            this.renderable.flipX(true)
            this.walkLeft = true
        }
        this.body.update(dt)

        // verificam daca corpul se misca si trebuie actualizat
        if (me.Entity.prototype.update.apply(this, [dt]) || 
            this.body.vel.x !== 0 || this.body.vel.y !== 0) {
                return true;
            }
        
        // nu se misca
        return false;
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            // omoram personajul
            this.alive = false
            // crestem scorul
            game.data.score += 50
            // sterge obiectul
            this.body.setCollisionMask(me.collision.types.NO_OBJECT)
            // flickering:
            var self = this
            this.renderable.flicker(1000, function () {
                me.game.world.removeChild(self)
            })
        }
        // Make all other objects solid
        return true;
    }
});


/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        me.Entity.prototype.init.apply(this, [x, y , settings])

        // setam viteza maxima si frictiunea
        this.body.setMaxVelocity(3, 14)
        this.body.setFriction(0.4, 0)

        // setam display-ul sa urmareasca personajul nostru
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4)

        this.alwaysUpdate = true

        // definim animatia pentru mers
        this.renderable.addAnimation("walk", [0, 1, 2, 3, 4, 5, 6, 7])

        // definim animatia pentru stat pe loc
        this.renderable.addAnimation("stand", [0])

        // setam animatia default
        this.renderable.setCurrentAnimation("stand")
    },

    /**
     * update the entity
     */
    update : function (dt) {

        if (me.input.isKeyPressed("left")) {
            // schimbam orientarea
            this.renderable.flipX(true)
            // schimbam directia vitezei (velocitatea)
            this.body.force.x = -this.body.maxVel.x
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk")
            }
        } else if (me.input.isKeyPressed("right")) {
            // schimbam orientarea
            this.renderable.flipX(false)
            // schimbam directia vitezei (velocitatea)
            this.body.force.x = this.body.maxVel.x
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk")
            }
        } else {
            // setam viteaza 0 pe axa x
            this.body.force.x = 0
            this.renderable.setCurrentAnimation("stand")
        }

        if (me.input.isKeyPressed("jump")) {
            this.body.jumping = true
            if (this.multipleJump <= 2) {
                // easy "math" for double jump
                this.body.force.y = -this.body.maxVel.y * this.multipleJump++;
                me.audio.play("jump", false);
            }
        }
        else {

            this.body.force.y = 0;

            if (!this.body.falling && !this.body.jumping) {
                // reset the multipleJump flag if on the ground
                this.multipleJump = 1;
            }
            else if (this.body.falling && this.multipleJump < 2) {
                // reset the multipleJump flag if falling
                this.multipleJump = 2;
            }
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
            (this.renderable && this.renderable.isFlickering())
        ) {
            me.Entity.prototype.update.apply(this, [dt]);
            return true;
        }

        return false;
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        switch (response.b.body.collisionType) {
        
            case me.collision.types.ENEMY_OBJECT:
                if (!other.isMovingEnemy) {
                    // spike or any other fixed danger
                    this.body.vel.y -= this.body.maxVel.y * me.timer.tick;
                    this.hurt();
                }
                else {
                    // a regular moving enemy entity
                    if ((response.overlapV.y > 0) && this.body.falling) {
                        // jump
                        this.body.vel.y -= this.body.maxVel.y * 1.5 * me.timer.tick;
                    }
                    else {
                        this.hurt();
                    }
                    // Not solid
                    return false;
                }
                break;
        
            default:
              // Make the object solid
              return true;
          }
    },

    /**
     * ouch
     */
    hurt : function () {
        if (!this.renderable.isFlickering())
        {
            this.renderable.flicker(750);
            // flash the screen
            me.game.viewport.fadeIn("#FFFFFF", 75);
            me.audio.play("stomp", false);
        }
    }
});



/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.Container.extend({

    init: function() {
        // call the constructor
        me.Container.prototype.init.apply(this);

        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = "HUD";

        // adaugam scorul
        this.addChild(new game.HUD.ScoreItem(-5, -5));
    }
});


/**
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {

        // call the parent constructor
        // (size does not matter here)
        me.Renderable.prototype.init.apply(this, [x, y, 10, 10]);

        // intializam fontul
        this.font = new me.BitmapFont(
            me.loader.getBinary('PressStart2P'),
            me.loader.getImage('PressStart2P'),
        )

        // setam alinierea si pozitia
        this.font.textAlign = "right"
        this.font.textBaseline = "bottom"

        // local copy of the global score
        this.score = -1;
    },

    /**
     * update function
     */
    update : function () {
        // we don't do anything fancy here, so just
        // return true if the score has been updated
        if (this.score !== game.data.score) {
            this.score = game.data.score;
            return true;
        }
        return false;
    },

    /**
     * draw the score
     */
    draw : function (renderer) {
        // desenam scorul
        this.font.draw(
            renderer,
            game.data.score,
            me.game.viewport.width + this.pos.x,
            me.game.viewport.height + this.pos.y
        )
    }

});

/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        me.Entity.prototype.init.apply(this, [x, y , settings])

        // setam viteza maxima si frictiunea
        this.body.setMaxVelocity(3, 14)
        this.body.setFriction(0.4, 0)

        // setam display-ul sa urmareasca personajul nostru
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4)

        this.alwaysUpdate = true

        // definim animatia pentru mers
        this.renderable.addAnimation("walk", [0, 1, 2, 3, 4, 5, 6, 7])

        // definim animatia pentru stat pe loc
        this.renderable.addAnimation("stand", [0])

        // setam animatia default
        this.renderable.setCurrentAnimation("stand")
    },

    /**
     * update the entity
     */
    update : function (dt) {

        if (me.input.isKeyPressed("left")) {
            // schimbam orientarea
            this.renderable.flipX(true)
            // schimbam directia vitezei (velocitatea)
            this.body.force.x = -this.body.maxVel.x
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk")
            }
        } else if (me.input.isKeyPressed("right")) {
            // schimbam orientarea
            this.renderable.flipX(false)
            // schimbam directia vitezei (velocitatea)
            this.body.force.x = this.body.maxVel.x
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk")
            }
        } else {
            // setam viteaza 0 pe axa x
            this.body.force.x = 0
            this.renderable.setCurrentAnimation("stand")
        }

        if (me.input.isKeyPressed("jump")) {
            this.body.jumping = true
            if (this.multipleJump <= 2) {
                // easy "math" for double jump
                this.body.force.y = -this.body.maxVel.y * this.multipleJump++;
                
                me.audio.play("jump", false)
            }
        }
        else {

            this.body.force.y = 0;

            if (!this.body.falling && !this.body.jumping) {
                // reset the multipleJump flag if on the ground
                this.multipleJump = 1;
            }
            else if (this.body.falling && this.multipleJump < 2) {
                // reset the multipleJump flag if falling
                this.multipleJump = 2;
            }
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
            (this.renderable && this.renderable.isFlickering())
        ) {
            me.Entity.prototype.update.apply(this, [dt]);
            return true;
        }

        return false;
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {

        switch(response.b.body.collisionType) {

            case me.collision.types.ENEMY_OBJECT:
                // daca este inamic mobil
                if (other.isMovingEnemy) {
                    // saritura in capul inamicului
                    if (response.overlapV.y > 0 && this.body.falling) {
                        // sare
                        this.body.vel.y = -this.body.maxVel.y * 1.5 * me.timer.tick
                    } else {
                        this.hurt()
                    }
                } else {
                    // inamic fix
                    // sare
                    this.body.vel.y = -this.body.maxVel.y * me.timer.tick
                    // este ranit
                    this.hurt()
                }
                return false
                break

            default:
                return true
        }

        return true
    },


    hurt: function() {
        if (!this.renderable.isFlickering()) {
            this.renderable.flicker(1000)
            me.audio.play("stomp", false)
        }
    }
});



/**
 * Enemy Entity
 */
game.StaticEnemy = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {

        // setam lungimea si inaltimea frame-ului
        settings.framewidth = settings.width
        settings.frameheight = settings.height

        // call the constructor
        me.Entity.prototype.init.apply(this, [x, y , settings])

        // setam tipul de coliziune pentru a recunaste acest tip de obiect
        this.body.collisionType = me.collision.types.ENEMY_OBJECT

        // nu vrem sa actualizam personajul cat timp nu este vizibil
        this.alwaysUpdate = false

        // este un inamic in miscare
        this.isMovingEnemy = false
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // nu se misca
        return false;
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        // Make all other objects solid
        return true;
    }
});


game.PlayScreen = me.Stage.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // reset the score
        game.data.score = 0;

        // load map
        me.levelDirector.loadLevel("game01")

        // play audio track
        // me.audio.playTrack("dst-inertexponent")

        // Add our HUD to the game world, add it last so that this is on top of the rest.
        // Can also be forced by specifying a "Infinity" z value to the addChild function.
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        me.audio.stopTrack()

        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
    }
});

game.TitleScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // setam o imagine de background
        let back = new me.Sprite(
            0, 0, { image: me.loader.getImage('title_screen') }
        )
        console.log(me.game.viewport.width)

        back.anchorPoint.set(0, 0)
        back.scale(me.game.viewport.width / back.width, me.game.viewport.height / back.height)
        
        me.game.world.addChild(back, 1)

        // scrolling text
        let text = new (me.Renderable.extend({
            init: function() {
                me.Renderable.prototype.init.apply(this, [0, 0, me.game.viewport.width, me.game.viewport.height])
            
                this.font = new me.BitmapFont(me.loader.getBinary('PressStart2P'), me.loader.getImage('PressStart2P'))

                this.scrolltween = new me.Tween(this)
                                        .to({scrollerpos: -800 }, 1000)
                                        .onComplete(this.scrollover.bind(this))
                                        .start()

                this.scroller = "WELCOME TO MY FIRST MELONJS GAME! PLEASE SEND ME FEEDBACK"
                this.scroollerpos = 640
            },
            scrollover: function() {
                this.scrollerpos = 640
                this.scrolltween = new me.Tween(this)
                                        .to({scrollerpos: -800 }, 1000)
                                        .onComplete(this.scrollover.bind(this))
                                        .start()
            },
            update: function() {
                return true
            },
            draw: function(renderer) {
                this.font.draw(renderer, "PRESS ENTER TO PLAY", 20, 240)
                this.font.draw(renderer, this.scroller, this.scrollerpos, 400)
            },
            onDestroyEvent: function() {
                this.scrollertween.stop()
            }
        }))

        me.game.world.addChild(text, 2)

        // schimbam ecranul cand se apasa enter sau se da click
        me.input.bindKey(me.input.KEY.ENTER, "start", true)
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER)
        this.startHandler = me.event.subscribe(me.event.KEYDOWN, (action) => {
            if (action === "start") {
                // efect sonor
                me.audio.play("cling")
                // pornim jocul
                me.state.change(me.state.PLAY)
            }
        })
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER)
        me.input.unbindPointer(me.input.pointer.LEFT)
        me.event.unsubscribe(this.startHandler)
    }
});
