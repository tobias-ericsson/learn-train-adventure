class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        
        this.loadSounds();
    }
    
    loadSounds() {
        // Create sound effects using Web Audio API oscillators
        // This is a simple approach without external audio files
        
        // Shoot sound
        this.sounds.shoot = () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
        
        // Hit sound (missile/explosion)
        this.sounds.hit = () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext());
            
            // Create explosion sound with multiple oscillators
            const mainOsc = audioContext.createOscillator();
            const noiseOsc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            // Main explosion tone
            mainOsc.connect(filter);
            mainOsc.type = 'sawtooth';
            mainOsc.frequency.setValueAtTime(100, audioContext.currentTime);
            mainOsc.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.3);
            
            // Noise component
            noiseOsc.connect(filter);
            noiseOsc.type = 'square';
            noiseOsc.frequency.setValueAtTime(300, audioContext.currentTime);
            noiseOsc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
            
            // Filter setup
            filter.connect(gainNode);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
            
            // Volume envelope
            gainNode.connect(audioContext.destination);
            gainNode.gain.setValueAtTime(this.volume * 0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            // Start sounds
            mainOsc.start(audioContext.currentTime);
            noiseOsc.start(audioContext.currentTime);
            mainOsc.stop(audioContext.currentTime + 0.4);
            noiseOsc.stop(audioContext.currentTime + 0.2);
        };
        
        // Engine sound
        this.sounds.engine = () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(this.volume * 0.1, audioContext.currentTime);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        };
        
        // Crash sound (car collision)
        this.sounds.crash = () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext());
            
            // Create metallic crash sound with multiple components
            const metalImpact = audioContext.createOscillator();
            const scrape = audioContext.createOscillator();
            const thud = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            // Metal impact component
            metalImpact.connect(filter);
            metalImpact.type = 'square';
            metalImpact.frequency.setValueAtTime(2000, audioContext.currentTime);
            metalImpact.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
            metalImpact.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
            
            // Scrape component
            scrape.connect(filter);
            scrape.type = 'sawtooth';
            scrape.frequency.setValueAtTime(1500, audioContext.currentTime);
            scrape.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
            
            // Low frequency thud
            thud.connect(filter);
            thud.type = 'sine';
            thud.frequency.setValueAtTime(80, audioContext.currentTime);
            thud.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
            
            // Filter setup for metallic effect
            filter.connect(gainNode);
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, audioContext.currentTime);
            filter.Q.setValueAtTime(5, audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
            
            // Volume envelope
            gainNode.connect(audioContext.destination);
            gainNode.gain.setValueAtTime(this.volume * 0.6, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            // Start sounds
            metalImpact.start(audioContext.currentTime);
            scrape.start(audioContext.currentTime);
            thud.start(audioContext.currentTime);
            metalImpact.stop(audioContext.currentTime + 0.15);
            scrape.stop(audioContext.currentTime + 0.2);
            thud.stop(audioContext.currentTime + 0.1);
        };
        
        // Game over sound
        this.sounds.gameOver = () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        };
    }
    
    playShoot() {
        this.sounds.shoot();
    }
    
    playHit() {
        this.sounds.hit();
    }
    
    playEngine() {
        this.sounds.engine();
    }
    
    playCrash() {
        this.sounds.crash();
    }
    
    playGameOver() {
        this.sounds.gameOver();
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    toggle() {
        this.enabled = !this.enabled;
    }
}