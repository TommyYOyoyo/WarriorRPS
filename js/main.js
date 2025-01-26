// JS module handling elements from the home page only

import { handleMute } from "./utils.js";

// Grab the elements
const muteButton = document.querySelector("#mute");
const lobbyMusic = new Audio("../assets/sounds/The Watchful Ivory Towers.mp3");
let musicPaused = false;

let level = "";

// Enable loop and autoplay
lobbyMusic.loop = true;
lobbyMusic.play();
console.log("Now playing: The Watchful Ivory Towers.mp3");

// Level selector handling and send level number to game.js by exporting
document.querySelector(".levels").addEventListener("click", (e) => {
    // Only if button is clicked
    if (e.target.tagName === "BUTTON") {
        // Level grabber
        level = e.target.id; // Level = selected level
        window.location.href = "../html/levels.html"; // Redirect to game page
        // Set the level in local storage to be used in game.js
        localStorage.setItem("selectedLevel", level); 
    }
});

// Mute button handling
handleMute(muteButton, lobbyMusic, musicPaused);
