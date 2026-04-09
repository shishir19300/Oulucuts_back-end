const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

router.post('/', async (req, res) => {
    if (!req.session.user) {
    return res.status(401).json({ error: 'You must be logged in to book.' });
  } 
     const { barber_id, customer_name, phone, booking_date, booking_time } = req.body;
  const user_id = req.session.user.id;

  if (!barber_id || !customer_name || !phone || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

    try {
    const result = await pool.query(
      `INSERT INTO bookings 
        (user_id, barber_id, customer_name, phone, booking_date, booking_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, barber_id, customer_name, phone, booking_date, booking_time]
    );
    console.log(' New booking:', result.rows[0]);

    return res.status(201).json({ 
        message: 'Booking successful!', 
        booking: result.rows[0] 
      });


      } catch (err) {
    console.error(' Booking error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});
module.exports = router;