
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const apiController = require('./api-controller/api-controller');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '../clientside')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/index.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/search.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/login.html'))
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/signup.html'))
});

app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/event.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/contact.html'))
})

app.use('/api', apiController);


app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));


const PORT = 3030;
app.listen(PORT, () => console.log(`Server ready: http://localhost:${PORT}`));