/**
 * Danger Entity
 */
 game.Danger = me.Entity.extend({

    /**
     * constructor
     */
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings])

        this.body.collisionType = me.collision.types.ENEMY_OBJECT
    },

    onCollision: function (response, other) {
        this.body.setCollisionMask(me.collision.types.NO_OBJECT)
        setTimeout(750, () => this.body.collisionType = me.collision.types.ENEMY_OBJECT)
        return true
    }

});