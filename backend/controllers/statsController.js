const db = require('../config/db');

// GET /api/stats/overview
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total workouts completed
    const [[totalWorkouts]] = await db.query(
      'SELECT COUNT(*) as count FROM daily_logs WHERE user_id = ? AND is_completed = 1',
      [userId]
    );

    // Total exercises created
    const [[totalExercises]] = await db.query(
      'SELECT COUNT(*) as count FROM exercises WHERE user_id = ?',
      [userId]
    );

    // Total plans created
    const [[totalPlans]] = await db.query(
      'SELECT COUNT(*) as count FROM workout_plans WHERE user_id = ?',
      [userId]
    );

    // Current streak (consecutive days with completed workout)
    const [streakRows] = await db.query(
      `SELECT log_date FROM daily_logs
       WHERE user_id = ? AND is_completed = 1
       ORDER BY log_date DESC`,
      [userId]
    );

    let streak = 0;
    if (streakRows.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const row of streakRows) {
        const logDate = new Date(row.log_date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (logDate < checkDate) {
          break;
        }
      }
    }

    // This week workouts
    const [[thisWeek]] = await db.query(
      `SELECT COUNT(*) as count FROM daily_logs
       WHERE user_id = ? AND is_completed = 1
       AND YEARWEEK(log_date, 1) = YEARWEEK(CURDATE(), 1)`,
      [userId]
    );

    // This month workouts
    const [[thisMonth]] = await db.query(
      `SELECT COUNT(*) as count FROM daily_logs
       WHERE user_id = ? AND is_completed = 1
       AND YEAR(log_date) = YEAR(CURDATE()) AND MONTH(log_date) = MONTH(CURDATE())`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalWorkouts: totalWorkouts.count,
        totalExercises: totalExercises.count,
        totalPlans: totalPlans.count,
        currentStreak: streak,
        thisWeek: thisWeek.count,
        thisMonth: thisMonth.count,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/stats/weekly
const getWeekly = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         DATE(log_date) as date,
         DAYNAME(log_date) as day_name,
         COUNT(*) as total,
         SUM(is_completed) as completed
       FROM daily_logs
       WHERE user_id = ?
       AND log_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(log_date), DAYNAME(log_date)
       ORDER BY log_date ASC`,
      [req.user.id]
    );

    // Fill missing days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = rows.find(r => r.date === dateStr || (r.date && r.date.toISOString && r.date.toISOString().split('T')[0] === dateStr));
      result.push({
        date: dateStr,
        day: dayName,
        total: found ? Number(found.total) : 0,
        completed: found ? Number(found.completed) : 0,
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/stats/monthly
const getMonthly = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         WEEK(log_date, 1) as week_num,
         COUNT(*) as total,
         SUM(is_completed) as completed
       FROM daily_logs
       WHERE user_id = ?
       AND log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY WEEK(log_date, 1)
       ORDER BY week_num ASC`,
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/stats/categories
const getCategoryBreakdown = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.category, COUNT(le.id) as count
       FROM log_exercises le
       JOIN exercises e ON le.exercise_id = e.id
       JOIN daily_logs dl ON le.log_id = dl.id
       WHERE dl.user_id = ? AND le.is_done = 1
       GROUP BY e.category`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getOverview, getWeekly, getMonthly, getCategoryBreakdown };
