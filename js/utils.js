/* Utilities for all files */

export { handleMute, handleReturnToMain, handleRestart, frameUpdater };

// Handle mute button
function handleMute(muteButton, music, musicPaused) {
    // Mute button onclick -> pause music, reset to 0 and set musicPaused to true.
    // Otherwise, play music and set musicPaused to false
    muteButton.addEventListener("click", () => {
        if (musicPaused) {
            music.play();
            muteButton.style.filter = "invert(100%)";
            musicPaused = false;
            console.log("Music resumed");
        } else {
            music.pause();
            music.currentTime = 0;
            muteButton.style.filter = "invert(50%)";
            musicPaused = true;
            console.log("Music stopped");
        }
    });
}

// Handling the "return to main menu" button
function handleReturnToMain(btn) {
    btn.addEventListener("click", () => {
        window.location.href = "../html/menu.html"; // Return to main menu
    });
}

// Handling the "restart" button
function handleRestart(btn) {
    btn.addEventListener("click", () => {
        window.location.reload();   // Restart level
    });
}

// Frame updater
function frameUpdater(character, normalDirection) {
    // The frames should be cycled from left to right
    if (character.dirX == normalDirection) {
        // If player = dying, and is at last frame -> pause animation
        if (character.state == 4 && character.xframe >= character.maxFrame) {
            return;

        // If player is taking hit, is attacking attacking or is running,
        // and is at last frame -> switch spritesheet to idling
        } else if ((character.state != 0 || character.state != 4) && character.xframe >= character.maxFrame) {
            character.switchState(0, character.dirX);

        // Player is idling, replay the same spritesheet
        } else {
            character.xframe = character.minFrame; // Reset to the first frame
        }

    // The frames should be cycled from right to left (mirrored spritesheet)
    } else {
        // If player = dying, and is at last frame -> pause animation
        if (character.state == 4 && character.xframe <= character.minFrame) {
            return;

        // If player is taking hit, is attacking attacking or is running,
        // and is at last frame -> switch spritesheet to idling
        } else if ((character.state != 0 && character.state != 4) && character.xframe <= character.minFrame) {
            character.switchState(0, character.dirX);

        // Player is idling, replay the same spritesheet
        } else {
            character.xframe = character.maxFrame; // Reset to the first frame
        }
    }
}
