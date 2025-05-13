const words = [
    "program", "kucanje", "igra", "tastatura", "brzina", "rec", "pokusaj", "vežba", "ekran", "klik",
    "računar", "misa", "kompjuter", "internet", "softver", "hardver", "aplikacija", "korisnik", "ekran", "kod",
    "algoritam", "podaci", "analiza", "baza", "sistem", "programer", "razvoj", "programiranje", "pitanje", "odgovor",
    "igraonica", "učiti", "usmeriti", "konfiguracija", "poruka", "zadovoljstvo", "povratak", "ceo", "tekst", "slika",
    "zadatak", "pitanja", "resenje", "napredak", "progresija", "tok", "sveska", "matematika", "fizika", "hemija",
    "informatika", "inženjer", "vežbanje", "pozadina", "sastav", "grafika", "klijent", "server", "razlika", "greška",
    "struktura", "rešenje", "verifikacija", "provera", "prijava", "uslov", "radni", "projekat", "skripta", "program",
    "sloga", "funkcija", "formula", "ukupno", "posao", "pristup", "uključiti", "ispraviti", "izbor", "komanda", "aplikacija",
    "terminal", "menadžer", "modul", "osvežiti", "dokument", "povezivanje", "početak", "kraj", "period", "datum",
    "testiranje", "podrška", "izbor", "dizajn", "upit", "uputstvo", "usmerenje", "skraćenica", "skup", "klasa",
    "instalacija", "pokretanje", "učiti", "sistem", "krug", "zadovoljan", "raditi", "pomoc", "materijal", "veza",
    "svetlo", "boja", "oblik", "pretraga", "greške", "rezultat", "kreativnost", "analiza", "istraživanje", "programer"
];

const maxScore = 50;
const startTime = 5.0;
const minTime = 0.5;

let score = 0;
let currentWord = "";
let timeLimit = startTime;
let timeLeft = timeLimit;
let timerInterval;
let startTimestamp = null;
let pendingScore = null;
let finalWPM = 0;

const wordDisplay = document.getElementById("wordDisplay");
const inputField = document.getElementById("inputField");
const startBtn = document.getElementById("startBtn");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const leaderboardEl = document.getElementById("leaderboard");

const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerName");
const saveNameBtn = document.getElementById("saveNameBtn");

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function updateScore() {
    scoreDisplay.textContent = "Poeni: " + score;
}

function calculateTimeLimit(score) {
    if (score >= maxScore) return minTime;
    const progress = score / maxScore;
    return startTime - progress * (startTime - minTime);
}

function updateTimerDisplay() {
    timerDisplay.textContent = "Vreme: " + timeLeft.toFixed(1) + "s";
}

function updateWPM() {
    if (!startTimestamp) return;
    const elapsedSeconds = (Date.now() - startTimestamp) / 1000;
    finalWPM = Math.round((score * 60) / elapsedSeconds);
    wpmDisplay.textContent = "WPM: " + finalWPM;
}

function endGame(message) {
    wordDisplay.textContent = message;
    inputField.disabled = true;
    clearInterval(timerInterval);
    updateWPM();
    checkLeaderboard(finalWPM);
}

function showNewWord() {
    clearInterval(timerInterval);

    timeLimit = calculateTimeLimit(score);
    timeLeft = timeLimit;
    updateTimerDisplay();

    currentWord = getRandomWord();
    wordDisplay.textContent = currentWord;
    inputField.value = "";
    inputField.focus();

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerDisplay();
        updateWPM();

        if (timeLeft <= 0.1) {
            clearInterval(timerInterval);
            endGame("Isteklo vreme!");
        }
    }, 100);
}

function startGame() {
    score = 0;
    updateScore();
    wpmDisplay.textContent = "WPM: 0";
    inputField.disabled = false;
    inputField.value = "";
    inputField.focus();
    startTimestamp = Date.now();
    showNewWord();
}

inputField.addEventListener("input", () => {
    if (inputField.value === currentWord) {
        score++;
        updateScore();
        showNewWord();
    }
});

startBtn.addEventListener("click", startGame);

async function getLeaderboard() {
    const res = await fetch("https://wordy-bu5l.onrender.com/leaderboard");
    const data = await res.json();
    return data
        .map(entry => {
            const match = entry.match(/(.*) - (\d+) WPM \((.*)\)/);
            if (!match) return null;
            return {
                name: match[1],
                wpm: parseInt(match[2]),
                date: match[3]
            };
        })
        .filter(entry => entry !== null);
}

function renderLeaderboard() {
    getLeaderboard().then(leaderboard => {
        leaderboardEl.innerHTML = "";
        leaderboard
            .sort((a, b) => b.wpm - a.wpm)
            .slice(0, 5)
            .forEach(entry => {
                const li = document.createElement("li");
                li.textContent = `${entry.name} - ${entry.wpm} WPM (${entry.date})`;
                leaderboardEl.appendChild(li);
            });
    });
}


function checkLeaderboard(wpm) {
    getLeaderboard().then(leaderboard => {
        if (leaderboard.length < 5 || wpm > leaderboard[4].wpm) {
            pendingScore = {
                wpm,
                date: new Date().toLocaleDateString()
            };
            nameModal.classList.remove("hidden");
            playerNameInput.focus();
        }
    });
}

saveNameBtn.onclick = async () => {
    if (!pendingScore) return;

    const name = playerNameInput.value.trim() || "Nepoznat";
    const { wpm, date } = pendingScore;

    await fetch("https://wordy-bu5l.onrender.com/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wpm, date })
    });

    nameModal.classList.add("hidden");
    playerNameInput.value = "";
    pendingScore = null;
    renderLeaderboard();
};


renderLeaderboard(); // prikaži na učitavanju
