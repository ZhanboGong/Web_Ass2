const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // ✅ 引入 path 模块
const apiController = require('./api-controller/api-controller');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '../clientside')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/index.html'));
});

app.get('/search', (_req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/HTML/search.html'));
});

app.use('/api', apiController);


app.use((_req, res) => res.status(404).json({ msg: 'Route not found' }));

// 启动
const PORT = 3030;
app.listen(PORT, () => console.log(`✅ Server ready: http://localhost:${PORT}`));