const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const { JSONFile, Low } = require('lowdb');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files from 'public' (we'll move assets/css/js there)
app.use(express.static('.')); // Also serve root for now since current structure is flat, but 'public' is better practice. 
// actually, let's keep serving from root for assets but careful with security. 
// Better: Serve specific folders.
app.use('/assets', express.static('assets'));
app.use('/style.css', express.static('style.css')); // explicitly serve css
app.use('/script.js', express.static('script.js')); // explicitly serve js

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Mock Database Setup (Native JSON Read/Write for simplicity if lowdb defaults are too ES-module heavy for this quick setup)
// We'll just read/write the JSON file directly to avoid import issues with recent lowdb versions in CJS environment.
const DB_FILE = 'database.json';

function getDB() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes

// Home
app.get('/', (req, res) => {
    const data = getDB();
    res.render('index', { data });
});

// Admin Login
app.get('/admin', (req, res) => {
    if (req.session.loggedIn) {
        const data = getDB();
        res.render('admin', { data });
    } else {
        res.render('login');
    }
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123') { // Simple password
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid Password' });
    }
});

app.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/');
});

// Admin Actions
app.post('/admin/update-hero', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/admin');
    const db = getDB();
    db.hero = req.body;
    saveDB(db);
    res.redirect('/admin');
});

// ... More update routes will be added naturally

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
