
const authRoutes = require('./routes/auth');

const barberRoutes = require('./routes/barbers');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path    = require('path');
require('dotenv').config();

// const bookingRoutes = require('./routes/bookings');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
})); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../front-end/public')));

app.use(session({
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  }
}));
app.use('/api/barbers', barberRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/bookings', bookingRoutes);
const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
  console.log(`Server is sprinting on http://localhost:${PORT}`);
});