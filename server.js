
const authRoutes = require('./routes/auth');
const pool = require('./config/db');
const barberRoutes = require('./routes/barbers');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use('/api/barbers', barberRoutes);
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('OuluCuts Server is officially awake!');
});

app.listen(PORT, () => {
  console.log(`Server is sprinting on http://localhost:${PORT}`);
});