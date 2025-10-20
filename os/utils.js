export class AssetManager {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
        this.failed = new Set();
    }

    async preloadCritical(assets) {
        const promises = assets.map(src => this.loadImage(src));

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to load critical assets:', error);
            throw error;
        }
    }

    async loadImage(src) {
        if (this.cache.has(src)) return this.cache.get(src);
        if (this.failed.has(src)) {
            throw new Error(`Asset ${src} previously failed to load`);
        }
        if (this.loading.has(src)) return this.loading.get(src);

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(src, img);
                this.loading.delete(src);
                resolve(img);
            };
            img.onerror = () => {
                this.failed.add(src);
                this.loading.delete(src);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });

        this.loading.set(src, promise);
        return promise;
    }

    get(src) {
        const img = this.cache.get(src);
        if (!img) {
            console.warn(`Image not loaded yet: ${src}`);
            return null;
        }
        if (!(img instanceof Image)) {
            console.error(`Invalid image object for: ${src}`, img);
            return null;
        }
        return img;
    }

    getStatus() {
        return {
            cached: Array.from(this.cache.keys()),
            loading: Array.from(this.loading.keys()),
            failed: Array.from(this.failed)
        };
    }
}

export class Sprite {
    constructor(image, options = {}) {
        this.image = image;
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || image.naturalWidth;
        this.height = options.height || image.naturalHeight;
        this.scale = options.scale || 1;
        this.rotation = options.rotation || 0;
        this.opacity = options.opacity || 1;
        this.visible = options.visible !== false;

        this.frameWidth = options.frameWidth || this.width;
        this.frameHeight = options.frameHeight || this.height;
        this.frameCount = options.frameCount || 1;
        this.currentFrame = 0;
        this.animationSpeed = options.animationSpeed || 0;
        this.loop = options.loop !== false;
        this.playing = false;

        this.framesPerRow = options.framesPerRow || Math.ceil(Math.sqrt(this.frameCount));;
        this.currentRow = options.currentRow || 0;

        this.lastFrameTime = 0;
    }

    draw(ctx) {
        if (!this.visible || !this.image) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        const scaledWidth = this.width * this.scale;
        const scaledHeight = this.height * this.scale;

        if (this.rotation !== 0) {
            ctx.translate(this.x + scaledWidth / 2, this.y + scaledHeight / 2);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.translate(-scaledWidth / 2, -scaledHeight / 2);
        }

        if (this.frameCount > 1) {
            const frameX = (this.currentFrame % this.framesPerRow) * this.frameWidth;
            const frameY = Math.floor(this.currentFrame / this.framesPerRow) * this.frameHeight;

            ctx.drawImage(
                this.image,
                frameX, frameY, this.frameWidth, this.frameHeight,
                this.rotation !== 0 ? 0 : this.x,
                this.rotation !== 0 ? 0 : this.y,
                scaledWidth, scaledHeight
            );
        } else {
            ctx.drawImage(
                this.image,
                this.rotation !== 0 ? 0 : this.x,
                this.rotation !== 0 ? 0 : this.y,
                scaledWidth, scaledHeight
            );
        }

        ctx.restore();
    }

    update(deltaTime) {
        if (this.playing && this.animationSpeed > 0) {
            this.lastFrameTime += deltaTime;
            if (this.lastFrameTime >= this.animationSpeed) {
                this.currentFrame++;
                if (this.currentFrame >= this.frameCount) {
                    this.currentFrame = this.loop ? 0 : this.frameCount - 1;
                }
                this.lastFrameTime = 0;
            }
        }
    }

    play() {
        this.playing = true;
        this.currentFrame = 0;
    }

    stop() {
        this.playing = false;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setScale(scale) {
        this.scale = scale;
    }

    setRotation(deg) {
        this.rotation = deg;
    }

    gotoAndPlay(frame) {
        this.currentFrame = frame;
        this.playing = true;
    }

    gotoAndStop(frame) {
        this.currentFrame = frame;
        this.playing = false;
    }

    setFrame(frame) {
        this.currentFrame = Math.max(0, Math.min(frame, this.frameCount - 1));
    }
}

export class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.groups = new Map();
    }

    createSprite(name, image, options = {}) {
        const sprite = new Sprite(image, options);
        this.sprites.set(name, sprite);
        return sprite;
    }

    createAnimatedSprite(name, image, options = {}) {
        const sprite = new AnimatedSprite(image, options);
        this.sprites.set(name, sprite);
        return sprite;
    }

    getSprite(name) {
        return this.sprites.get(name);
    }

    createGroup(groupName) {
        this.groups.set(groupName, new Set());
        return this.groups.get(groupName);
    }

    addToGroup(groupName, spriteName) {
        const group = this.groups.get(groupName);
        if (group && this.sprites.has(spriteName)) {
            group.add(spriteName);
        }
    }

    drawGroup(ctx, groupName) {
        const group = this.groups.get(groupName);
        if (group) {
            group.forEach(spriteName => {
                const sprite = this.sprites.get(spriteName);
                if (sprite) sprite.draw(ctx);
            });
        }
    }

    updateAll(deltaTime) {
        this.sprites.forEach(sprite => {
            sprite.update(deltaTime);
        });
    }

    removeSprite(name) {
        this.sprites.delete(name);
        this.groups.forEach(group => group.delete(name));
    }
}

export class AnimatedSprite extends Sprite {
    constructor(image, options = {}) {
        super(image, options);
        
        this.width = options.frameWidth || this.frameWidth;
        this.height = options.frameHeight || this.frameHeight;

        this.animations = options.animations || {};
        this.currentAnimation = options.defaultAnimation || 'idle';
        this.onAnimationComplete = null;

        if (this.currentAnimation && this.animations[this.currentAnimation]) {
            this.setAnimation(this.currentAnimation, true);
        }
    }

    setAnimation(name, forceReset = false) {
        if (!this.animations[name]) {
            console.warn(`Animation '${name}' not found`);
            return;
        }

        const animation = this.animations[name];

        if (this.currentAnimation === name && !forceReset) return;

        this.currentAnimation = name;
        this.frameCount = animation.frameCount || 1;
        this.animationSpeed = animation.speed;
        this.loop = animation.loop !== false;
        this.currentRow = animation.row || 0;
        this.framesPerRow = animation.framesPerRow || this.frameCount;

        if (forceReset || this.currentFrame >= this.frameCount) {
            this.currentFrame = animation.startFrame || 0;
        }

        this.playing = true;
    }

    update(deltaTime) {
        if (!this.playing || !this.currentAnimation) return;

        const prevFrame = this.currentFrame;
        super.update(deltaTime);

        if (!this.loop && prevFrame === this.frameCount - 1 && this.currentFrame === 0) {
            this.playing = false;
            if (this.onAnimationComplete) {
                this.onAnimationComplete(this.currentAnimation);
            }
        }
    }

    draw(ctx) {
        if (!this.visible || !this.image || !this.currentAnimation) return;

        const animation = this.animations[this.currentAnimation];
        if (!animation) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        const scaledWidth = this.width * this.scale;
        const scaledHeight = this.height * this.scale;

        if (this.rotation !== 0) {
            ctx.translate(this.x + scaledWidth / 2, this.y + scaledHeight / 2);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.translate(-scaledWidth / 2, -scaledHeight / 2);
        }

        const frameX = (this.currentFrame % this.framesPerRow) * this.frameWidth;
        const frameY = this.currentRow * this.frameHeight;

        ctx.drawImage(
            this.image,
            frameX, frameY, this.frameWidth, this.frameHeight,
            this.rotation !== 0 ? 0 : this.x,
            this.rotation !== 0 ? 0 : this.y,
            scaledWidth, scaledHeight
        );

        ctx.restore();
    }
}