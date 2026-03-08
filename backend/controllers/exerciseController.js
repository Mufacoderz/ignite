const db = require('../config/db');

// GET /api/exercises
const getAll = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM exercises WHERE user_id = ?';
    const params = [req.user.id];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (name LIKE ? OR muscle_group LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/exercises/:id
const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM exercises WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/exercises
const create = async (req, res) => {
  try {
    const { name, category, muscle_group, description, sets, reps, duration_min, calories_est } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Exercise name is required' });

    const [result] = await db.query(
      `INSERT INTO exercises (user_id, name, category, muscle_group, description, sets, reps, duration_min, calories_est)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, category || 'strength', muscle_group, description, sets, reps, duration_min, calories_est]
    );

    const [newEx] = await db.query('SELECT * FROM exercises WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newEx[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/exercises/:id
const update = async (req, res) => {
  try {
    const { name, category, muscle_group, description, sets, reps, duration_min, calories_est } = req.body;

    const [check] = await db.query(
      'SELECT id FROM exercises WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Exercise not found' });

    await db.query(
      `UPDATE exercises SET name=?, category=?, muscle_group=?, description=?, sets=?, reps=?, duration_min=?, calories_est=?
       WHERE id = ? AND user_id = ?`,
      [name, category, muscle_group, description, sets, reps, duration_min, calories_est, req.params.id, req.user.id]
    );

    const [updated] = await db.query('SELECT * FROM exercises WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/exercises/:id
const remove = async (req, res) => {
  try {
    const [check] = await db.query(
      'SELECT id FROM exercises WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Exercise not found' });

    await db.query('DELETE FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Exercise deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
