class UIManager {
    constructor(game) {
        this.game = game;
        this.gameOverScreen = document.getElementById('gameOver');
        this.winnerText = document.getElementById('winnerText');
        this.restartBtn = document.getElementById('restartBtn');
        this.player1HealthBar = document.querySelector('#player1Health .health-fill');
        this.player2HealthBar = document.querySelector('#player2Health .health-fill');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => {
            this.game.restart();
        });
    }
    
    update() {
        this.updateHealthBars();
    }
    
    updateHealthBars() {
        const car1 = this.game.getCar(1);
        const car2 = this.game.getCar(2);
        
        if (car1) {
            const healthPercent = (car1.getTotalHealth() / car1.getMaxTotalHealth()) * 100;
            this.player1HealthBar.style.width = `${healthPercent}%`;
            
            // Change color based on health
            if (healthPercent > 50) {
                this.player1HealthBar.style.background = 'linear-gradient(90deg, #00ff00, #00cc00)';
            } else if (healthPercent > 25) {
                this.player1HealthBar.style.background = 'linear-gradient(90deg, #ffff00, #cccc00)';
            } else {
                this.player1HealthBar.style.background = 'linear-gradient(90deg, #ff3333, #cc0000)';
            }
        }
        
        if (car2) {
            const healthPercent = (car2.getTotalHealth() / car2.getMaxTotalHealth()) * 100;
            this.player2HealthBar.style.width = `${healthPercent}%`;
            
            // Change color based on health
            if (healthPercent > 50) {
                this.player2HealthBar.style.background = 'linear-gradient(90deg, #00ff00, #00cc00)';
            } else if (healthPercent > 25) {
                this.player2HealthBar.style.background = 'linear-gradient(90deg, #ffff00, #cccc00)';
            } else {
                this.player2HealthBar.style.background = 'linear-gradient(90deg, #ff3333, #cc0000)';
            }
        }
    }
    
    showGameOver(winnerId) {
        this.gameOverScreen.style.display = 'block';
        
        if (winnerId === 0) {
            this.winnerText.textContent = 'Draw!';
        } else {
            this.winnerText.textContent = `Player ${winnerId} Wins!`;
        }
        
        // Play game over sound
        this.game.audio.playGameOver();
    }
    
    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
    }
    
    showMessage(message, duration = 2000) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 24px;
            z-index: 1000;
            pointer-events: none;
        `;
        messageEl.textContent = message;
        
        document.getElementById('ui').appendChild(messageEl);
        
        // Remove after duration
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, duration);
    }
}