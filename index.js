const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/todos',     require('./routes/todos'));
app.use('/api/events',    require('./routes/events'));
app.use('/api/documents', require('./routes/documents'));

app.listen(3000, () => console.log('Server avviato → http://192.168.1.11:3000'));