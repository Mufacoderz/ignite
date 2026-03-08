const db = require('../config/db');

// GET /api/checklist?date=YYYY-MM-DD
const getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const logDate = date || new Date().toISOString().split('T')[0];

    const [logs] = await db.query(
      `SELECT dl.*, wp.name as plan_name, wp.color as plan_color
       FROM daily_logs dl
       JOIN workout_plans wp ON dl.plan_id = wp.id
       WHERE dl.user_id = ? AND dl.log_date = ?`,
      [req.user.id, logDate]
    );

    for (let log of logs) {
      const [exs] = await db.query(
        `SELECT le.*, e.name, e.category, e.sets, e.reps, e.duration_min
         FROM log_exercises le
         JOIN exercises e ON le.exercise_id = e.id
         WHERE le.log_id = ?`,
        [log.id]
      );
      log.exercises = exs;
    }

    res.json({ success: true, data: logs, date: logDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/checklist/start - start a plan for today
const startPlan = async (req, res) => {
  try {
    const { plan_id, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];

    // Check if already started
    const [existing] = await db.query(
      'SELECT id FROM daily_logs WHERE user_id = ? AND plan_id = ? AND log_date = ?',
      [req.user.id, plan_id, date]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Plan already started for this date' });
    }

    // Verify plan ownership
    const [plan] = await db.query(
      'SELECT id FROM workout_plans WHERE id = ? AND user_id = ?',
      [plan_id, req.user.id]
    );
    if (plan.length === 0) return res.status(404).json({ success: false, message: 'Plan not found' });

    const [logResult] = await db.query(
      'INSERT INTO daily_logs (user_id, plan_id, log_date) VALUES (?, ?, ?)',
      [req.user.id, plan_id, date]
    );
    const logId = logResult.insertId;

    // Copy exercises from plan to log
    const [planExercises] = await db.query(
      'SELECT exercise_id FROM plan_exercises WHERE plan_id = ? ORDER BY order_index',
      [plan_id]
    );

    for (const pe of planExercises) {
      await db.query(
        'INSERT INTO log_exercises (log_id, exercise_id) VALUES (?, ?)',
        [logId, pe.exercise_id]
      );
    }

    res.status(201).json({ success: true, message: 'Plan started', log_id: logId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/checklist/exercise/:logExerciseId - toggle exercise done
const toggleExercise = async (req, res) => {
  try {
    const { logExerciseId } = req.params;

    const [rows] = await db.query(
      `SELECT le.* FROM log_exercises le
       JOIN daily_logs dl ON le.log_id = dl.id
       WHERE le.id = ? AND dl.user_id = ?`,
      [logExerciseId, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });

    const current = rows[0];
    const newDone = !current.is_done;
    const doneAt = newDone ? new Date() : null;

    await db.query(
      'UPDATE log_exercises SET is_done = ?, done_at = ? WHERE id = ?',
      [newDone, doneAt, logExerciseId]
    );

    // Check if all exercises in log are done
    const [allExercises] = await db.query(
      'SELECT is_done FROM log_exercises WHERE log_id = ?',
      [current.log_id]
    );
    const allDone = allExercises.every(e => e.is_done);

    await db.query(
      'UPDATE daily_logs SET is_completed = ?, completed_at = ? WHERE id = ?',
      [allDone, allDone ? new Date() : null, current.log_id]
    );

    res.json({ success: true, is_done: newDone, log_completed: allDone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/checklist/history?days=30
const getHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await db.query(
      `SELECT log_date, COUNT(*) as total_plans,
              SUM(is_completed) as completed_plans
       FROM daily_logs
       WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY log_date
       ORDER BY log_date ASC`,
      [req.user.id, days]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getByDate, startPlan, toggleExercise, getHistory };
