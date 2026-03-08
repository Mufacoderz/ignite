const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM exercises WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(rows);
});

router.get('/:id', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Exercise not found.' });
  res.json(rows[0]);
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, muscle_group, category, sets, reps,  notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const [result] = await db.query(
      'INSERT INTO exercises (user_id, name, muscle_group, category, sets, reps,  notes) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, name, muscle_group, category || 'strength', sets || 3, reps || 10,  notes || null]
    );
    const [rows] = await db.query('SELECT * FROM exercises WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, muscle_group, category, sets, reps,  notes } = req.body;
    const [check] = await db.query('SELECT id FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!check.length) return res.status(404).json({ message: 'Exercise not found.' });
    await db.query(
      'UPDATE exercises SET name=?, muscle_group=?, category=?, sets=?, reps=?,  notes=? WHERE id=?',
      [name, muscle_group, category, sets, reps,  notes, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM exercises WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const [check] = await db.query('SELECT id FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!check.length) return res.status(404).json({ message: 'Exercise not found.' });
  await db.query('DELETE FROM exercises WHERE id = ?', [req.params.id]);
  res.json({ message: 'Exercise deleted.' });
});

module.exports = router;
