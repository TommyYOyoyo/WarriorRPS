/* Main JS module for the gameplay handling */

import { handleMute, handleReturnToMain, handleRestart } from "./utils.js";
import { Player, Enemy_L1, Enemy_L2, Enemy_L3 } from "./classes.js";
import { easyMove, mediumMove, hardMove } from "./computer.js";

// Initializing the elements, audios and declaring the variables
const level = localStorage.getItem("selectedLevel");
const title = document.querySelector("#title");
const muteButton = document.querySelector("#mute");
const returnToMainButton = document.querySelector("#returnToMainMenu");
const restartButton = document.querySelector("#restart");
const canvas = document.getElementById("canvas");
// Healthbar elements
const playerHealthContainer = document.querySelector(".playerHealthbarContainer");
const enemyHealthContainer = document.querySelector(".enemyHealthbarContainer");
const playerHealthbar = document.querySelector("#playerHealthbar");
const enemyHealthValue = document.querySelector("#enemyHealthValue");
const playerHealthValue = document.querySelector("#playerHealthValue");
const enemyHealthbar = document.querySelector("#enemyHealthbar");
// Player choices elements (RPS)
const choiceBox = document.querySelector(".playerChoices");
const rock = document.querySelector("#rock");
const paper = document.querySelector("#paper");
const scissor = document.querySelector("#scissor");
// Canvas render context = 2D
const ctx = canvas.getContext("2d"); // Canvas render context = 2D
// Canvas width and height = page width and height
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight;
const victorySound = new Audio("../assets/sounds/win.mp3");
const gameOverSound = new Audio("../assets/sounds/game-over.mp3");
const hurtSound = new Audio("../assets/sounds/Oof.mp3");
const laughSound = new Audio("../assets/sounds/laugh.mp3");
let enemy; // Computer instance
let musicPaused = false;
let music;

// ================================ BELOW ARE CORE GAME FUNCTIONS ================================

console.log("LEVEL: "+level);

// Determine the AI difficulty based on the level
// Also updates the contents of the page (images, audio...) according to the level.
switch (level) {
    // Easy
    case "easy":

        // Changing background image
        document.querySelector(".levels").style.backgroundImage = 'url("../assets/images/lvl1.gif")';

        // Changing audio
        music = new Audio("../assets/sounds/Town Square Festival.mp3");
        console.log("Now playing: Town Square Festival");

        // Changing title
        title.innerHTML = "Easy";

        break;

    // Medium
    case "medium":
        // Changing background image
        document.querySelector(".levels").style.backgroundImage = 'url("../assets/images/lvl2.gif")';

        // Changing audio
        music = new Audio("../assets/sounds/Resonance in the Depths.mp3");
        console.log("Now playing: Resonance in the Depths");

        // Changing title
        title.innerHTML = "Medium";

        break;

    // Hard
    case "hard":
        // Changing background image
        document.querySelector(".levels").style.backgroundImage = 'url("../assets/images/lvl3.gif")';

        // Changing audio
        music = new Audio("../assets/sounds/The Enemy Draws Near.mp3");
        console.log("Now playing: The Enemy Draws Near");

        // Changing title
        title.innerHTML = "Hardcore";

        break;
}

// Handling the extra buttons
handleMute(muteButton, music, musicPaused);
handleReturnToMain(returnToMainButton);
handleRestart(restartButton);

// Play the right music
music.loop = true;
music.play();

// Initialize a new player character spritesheet
const player = new Player({
    x: canvas.width / 4,
    y: canvas.height / 1.4,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    scale: 6,
    dirX: 1,
});

// Initialize a new enemy spritesheet
enemy = chooseEnemyCharacter(level);

// Animate spritesheets
animate();

// Update HP container according to player's position
updateHPContainerPosition();




// ================================ BELOW ARE GAME FUNCTIONS ================================

// Function that returns an enemy object according to the level
function chooseEnemyCharacter(level) {
    switch (level) {
        // Easy
        case "easy":
            return new Enemy_L1({
                x: canvas.width / 1.3,
                y: canvas.height / 1.35,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                scale: 6,
                dirX: 0,
            });
        // Medium
        case "medium":
            return new Enemy_L2({
                x: canvas.width / 1.3,
                y: canvas.height / 1.5,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                scale: 6,
                dirX: 0,
            });
        // Hard
        case "hard":
            return new Enemy_L3({
                x: canvas.width / 1.3,
                y: canvas.height / 1.75,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                scale: 6,
                dirX: 0,
            });
    }
}

// Win function (display congratulations message)
function win(tries) {
    // If current gamemode is bossfight, re-center the title
    if (isBossfight) {
        title.style.animation = "reverseTitleRoll 1s linear forwards";
    }

    music.pause();       // Pause current music to hear the victory sound effect
    victorySound.play(); // Victory sound effect
    // Victory text displays, all others are hidden
    canvas.style.display = "none";
    healthContainer.style.display = "none";
    form.style.display = "none";
    transcripts.style.display = "none";
    title.innerHTML = `You win! Congratulations! <br> Tries: ${tries}`;
}

// Lose function
function gameOver(correctNumber) {
    // Switch to player death spritesheet
    player.switchState(3);

    setTimeout(() => {
        // If current gamemode is bossfight, re-center the title
        if (isBossfight) {
            title.style.animation = "reverseTitleRoll 1s linear forwards";
        }

        music.pause();        // Pause current music to hear sound effect
        gameOverSound.play(); // Game over sound effect
        // Game over text displays, all others are hidden
        canvas.style.display = "none";
        healthContainer.style.display = "none";
        form.style.display = "none";
        transcripts.style.display = "none";
        title.style.color = "rgb(255, 66, 66)";
        title.innerHTML = `Game Over! <br> Correct number: ${correctNumber}`;
        // Enable player death
    }, 1000);
}

// Function animating frames
function animate() {
    window.requestAnimationFrame(animate); // Infinite animating loop
    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player and enemy
    player.update(ctx);
    enemy.update(ctx);
}

// Function that handles when a character takes a hit
function updateHealth(character, damage) {
    // Update character health
    character.hp -= damage;
    character.switchState(2); // Switch character's spritesheet to hurt
    console.log(`Current health of ${character.constructor.name}: ${character.hp}%`);

    hurtSound.play(); // Play hurt sound
    if (character == player) {
        playerHealthbar.value = character.hp;
        playerHealthValue.innerHTML = `${character.hp}%`;
    } else {
        enemyHealthbar.value = character.hp;
        enemyHealthValue.innerHTML = `${character.hp}%`;
    }
}

// Function that updates health container's position according to player's position
function updateHPContainerPosition() {
    // Calculate the canvas's position relatively to the player
    const canvasRect = canvas.getBoundingClientRect();
    const healthContainerX = canvasRect.left + player.x - playerHealthContainer.offsetWidth / 2 - 5; // x absolute position - offset
    const healthContainerY = canvasRect.top + player.y - playerHealthContainer.offsetHeight - 200; // y absolute position - offset

    // Calculate the canva's position relatively to the enemy
    const eHealthContainerX = canvasRect.left + enemy.x - enemyHealthContainer.offsetWidth / 2 - 30; // x absolute position - offset
    const eHealthContainerY = canvasRect.top + enemy.y - enemyHealthContainer.offsetHeight - 150; // y absolute position - offset

    // Update health bar position
    playerHealthContainer.style.left = `${healthContainerX}px`;
    playerHealthContainer.style.top = `${healthContainerY}px`;
    enemyHealthContainer.style.left = `${eHealthContainerX}px`;
    enemyHealthContainer.style.top = `${eHealthContainerY}px`;
}
