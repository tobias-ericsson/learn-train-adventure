// Physics utilities and helpers
class PhysicsUtils {
    static screenToWorld(screenX, screenY, renderer) {
        // Convert screen coordinates to physics world coordinates
        const worldX = (screenX - renderer.width / 2) / 50;
        const worldY = (screenY - renderer.height / 2) / 50;
        return { x: worldX, y: worldY };
    }
    
    static worldToScreen(worldX, worldY, renderer) {
        // Convert physics world coordinates to screen coordinates
        const screenX = worldX * 50 + renderer.width / 2;
        const screenY = worldY * 50 + renderer.height / 2;
        return { x: screenX, y: screenY };
    }
    
    static distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static angleBetween(point1, point2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x);
    }
    
    static normalizeVector(vector) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude === 0) return { x: 0, y: 0 };
        
        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    }
    
    static lerp(start, end, amount) {
        return start + (end - start) * amount;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}