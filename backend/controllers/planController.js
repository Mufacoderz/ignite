const db = require('../config/db');

// GET /api/plans
const getAll = async (req, res) => {
  try {
    const [plans] = await db.query(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Attach exercises for each plan
    for (let plan of plans) {
      const [exercises] = await db.query(
        `SELECT pe.*, e.name, e.category, e.muscle_group, e.sets as default_sets, e.reps as default_reps
         FROM plan_exercises pe
         JOIN exercises e ON pe.exercise_id = e.id
         WHERE pe.plan_id = ?
         ORDER BY pe.order_index ASC`,
        [plan.id]
      );
      plan.exercises = exercises;
    }

    res.json({ success: true, data: plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/plans/:id
const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM workout_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Plan not found' });

    const plan = rows[0];
    const [exercises] = await db.query(
      `SELECT pe.*, e.name, e.category, e.muscle_group, e.description,
              e.sets as default_sets, e.reps as default_reps, e.duration_min, e.calories_est
       FROM plan_exercises pe
       JOIN exercises e ON pe.exercise_id = e.id
       WHERE pe.plan_id = ?
       ORDER BY pe.order_index ASC`,
      [plan.id]
    );
    plan.exercises = exercises;

    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/plans
const create = async (req, res) => {
  try {
    const { name, description, color, scheduled_date, scheduled_time, exercises } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Plan name is required' });

    const [result] = await db.query(
      `INSERT INTO workout_plans (user_id, name, description, color, scheduled_date, scheduled_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, description, color || '#E53E3E', scheduled_date || null, scheduled_time || null]
    );

    const planId = result.insertId;

    if (exercises && exercises.length > 0) {
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await db.query(
          `INSERT INTO plan_exercises (plan_id, exercise_id, order_index, custom_sets, custom_reps, custom_duration, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [planId, ex.exercise_id, i, ex.custom_sets, ex.custom_reps, ex.custom_duration, ex.notes]
        );
      }
    }

    const [newPlan] = await db.query('SELECT * FROM workout_plans WHERE id = ?', [planId]);
    const [planExercises] = await db.query(
      `SELECT pe.*, e.name, e.category FROM plan_exercises pe JOIN exercises e ON pe.exercise_id = e.id WHERE pe.plan_id = ?`,
      [planId]
    );
    newPlan[0].exercises = planExercises;

    res.status(201).json({ success: true, data: newPlan[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/plans/:id
const update = async (req, res) => {
  try {
    const { name, description, color, scheduled_date, scheduled_time, is_active, exercises } = req.body;

    const [check] = await db.query(
      'SELECT id FROM workout_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Plan not found' });

    await db.query(
      `UPDATE workout_plans SET name=?, description=?, color=?, scheduled_date=?, scheduled_time=?, is_active=?
       WHERE id = ? AND user_id = ?`,
      [name, description, color, scheduled_date || null, scheduled_time || null, is_active !== undefined ? is_active : true, req.params.id, req.user.id]
    );

    if (exercises !== undefined) {
      await db.query('DELETE FROM plan_exercises WHERE plan_id = ?', [req.params.id]);
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await db.query(
          `INSERT INTO plan_exercises (plan_id, exercise_id, order_index, custom_sets, custom_reps, custom_duration, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [req.params.id, ex.exercise_id, i, ex.custom_sets, ex.custom_reps, ex.custom_duration, ex.notes]
        );
      }
    }

    const [updated] = await db.query('SELECT * FROM workout_plans WHERE id = ?', [req.params.id]);
    const [planExercises] = await db.query(
      `SELECT pe.*, e.name, e.category FROM plan_exercises pe JOIN exercises e ON pe.exercise_id = e.id WHERE pe.plan_id = ?`,
      [req.params.id]
    );
    updated[0].exercises = planExercises;

    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/plans/:id
const remove = async (req, res) => {
  try {
    const [check] = await db.query(
      'SELECT id FROM workout_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Plan not found' });

    await db.query('DELETE FROM workout_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
