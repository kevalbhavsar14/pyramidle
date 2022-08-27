// Wordle spinoff game Pyramidle
// Created by Keval Bhavsar

const rnd = new Srand();
const s = Number([...location.search.matchAll(/\?((\w+)=([0-9]*))/g)]?.[0]?.[3]);
if (!isNaN(s)) {
    rnd.seed(s);
}

function getRandomInt(max) {
    return rnd.intInRange(0, max - 1);
}

function replaceAtStr(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

const darkModeInput = document.getElementById("dark-mode");
darkModeInput.addEventListener("click", () => {
    const r = document.querySelector(":root");
    const dmSwitch = document.querySelector(".switch");
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
const guesses = [];
const answers = [];
for (let i = 4; i <= 11; i++) {
    const eligible = targets.filter((word) => word.length == i);
    answers.push(eligible[getRandomInt(eligible.length)]);
}
// console.log(answers);

let won = false;
let finished = false;

document.addEventListener("keydown", (e) => {
    keydown(e.key, e.code);
}, false);

let keys = document.getElementsByClassName("key");
for (const key of keys) {
    key.addEventListener("click", (e) => {
        const keyElm = e.currentTarget;
        keydown(keyElm.children[0].textContent.toLowerCase(), keyElm.attributes["code"].value);
        e.target.blur();
    });
}

document.getElementById("play-again").addEventListener("click", (e) => {
    window.location.replace(location.origin);
    e.target.blur();
});

document.getElementById("share-result").addEventListener("click", () => {
    let emojis = "";
    for (let i = 1; i < guessNo; i++) {
        for (let j = 1; j <= i; j++) {
            let guessRow = document.getElementById(`guess-${i}`);
            let letterDiv = guessRow.querySelector(`:nth-child(${j})`);
            if (letterDiv.style.backgroundColor == "var(--correctPlaceColor)") {
                emojis += "🟩";
            } else if (letterDiv.style.backgroundColor == "var(--incorrectPlaceColor)") {
                emojis += "🟨";
            } else {
                emojis += darkModeInput.checked ? "⬛" : "⬜";
            }
        }
        emojis += "\n";
    }
    let message = `Pyramidle ${won ? guessNo - 1: 'X'}/11\n` + emojis + `\nGame link: ` + getLink();
    copyToClipboard(message);
});

document.getElementById("share-link").addEventListener("click", (e) => {
    copyToClipboard(getLink());
    e.target.blur();
});

document.getElementById("giveup").addEventListener("click", (e) => {
    finishGame();
    e.target.blur();
});

document.getElementById("help").addEventListener("click", () => {
    const howToPlay = document.getElementById("how-to-play");
    howToPlay.style.visibility = "visible";
});

document.getElementById("how-to-play").addEventListener("click", () => {
    const howToPlay = document.getElementById("how-to-play");
    howToPlay.style.visibility = "hidden";
})

function notify(message) {
    let notif = document.getElementById("notif");
    notif.innerText = message;
    notif.style.opacity = "1";
    notif.style.transform = "translate(-50%, 100%)"
    sleep(2000).then(() => {
        notif.style.opacity = "0";      
        notif.style.transform = "translate(-50%, 0)"
    });
}

function getLink() {
    let link = location.href;
    if (location.search == "") {
        link += `?s=${rnd.seed()}`;
    }
    return link;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        notify("Copied to clipboard");
    }, function(err) {
        notify("Failed to copy to clipboard: " + err);
    });
}

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
        // let answerDivs = document.querySelectorAll(".answer span");
        // answerDivs[guessNo - 2].textContent = guessNo > 4 ? answers[guessNo - 5].toUpperCase() : '';
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
    endMessage.style.display = "block";
    if (won) {
        endMessage.children[0].textContent = "Pro bhai!";
    }
    else {
        endMessage.children[0].textContent = "Noob bhai.";
    }
    let answerDivs = document.querySelectorAll(".answer span");
    for (let i = 0; i < 8; i++) {
        answerDivs[i].textContent = answers[i].toUpperCase();
    }
    let answersDiv = document.querySelector(".answers");
    answersDiv.style.display = "flex";
    let spacer = document.querySelector(".spacer");
    spacer.style.display = "block";
}

function resetKeyboard() {
    let keys = document.querySelectorAll(".key");
    for (let key of keys) {
        key.style.backgroundColor = "rgb(174, 174, 174)";
    }
}