const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const adminVerify = require('../middleware/adminVerify');
const multer = require('multer'); 
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM barbers ORDER BY id ASC');
    
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching barbers:", err.message);
    res.status(500).json({ error: "Database error occurred" });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM barbers WHERE id = $1', [id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
router.post('/', adminVerify, upload.single('photo'), async (req, res) => {
  
  const { 
    name, 
    age, 
    phone_no, 
    experience, 
    specialty, 
    special_message, 
  } = req.body;
  const photo_path = req.file ? `/uploads/${req.file.filename}` : null;
  if (!name || !specialty || !phone_no) {
  return res.status(400).json({ error: 'Name, specialty, and phone number are required.' });
}
try {
  const { rows } = await pool.query(
    `INSERT INTO barbers (name, age, phone_no, experience, specialty, special_message, photo_url) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [
      name, 
      age, 
      phone_no, 
      experience, 
      specialty, 
      special_message || null, 
      photo_path || null
    ]
  );
      res.status(201).json({
      message: 'Barber added successfully.',
      barber: rows[0]
    });
     } catch (err) {
    console.error('Add barber error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', adminVerify, async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid barber ID.' });
  }
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM barbers WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Barber not found.' });
    }
      res.json({ message: `Barber ${id} deleted successfully.` });
       } catch (err) {
    console.error('Delete barber error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});
module.exports = router;