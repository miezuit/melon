/**
 * Coin Entity
 */
game.Coin = me.Entity.extend({

    /**
     * constructor
     */
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings])

        this.renderable.addAnimation("spin", [0, 1, 2, 3, 4, 5, 6, 7])

        this.renderable.setCurrentAnimation("spin")

        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT
    },

    onCollision: function (response, other) {
        // do something when collected
        // make sure it cannot be collected "again"
        this.body.setCollisionMask(me.collision.types.NO_OBJECT)
        // remove it
        me.game.world.removeChild(this)

        game.data.score++

        return false
    }
});