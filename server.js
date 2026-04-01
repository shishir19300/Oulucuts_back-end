const pool = require('./config/db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('OuluCuts Server is officially awake!');
});

app.listen(PORT, () => {
  console.log(`Server is sprinting on http://localhost:${PORT}`);
});