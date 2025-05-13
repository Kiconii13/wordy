const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Adding the results
app.post('/leaderboard', (req, res) => {
    const { name, wpm, date } = req.body;

    if (!name || typeof wpm !== "number" || !date) {
        return res.status(400).send("Neispravan format!");
    }

    const entry = `${name} - ${wpm} WPM (${date})\n`;
    fs.appendFile('leaderboard.txt', entry, err => {
        if (err) {
            console.error('Greška pri upisu u fajl:', err);
            return res.status(500).send('Greška pri upisu.');
        }
        res.send('Rezultat sačuvan.');
    });
});


// Reading the results
app.get('/leaderboard', (req, res) => {
    fs.readFile('leaderboard.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Greška pri čitanju.');
        }
        const entries = data.trim().split('\n').map(line => line.trim());
        res.json(entries);
    });
});

app.listen(port, () => {
    console.log(`Server is on http://localhost:${port}`);
});
