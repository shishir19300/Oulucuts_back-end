const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Create a comment + rating for a barber
router.post('/', async (req, res) => {
  const { barber_id, rating, comment_text } = req.body;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Please login first.' });
  }

  const parsedBarberId = parseInt(barber_id, 10);
  const parsedRating = parseInt(rating, 10);
  const cleanComment = typeof comment_text === 'string' ? comment_text.trim() : '';

  if (!parsedBarberId || !parsedRating || !cleanComment) {
    return res.status(400).json({ error: 'barber_id, rating and comment_text are required.' });
  }

  if (parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const barberCheck = await pool.query('SELECT id FROM barbers WHERE id = $1', [parsedBarberId]);
    if (barberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Barber not found.' });
    }

    const result = await pool.query(
      `INSERT INTO comments (barber_id, user_id, rating, comment_text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, barber_id, user_id, rating, comment_text, created_at`,
      [parsedBarberId, userId, parsedRating, cleanComment]
    );

    return res.status(201).json({
      message: 'Comment created successfully.',
      comment: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating comment:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get all comments for one barber
router.get('/barber/:barberId', async (req, res) => {
  const barberId = parseInt(req.params.barberId, 10);

  if (!barberId) {
    return res.status(400).json({ error: 'Invalid barber id.' });
  }

  try {
    const result = await pool.query(
      `SELECT c.id, c.barber_id, c.user_id, c.rating, c.comment_text, c.created_at, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.barber_id = $1
       ORDER BY c.created_at DESC`,
      [barberId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get average rating for one barber
router.get('/barber/:barberId/average', async (req, res) => {
  const barberId = parseInt(req.params.barberId, 10);

  if (!barberId) {
    return res.status(400).json({ error: 'Invalid barber id.' });
  }

  try {
    const result = await pool.query(
      `SELECT barber_id,
              ROUND(AVG(rating)::numeric, 2) AS average_rating,
              COUNT(*)::int AS total_reviews
       FROM comments
       WHERE barber_id = $1
       GROUP BY barber_id`,
      [barberId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        barber_id: barberId,
        average_rating: 0,
        total_reviews: 0
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching average rating:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Delete own comment
router.delete('/:id', async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Please login first.' });
  }

  if (!commentId) {
    return res.status(400).json({ error: 'Invalid comment id.' });
  }

  try {
    const existing = await pool.query('SELECT id, user_id FROM comments WHERE id = $1', [commentId]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    return res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
