/* Computer moves generation */

export { easyMove, mediumMove, hardMove };

// Move pairs (which move would win over the player's move, and which would result in a draw or a lose)
// lodTo = lose or draw to
const movePairs = [
    {
        id: "rock",
        winTo: "scissors",
        loseTo: "paper",
        lodTo: ["paper", "rock"]
    },
    {
        id: "paper",
        winTo: "rock",
        loseTo: "scissors",
        lodTo: ["scissors", "paper"]
    },
    {
        id: "scissors",
        winTo: "paper",
        loseTo: "rock",
        lodTo: ["scissors", "rock"]
    }
];

// Easy level computer moves (60% chance of winning, 40% chance of drawing/losing)
function easyMove(playerMove) {
    let randomNumber = Math.floor(Math.random() * 100); // Generate a random chance number between 0 and 100

    if (randomNumber < 40) {
        return movePairs.find(i => i.id == playerMove).lodTo[Math.floor(Math.random() * 2)]; // Choose a random move that would result in a computer win or draw
    } else {
        return movePairs.find(i => i.id == playerMove).winTo; // Let the player win
    }
}

// Medium level computer moves (1/3 chance of winning, 2/3 chance of drawing/losing)
function mediumMove() {
    return movePairs[Math.floor(Math.random() * 3)].id; // Generate a complete random move
}

// Hard level computer moves (20% chance of winning, 80% chance of drawing/losing)
function hardMove(playerMove) {  
    let randomNumber = Math.floor(Math.random() * 100); // Generate a random chance number between 0 and 100

    if (randomNumber > 20) {
        return movePairs.find(i => i.id == playerMove).lodTo[Math.floor(Math.random() * 2)]; // Choose a random move that would result in a computer win or draw
    } else {
        return movePairs.find(i => i.id == playerMove).winTo; // Let the player win
    }
}