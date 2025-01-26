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
const playerHealthBar = document.querySelector("#playerHealthbar");
const enemyHealthValue = document.querySelector("#enemyHealthValue");
const playerHealthValue = document.querySelector("#playerHealthValue");
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
let computer; // Computer instance
let musicPaused = false;
let music;

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
const enemy = new Enemy_L3({
    x: canvas.width / 1.3,
    y: canvas.height / 1.75,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    scale: 6,
    dirX: 0,
});

// Animate spritesheets
animate();

// Update HP container according to player's position
updateHPContainerPosition();

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

// Function to update healthbar and trigger player hurt animation
function updateHealth(newHealth) {
    player.switchState(2); // Switch player's spritesheet to hurt
    hurtSound.play(); // Play hurt sound
    healthBar.value = newHealth;
    healthValue.innerHTML = `${newHealth}%`;
}

// Function that handles when player takes a hit
function takeHit(currentTries, maxTries) {
    // Update player health
    player.hp -= (1 / maxTries) * 100;
    // Update healthbar and trigger player animation
    updateHealth(player.hp);
    console.log(`Current health: ${player.hp}%, try #${currentTries - 1}`);
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
