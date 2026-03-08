const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get checklist for a date
router.get('/', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const [rows] = await db.query(
    `SELECT dc.*, e.name as exercise_name, e.muscle_group, e.category, e.sets, e.reps 
     FROM daily_checklist dc JOIN exercises e ON dc.exercise_id = e.id
     WHERE dc.user_id = ? AND dc.date = ? ORDER BY dc.id`,
    [req.user.id, date]
  );
  res.json(rows);
});

// Add exercise to checklist
router.post('/', auth, async (req, res) => {
  try {
    const { exercise_id, plan_id, date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const [existing] = await db.query(
      'SELECT id FROM daily_checklist WHERE user_id=? AND exercise_id=? AND date=?',
      [req.user.id, exercise_id, targetDate]
    );
    if (existing.length) return res.status(409).json({ message: 'Already in checklist.' });
    const [result] = await db.query(
      'INSERT INTO daily_checklist (user_id, exercise_id, plan_id, date) VALUES (?,?,?,?)',
      [req.user.id, exercise_id, plan_id || null, targetDate]
    );
    res.status(201).json({ id: result.insertId, message: 'Added to checklist.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Generate checklist from a plan
router.post('/from-plan', auth, async (req, res) => {
  try {
    const { plan_id, date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const [exercises] = await db.query(
      'SELECT exercise_id FROM plan_exercises WHERE plan_id = ?', [plan_id]
    );
    for (const ex of exercises) {
      const [existing] = await db.query(
        'SELECT id FROM daily_checklist WHERE user_id=? AND exercise_id=? AND date=?',
        [req.user.id, ex.exercise_id, targetDate]
      );
      if (!existing.length) {
        await db.query('INSERT INTO daily_checklist (user_id, exercise_id, plan_id, date) VALUES (?,?,?,?)',
          [req.user.id, ex.exercise_id, plan_id, targetDate]);
      }
    }
    res.json({ message: 'Checklist generated from plan.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Toggle complete
router.patch('/:id/toggle', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM daily_checklist WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found.' });
  const item = rows[0];
  const newVal = !item.is_completed;
  await db.query('UPDATE daily_checklist SET is_completed=?, completed_at=? WHERE id=?',
    [newVal, newVal ? new Date() : null, req.params.id]);
  res.json({ id: item.id, is_completed: newVal });
});

// Delete checklist item
router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM daily_checklist WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Removed.' });
});

module.exports = router;
