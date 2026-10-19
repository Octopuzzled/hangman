import { techWords } from "./words/tech.js";
import { animalWords } from "./words/animals.js";

const wordCategories = {
    tech: techWords,
    animals: animalWords,
};
// let words = ["cat"]; // Development word list
let words = wordCategories.tech;

// Hangman Stick Figure parts
// 8 guesses (trys)
const partsEasy = [
    ["part-base"], // Error 1
    ["part-pole"], // Error 2
    ["part-beam"], // Error 3
    ["part-rope"], // Error 4
    ["part-head"], // Error 5
    ["part-body"], // Error 6
    ["part-arms", "part-arms-2"], // Error 7
    ["part-legs", "part-legs-2"], // Error 8
];

const partsNormal = [
    ["part-base", "part-pole"],
    ["part-beam", "part-rope"],
    ["part-head"],
    ["part-body"],
    ["part-arms", "part-arms-2"],
    ["part-legs", "part-legs-2"],
];

// 4 guesses (trys): shows several parts at once
const partsDifficult = [
    ["part-base", "part-pole", "part-beam", "part-rope"],
    ["part-head"],
    ["part-body"],
    ["part-arms", "part-arms-2", "part-legs", "part-legs-2"],
];

let activeParts = []; // for active array

let word = [];
let keyArray = [];
let trys = 0;
let errorCount = 0;
let displayWord = [];
let gamesWon = 0;
let gamesLost = 0;
let currentMode = "normal";

const trySection = document.getElementById("trys");
const wordSection = document.getElementById("word");
const gameStatement = document.getElementById("gameEnd");
const gameButton = document.getElementById("new-game");
const keyboardContainer = document.getElementById("keyboard");

initiateGameField("normal", words);

function initiateGameField(gameMode) {
    if (gameMode) currentMode = gameMode;
    switch (currentMode) {
        case "easy":
            trys = 8;
            activeParts = partsEasy;
            break;
        case "difficult":
            trys = 4;
            activeParts = partsDifficult;
            // todo: key buttons stay usable
            break;
        case "normal":
            trys = 6;
            activeParts = partsNormal;
    }

    word = Array.from(
        words[Math.floor(Math.random() * words.length)].toUpperCase(),
    );
    keyArray = Array.from({ length: 26 }, (_, i) =>
        String.fromCharCode(65 + i),
    ); // Generates all 26 letters of the alphabet
    displayWord = [];
    gameStatement.innerText = "";
    gameButton.classList.add("new-game-btn-hidden");
    wordSection.textContent = "";
    keyboardContainer.innerHTML = "";
    errorCount = 0;
    resetStickFigure();
    updateWordDisplay();
    initiateWord();
    initiateKeyboard();
    updateTrys();
    enableKeyboard();
    updateGameHistory(gamesWon, gamesLost);
}

function changeCategory(selectedCategory) {
    words = wordCategories[selectedCategory];
    initiateGameField("easy", words);
}

function updateTrys() {
    trySection.innerHTML = `Verbleibende Versuche: ${trys}`;
}

function updateWordDisplay() {
    let wordSpace = document.getElementById("word");
    wordSpace.textContent = displayWord.join(" ");
}

function initiateWord() {
    for (let i = 0; i < word.length; i++) {
        displayWord.push("_");
    }
    wordSection.textContent = displayWord.join(" ");
}

function initiateKeyboard() {
    keyArray.forEach((key) => {
        keyboardContainer.innerHTML += `<button id=${key} class="key-button">${key}</button>`;
    });
}

function guessLetter(letter) {
    //todo: add use of actual keyboard
    let button = document.getElementById(`${letter}`);
    let letterFound = false;
    word.forEach((element, index) => {
        if (element === letter) {
            displayWord[index] = word[index];
            letterFound = true;
        }
    });
    if (!letterFound) {
        trys--;
        errorCount++;
        updateTrys();
        updateStickFigure();
    }
    button.classList.add("disabled");
    button.disabled = true;
    updateWordDisplay();
    updateStickFigure();
    checkGameEnd();
}

function updateStickFigure() {
    if (errorCount > 0 && errorCount <= activeParts.length) {
        let currentStepParts = activeParts[errorCount - 1];

        currentStepParts.forEach((partId) => {
            let part = document.getElementById(partId);
            if (part) {
                part.classList.remove("hidden");
            }
        });
    }
}

function resetStickFigure() {
    const allParts = document.querySelectorAll(".hangman-part");
    allParts.forEach((part) => {
        part.classList.add("hidden");
    });
    errorCount = 0;
}

function disableKeyboard() {
    keyboardContainer.classList.add("keyboard-locked");
}

function enableKeyboard() {
    keyboardContainer.classList.remove("keyboard-locked");
}

function checkGameEnd() {
    if (trys === 0) {
        console.log("Game Over");
        gameStatement.innerText = `Verloren! Das Wort war "${word.join("")}".`;
        gameButton.classList.remove("new-game-btn-hidden");
        disableKeyboard();
        gamesLost++;
        updateGameHistory(gamesWon, gamesLost);
    }
    if (displayWord.join("") === word.join("")) {
        console.log("Game won");
        gameStatement.innerText = `Gewonnen! Das Wort war "${word.join("")}".`;
        gameButton.classList.remove("new-game-btn-hidden");
        disableKeyboard();
        gamesWon++;
        updateGameHistory(gamesWon, gamesLost);
    }
}

function updateGameHistory(won, lost) {
    let gameHistory = document.getElementById("game-history");
    gameHistory.innerHTML = `<p>Gewonnen: ${won} | Verloren: ${lost}</p>`;
}

// Event listeners
// Keyboard (Event delegatioin: one listener for all letters)
keyboardContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".key-button");
    if (!button) return;
    guessLetter(button.id);
});

// Physical keyboard: listen on the whole page, not on the button container
document.addEventListener("keydown", (event) => {
    // ignore shortcuts like Ctrl+R or Cmd+C
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    // ignore typing while the category dropdown has focus
    if (event.target.tagName === "SELECT") return;

    // only accept the letters A-Z
    if (!/^[a-z]$/i.test(event.key)) return;

    // game is over, keyboard is locked
    if (keyboardContainer.classList.contains("keyboard-locked")) return;

    // find the matching on-screen button and skip letters already used
    const button = document.getElementById(event.key.toUpperCase());
    if (!button || button.disabled) return;

    guessLetter(button.id);
});

// Buttons for game difficulty
document.querySelectorAll(".game-difficulty-section button").forEach((btn) => {
    btn.addEventListener("click", () => initiateGameField(btn.dataset.mode));
});

// New game
gameButton.addEventListener("click", () => initiateGameField());

// Category
let category = document.getElementById("category-select");
category.addEventListener("change", (event) =>
    changeCategory(event.target.value),
);
