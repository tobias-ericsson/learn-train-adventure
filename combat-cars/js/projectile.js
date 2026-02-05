class Projectile {
    constructor(game, position, angle, ownerId) {
        this.game = game;
        this.ownerId = ownerId;
        this.body = null;
        this.graphics = null;
        this.active = true;
        this.lifetime = 2000; // 2 seconds
        this.age = 0;
        
        // Projectile properties
        this.radius = 0.2;
        this.speed = 20;
        this.damage = 10;
        
        this.createPhysicsBody(position, angle);
        this.createGraphics();
    }
    
    createPhysicsBody(position, angle) {
        this.body = this.game.world.createBody({
            type: 'dynamic',
            position: position,
            angle: angle,
            bullet: true // Set as bullet for continuous collision detection
        });
        
        // Create circular fixture
        const shape = new planck.Circle(this.radius);
        this.body.createFixture({
            shape: shape,
            density: 0.1,
            friction: 0,
            restitution: 0
        });
        
        // Set velocity
        const velocity = new planck.Vec2(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        this.body.setLinearVelocity(velocity);
        
        // Set user data
        this.body.setUserData(this);
    }
    
    createGraphics() {
        this.graphics = new PIXI.Graphics();
        this.updateGraphics();
    }
    
    updateGraphics() {
        this.graphics.clear();
        
        const pos = this.body.getPosition();
        
        const screenX = pos.x * 50 + this.game.app.screen.width / 2;
        const screenY = pos.y * 50 + this.game.app.screen.height / 2;

        // Draw projectile
        this.graphics.lineStyle(1, 0xffff00);
        this.graphics.beginFill(0xffff00, 0.8);
        this.graphics.drawCircle(screenX, screenY, this.radius * 50);
        this.graphics.endFill();
        
        // Draw trail effect
        const velocity = this.body.getLinearVelocity();
        const trailLength = 2;
        const trailEnd = new planck.Vec2(
            pos.x - velocity.x * trailLength / this.speed,
            pos.y - velocity.y * trailLength / this.speed
        );
        
        const trailScreenX = trailEnd.x * 50 + this.game.app.screen.width / 2;
        const trailScreenY = trailEnd.y * 50 + this.game.app.screen.height / 2;

        this.graphics.lineStyle(2, 0xffaa00, 0.5);
        this.graphics.moveTo(screenX, screenY);
        this.graphics.lineTo(trailScreenX, trailScreenY);
    }
    
    update() {
        if (!this.active) return;
        
        this.age += 16; // Assuming 60 FPS
        
        // Check lifetime
        if (this.age >= this.lifetime) {
            this.destroy();
            return;
        }
        
        this.updateGraphics();
    }
    
    render(stage) {
        if (this.active && this.graphics) {
            console.log(`Rendering projectile - active: ${this.active}, graphics: ${this.graphics}`);
            stage.addChild(this.graphics);
        } else {
            console.log(`Not rendering projectile - active: ${this.active}, graphics: ${this.graphics}`);
        }
    }
    
    isActive() {
        return this.active;
    }
    
    getBody() {
        return this.body;
    }
    
    getDamage() {
        return this.damage;
    }
    
    destroy() {
        this.active = false;
        
        if (this.body) {
            this.game.world.destroyBody(this.body);
            this.body = null;
        }
        
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
    }
}