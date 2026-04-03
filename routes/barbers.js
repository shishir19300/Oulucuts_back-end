const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 


router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM barbers ORDER BY id ASC');
    
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching barbers:", err.message);
    res.status(500).json({ error: "Database error occurred" });
  }
});

module.exports = router;