class Game {
    constructor() {
        this.app = null;
        this.world = null;
        this.cars = [];
        this.projectiles = [];
        this.input = null;
        this.audio = null;
        this.ui = null;
        this.gameRunning = false;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.setupPixi();
        this.setupPhysics();
        this.setupInput();
        this.setupAudio();
        this.setupUI();
        this.createCars();
        this.startGameLoop();
    }
    
    setupPixi() {
        this.app = new PIXI.Application({
            view: document.getElementById('gameCanvas'),
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x2a2a2a,
            antialias: true
        });
        
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupPhysics() {
        this.world = new planck.World(new planck.Vec2(0, 0));
        
        // Store boundary dimensions for rendering
        this.boundaryWidth = this.app.screen.width / 50;
        this.boundaryHeight = this.app.screen.height / 50;
        
        // Ground body for boundaries
        const ground = this.world.createBody({
            type: 'static',
            position: new planck.Vec2(0, 0)
        });
        
        // Create boundary walls that match screen edges
        const halfWidth = this.boundaryWidth / 2;
        const halfHeight = this.boundaryHeight / 2;
        
        ground.createFixture(new planck.Edge(new planck.Vec2(-halfWidth, -halfHeight), new planck.Vec2(halfWidth, -halfHeight)));
        ground.createFixture(new planck.Edge(new planck.Vec2(-halfWidth, halfHeight), new planck.Vec2(halfWidth, halfHeight)));
        ground.createFixture(new planck.Edge(new planck.Vec2(-halfWidth, -halfHeight), new planck.Vec2(-halfWidth, halfHeight)));
        ground.createFixture(new planck.Edge(new planck.Vec2(halfWidth, -halfHeight), new planck.Vec2(halfWidth, halfHeight)));
    }
    
    setupInput() {
        this.input = new InputHandler();
    }
    
    setupAudio() {
        this.audio = new AudioManager();
    }
    
    setupUI() {
        this.ui = new UIManager(this);
    }
    
    createCars() {
        // Use the same boundary calculations as physics setup
        const halfWidth = this.boundaryWidth / 2;
        const halfHeight = this.boundaryHeight / 2;
        
        // Calculate positions with margins
        const margin = 3; // Margin from edges
        const redCarPos = new planck.Vec2(-halfWidth + margin, -halfHeight + margin);
        const blueCarPos = new planck.Vec2(halfWidth - margin, halfHeight - margin);
        
        // Player 1 car (red, top-left)
        const car1 = new Car(
            this,
            redCarPos,
            0xff3333,
            1
        );
        
        // Player 2 car (blue, bottom-right)
        const car2 = new Car(
            this,
            blueCarPos,
            0x3333ff,
            2
        );
        
        this.cars.push(car1, car2);
    }
    
    startGameLoop() {
        this.gameRunning = true;
        
        const gameLoop = () => {
            if (!this.gameRunning) return;
            
            this.update();
            this.render();
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update physics
        this.world.step(1/60);
        
        // Update input
        this.input.update();
        
        // Update cars
        this.cars.forEach(car => {
            if (car.isAlive()) {
                car.update(this.input);
            }
        });
        
        // Update projectiles
        console.log(`Before update: ${this.projectiles.length} projectiles`);
        this.projectiles = this.projectiles.filter((projectile, index) => {
            console.log(`Updating projectile ${index}: active before update = ${projectile.isActive()}`);
            projectile.update();
            const activeAfter = projectile.isActive();
            console.log(`Projectile ${index}: active after update = ${activeAfter}`);
            return activeAfter;
        });
        console.log(`After update: ${this.projectiles.length} projectiles`);
        
        // Check collisions
        this.checkCollisions();
        
        // Check game over
        this.checkGameOver();
        
        // Update UI
        this.ui.update();
    }
    
    renderBoundaries() {
        const boundaryGraphics = new PIXI.Graphics();
        
        // Set boundary line style
        boundaryGraphics.lineStyle(3, 0xFFFFFF); // White boundaries
        
        const halfWidth = this.boundaryWidth / 2 * 50; // Convert to screen coordinates
        const halfHeight = this.boundaryHeight / 2 * 50;
        
        // Draw rectangle boundaries centered on screen
        const centerX = this.app.screen.width / 2 - halfWidth;
        const centerY = this.app.screen.height / 2 - halfHeight;
        boundaryGraphics.drawRect(centerX, centerY, halfWidth * 2, halfHeight * 2);
        
        this.app.stage.addChild(boundaryGraphics);
    }
    
    render() {
        // Clear stage
        this.app.stage.removeChildren();
        
        // Render boundaries
        this.renderBoundaries();
        
        // Render cars
        this.cars.forEach(car => {
            if (car.isAlive()) {
                car.render(this.app.stage);
            }
        });
        
        // Render projectiles
        console.log(`Rendering ${this.projectiles.length} projectiles`);
        this.projectiles.forEach((projectile, index) => {
            console.log(`Rendering projectile ${index}: active=${projectile.isActive()}`);
            projectile.render(this.app.stage);
        });
    }
    
    checkCollisions() {
        // Check projectile-car collisions
        this.projectiles.forEach(projectile => {
            this.cars.forEach(car => {
                // Only check collisions with other cars, not the owner
                if (car.isAlive() && projectile.ownerId !== car.playerId) {
                    if (this.checkCollision(projectile, car)) {
                        console.log(`Hit! Player ${projectile.ownerId} hit Player ${car.playerId} for ${projectile.getDamage()} damage`);
                        car.takeDamage(projectile.getDamage());
                        projectile.destroy();
                        this.audio.playHit();
                    }
                }
            });
        });
        
        // Check car-to-car collisions
        for (let i = 0; i < this.cars.length; i++) {
            for (let j = i + 1; j < this.cars.length; j++) {
                const car1 = this.cars[i];
                const car2 = this.cars[j];
                
                if (car1.isAlive() && car2.isAlive()) {
                    if (this.checkCarCollision(car1, car2)) {
                        this.handleCarCollision(car1, car2);
                    }
                }
            }
        }
    }
    
    checkCollision(projectile, car) {
        const projBody = projectile.getBody();
        const carBody = car.getBody();

        if (!projBody || !carBody) {
            return false; // One of the bodies has been destroyed
        }

        const projPos = projBody.getPosition();
        const carPos = carBody.getPosition();
        
        const distance = Math.sqrt(
            Math.pow(projPos.x - carPos.x, 2) + 
            Math.pow(projPos.y - carPos.y, 2)
        );
        
        // Use a smaller collision threshold - car width is 1.5, height is 0.8
        // Add some margin for the projectile radius (0.2)
        const collisionThreshold = (Math.max(car.width, car.height) / 2) + projectile.radius + 0.5;
        
        return distance < collisionThreshold;
    }
    
    checkCarCollision(car1, car2) {
        const body1 = car1.getBody();
        const body2 = car2.getBody();

        if (!body1 || !body2) {
            return false; // One of the bodies has been destroyed
        }

        const pos1 = body1.getPosition();
        const pos2 = body2.getPosition();
        
        const distance = Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + 
            Math.pow(pos1.y - pos2.y, 2)
        );
        
        // Use the maximum dimension of both cars for collision detection
        const car1Radius = Math.max(car1.width, car1.height) / 2;
        const car2Radius = Math.max(car2.width, car2.height) / 2;
        const collisionThreshold = car1Radius + car2Radius;
        
        return distance < collisionThreshold;
    }
    
    handleCarCollision(car1, car2) {
        // Calculate collision damage based on relative velocity
        const body1 = car1.getBody();
        const body2 = car2.getBody();
        
        const vel1 = body1.getLinearVelocity();
        const vel2 = body2.getLinearVelocity();
        
        const relativeVel = Math.sqrt(
            Math.pow(vel1.x - vel2.x, 2) + 
            Math.pow(vel1.y - vel2.y, 2)
        );
        
        // Scale damage based on collision speed (higher speed = more damage)
        const baseDamage = 5;
        const speedMultiplier = Math.min(relativeVel / 10, 3); // Cap multiplier at 3x
        const damage = Math.round(baseDamage * speedMultiplier);
        
        // Apply damage to both cars
        if (damage > 0) {
            car1.takeDamage(damage);
            car2.takeDamage(damage);
            
            // Play crash sound effect
            this.audio.playCrash();
            
            console.log(`Car collision! Both cars took ${damage} damage (relative speed: ${relativeVel.toFixed(2)})`);
        }
    }
    
    checkGameOver() {
        const aliveCars = this.cars.filter(car => car.isAlive());
        
        if (aliveCars.length <= 1) {
            this.gameOver = true;
            const winner = aliveCars.length === 1 ? aliveCars[0].playerId : 0;
            this.ui.showGameOver(winner);
        }
    }
    
    addProjectile(projectile) {
        console.log(`Game adding projectile: ${projectile}, active: ${projectile.isActive()}`);
        this.projectiles.push(projectile);
        console.log(`Game projectiles array now has: ${this.projectiles.length} items`);
    }
    
    restart() {
        // Clear existing objects
        this.cars.forEach(car => car.destroy());
        this.projectiles.forEach(projectile => projectile.destroy());
        
        this.cars = [];
        this.projectiles = [];
        this.gameOver = false;
        
        // Create new cars
        this.createCars();
        
        // Hide game over screen
        this.ui.hideGameOver();
    }
    
    getCar(playerId) {
        return this.cars.find(car => car.playerId === playerId);
    }
}

