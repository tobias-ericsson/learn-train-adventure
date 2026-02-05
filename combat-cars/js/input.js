class InputHandler {
    constructor() {
        this.keys = new Map();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Key down events
        window.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.keys.set(e.code, true);
        });
        
        // Key up events
        window.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.keys.set(e.code, false);
        });
        
        // Prevent default browser actions for game keys
        window.addEventListener('keydown', (e) => {
            if (this.isGameKey(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    isGameKey(keyCode) {
        const gameKeys = [
            'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Tab',
            'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Enter'
        ];
        return gameKeys.includes(keyCode);
    }
    
    isKeyDown(keyCode) {
        return this.keys.get(keyCode) || false;
    }
    
    update() {
        // Input handler doesn't need per-frame updates
        // All key states are managed by event listeners
    }
    
    // Helper methods for checking specific player inputs
    getPlayer1Movement() {
        return {
            forward: this.isKeyDown('KeyW'),
            backward: this.isKeyDown('KeyS'),
            left: this.isKeyDown('KeyA'),
            right: this.isKeyDown('KeyD'),
            shoot: this.isKeyDown('Tab')
        };
    }
    
    getPlayer2Movement() {
        return {
            forward: this.isKeyDown('ArrowUp'),
            backward: this.isKeyDown('ArrowDown'),
            left: this.isKeyDown('ArrowLeft'),
            right: this.isKeyDown('ArrowRight'),
            shoot: this.isKeyDown('Enter')
        };
    }
}