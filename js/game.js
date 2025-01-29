/* Main JS module for the gameplay handling */

import { handleMute, handleReturnToMain, handleRestart } from "./utils.js";
import { Player, Enemy_L1, Enemy_L2, Enemy_L3 } from "./classes.js";
import { easyMove, mediumMove, hardMove } from "./computer.js";

// Initializing the elements, audios and declaring the variables
const level = localStorage.getItem("selectedLevel");
const page = document.querySelector(".levels");
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
const choicesContainer = document.querySelector(".playerChoices");
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
let enemy; // Computer instance
let musicPaused = false;
let music;

// ================================ BELOW IS GAME CALLSTACK ===================================

console.log("LEVEL: "+level);

levelSwitcher(level);

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
    y: canvas.height / 1.35,
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

buttonHandler();



// ================================ BELOW ARE CORE GAME FUNCTIONS ================================

// Gameplay loop
function handleResponse(playerMove) {
    let botMove;
    
    if (level == "easy") {
        botMove = easyMove(playerMove);
    } else if (level == "medium") {
        botMove = mediumMove(playerMove);
    } else if (level == "hard") {
        botMove = hardMove(playerMove);
    }

    checker(playerMove, botMove);
}

// Function that checks which side won
function checker(playerMove, computerMove) {
    switch (true) {
        // Tie
        case playerMove == computerMove:
            break;
        // Computer wins
        case (playerMove == "rock" && computerMove == "paper") ||
             (playerMove == "paper" && computerMove == "scissors") ||
             (playerMove == "scissors" && computerMove == "rock"):
            updateHealth(player, -10);
            break;
        // Player wins
        case (playerMove == "rock" && computerMove == "scissors") ||
             (playerMove == "paper" && computerMove == "rock") ||
             (playerMove == "scissors" && computerMove == "paper"):
            updateHealth(enemy, -10);
            break;
    }

    // Check if either won, and call the according function
    if (player.hp <= 0) {
        gameOver();
    }
    if (enemy.hp <= 0) {
        win();
    }
}

// Function to enable / disable player buttons (0 = disabled, 1 = enabled)
function controlChoices(parameter) {
    if (parameter == 0) {
        choicesContainer.style.display = "none";
    } else if (parameter == 1) {
        choicesContainer.style.display = "block";
    }
}

// Function that handles player button interactions
function buttonHandler() {
    rock.addEventListener("click", () => {
        return handleResponse("rock");
    });
    paper.addEventListener("click", () => {
        return handleResponse("paper");
    });
    scissor.addEventListener("click", () => {
        return handleResponse("scissors");
    });
}

// Determine the AI difficulty based on the level
// Also updates the contents of the page (images, audio...) according to the level.
function levelSwitcher(level) {
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
}

// Function that returns an enemy object according to the level
function chooseEnemyCharacter(level) {
    switch (level) {
        // Easy
        case "easy":
            return new Enemy_L1({
                x: canvas.width / 1.3,
                y: canvas.height / 1.32,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                scale: 6,
                dirX: 0,
            });
        // Medium
        case "medium":
            return new Enemy_L2({
                x: canvas.width / 1.3,
                y: canvas.height / 1.45,
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
function updateHealth(character, hpChange) {
    // Update character health
    character.hp += hpChange;
    character.switchState(2); // Switch character's spritesheet to hurt
    console.log(`Current health of ${character.constructor.name}: ${character.hp}%`);

    hurtSound.play(); // Play hurt sound
    if (character.constructor.name == "Player") {
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

// Win function (display congratulations message)
function win(tries) {

    music.pause();       // Pause current music to hear the victory sound effect
    victorySound.play(); // Victory sound effect

    // Victory text displays, all others are hidden
    canvas.style.display = "none";
    playerHealthContainer.style.display = "none";
    enemyHealthContainer.style.display = "none";
    choicesContainer.style.display = "none";

    // Change game over content to victory message
    title.innerHTML = `You win! <br>HP left: ${player.hp}%`;

    title.style.fontSize = "150px";
    title.style.top = "50%";                    // Center vertically
    title.style.transform = "translateY(50%)";  // Center vertically
}

// Lose function
function gameOver(correctNumber) {
    // Switch to player death spritesheet
    player.switchState(4);

    setTimeout(() => {
        music.pause();       // Pause current music to hear the game over sound effect
        gameOverSound.play(); // Game over sound effect

        // Victory text displays, all others are hidden
        canvas.style.display = "none";
        playerHealthContainer.style.display = "none";
        enemyHealthContainer.style.display = "none";
        choicesContainer.style.display = "none";
        page.style.animation = "blur 1s linear forwards";

        // Change title content to game over message
        title.innerHTML = `Game Over! <br>Enemy HP left: ${enemy.hp}%`;

        title.style.top = "50%";                    // Center vertically
        title.style.transform = "translateY(50%)";  // Center vertically
        title.style.color = "rgb(255, 66, 66)";
        title.style.fontSize = "150px";
    }, 1000);
}
