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
// ChatBox elements
const playerChatBox = document.querySelector(".playerChatBox");
const enemyChatBox = document.querySelector(".enemyChatBox");
const playerChoiceImage = document.querySelector("#playerChoiceImg");
const enemyChoiceImage = document.querySelector("#enemyChoiceImg");
const enemyTalkText = document.querySelector("#enemyTalk");
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
let paused = false;
let randomInterval = Math.floor(Math.random() * (6000-3000) + 6000);
let damage = -10;
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

// Computer random chat
let remarking = function() {
    if (paused) return; // If game is over, do not do anything

    // Only display enemy remark if enemy is not interacting
    if (!enemy.isInteracting) {
        // New random interval
        randomInterval = Math.floor(Math.random() * (6000-3000) + 3000);

        // Display random enemy remark
        enemyChatBox.style.display = "block";
        enemyTalkText.style.display = "block";
        drawChatBox();
        enemyTalkText.innerHTML = enemyTalk(enemy.hp);

        // Hide random enemy remark
        setTimeout(() => {
            enemyChatBox.style.display = "none";
            enemyTalkText.style.display = "none";
        }, 2000);
    };

    setTimeout(remarking, randomInterval); // Call the function again, in a random interval
};

setTimeout(remarking, randomInterval); // Call the function once, in a random interval


// ================================ BELOW ARE CORE GAME FUNCTIONS ================================

// Gameplay loop
function handleResponse(playerMove) {
    let computerMove;
    
    // Choose computer move
    if (level == "easy") {
        computerMove = easyMove(playerMove);
    } else if (level == "medium") {
        computerMove = mediumMove();
    } else if (level == "hard") {
        computerMove = hardMove(playerMove);
    }

    console.log("Player move: " + playerMove + " VS Computer move: " + computerMove);

    // Check who won
    checker(playerMove, computerMove);
}

// Function that checks which side won
function checker(playerMove, computerMove) {
    switch (true) {
        // Tie
        case playerMove == computerMove:
            afterMove(2, playerMove, computerMove); // Tie
            break;
        // Computer wins
        case (playerMove == "rock" && computerMove == "paper") ||
             (playerMove == "paper" && computerMove == "scissors") ||
             (playerMove == "scissors" && computerMove == "rock"):
            afterMove(0, playerMove, computerMove); // Lose
            break;
        // Player wins
        case (playerMove == "rock" && computerMove == "scissors") ||
             (playerMove == "paper" && computerMove == "rock") ||
             (playerMove == "scissors" && computerMove == "paper"):
            afterMove(1, playerMove, computerMove); // Win
            break;
    }
}

// Function to check HP of both characters to determine who won
function checkWL() {
    // Check if either won, and call the according function
    if (player.hp <= 0) {
        paused = true;
        gameOver();
    } else if (enemy.hp <= 0) {
        paused = true;
        win();
    }
}

// Function that handles the animation upon a player move
// WoL = Win or lose
function afterMove(WoL, playerMove, computerMove) {

    controlChoices(0); // Disable player choices

    enemy.isInteracting = true;

    setTimeout(() => {
        // Display chat boxes
        playerChatBox.style.display = "block";
        enemyChatBox.style.display = "block";
        playerChoiceImage.style.display = "block";
        enemyChoiceImage.style.display = "block";
        enemyTalkText.style.display = "none";
        drawChatBox();

        // Display player and enemy choice images
        switch (playerMove) {
            case "rock":
                playerChoiceImage.src = "../assets/images/rock.png";
                break;
            case "paper":
                playerChoiceImage.src = "../assets/images/paper.png";
                break;
            case "scissors":
                playerChoiceImage.src = "../assets/images/scissor.png";
                break;
        }
        switch (computerMove) {
            case "rock":
                enemyChoiceImage.src = "../assets/images/rock.png";
                break;
            case "paper":
                enemyChoiceImage.src = "../assets/images/paper.png";
                break;  
            case "scissors":
                enemyChoiceImage.src = "../assets/images/scissor.png";
                break;
        }

        // Animations
        setTimeout (() => {
            // Hide chat boxes
            playerChatBox.style.display = "none";
            enemyChatBox.style.display = "none";
            playerChoiceImage.style.display = "none";
            enemyChoiceImage.style.display = "none";
            enemyTalkText.style.display = "none";
            let interval = 0;

            // Player wins
            if (WoL == 1) {
                // Move player
                move(player);

            // Player loses
            } else if (WoL == 0) {
                // Move enemy
                move(enemy);

            // Tie
            } else {
                enemy.isInteracting = false;
                return controlChoices(1);
            }
        }, 1500);
    }, 500);
}

// Function that moves player or enemy when they're attacking
function move(character) {
    let interval;
    // Make character run
    character.switchState(1);

    // CHARACTER IS PLAYER
    if (character.constructor.name == "Player") {
        // Move to right
        interval = setInterval(() => {
            if (character.x < canvas.width / 2) { 
                character.x += 3;
                updateHPContainerPosition();
            } else {
                // Get out of the loop
                clearInterval(interval);
            }
        }, 1);
        setTimeout(() => {
            // Player attack
            character.switchState(3);

            // Enemy loses health, if one side won, stop the suite
            updateHealth(enemy, damage);

            if (paused) return;

            setTimeout(() =>{
                // Player runs back
                character.switchDirection(0);
                character.switchState(1);
                interval = setInterval(() => {  
                    if (character.x > canvas.width / 4) { 
                        character.x -= 3;
                        updateHPContainerPosition();
                    } else {
                        // Get out of the loop
                        clearInterval(interval);
                    }
                }, 1);  
                // Reset to default
                setTimeout(() => {
                    character.switchDirection(1);
                    // Allow player to play again
                    controlChoices(1);
                    enemy.isInteracting = false;
                }, 500);
            }, 500);
        }, 500);

    // CHARACTER IS ENEMY
    } else {
        // Move to left
        interval = setInterval(() => {
            if (character.x > canvas.width / 2) { 
                character.x -= 3;
                updateHPContainerPosition();
            } else {
                // Get out of the loop
                clearInterval(interval);
            }
        }, 1);
        setTimeout(() => {
            // Enemy attack
            character.switchState(3);

            // Player loses health, if one side won, stop the suite
            updateHealth(player, damage);

            if (paused) return;

            setTimeout(() =>{
                // Enemy runs back
                character.switchDirection(1);
                character.switchState(1);
                interval = setInterval(() => {  
                    if (character.x < canvas.width / 1.3) { 
                        character.x += 3;
                        updateHPContainerPosition();
                    } else {
                        // Get out of the loop
                        clearInterval(interval);
                    }
                }, 1);  
                // Reset to default
                setTimeout(() => {
                    character.switchDirection(0);
                    // Allow player to play again
                    controlChoices(1);
                    enemy.isInteracting = false;
                }, 500);
            }, 500);
        }, 500);
    }
}

// Function to enable / disable player buttons (0 = disabled, 1 = enabled)
function controlChoices(parameter) {
    if (parameter == 0) {
        choicesContainer.style.display = "none";
    } else if (parameter == 1) {
        choicesContainer.style.display = "flex";
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

    // Check win-loss
    checkWL();
}

// Function that updates health container's position according to player's and enemy's position
function updateHPContainerPosition() {
    // Calculate the canvas's position relatively to the player
    const canvasRect = canvas.getBoundingClientRect();
    const healthContainerX = canvasRect.left + player.x - playerHealthContainer.offsetWidth / 2 - 5; // x absolute position - offset
    const healthContainerY = canvasRect.top + player.y - playerHealthContainer.offsetHeight - 180; // y absolute position - offset

    // Calculate the canva's position relatively to the enemy (computer)
    const eHealthContainerX = canvasRect.left + enemy.x - enemyHealthContainer.offsetWidth / 2 - 30; // x absolute position - offset
    const eHealthContainerY = canvasRect.top + enemy.y - enemyHealthContainer.offsetHeight - 130; // y absolute position - offset

    // Update health bar position
    playerHealthContainer.style.left = `${healthContainerX}px`;
    playerHealthContainer.style.top = `${healthContainerY}px`;
    enemyHealthContainer.style.left = `${eHealthContainerX}px`;
    enemyHealthContainer.style.top = `${eHealthContainerY}px`;
}

// Function that draws player and enemy (computer) chat boxes
function drawChatBox() {
    // pcX = Player Chat box X...

    // Calculate the canvas's position relatively to the player
    const canvasRect = canvas.getBoundingClientRect();
    const pcX = canvasRect.left + player.x - playerChatBox.offsetWidth / 2 - 5; // x absolute position - offset
    const pcY = canvasRect.top + player.y - playerChatBox.offsetHeight - 200; // y absolute position - offset

    // Calculate the canva's position relatively to the enemy (computer)
    const ecX = canvasRect.left + enemy.x - enemyChatBox.offsetWidth / 2 - 30; // x absolute position - offset
    const ecY = canvasRect.top + enemy.y - enemyChatBox.offsetHeight - 150; // y absolute position - offset

    // Update Chat Box position
    playerChatBox.style.left = `${pcX}px`;
    playerChatBox.style.top = `${pcY}px`;
    enemyChatBox.style.left = `${ecX}px`;
    enemyChatBox.style.top = `${ecY}px`;
}

// Enemy random messages function
function enemyTalk(hp) {
    let chatMessages = {
        good: ["You can't beat me!", "I'm your worthy enemy!", "Just wait... I will slain you!", "Wait and get wrecked!", "You're gonna lose no matter what!", "Nah I'd win.", "We are no match!"],
        mid: ["I don't feel so good...", "I'd still win.", "May the lightning strike upon you!", "#@)(%(&^)@$(*!", "I'm maybe not gonna win this time...", "Lock in", "...", "!!!"],
        bad: ["Oh crap.", "I don't feel good.", "You're very strong.", "It seems that you're winning...", "*******!", "NOOOOOO!!!", "This is so not right...so not right"],
    }
    // Enemy still has high health
    if (hp >= 75) {
        return chatMessages.good[Math.floor(Math.random() * (chatMessages.good.length - 1))];
    // Enemy has dropped to mid-health
    } else if (hp < 75 && hp > 25) {
        return chatMessages.mid[Math.floor(Math.random() * (chatMessages.mid.length - 1))];
    // Enemy has low health
    } else if (hp <= 25) {
        return chatMessages.bad[Math.floor(Math.random() * (chatMessages.bad.length - 1))];
    }
}

// Win function (display congratulations message)
function win(tries) {
    // Switch to enemy death spritesheet
    enemy.switchState(4);

    // Timeout to show death animation
    setTimeout(() => {
        music.pause();       // Pause current music to hear the victory sound effect
        victorySound.play(); // Victory sound effect

        // Victory text displays, all others are hidden
        canvas.style.display = "none";
        playerHealthContainer.style.display = "none";
        enemyHealthContainer.style.display = "none";
        choicesContainer.style.display = "none";
        enemyChatBox.style.display = "none";
        playerChatBox.style.display = "none";
        page.style.animation = "blur 1s linear forwards";

        // Change game over content to victory message
        title.innerHTML = `You win! <br>HP left: ${player.hp}%`;

        title.style.fontSize = "150px";
        title.style.top = "50%";                    // Center vertically
        title.style.transform = "translateY(50%)";  // Center vertically
    },1000);
}

// Lose function
function gameOver(correctNumber) {
    // Switch to player death spritesheet
    player.switchState(4);

    // Timeout to show death animation
    setTimeout(() => {
        music.pause();       // Pause current music to hear the game over sound effect
        gameOverSound.play(); // Game over sound effect

        // Victory text displays, all others are hidden
        canvas.style.display = "none";
        playerHealthContainer.style.display = "none";
        enemyHealthContainer.style.display = "none";
        choicesContainer.style.display = "none";
        enemyChatBox.style.display = "none";
        playerChatBox.style.display = "none";
        page.style.animation = "blur 1s linear forwards";

        // Change title content to game over message
        title.innerHTML = `Game Over! <br>Enemy HP left: ${enemy.hp}%`;

        title.style.top = "50%";                    // Center vertically
        title.style.transform = "translateY(50%)";  // Center vertically
        title.style.color = "rgb(255, 66, 66)";
        title.style.fontSize = "150px";
    }, 1000);
}
