const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get all plans
router.get('/', auth, async (req, res) => {
  const [plans] = await db.query('SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  for (const plan of plans) {
    const [exercises] = await db.query(
      `SELECT pe.*, e.name, e.muscle_group, e.category, e.sets, e.reps, e.duration_minutes
       FROM plan_exercises pe JOIN exercises e ON pe.exercise_id = e.id
       WHERE pe.plan_id = ? ORDER BY pe.order_index`, [plan.id]
    );
    plan.exercises = exercises;
  }
  res.json(plans);
});

// Get single plan
router.get('/:id', auth, async (req, res) => {
  const [plans] = await db.query('SELECT * FROM workout_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!plans.length) return res.status(404).json({ message: 'Plan not found.' });
  const plan = plans[0];
  const [exercises] = await db.query(
    `SELECT pe.*, e.name, e.muscle_group, e.category, e.sets, e.reps, e.duration_minutes
     FROM plan_exercises pe JOIN exercises e ON pe.exercise_id = e.id
     WHERE pe.plan_id = ? ORDER BY pe.order_index`, [plan.id]
  );
  plan.exercises = exercises;
  res.json(plan);
});

// Create plan
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, scheduled_date, day_of_week, exercise_ids } = req.body;
    if (!name) return res.status(400).json({ message: 'Plan name is required.' });
    const [result] = await db.query(
      'INSERT INTO workout_plans (user_id, name, description, scheduled_date, day_of_week) VALUES (?,?,?,?,?)',
      [req.user.id, name, description || null, scheduled_date || null, day_of_week || null]
    );
    const planId = result.insertId;
    if (exercise_ids && exercise_ids.length) {
      for (let i = 0; i < exercise_ids.length; i++) {
        await db.query('INSERT INTO plan_exercises (plan_id, exercise_id, order_index) VALUES (?,?,?)', [planId, exercise_ids[i], i]);
      }
    }
    const [plans] = await db.query('SELECT * FROM workout_plans WHERE id = ?', [planId]);
    res.status(201).json(plans[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Update plan
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, scheduled_date, day_of_week, exercise_ids } = req.body;
    const [check] = await db.query('SELECT id FROM workout_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!check.length) return res.status(404).json({ message: 'Plan not found.' });
    await db.query(
      'UPDATE workout_plans SET name=?, description=?, scheduled_date=?, day_of_week=? WHERE id=?',
      [name, description, scheduled_date, day_of_week, req.params.id]
    );
    if (exercise_ids !== undefined) {
      await db.query('DELETE FROM plan_exercises WHERE plan_id = ?', [req.params.id]);
      for (let i = 0; i < exercise_ids.length; i++) {
        await db.query('INSERT INTO plan_exercises (plan_id, exercise_id, order_index) VALUES (?,?,?)', [req.params.id, exercise_ids[i], i]);
      }
    }
    const [plans] = await db.query('SELECT * FROM workout_plans WHERE id = ?', [req.params.id]);
    res.json(plans[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Delete plan
router.delete('/:id', auth, async (req, res) => {
  const [check] = await db.query('SELECT id FROM workout_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!check.length) return res.status(404).json({ message: 'Plan not found.' });
  await db.query('DELETE FROM workout_plans WHERE id = ?', [req.params.id]);
  res.json({ message: 'Plan deleted.' });
});

// Add exercise to plan
router.post('/:id/exercises', auth, async (req, res) => {
  const { exercise_id, custom_sets, custom_reps } = req.body;
  const [count] = await db.query('SELECT COUNT(*) as c FROM plan_exercises WHERE plan_id = ?', [req.params.id]);
  await db.query('INSERT INTO plan_exercises (plan_id, exercise_id, order_index, custom_sets, custom_reps) VALUES (?,?,?,?,?)',
    [req.params.id, exercise_id, count[0].c, custom_sets || null, custom_reps || null]);
  res.status(201).json({ message: 'Exercise added to plan.' });
});

// Remove exercise from plan
router.delete('/:id/exercises/:peId', auth, async (req, res) => {
  await db.query('DELETE FROM plan_exercises WHERE id = ? AND plan_id = ?', [req.params.peId, req.params.id]);
  res.json({ message: 'Exercise removed from plan.' });
});

module.exports = router;
