import { frameUpdater } from "./utils.js";

export { Samurai, Player, Enemy_L1, Enemy_L2, Enemy_L3 };

// Samurai parents class (blueprint for all kinds of samurais)
class Samurai {
    constructor({ x, y, canvasWidth, canvasHeight, scale, dirX }) {
        this.canvasWidth = canvasWidth; // Width of the canvas
        this.canvasHeight = canvasHeight; // Height of the canvas

        this.state = 0; // Player states: 0 = idle, 1 = run, 2 = hurt, 3 = attack, 4 = death

        this.sprites = {}; // Spritesheet unique to each child class

        this.image = new Image();
        this.image.src;

        this.spriteWidth = 200; // width of each sprite
        this.spriteHeight = 200; // height of each sprite

        this.width = this.spriteWidth; // width of sprite in canvas
        this.height = this.spriteHeight; // width of sprite in canvas

        this.scale = scale; // Image scale

        this.x = x; // sprite position, x
        this.y = y; // sprite position, y

        this.dirX = dirX; // sprite direction (left=0 or right=1)

        // Frame timer to slow down the animation (5 game ticks before 1 frame refresh)
        this.frameTimer = 0;
        this.frameInterval = 5;

        // Player HP
        this.hp = 100;
    }

    // Draw the sprite
    draw(ctx) {
        ctx.drawImage(
            this.image, // Image source
            this.xframe * this.spriteWidth, // sx: Position of current sprite the spritesheet
            0, // sy: Position of current sprite in the spritesheet
            this.spriteWidth, // sWidth: Each sprite's width in the spritesheet
            this.spriteHeight, // sHeight: Each sprite's height in the spritesheet
            // dx: Pos in canvas, with offset to always center image to the desired position
            this.x - (this.width * this.scale) / 2,
            // dy: Pos in canvas, with offset to always center image to the desired position
            this.y - (this.height * this.scale) / 2,
            this.width * this.scale, // dWidth: Image width in canvas
            this.height * this.scale // dHeight: Image height in canvas
        );
    }

    // Updating the sprite
    update(ctx) {
        // Draw the sprite on the canvas
        this.draw(ctx);
        // Frame timing
        if (this.frameTimer > this.frameInterval) {
            this.frameHandler();
            this.frameTimer = 0; // Reset timer
        // If frame didn't reach the timing, do not update the frame in the current game tick 
        } else {
            this.frameTimer++;
        }
    }

    // Switching to the correct spritesheet according to the player state
    switchState(state) {
        switch (state){
            // Idle
            case 0:
                this.state = 0;
                // Left
                if (this.dirX == 0) {
                    this.image.src = this.sprites.left.idle.imageSrc;
                    this.maxFrame = this.sprites.left.idle.maxFrame - 1;
                // Right
                } else {
                    this.image.src = this.sprites.right.idle.imageSrc;
                    this.maxFrame = this.sprites.right.idle.maxFrame - 1;
                }
                break;
            // running
            case 1:
                this.state = 1;
                // Left
                if (this.dirX == 0) {
                    this.image.src = this.sprites.left.run.imageSrc;
                    this.maxFrame = this.sprites.left.run.maxFrame - 1;
                // Right
                } else {
                    this.image.src = this.sprites.right.run.imageSrc;
                    this.maxFrame = this.sprites.right.run.maxFrame - 1;
                }
                break;
            // Hurt
            case 2:
                this.state = 2;
                // Left
                if (this.dirX == 0) {
                    this.image.src = this.sprites.left.hurt.imageSrc;
                    this.maxFrame = this.sprites.left.hurt.maxFrame - 1;
                // Right
                } else {
                    this.image.src = this.sprites.right.hurt.imageSrc;
                    this.maxFrame = this.sprites.right.hurt.maxFrame - 1;
                }
                break;
            // Attack (choose random attack spritesheet)
            case 3:
                this.state = 3;
                // Left
                if (this.dirX == 0) {
                    // Choose random attack spritesheet
                    let randomAttack = Math.floor(Math.random() * this.sprites.left.attack.length);
                    this.image.src = this.sprites.left.attack[randomAttack].imageSrc;
                    this.maxFrame = this.sprites.left.attack[randomAttack].maxFrame - 1;
                // Right
                } else {
                    // Choose random attack spritesheet
                    let randomAttack = Math.floor(Math.random() * this.sprites.left.attack.length);
                    this.image.src = this.sprites.right.attack[randomAttack].imageSrc;
                    this.maxFrame = this.sprites.right.attack[randomAttack].maxFrame - 1;
                }
                break;
            // Death
            case 4:
                this.state = 4;
                // Left
                if (this.dirX == 0) {
                    this.image.src = this.sprites.left.death.imageSrc;
                    this.maxFrame = this.sprites.left.death.maxFrame - 1;
                // Right
                } else {
                    this.image.src = this.sprites.right.death.imageSrc;
                    this.maxFrame = this.sprites.right.death.maxFrame - 1;
                }
                break;
        }
        // Change initial frame according to direction
        this.directionHandler();
    }

    frameHandler() {
        // Change to the correct direction spritesheet (left/right)
        if (this.dirX == 1) {
            // Right = default normal frames cycling order
            if (this.xframe < this.maxFrame) {
                this.xframe++; // Move to the next frame
                return;
            }
        } else {
            // Left = default reversed frames cycling order
            if (this.xframe > this.minFrame) {
                this.xframe--; // Move to the previous frame, as the spritesheet is mirrored
                return;
            }
        }
        // Call the frameUpdater to reset to first frame according to player direction and state
        frameUpdater(this, 1);
    }
    
    // Change initial frame according to direction (default)
    directionHandler() {
        if (this.dirX == 0) {
            this.xframe = this.maxFrame;
        } else {
            this.xframe = this.minFrame;
        }
    }

    // Direction switcher
    switchDirection(direction) {
        this.dirX = direction;
        this.switchState(this.state);
    }
}

// Character (samurai) sprite class
class Player extends Samurai {
    constructor({ x, y, canvasWidth, canvasHeight, scale, dirX }) {
        // Inherit from Samurai parent class
        super({ x, y, canvasWidth, canvasHeight, scale, dirX });

        // Sources for each spritesheet and the max frame count for each
        this.sprites = {
            left: {
                attack: [
                        {
                            imageSrc: "../assets/images/player/left/LAttack1.png",
                            maxFrame: 6
                        },
                        {
                            imageSrc: "../assets/images/player/left/LAttack2.png",
                            maxFrame: 6
                        }
                ],
                idle: {
                    imageSrc: "../assets/images/player/left/LIdle.png",
                    maxFrame: 8
                },
                death: {
                    imageSrc: "../assets/images/player/left/LDeath.png",
                    maxFrame: 6
                },
                hurt: {
                    imageSrc: "../assets/images/player/left/LTake Hit.png",
                    maxFrame: 4
                },
                run: {
                    imageSrc: "../assets/images/player/left/LRun.png",
                    maxFrame: 8
                }
            },
            right: {
                attack: [
                    {
                        imageSrc: "../assets/images/player/right/RAttack1.png",
                        maxFrame: 6
                    },
                    {
                        imageSrc: "../assets/images/player/right/RAttack2.png",
                        maxFrame: 6
                    }
                ],
                idle: {
                    imageSrc: "../assets/images/player/right/RIdle.png",
                    maxFrame: 8
                },
                death: {
                    imageSrc: "../assets/images/player/right/RDeath.png",
                    maxFrame: 6
                },
                hurt: {
                    imageSrc: "../assets/images/player/right/RTake Hit.png",
                    maxFrame: 4
                },
                run: {
                    imageSrc: "../assets/images/player/right/RRun.png",
                    maxFrame: 8
                }
            }
        };

        this.state = 0; // Player states: 0 = idle, 1 = run, 2 = hurt, 3 = attack, 4 = death

        this.image = new Image();
        this.image.src = this.sprites.right.idle.imageSrc; // Current spritesheet

        this.spriteWidth = 200; // width of each sprite
        this.spriteHeight = 200; // height of each sprite

        this.width = this.spriteWidth; // width of sprite in canvas
        this.height = this.spriteHeight; // width of sprite in canvas

        this.xframe = 0; // # of frame in the spritesheet

        this.minFrame = 0; // Minimum frame number
        this.maxFrame = this.sprites.right.idle.maxFrame - 1; // Maximum frame number

        // Frame timer to slow down the animation (5 game ticks before 1 frame refresh)
        this.frameTimer = 0;
        this.frameInterval = 3;

        // Player HP
        this.hp = 100;
    }
}

class Enemy_L1 extends Samurai {
    constructor({ x, y, canvasWidth, canvasHeight, scale, dirX }) {
        // Inherit from Samurai parent class
        super({ x, y, canvasWidth, canvasHeight, scale, dirX });

        // Sources for each spritesheet and the max frame count for each
        this.sprites = {
            left: {
                attack: [
                    {
                        imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LAttack1.png",
                        maxFrame: 7
                    },
                    {
                        imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LAttack2.png",
                        maxFrame: 6
                    },
                    {
                        imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LAttack3.png",
                        maxFrame: 9
                    }
                ],
                idle: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LIdle.png",
                    maxFrame: 10
                },
                death: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LDeath.png",
                    maxFrame: 11
                },
                hurt: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LTake Hit.png",
                    maxFrame: 3
                },
                run: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/left/LRun.png",
                    maxFrame: 8
                }
            },
            right: {
                attack: [
                    {
                        imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RAttack1.png",
                        maxFrame: 7
                    },
                    {
                        imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RAttack2.png",
                        maxFrame: 6
                    },
                    {
                        imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RAttack3.png",
                        maxFrame: 9
                    }
                ],
                idle: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RIdle.png",
                    maxFrame: 10
                },
                death: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RDeath.png",
                    maxFrame: 11
                },
                hurt: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RTake Hit.png",
                    maxFrame: 3
                },
                run: {
                    imageSrc: "../assets/images/Martial Hero 3/Sprite/right/RRun.png",
                    maxFrame: 8
                }
            }
        };

        this.state = 0; // Player states: 0 = idle, 1 = run, 2 = hurt, 3 = attack, 4 = death

        this.image = new Image();
        this.image.src = this.sprites.left.idle.imageSrc; // Current spritesheet

        this.spriteWidth = 126; // width of each sprite
        this.spriteHeight = 126; // height of each sprite

        this.width = this.spriteWidth; // width of sprite in canvas
        this.height = this.spriteHeight; // width of sprite in canvas

        this.minFrame = 0; // Minimum frame number
        this.maxFrame = this.sprites.left.idle.maxFrame - 1; // Maximum frame number

        this.xframe = this.maxFrame; // # of frame in the spritesheet

        // Frame timer to slow down the animation (5 game ticks before 1 frame refresh)
        this.frameTimer = 0;
        this.frameInterval = 2;

        // Player HP
        this.hp = 100;

        this.isAttacking = false;
    }
}

class Enemy_L2 extends Samurai {
    constructor({ x, y, canvasWidth, canvasHeight, scale, dirX }) {
        // Inherit from Samurai parent class
        super({ x, y, canvasWidth, canvasHeight, scale, dirX });

        // Sources for each spritesheet and the max frame count for each
        this.sprites = {
            left: {
                attack: [
                    {
                        imageSrc: "../assets/images/kenji/left/LAttack1.png",
                        maxFrame: 4
                    },
                    {
                        imageSrc: "../assets/images/kenji/left/LAttack2.png",
                        maxFrame: 4
                    },
                ],
                idle: {
                    imageSrc: "../assets/images/kenji/left/LIdle.png",
                    maxFrame: 4
                },
                death: {
                    imageSrc: "../assets/images/kenji/left/LDeath.png",
                    maxFrame: 7
                },
                hurt: {
                    imageSrc: "../assets/images/kenji/left/LTake Hit.png",
                    maxFrame: 3
                },
                run: {
                    imageSrc: "../assets/images/kenji/left/LRun.png",
                    maxFrame: 8
                }
            },
            right: {
                attack: [
                    {
                        imageSrc: "../assets/images/kenji/right/RAttack1.png",
                        maxFrame: 4
                    },
                    {
                        imageSrc: "../assets/images/kenji/right/RAttack2.png",
                        maxFrame: 4
                    },
                ],
                idle: {
                    imageSrc: "../assets/images/kenji/right/RIdle.png",
                    maxFrame: 4
                },
                death: {
                    imageSrc: "../assets/images/kenji/right/RDeath.png",
                    maxFrame: 7
                },
                hurt: {
                    imageSrc: "../assets/images/kenji/right/RTake Hit.png",
                    maxFrame: 3
                },
                run: {
                    imageSrc: "../assets/images/kenji/right/RRun.png",
                    maxFrame: 8
                }
            }
        };

        this.state = 0; // Player states: 0 = idle, 1 = run, 2 = hurt, 3 = attack, 4 = death

        this.image = new Image();
        this.image.src = this.sprites.left.idle.imageSrc; // Current spritesheet

        this.spriteWidth = 200; // width of each sprite
        this.spriteHeight = 200; // height of each sprite

        this.width = this.spriteWidth; // width of sprite in canvas
        this.height = this.spriteHeight; // width of sprite in canvas

        this.minFrame = 0; // Minimum frame number
        this.maxFrame = this.sprites.left.idle.maxFrame - 1; // Maximum frame number

        this.xframe = this.maxFrame; // # of frame in the spritesheet

        // Frame timer to slow down the animation (5 game ticks before 1 frame refresh)
        this.frameTimer = 0;
        this.frameInterval = 5;

        // Player HP
        this.hp = 100;

        this.isAttacking = false;
    }

    /**
     * @override
     * Since this class doesn't use the default spritesheet direction
     */
    frameHandler() {
        // Change to the correct direction spritesheet (left/right)
        if (this.dirX == 0) {
            // Left = normal frames cycling order
            if (this.xframe < this.maxFrame) {
                this.xframe++; // Move to the next frame
                return;
            }
        } else {
            // Right = reversed frames cycling order
            if (this.xframe > this.minFrame) {
                this.xframe--; // Move to the previous frame, as the spritesheet is mirrored
                return;
            }
        }
        // Call the frameUpdater to reset to first frame according to player direction and state
        frameUpdater(this, 0);
    }

    /** 
     * @override
     * Change initial frame according to direction 
     */
    directionHandler() {
        if (this.dirX == 1) {
            this.xframe = this.maxFrame;
        } else {
            this.xframe = this.minFrame;
        }
    }
}

class Enemy_L3 extends Samurai {
    constructor({ x, y, canvasWidth, canvasHeight, scale, dirX }) {
        // Inherit from Samurai parent class
        super({ x, y, canvasWidth, canvasHeight, scale, dirX });

        // Sources for each spritesheet and the max frame count for each
        this.sprites = {
            left: {
                attack: [
                    {
                        imageSrc: "../assets/images/Evil Wizard 2/Sprite/left/LAttack1.png",
                        maxFrame: 8
                    },
                    {
                        imageSrc: "../assets/images/Evil Wizard 2/Sprite/left/LAttack2.png",
                        maxFrame: 8
                    }
                ],
                idle: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/left/LIdle.png",
                    maxFrame: 8
                },
                death: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/left/LDeath.png",
                    maxFrame: 7
                },
                hurt: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/left/LTake Hit.png",
                    maxFrame: 3
                },
                run: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/left/LRun.png",
                    maxFrame: 8
                }
            },
            right: {
                attack: [
                    {
                        imageSrc: "../assets/images/Evil Wizard 2/Sprite/right/RAttack1.png",
                        maxFrame: 8
                    },
                    {
                        imageSrc: "../assets/images/Evil Wizard 2/Sprite/right/RAttack2.png",
                        maxFrame: 8
                    }
                ],
                idle: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/right/RIdle.png",
                    maxFrame: 8
                },
                death: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/right/RDeath.png",
                    maxFrame: 7
                },
                hurt: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/right/RTake Hit.png",
                    maxFrame: 3
                },
                run: {
                    imageSrc: "../assets/images/Evil Wizard 2/Sprite/right/RRun.png",
                    maxFrame: 8
                }
            }
        };

        this.state = 0; // Player states: 0 = idle, 1 = run, 2 = hurt, 3 = attack, 4 = death

        this.image = new Image();
        this.image.src = this.sprites.left.idle.imageSrc; // Current spritesheet

        this.spriteWidth = 250; // width of each sprite
        this.spriteHeight = 250; // height of each sprite

        this.width = this.spriteWidth; // width of sprite in canvas
        this.height = this.spriteHeight; // width of sprite in canvas

        this.minFrame = 0; // Minimum frame number
        this.maxFrame = this.sprites.left.idle.maxFrame - 1; // Maximum frame number

        this.xframe = this.maxFrame; // # of frame in the spritesheet

        // Frame timer to slow down the animation (5 game ticks before 1 frame refresh)
        this.frameTimer = 0;
        this.frameInterval = 2;

        // Player HP
        this.hp = 100;

        this.isInteracting = false;
    }
}