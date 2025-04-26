// Visual Effects System for Fuse Field

class VisualEffects {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.animations = [];
        this.lastTime = 0;
    }

    // Particle system
    createParticle(x, y, type) {
        const particle = {
            x,
            y,
            type,
            size: type === 'sparkle' ? 32 : 64,
            alpha: 1,
            scale: 0,
            rotation: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * 2,
            direction: Math.random() * Math.PI * 2
        };
        this.particles.push(particle);
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.alpha -= deltaTime * 2;
            particle.scale += deltaTime * 3;
            particle.x += Math.cos(particle.direction) * particle.speed;
            particle.y += Math.sin(particle.direction) * particle.speed;
            return particle.alpha > 0;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            this.ctx.scale(particle.scale, particle.scale);
            
            if (particle.type === 'sparkle') {
                this.drawSparkle();
            } else {
                this.drawPopRing();
            }
            
            this.ctx.restore();
        });
    }

    drawSparkle() {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -16);
        this.ctx.lineTo(8, -8);
        this.ctx.lineTo(16, 0);
        this.ctx.lineTo(8, 8);
        this.ctx.lineTo(0, 16);
        this.ctx.lineTo(-8, 8);
        this.ctx.lineTo(-16, 0);
        this.ctx.lineTo(-8, -8);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
    }

    drawPopRing() {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    // Screen shake
    addScreenShake(intensity) {
        this.screenShake.intensity = intensity;
    }

    updateScreenShake(deltaTime) {
        if (this.screenShake.intensity > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.intensity *= 0.9;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
    }

    // Fusion animation
    addFusionAnimation(x, y, value) {
        this.animations.push({
            type: 'fusion',
            x,
            y,
            value,
            progress: 0,
            duration: 0.3
        });
    }

    updateAnimations(deltaTime) {
        this.animations = this.animations.filter(anim => {
            anim.progress += deltaTime;
            return anim.progress < anim.duration;
        });
    }

    drawAnimations() {
        this.animations.forEach(anim => {
            if (anim.type === 'fusion') {
                const progress = anim.progress / anim.duration;
                const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
                const alpha = 1 - progress;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.translate(anim.x, anim.y);
                this.ctx.scale(scale, scale);
                
                // Draw the orb being fused
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
                this.ctx.fillStyle = this.getOrbColor(anim.value);
                this.ctx.fill();
                
                this.ctx.restore();
            }
        });
    }

    getOrbColor(value) {
        const colors = {
            1: '#A7D8FF',
            2: '#8EF3C9',
            3: '#FF5B5B',
            4: '#CFA2FF',
            5: '#FFE97A',
            6: '#FFB800'
        };
        return colors[value] || '#FFFFFF';
    }

    // Move feedback
    showValidMove(x, y) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#8EF3C9';
        this.ctx.fillRect(x, y, 64, 64);
        this.ctx.restore();
    }

    showInvalidMove(x, y) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#FF5B5B';
        this.ctx.fillRect(x, y, 64, 64);
        this.ctx.restore();
    }

    // Update and render all effects
    update(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.updateParticles(deltaTime);
        this.updateScreenShake(deltaTime);
        this.updateAnimations(deltaTime);
    }

    render() {
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        this.drawParticles();
        this.drawAnimations();
        
        this.ctx.restore();
    }
}

// Export for use in index.html
window.VisualEffects = VisualEffects; 