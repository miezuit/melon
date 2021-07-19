/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

  /**
   * constructor
   */
  init: function (x, y, settings) {
    this._super(me.Entity, 'init', [x, y, settings])

    // setam viteza maxima si frictiunea
    this.body.setMaxVelocity(3, 14)
    this.body.setFriction(1, 0)

    me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4)

    this.alwaysUpdate = true

    this.renderable.addAnimation("walk", [0, 1, 2, 3, 4, 5, 6, 7])

    this.renderable.addAnimation("stand", [0])

    this.renderable.setCurrentAnimation("stand")
  },

  /**
   * update the entity
   */
  update: function (dt) {
    if (me.input.isKeyPressed("right")) {
      // schimbam orientarea
      this.renderable.flipX(false)
      // schimbam directia vitezei (velocitatea)
      this.body.force.x = this.body.maxVel.x
      if (!this.renderable.isCurrentAnimation("walk")) {
        this.renderable.setCurrentAnimation("walk")
      }
    } else if (me.input.isKeyPressed("left")) {
      // schimbam orientarea
      this.renderable.flipX(true)
      // schimbam directia vitezei (velocitatea)
      this.body.force.x = -this.body.maxVel.x
      if (!this.renderable.isCurrentAnimation("walk")) {
        this.renderable.setCurrentAnimation("walk")
      }
    }
    else {
      // setam viteaza 0 pe axa x
      this.body.force.x = 0
      this.renderable.setCurrentAnimation("stand")
    }

    if (me.input.isKeyPressed("jump")) {
      // easy "math" for double jump
      this.body.force.y = -this.body.maxVel.y
      me.audio.play("jump", false)
    } else {
      this.body.force.y = 0
    }

    this.body.update(dt)

    me.collision.check(this)

    // verifica daca s-a miscat
    if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
      (this.renderable && this.renderable.isFlickering())
    ) {
      this._super(me.Entity, "update", [dt]);
      return true;
    }
    return false;
  },

  /**
    * colision handler
    * (called when colliding with other objects)
    */
  onCollision: function (response, other) {
    switch (response.b.body.collisionType) {
      case me.collision.types.WORLD_SHAPE:
        // it is solid
        return true
      case me.collision.types.ENEMY_OBJECT:
        this.renderable.flicker(750)
        return true
      default:
        return false
    }
  },

  /**
   * ouch
   */
  hurt: function () {

  }
});


