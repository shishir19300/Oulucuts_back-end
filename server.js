
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path    = require('path');
const multer  = require('multer'); 
const fs      = require('fs');
require('dotenv').config();

const adminAuthRoutes = require('./routes/adminAuth');
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');
const commentsRoutes = require('./routes/comments');
const bookingRoutes = require('./routes/bookings');

const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.set('trust proxy', 1);

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://web-development-project-oulucuts-1.onrender.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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
app.use('/api/admin', adminAuthRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
const PORT = process.env.PORT || 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, '../front-end/public')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is sprinting on http://localhost:${PORT}`);
});
