const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Overview stats
router.get('/overview', auth, async (req, res) => {
  const uid = req.user.id;
  const [totalEx] = await db.query('SELECT COUNT(*) as count FROM exercises WHERE user_id=?', [uid]);
  const [totalPlans] = await db.query('SELECT COUNT(*) as count FROM workout_plans WHERE user_id=?', [uid]);
  const [totalDays] = await db.query('SELECT COUNT(DISTINCT date) as count FROM daily_checklist WHERE user_id=?', [uid]);
  const [completed] = await db.query('SELECT COUNT(*) as count FROM daily_checklist WHERE user_id=? AND is_completed=1', [uid]);
  const [total] = await db.query('SELECT COUNT(*) as count FROM daily_checklist WHERE user_id=?', [uid]);
  
  // Streak calculation
  const [dates] = await db.query(
    `SELECT DISTINCT date FROM daily_checklist 
     WHERE user_id=? AND date <= CURDATE()
     AND (SELECT COUNT(*) FROM daily_checklist dc2 WHERE dc2.user_id=? AND dc2.date=daily_checklist.date AND dc2.is_completed=1) > 0
     ORDER BY date DESC`, [uid, uid]
  );
  
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i].date);
    const diff = Math.round((today - d) / 86400000);
    if (diff === i || diff === i + 1) streak++;
    else break;
  }

  res.json({
    total_exercises: totalEx[0].count,
    total_plans: totalPlans[0].count,
    total_workout_days: totalDays[0].count,
    completion_rate: total[0].count ? Math.round((completed[0].count / total[0].count) * 100) : 0,
    streak
  });
});

// Weekly progress (last 7 days)
router.get('/weekly', auth, async (req, res) => {
  const uid = req.user.id;
  const [rows] = await db.query(
    `SELECT 
       date,
       COUNT(*) as total,
       SUM(is_completed) as completed
     FROM daily_checklist
     WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY date ORDER BY date ASC`,
    [uid]
  );
  // Fill missing days
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = rows.find(r => r.date.toISOString?.().split('T')[0] === dateStr || r.date === dateStr);
    result.push({
      date: dateStr,
      day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
      total: found ? Number(found.total) : 0,
      completed: found ? Number(found.completed) : 0
    });
  }
  res.json(result);
});

// Monthly heatmap
router.get('/monthly', auth, async (req, res) => {
  const uid = req.user.id;
  const [rows] = await db.query(
    `SELECT date, COUNT(*) as total, SUM(is_completed) as completed
     FROM daily_checklist
     WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY date ORDER BY date ASC`,
    [uid]
  );
  res.json(rows);
});

// Category breakdown
router.get('/categories', auth, async (req, res) => {
  const uid = req.user.id;
  const [rows] = await db.query(
    `SELECT e.category, COUNT(dc.id) as total, SUM(dc.is_completed) as completed
     FROM daily_checklist dc JOIN exercises e ON dc.exercise_id = e.id
     WHERE dc.user_id = ?
     GROUP BY e.category`,
    [uid]
  );
  res.json(rows);
});

module.exports = router;
