class Car {
    constructor(game, position, color, playerId) {
        this.game = game;
        this.color = color;
        this.playerId = playerId;
        this.body = null;
        this.graphics = null;
        
        // Car properties (smaller cars)
        this.width = 1.5;
        this.height = 0.8;
        this.speed = 0;
        this.maxSpeed = 3;
        this.acceleration = 0.2;
        this.deceleration = 0.3;
        this.turnSpeed = 0;
        this.maxTurnSpeed = 4; // Much smaller turn radius
        this.turnAcceleration = 0.3;
        
        // Advanced health system with sections and wheels
        this.sections = {
            front: { health: 100, maxHealth: 100, x: 0, y: -this.height/2 },
            back: { health: 100, maxHealth: 100, x: 0, y: this.height/2 },
            left: { health: 100, maxHealth: 100, x: -this.width/2, y: 0 },
            right: { health: 100, maxHealth: 100, x: this.width/2, y: 0 },
            center: { health: 100, maxHealth: 100, x: 0, y: 0 }
        };
        
        this.wheels = {
            frontLeft: { health: 100, maxHealth: 100, x: -this.width/3, y: -this.height/2 },
            frontRight: { health: 100, maxHealth: 100, x: this.width/3, y: -this.height/2 },
            backLeft: { health: 100, maxHealth: 100, x: -this.width/3, y: this.height/2 },
            backRight: { health: 100, maxHealth: 100, x: this.width/3, y: this.height/2 }
        };
        
        // Movement flags based on damage
        this.motorDisabled = false;
        this.weaponDisabled = false;
        this.steeringAffected = false;
        
        // Shooting
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownTime = 1000; // 1 second
        
        this.createPhysicsBody(position);
        this.createGraphics();
    }
    
    createPhysicsBody(position) {
        this.body = this.game.world.createBody({
            type: 'dynamic',
            position: position,
            angle: 0,
            linearDamping: 0.5,
            angularDamping: 0.8
        });
        
        // Create rectangular fixture
        const shape = new planck.Box(this.width / 2, this.height / 2);
        this.body.createFixture({
            shape: shape,
            density: 1,
            friction: 0.3,
            restitution: 0.2
        });
        
        // Set user data for collision detection
        this.body.setUserData(this);
    }
    
    createGraphics() {
        this.graphics = new PIXI.Graphics();
        this.updateGraphics();
    }
    
    updateGraphics() {
        this.graphics.clear();
        
        const pos = this.body.getPosition();
        const angle = this.body.getAngle();
        
        // Draw car body
        this.graphics.lineStyle(2, this.color);
        this.graphics.beginFill(this.color, 0.7);
        
        // Calculate car corners
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const corners = [
            { x: -this.width/2, y: -this.height/2 },
            { x: this.width/2, y: -this.height/2 },
            { x: this.width/2, y: this.height/2 },
            { x: -this.width/2, y: this.height/2 }
        ];
        
        corners.forEach((corner, i) => {
            const rotatedX = corner.x * cos - corner.y * sin;
            const rotatedY = corner.x * sin + corner.y * cos;
            const screenX = (pos.x + rotatedX) * 50 + this.game.app.screen.width / 2; // Convert to screen coordinates and center
            const screenY = (pos.y + rotatedY) * 50 + this.game.app.screen.height / 2;
            
            if (i === 0) {
                this.graphics.moveTo(screenX, screenY);
            } else {
                this.graphics.lineTo(screenX, screenY);
            }
        });
        
        this.graphics.closePath();
        this.graphics.endFill();
        
        // Draw front indicator (triangle pointing forward)
        const frontX = pos.x + cos * this.width/2;
        const frontY = pos.y + sin * this.width/2;
        
        this.graphics.beginFill(0xFFFF00); // Yellow front indicator
        const triangleSize = 0.4;
        
        // Triangle points
        const triangleTip = {
            x: frontX * 50 + this.game.app.screen.width / 2,
            y: frontY * 50 + this.game.app.screen.height / 2
        };
        const triangleLeft = {
            x: (frontX - cos * triangleSize - sin * triangleSize/2) * 50 + this.game.app.screen.width / 2,
            y: (frontY - sin * triangleSize + cos * triangleSize/2) * 50 + this.game.app.screen.height / 2
        };
        const triangleRight = {
            x: (frontX - cos * triangleSize + sin * triangleSize/2) * 50 + this.game.app.screen.width / 2,
            y: (frontY - sin * triangleSize - cos * triangleSize/2) * 50 + this.game.app.screen.height / 2
        };
        
        this.graphics.moveTo(triangleTip.x, triangleTip.y);
        this.graphics.lineTo(triangleLeft.x, triangleLeft.y);
        this.graphics.lineTo(triangleRight.x, triangleRight.y);
        this.graphics.closePath();
        this.graphics.endFill();
        
        // Draw back indicator (larger circle)
        const backX = pos.x - cos * this.width/2;
        const backY = pos.y - sin * this.width/2;
        this.graphics.beginFill(0xFF0000); // Red back indicator
        this.graphics.drawCircle(backX * 50 + this.game.app.screen.width / 2, backY * 50 + this.game.app.screen.height / 2, 8);
        this.graphics.endFill();
        
        this.drawSectionHealthIndicators(pos, angle, cos, sin);
        this.drawWheelHealthIndicators(pos, angle, cos, sin);
    }
    
    drawHealthIndicator(pos, angle) {
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 40;
        const barHeight = 4;
        
        // Background
        const centerX = this.game.app.screen.width / 2;
        const centerY = this.game.app.screen.height / 2;
        
        this.graphics.lineStyle(1, 0x000000);
        this.graphics.beginFill(0x333333);
        this.graphics.drawRect(
            (pos.x - barWidth/2) * 50 + centerX,
            (pos.y - this.height/2 - 10) * 50 + centerY,
            barWidth * 50,
            barHeight * 50
        );
        this.graphics.endFill();
        
        // Health fill
        const healthColor = healthPercent > 0.5 ? 0x00ff00 : 
                           healthPercent > 0.25 ? 0xffff00 : 0xff0000;
        
        this.graphics.beginFill(healthColor);
        this.graphics.drawRect(
            (pos.x - barWidth/2) * 50 + centerX,
            (pos.y - this.height/2 - 10) * 50 + centerY,
            barWidth * healthPercent * 50,
            barHeight * 50
        );
        this.graphics.endFill();
    }
    
    drawSectionHealthIndicators(pos, angle, cos, sin) {
        
        // Draw each section's health
        Object.entries(this.sections).forEach(([sectionName, section]) => {
            const healthPercent = section.health / section.maxHealth;
            
            // Transform section position to world coordinates
            const worldX = section.x * cos - section.y * sin + pos.x;
            const worldY = section.x * sin + section.y * cos + pos.y;
            
            // Draw section indicator
            const indicatorSize = 0.3;
            const healthColor = healthPercent > 0.5 ? 0x00ff00 : 
                               healthPercent > 0.25 ? 0xffff00 : 0xff0000;
            
            const screenX = worldX * 50 + this.game.app.screen.width / 2;
            const screenY = worldY * 50 + this.game.app.screen.height / 2;
            
            this.graphics.lineStyle(1, healthColor);
            this.graphics.beginFill(healthColor, healthPercent * 0.7);
            this.graphics.drawCircle(screenX, screenY, indicatorSize * 50);
            this.graphics.endFill();
            
            // Draw section border
            this.graphics.lineStyle(1, 0x000000);
            this.graphics.drawCircle(screenX, screenY, indicatorSize * 50);
        });
    }
    
    drawWheelHealthIndicators(pos, angle, cos, sin) {
        
        // Draw each wheel's health
        Object.entries(this.wheels).forEach(([wheelName, wheel]) => {
            const healthPercent = wheel.health / wheel.maxHealth;
            
            // Transform wheel position to world coordinates
            const worldX = wheel.x * cos - wheel.y * sin + pos.x;
            const worldY = wheel.x * sin + wheel.y * cos + pos.y;
            
            // Draw wheel indicator (rectangular)
            const wheelWidth = 0.2;
            const wheelHeight = 0.1;
            const healthColor = healthPercent > 0.5 ? 0x0066ff : 
                               healthPercent > 0.25 ? 0xffaa00 : 0xff0000;
            
            this.graphics.lineStyle(1, healthColor);
            this.graphics.beginFill(healthColor, healthPercent * 0.7);
            
            // Calculate wheel corners
            const corners = [
                { x: worldX - wheelWidth/2, y: worldY - wheelHeight/2 },
                { x: worldX + wheelWidth/2, y: worldY - wheelHeight/2 },
                { x: worldX + wheelWidth/2, y: worldY + wheelHeight/2 },
                { x: worldX - wheelWidth/2, y: worldY + wheelHeight/2 }
            ];
            
            corners.forEach((corner, i) => {
                const screenX = corner.x * 50 + this.game.app.screen.width / 2;
                const screenY = corner.y * 50 + this.game.app.screen.height / 2;
                
                if (i === 0) {
                    this.graphics.moveTo(screenX, screenY);
                } else {
                    this.graphics.lineTo(screenX, screenY);
                }
            });
            
            this.graphics.closePath();
            this.graphics.endFill();
        });
    }
    
    update(input) {
        this.handleInput(input);
        this.updatePhysics();
        this.updateShootCooldown();
        this.updateGraphics();
    }
    
    handleInput(input) {
        if (this.playerId === 1) {
            // Player 1 controls (WASD + Tab)
            if (input.isKeyDown('KeyW')) {
                this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
            }
            if (input.isKeyDown('KeyS')) {
                this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed/2);
            }
            if (input.isKeyDown('KeyA')) {
                this.turnSpeed = Math.max(this.turnSpeed - this.turnAcceleration, -this.maxTurnSpeed);
            }
            if (input.isKeyDown('KeyD')) {
                this.turnSpeed = Math.min(this.turnSpeed + this.turnAcceleration, this.maxTurnSpeed);
            }
            if (input.isKeyDown('Tab') && this.canShoot) {
                this.shoot();
            }
        } else if (this.playerId === 2) {
            // Player 2 controls (Arrow keys + Enter)
            if (input.isKeyDown('ArrowUp')) {
                this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
            }
            if (input.isKeyDown('ArrowDown')) {
                this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed/2);
            }
            if (input.isKeyDown('ArrowLeft')) {
                this.turnSpeed = Math.max(this.turnSpeed - this.turnAcceleration, -this.maxTurnSpeed);
            }
            if (input.isKeyDown('ArrowRight')) {
                this.turnSpeed = Math.min(this.turnSpeed + this.turnAcceleration, this.maxTurnSpeed);
            }
            if (input.isKeyDown('Enter') && this.canShoot) {
                this.shoot();
            }
        }
    }
    
    updatePhysics() {
        // Apply turning
        this.body.setAngularVelocity(this.turnSpeed);
        
        // Apply forward/backward movement
        const angle = this.body.getAngle();
        const force = new planck.Vec2(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        this.body.applyLinearImpulse(force, this.body.getWorldCenter(), true);
        
        // Apply deceleration
        this.speed *= (1 - this.deceleration);
        this.turnSpeed *= (1 - this.turnAcceleration * 2);
        
        // Stop if speed is very low
        if (Math.abs(this.speed) < 0.01) this.speed = 0;
        if (Math.abs(this.turnSpeed) < 0.01) this.turnSpeed = 0;
    }
    
    updateShootCooldown() {
        if (!this.canShoot) {
            this.shootCooldown -= 16; // Assuming 60 FPS
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
                this.shootCooldown = 0;
            }
        }
    }
    
    shoot() {
        if (!this.canShoot) return;
        
        const angle = this.body.getAngle();
        const pos = this.body.getPosition();
        
        // Create projectile in front of car with more offset
        const projectilePos = new planck.Vec2(
            pos.x + Math.cos(angle) * (this.width/2 + 2),
            pos.y + Math.sin(angle) * (this.width/2 + 2)
        );
        
        const projectile = new Projectile(
            this.game,
            projectilePos,
            angle,
            this.playerId
        );
        
        this.game.addProjectile(projectile);
        this.game.audio.playShoot();
        
        // Set cooldown
        this.canShoot = false;
        this.shootCooldown = this.shootCooldownTime;
    }
    
    takeDamage(amount, section = null) {
        console.log(`Car ${this.playerId} taking ${amount} damage, section: ${section}`);
        
        if (section) {
            // Damage specific section
            this.sections[section].health = Math.max(0, this.sections[section].health - amount);
            console.log(`Section ${section} health now: ${this.sections[section].health}/${this.sections[section].maxHealth}`);
            
            // Check for special effects based on section damage
            if (section === 'front' && this.sections.front.health <= 0) {
                this.motorDisabled = true;
                console.log(`Motor disabled for car ${this.playerId}`);
            }
            if (section === 'back' && this.sections.back.health <= 0) {
                this.weaponDisabled = true;
                console.log(`Weapon disabled for car ${this.playerId}`);
            }
            
            // Check if center is exposed and can be hit
            if (this.sections.center.health > 0) {
                const leftDestroyed = this.sections.left.health <= 0;
                const rightDestroyed = this.sections.right.health <= 0;
                
                // Allow center damage if appropriate side is destroyed
                if ((section === 'left' && leftDestroyed) || 
                    (section === 'right' && rightDestroyed)) {
                    this.sections.center.health = Math.max(0, this.sections.center.health - amount);
                    console.log(`Center section health now: ${this.sections.center.health}/${this.sections.center.maxHealth}`);
                }
            }
            
            // Check if player is dead (center section destroyed)
            if (this.sections.center.health <= 0) {
                console.log(`Car ${this.playerId} destroyed!`);
                this.destroy();
            }
        } else {
            // No section specified, damage random section
            const sections = ['front', 'back', 'left', 'right'];
            const randomSection = sections[Math.floor(Math.random() * sections.length)];
            this.takeDamage(amount, randomSection);
        }
    }
    
    takeWheelDamage(wheel, amount) {
        if (this.wheels[wheel]) {
            this.wheels[wheel].health = Math.max(0, this.wheels[wheel].health - amount);
            
            // Check if all wheels are destroyed
            const allWheelsDestroyed = Object.values(this.wheels).every(w => w.health <= 0);
            if (allWheelsDestroyed) {
                this.motorDisabled = true;
            }
            
            // Check steering affected (at least 2 wheels destroyed)
            const destroyedWheels = Object.values(this.wheels).filter(w => w.health <= 0).length;
            if (destroyedWheels >= 2) {
                this.steeringAffected = true;
            }
        }
    }
    
    isAlive() {
        return this.sections.center.health > 0;
    }
    
    getTotalHealth() {
        const sectionHealth = Object.values(this.sections).reduce((sum, s) => sum + s.health, 0);
        const wheelHealth = Object.values(this.wheels).reduce((sum, w) => sum + w.health, 0);
        return sectionHealth + wheelHealth;
    }
    
    getMaxTotalHealth() {
        const sectionMaxHealth = Object.values(this.sections).reduce((sum, s) => sum + s.maxHealth, 0);
        const wheelMaxHealth = Object.values(this.wheels).reduce((sum, w) => sum + w.maxHealth, 0);
        return sectionMaxHealth + wheelMaxHealth;
    }
    
    render(stage) {
        stage.addChild(this.graphics);
    }
    
    getBody() {
        return this.body;
    }
    
    destroy() {
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