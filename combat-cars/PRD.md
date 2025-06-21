<context>
Two players control cars on the same screen, attempting to eliminate one another using movement and projectile-based combat. Player One uses WASD to steer and Tab to shoot; Player Two uses arrow keys to steer and Enter to shoot.
</context>

<prd>
**Product Requirements Document (PRD): Two-Player Combat Cars Game**

---

### **1. Overview**

**Title:** Combat Cars Duel  
**Platform:** Web browser (desktop)  
**Technology Stack:** HTML5, CSS3, JavaScript (vanilla or with lightweight framework if needed)  
**Genre:** 2D Top-down Multiplayer Combat Duel game 
**Target Users:** Casual gamers, ages 10+, with access to a keyboard-enabled desktop browser.

---

### **2. Objective**

Two players compete in real-time using vehicles equipped with weapons. The goal is to eliminate the opponent by reducing their health to zero using movement tactics and shooting mechanics.

---

### **3. Features**

#### **3.1 Game Mechanics**
- Top-down 2D view. The cars are viewed from a top-down perspective.
- Two player-controlled cars on the same screen.
- Cars can drive forward, backward, and rotate left/right.
- Each car can shoot a projectile in the direction it is facing.
- Collision detection between projectiles and cars.
- Health points (HP) system.
- Explosions and game over state when a player is defeated.

#### **3.1 Car Health System**
- Each car is divided into sections.
- Each section has 100 health points (HP).
- Each section can be hit by a projectile.
- Sections are front, back, left, right, and center.
- When front section is hit and HP reaches zero the motor is dead and the car cannot move.
- When back section is hit and HP reaches zero the weapon is destroyed and the car can no longer shoot.
- When left section is hit and HP reaches zero the center is open to hit from the left.
- When right section is hit and HP reaches zero the center is open to hit from the right.
- When center section is hit and HP reaches zero the player is dead and game is over.
- Each car has four wheels, front-left-wheel, front-right-wheeel, back-left-wheel, back-right-wheel.
- Each wheel has 100 health points (HP).
- Each wheel can be hit by a projectile.
- When a wheel is hit and HP reaches zero the steering is affected. When the hit point reaches zero on all four wheels the car can not move.

#### **3.2 Controls**
- **Player One**:
  - Move Forward: `W`
  - Move Backward: `S`
  - Turn Left: `A`
  - Turn Right: `D`
  - Shoot: `Tab`

- **Player Two**:
  - Move Forward: `Arrow Up`
  - Move Backward: `Arrow Down`
  - Turn Left: `Arrow Left`
  - Turn Right: `Arrow Right`
  - Shoot: `Enter`

#### **3.3 Environment**
- Simple arena with defined boundaries.
- Obstacles like walls or crates.
- Different surfaces like road, gravel and grass. Gravel and grass reduces the speed of the car somewhat.
- The environment is generated randomly. The environment is generated with a seed. The environment contains roads and grass and trees and houses.

#### **3.4 User Interface**
- The health of the cars sections and wheels should be visible on the sections/wheels by color or similar.
- "Game Over" screen with winner announcement.
- Restart button.

---

### **4. Technical Requirements**

#### **4.1 Game Loop**
- Implemented using `requestAnimationFrame()`.
- Real-time physics and state updates (position, rotation, projectiles).

#### **4.2 Input Handling**
- Capture keyboard inputs for both players.
- Prevent default browser actions for `Tab` and `Enter` keys.

#### **4.3 Rendering**
- Canvas API or DOM elements for drawing the cars, bullets, and arena.
- Performance optimization to maintain smooth gameplay.

#### **4.4 Audio (optional for MVP)**
- Background music and sound effects for shooting, collisions, and explosions.

## the technology used

Javascript
Planck.js for physics
Pixi.js for rendering
Howler.js for sound

---

### **5. Game Design**

#### **5.1 Vehicles**
- Each car has distinct color/design.
- HP: 100 points.
- Projectile damage: 10 points.
- Speed and turning rate balanced for fair play.

#### **5.2 Projectiles**
- Straight-line movement.
- Limited lifetime or range.
- One shot per second rate limit.

---

### **6. MVP Scope**
- Two cars with movement and shooting mechanics.
- Health system.
- Win/lose condition.
- Restart capability.

---

### **7. Future Enhancements**
- Power-ups and ammo pickups.
- Scoreboard system.
- Multiplayer over network.
- Customizable cars.
- Multiple arenas.

---

### **8. Timeline**
- **Week 1:** Basic rendering and movement mechanics.
- **Week 2:** Shooting and collision logic.
- **Week 3:** UI and health system.
- **Week 4:** Polishing and deployment.

---

### **9. Success Criteria**
- Functional two-player gameplay.
- Responsive controls.
- No major bugs.
- Smooth performance across modern desktop browsers.
</prd>