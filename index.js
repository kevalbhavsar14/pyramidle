// Wordle spinoff game Pyramidle
// Created by Keval Bhavsar

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function replaceAtStr(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

let darkModeInput = document.getElementById("dark-mode");
darkModeInput.addEventListener("click", () => {
    let r = document.querySelector(":root");
    let dmSwitch = document.querySelector(".switch");
    if (darkModeInput.checked) {
        r.style.setProperty("--bgcolor", "rgb(25, 25, 30)");
        r.style.setProperty("--fgcolor", "white");
        r.style.setProperty("--correctPlaceColor", "rgb(0, 150, 75)");
        r.style.setProperty("--incorrectPlaceColor", "rgb(200, 175, 0)");
        r.style.setProperty("--notPresentColor", "rgb(50, 50, 60)");
        dmSwitch.classList.remove("off");
    }
    else {
        r.style.setProperty("--bgcolor", "white");
        r.style.setProperty("--fgcolor", "black");
        r.style.setProperty("--correctPlaceColor", "rgb(0, 170, 95)");
        r.style.setProperty("--incorrectPlaceColor", "rgb(220, 195, 50)");
        r.style.setProperty("--notPresentColor", "rgb(100, 100, 110)");
        dmSwitch.classList.add("off");
    }
});

let guessNo = 1;
let guessLetter = 1;

let guess = "";
let guesses = [];
let answers = [];
for (let i = 4; i <= 11; i++) {
    let eligible = targets.filter((word) => word.length == i);
    answers.push(eligible[getRandomInt(eligible.length)]);
}
console.log(answers);

let won = false;
let finished = false;

document.addEventListener("keydown", (event) => {
    keydown(event.key, event.code);
}, false);

let keys = document.getElementsByClassName("key");
for (let key of keys) {
    key.addEventListener("click", () => {
        keydown(key.children[0].textContent.toLowerCase(), key.attributes["code"].value);
    });
}

document.getElementById("play-again").addEventListener("click", () => {
    window.location.reload();
});

function keydown(keyName, keyCode) {
    if (finished) {
        return;
    }
    if (keyCode == "Enter") {
        if (!validateGuess()) {
            return;
        }
        checkGuess(guess, guessNo, guessNo > 3 ? answers[guessNo - 4] : answers[0]);
        nextGuess();
        let answerDivs = document.querySelectorAll(`.answer span`);
        answerDivs[guessNo - 2].textContent = guessNo > 4 ? answers[guessNo - 5].toUpperCase() : '';
        if (finished) return;
        resetKeyboard();
        for (let i = 0; i < guessNo - 1; i++) {
            checkGuess(guesses[i], i + 1, guessNo > 3 ? answers[guessNo - 4] : answers[0]);
        }
    }
    else if (keyCode.startsWith("Key")) {
        enterLetter(keyName, guessNo, guessLetter);
    }
    else if (keyCode == "Backspace") {
        removeLetter(guessNo, guessLetter - 1);
    }
}

function enterLetter(letter, guessNo, letterNo) {
    if (letterNo > guessNo) {
        return;
    }
    let guessRow = document.getElementById(`guess-${guessNo}`);
    let letterDiv = guessRow.querySelector(`:nth-child(${letterNo})`);
    letterDiv.children[0].textContent = letter.toUpperCase();
    guess += letter;
    guessLetter++;
}

function removeLetter(guessNo, letterNo) {
    if (letterNo < 1) {
        return;
    }
    let guessRow = document.getElementById(`guess-${guessNo}`);
    let letterDiv = guessRow.querySelector(`:nth-child(${letterNo})`);
    letterDiv.children[0].textContent = "";
    guess = guess.slice(0, letterNo - 1);
    guessLetter--;
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function validateGuess() {
    if (guess.length < guessNo) {
        return false;
    }
    if (!dictionary.includes(guess)) {
        document.getElementById(`guess-${guessNo}`).style.animation = "shake 100ms linear";
        sleep(100).then(() => {
            document.getElementById(`guess-${guessNo}`).style.animation = "";
        })
        return false;
    }
    return true;
}

function checkGuess(guess, guessNo, answer) {
    let guessRow = document.getElementById(`guess-${guessNo}`);
    let guessLetters = guess;
    let answerLetters = answer;
    for (let i = 0; i < guessNo; i++) {
        let letterDiv = guessRow.querySelector(`:nth-child(${i + 1})`);
        if (guessLetters[i] == answerLetters[i]) {
            letterDiv.style.backgroundColor = "var(--correctPlaceColor)";
            document.querySelector(`button[code="Key${guessLetters[i].toUpperCase()}"]`).style.backgroundColor = "var(--correctPlaceColor)";
            guessLetters = replaceAtStr(guessLetters, i, "_");
            answerLetters = replaceAtStr(answerLetters, i, "_");
        }
        letterDiv.style.color = "white";
        letterDiv.style.border = "none";
    }
    for (let i = 0; i < guessNo; i++) {
        let letterDiv = guessRow.querySelector(`:nth-child(${i + 1})`);
        let key = document.querySelector(`button[code="Key${guessLetters[i].toUpperCase()}"]`);
        if (guessLetters[i] == "_") {
            continue;
        }
        else if (answerLetters.includes(guessLetters[i])) {
            letterDiv.style.backgroundColor = "var(--incorrectPlaceColor)";
            if (key.style.backgroundColor != "var(--correctPlaceColor)") {
                key.style.backgroundColor = "var(--incorrectPlaceColor)";
            }
            answerLetters = replaceAtStr(answerLetters, answerLetters.search(guessLetters[i]), "_");
        }
        else {
            letterDiv.style.backgroundColor = "var(--notPresentColor)";
            if (key.style.backgroundColor != "var(--correctPlaceColor)" && key.style.backgroundColor != "var(--incorrectPlaceColor)") {
                key.style.backgroundColor = "var(--notPresentColor)";
            }
        }
        key.style.color = "white";
    }
    if (guess == answer) {
        won = true;
        finishGame();
    }
}

function nextGuess() {
    guessNo++;
    guessLetter = 1;
    guesses.push(guess);
    guess = ""
    if (guessNo > 11) {
        finishGame();
    }
}

function finishGame() {
    finished = true;
    let endMessage = document.getElementById("end-message");
    endMessage.style.visibility = "visible";
    if (won) {
        endMessage.children[0].textContent = "Pro bhai!";
    }
    else {
        endMessage.children[0].textContent = `Noob bhai.`;
    }
    for (let i = guessNo; i <= 11; i++) {
        let answerDivs = document.querySelectorAll(`.answer span`);
        answerDivs[i - 1].textContent = i > 4 ? answers[i - 4].toUpperCase() : '';
    }
}

function resetKeyboard() {
    let keys = document.querySelectorAll(".key");
    for (let key of keys) {
        key.style.backgroundColor = "rgb(174, 174, 174)";
    }
}