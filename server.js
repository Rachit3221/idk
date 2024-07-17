const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const saltRounds = 10;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new User({
        username: req.body.username,
        password: hashedPassword
    });
    newUser.save((err) => {
        if (err) {
            res.send('Error registering user');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username }, (err, foundUser) => {
        if (err) {
            res.send('Error logging in');
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, (err, result) => {
                    if (result === true) {
                        req.session.user = foundUser;
                        res.send('Logged in successfully');
                    } else {
                        res.send('Incorrect password');
                    }
                });
            } else {
                res.send('No user found with that username');
            }
        }
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
